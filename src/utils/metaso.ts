import {
  initEccLib,
  address as addressLib,
  Psbt,
  Transaction,
} from "bitcoinjs-lib";
import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs";
import { buildTx, createPsbtInput, getUtxos } from "./psbtBuild";
import { determineAddressInfo } from "./utils";
import { TYPED_NETWORK } from "@/config";
import Decimal from "decimal.js";

export const SIGHASH_ALL = 0x01;
export const DUST_SIZE = 546;
type BaseBuildParams = {
  addressType: string;
  address: string;
  publicKey: Buffer;
  script: Buffer;
  network: API.Network;
};
type BuildClaimPsbtParams = BaseBuildParams & MS.ClaimPreRes;

const _buildClaimPsbt = async (
  buildClaimPsbtParams: BuildClaimPsbtParams,
  selectedUTXOs: API.UTXO[],
  change: Decimal,
  needChange: boolean,
  signPsbt: boolean
) => {
  const {
    addressType,
    address,
    publicKey,
    script,
    network,
    receiveAddress,
    totalAmount,
    minerFee,
  } = buildClaimPsbtParams;
  const psbt = new Psbt({ network: TYPED_NETWORK });
  for (const utxo of selectedUTXOs) {
    const psbtInput = await createPsbtInput({
      utxo,
      addressType,
      publicKey,
      script,
      network,
    });
    psbtInput.sighashType = SIGHASH_ALL;
    psbt.addInput(psbtInput);
  }
  psbt.addOutput({
    address: receiveAddress,
    value: BigInt(minerFee),
  });
  if (needChange || change.gt(DUST_SIZE)) {
    psbt.addOutput({
      address: address,
      value: BigInt(change.toNumber()),
    });
  }
  if (!signPsbt) return psbt;
  const _signed = await window.metaidwallet.btc.signPsbt({
    psbtHex: psbt.toHex(),
    options: {
      autoFinalized: true,
    },
  });
  if (typeof _signed === "object") {
    if (_signed.status === "canceled") throw new Error("canceled");
    throw new Error("");
  }
  const signed = Psbt.fromHex(_signed);
  return signed;
};
export const buildClaimPsbt = async (
  order: MS.ClaimPreRes,
  network: API.Network,
  address: string,
  feeRate: number,
  extract: boolean = true,
  signPsbt: boolean = true
) => {
  initEccLib(ecc);
  const { minerFee } = order;
  const utxos = (await getUtxos(address, network)).sort(
    (a, b) => b.satoshi - a.satoshi
  );
  const addressType = determineAddressInfo(address).toUpperCase();
  const publicKey = await window.metaidwallet.btc.getPublicKey();
  const script = addressLib.toOutputScript(address, TYPED_NETWORK);
  const ret = await buildTx<BuildClaimPsbtParams>(
    utxos,
    new Decimal(minerFee),
    feeRate,
    {
      addressType,
      address,
      publicKey: Buffer.from(publicKey, "hex"),
      script,
      network,
      ...order,
    },
    address,
    _buildClaimPsbt,
    extract,
    signPsbt
  );
  return ret;
};
