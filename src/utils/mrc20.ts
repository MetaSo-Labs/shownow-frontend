import {
  networks,
  Psbt,
  address as addressLib,
  initEccLib,
  Transaction,
  payments,
} from "bitcoinjs-lib";
import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs";
import { buildTx, calcFee, createPsbtInput, fillInternalKey, getUtxos } from "./psbtBuild";
import { determineAddressInfo } from "./utils";
import Decimal from "decimal.js";
import { DUST_SIZE, SIGHASH_ALL } from "./metaso";

type CommitPsbtParams = {
  addressType: string;
  address: string;
  publicKey: Buffer;
  script: Buffer;
  network: API.Network;
} & API.MintMRC20PreRes;

const _commitMint = async (
  params: CommitPsbtParams,
  selectedUTXOs: API.UTXO[],
  change: Decimal,
  needChange: boolean,
  buildPsbt: boolean = true
) => {
  const {
    address,
    network,
    revealAddress,
    revealFee,
    addressType,
    publicKey,
    script,
    serviceFee,
    serviceAddress,
  } = params;
  const btcNetwork =
    network === "mainnet" ? networks.bitcoin : networks.testnet;
  const psbt = new Psbt({ network: btcNetwork });
  for (const utxo of selectedUTXOs) {
    const psbtInput = await createPsbtInput({
      utxo: utxo,
      addressType,
      publicKey,
      script,
      network,
    });
    psbt.addInput(psbtInput);
  }
  psbt.addOutput({
    address: revealAddress,
    value: BigInt(revealFee),
  });
  // if (serviceFee > 0 && serviceAddress) {
  //   psbt.addOutput({
  //     address: serviceAddress,
  //     value: serviceFee,
  //   });
  // }
  if (needChange || change.gt(DUST_SIZE)) {
    psbt.addOutput({
      address: address,
      value: BigInt(change.toNumber()),
    });
  }
  if (!buildPsbt) {
    return psbt;
  }
  const _signPsbt = await window.metaidwallet.btc.signPsbt({
    psbtHex: psbt.toHex(),
    options: {
      autoFinalized: true,
    },
  });
  if (typeof _signPsbt === "object") {
    if (_signPsbt.status === "canceled") throw new Error("canceled");
    throw new Error("");
  }
  const signPsbt = Psbt.fromHex(_signPsbt);
  return signPsbt;
};

export const commitMintMRC20PSBT = async (
  order: API.MintMRC20PreRes,
  feeRate: number,
  address: string,
  network: API.Network,
  extract: boolean = true,
  signPsbt: boolean = true
) => {
  initEccLib(ecc);
  const { revealFee, revealInputIndex } = order;
  const utxos = (await getUtxos(address, network)).sort(
    (a, b) => b.satoshi - a.satoshi
  );
  const addressType = determineAddressInfo(address).toUpperCase();
  const publicKey = await window.metaidwallet.btc.getPublicKey();
  const btcNetwork =
    network === "mainnet" ? networks.bitcoin : networks.testnet;
  const script = addressLib.toOutputScript(address, btcNetwork);
  const commitTx = await buildTx<CommitPsbtParams>(
    utxos,
    new Decimal(revealFee),
    feeRate,
    {
      addressType,
      address,
      publicKey: Buffer.from(publicKey, "hex"),
      script: Buffer.from(script),
      network,
      ...order,
    },
    address,
    _commitMint,
    extract,
    signPsbt
  );
  const { rawTx, txId, psbt: commitPsbt } = commitTx;
  const psbt = Psbt.fromHex(order.revealPrePsbtRaw, {
    network: btcNetwork,
  });

  psbt.data.globalMap.unsignedTx.tx.ins[revealInputIndex].hash = Buffer.from(
    txId,
    "hex"
  ).reverse();
  psbt.data.globalMap.unsignedTx.tx.ins[revealInputIndex].index = 0;
  const toSignInputs = [];
  for (let i = 0; i < revealInputIndex; i++) {
    psbt.updateInput(
      i,
      await fillInternalKey({
        publicKey: Buffer.from(publicKey, "hex"),
        addressType,
      })
    );
    toSignInputs.push({
      index: i,
      address: address,
      sighashTypes: [SIGHASH_ALL],
    });
  }
  const estimatedFee = calcFee(psbt, feeRate, addressType === "P2TR");
  if (!signPsbt) {
    return {
      rawTx,
      revealPrePsbtRaw: psbt.toHex(),
      revealFee: estimatedFee.toString(),
      commitFee: commitTx.fee,
    };
  }
  const revealPrePsbtRaw = await window.metaidwallet.btc.signPsbt({
    psbtHex: psbt.toHex(),
    options: {
      toSignInputs,
      autoFinalized: false,
    },
  });

  if (typeof revealPrePsbtRaw === "object") {
    throw new Error("canceled");
  }
  return {
    rawTx,
    revealPrePsbtRaw,
    revealFee: estimatedFee,
    commitFee: commitTx.fee,
  };
};
export const transferMRC20PSBT = async (
  order: API.TransferMRC20PreRes,
  feeRate: number,
  address: string,
  network: API.Network,
  extract: boolean = true,
  signPsbt: boolean = true
) => {
  return commitMintMRC20PSBT(
    order,
    feeRate,
    address,
    network,
    extract,
    signPsbt
  );
};
