import { Decimal } from "decimal.js";
import {
  Psbt,
  Transaction,
  address as libAddress,
  payments,
  initEccLib,
  networks,
} from "bitcoinjs-lib";
import mempoolJS from "@mempool/mempool.js";
import { isTaprootInput } from "bitcoinjs-lib/src/psbt/bip371";
import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs";
import { Buffer } from "buffer";

import { determineAddressInfo } from "./utils";
import { curNetwork, TYPED_NETWORK } from "@/config";
import { value } from "bitcoinjs-lib/src/payments/lazy";

function toUint8Array(obj: { [key: number]: number }): Uint8Array {
  return new Uint8Array(Object.values(obj));
}

const TX_EMPTY_SIZE = 4 + 1 + 1 + 4;
const TX_INPUT_BASE = 32 + 4 + 1 + 4; // 41
const TX_INPUT_PUBKEYHASH = 107;
const TX_INPUT_SEGWIT = 27;
const TX_INPUT_TAPROOT = 17; // round up 16.5 bytes
const TX_OUTPUT_BASE = 8 + 1;
const TX_OUTPUT_PUBKEYHASH = 25;
const TX_OUTPUT_SCRIPTHASH = 23;
const TX_OUTPUT_SEGWIT = 22;
const TX_OUTPUT_SEGWIT_SCRIPTHASH = 34;
const TX_INPUT_SCRIPT_BASE = 0;

function selectUTXOs(utxos: API.UTXO[], targetAmount: Decimal) {
  let totalAmount = new Decimal(0);
  const selectedUtxos: typeof utxos = [];
  for (const utxo of utxos) {
    selectedUtxos.push(utxo);
    totalAmount = totalAmount.add(utxo.satoshis);

    if (totalAmount.gte(targetAmount)) {
      break;
    }
  }

  if (totalAmount.lt(targetAmount)) {
    throw new Error("Insufficient funds to reach the target amount");
  }

  return selectedUtxos;
}

function getTotalSatoshi(utxos: API.UTXO[]) {
  return utxos.reduce(
    (total, utxo) => total.add(utxo.satoshis),
    new Decimal(0)
  );
}
function calculateEstimatedFee(psbt: Psbt, feeRate: number) {
  const tx = psbt.extractTransaction();
  const size = tx.virtualSize();
  return new Decimal(size).mul(feeRate);
}
type PsbtInput = (typeof Psbt.prototype.data.inputs)[0];
export interface TransactionOutput {
  script: Buffer;
  value: number;
}
export interface PsbtTxOutput extends TransactionOutput {
  address: string | undefined;
}

function inputBytes(input: PsbtInput) {
  // todo: script length

  if (isTaprootInput(input)) {
    return TX_INPUT_BASE + TX_INPUT_TAPROOT;
  }
  if (input.redeemScript) return TX_INPUT_BASE + input.redeemScript.length;
  if (input.nonWitnessUtxo) return TX_INPUT_BASE + TX_INPUT_PUBKEYHASH;
  if (input.witnessUtxo) return TX_INPUT_BASE + TX_INPUT_SEGWIT;

  return TX_INPUT_BASE + TX_INPUT_PUBKEYHASH;
}

function outputBytes(output: PsbtTxOutput) {
  // if output is op-return, use it's buffer size

  return (
    TX_OUTPUT_BASE +
    (output.script
      ? output.script.length
      : output.address?.startsWith("bc1") || output.address?.startsWith("tb1")
        ? output.address?.length === 42 // TODO: looks like something wrong here
          ? TX_OUTPUT_SEGWIT
          : TX_OUTPUT_SEGWIT_SCRIPTHASH
        : output.address?.startsWith("3") || output.address?.startsWith("2")
          ? TX_OUTPUT_SCRIPTHASH
          : TX_OUTPUT_PUBKEYHASH)
  );
}
function transactionBytes(inputs: PsbtInput[], outputs: PsbtTxOutput[]) {
  const inputsSize = inputs.reduce(function (a, x) {
    return a + inputBytes(x);
  }, 0);
  const outputsSize = outputs.reduce(function (a, x, index) {
    return a + outputBytes(x);
  }, 0);

  console.log({
    inputsSize,
    outputsSize,
    TX_EMPTY_SIZE,
  });
  return TX_EMPTY_SIZE + inputsSize + outputsSize;
}

export function calcFee(psbt: Psbt, feeRate: number) {
  const inputs = psbt.data.inputs;
  const outputs = psbt.txOutputs;

  const bytes = transactionBytes(inputs, outputs);

  return new Decimal(bytes).mul(feeRate).add(10);
}

export async function buildTx<T>(
  utxos: API.UTXO[],
  amount: Decimal,
  feeRate: number,
  buildPsbtParams: T,
  address: string,
  buildPsbt: (
    buildPsbtParams: T,
    selectedUTXOs: API.UTXO[],
    change: Decimal,
    needChange: boolean,
    signPsbt: boolean
  ) => Promise<Psbt>,
  extract: boolean = false,
  signPsbt: boolean = true
): Promise<{
  psbt: Psbt;
  fee: string;
  txId: string;
  rawTx: string;
  txInputs: API.Tx[];
  txOutputs: API.Tx[];
}> {
  let selectedUTXOs = selectUTXOs(utxos, amount);
  let total = getTotalSatoshi(selectedUTXOs);
  let psbt = await buildPsbt(
    buildPsbtParams,
    selectedUTXOs,
    total.minus(amount),
    true,
    false
  );
  let estimatedFee = calcFee(psbt, feeRate);
  while (total.lt(amount.add(estimatedFee))) {
    if (selectedUTXOs.length === utxos.length) {
      throw new Error("Insufficient funds");
    }
    selectedUTXOs = selectUTXOs(utxos, amount.add(estimatedFee));
    total = getTotalSatoshi(selectedUTXOs);
    psbt = await buildPsbt(
      buildPsbtParams,
      selectedUTXOs,
      total.minus(amount.add(estimatedFee)),
      true,
      false
    );
    estimatedFee = calcFee(psbt, feeRate);
  }

  psbt = await buildPsbt(
    buildPsbtParams,
    selectedUTXOs,
    total.minus(amount.add(estimatedFee)),
    false,
    signPsbt
  );
  console.log(psbt, "psbt in buildTx");

  return {
    psbt,
    fee: total
      .minus(psbt.txOutputs.reduce((acc, cur) => acc + Number(cur.value), 0))
      .toString(),
    txId: !extract ? "" : psbt.extractTransaction().getId(),
    rawTx: !extract ? psbt.toHex() : psbt.extractTransaction().toHex(),
    txInputs: selectedUTXOs.map((utxo) => ({
      address,
      value: utxo.satoshis,
    })),
    txOutputs: psbt.txOutputs.map((out) => ({
      address: out.address || "",
      value: out.value,
    })),
  };
}

export async function createPsbtInput({
  utxo,
  addressType,
  publicKey,
  script,
  network,
}: {
  utxo: API.UTXO;
  publicKey: Buffer;
  script: Buffer;
  addressType: string;
  network?: API.Network;
}) {
  network = network || curNetwork;

  const payInput: any = {
    hash: utxo.txId,
    index: utxo.vout,
    sequence: 0xffffffff, // These are defaults. This line is not needed.
  };
  if (["P2TR"].includes(addressType)) {
    payInput["tapInternalKey"] = publicKey.subarray(1);
    payInput["witnessUtxo"] = {
      value: BigInt(utxo.satoshi),
      script: toUint8Array(script),
    };
  }
  if (["P2WPKH"].includes(addressType)) {
    payInput["witnessUtxo"] = {
      value: BigInt(utxo.satoshi),
      script: toUint8Array(script),
    };
  }
  if (["P2PKH"].includes(addressType)) {
    if (utxo.rawTx) {
      const tx = Transaction.fromHex(utxo.rawTx);
      payInput["nonWitnessUtxo"] = tx.toBuffer();
    } else {
      const mempoolReturn = mempoolJS({
        hostname: "mempool.space",
        network: curNetwork === "testnet" ? "testnet" : "main",
      });
      const rawTx = await mempoolReturn.bitcoin.transactions.getTxHex({
        txid: utxo.txId,
      });
      const tx = Transaction.fromHex(rawTx);
      payInput["nonWitnessUtxo"] = tx.toBuffer();
    }
  }
  if (["P2SH"].includes(addressType)) {
    const { redeem } = payments.p2sh({
      redeem: payments.p2wpkh({
        pubkey: publicKey,
        network: TYPED_NETWORK,
      }),
      network: TYPED_NETWORK,
    });
    if (!redeem) throw new Error("redeemScript");
    payInput.redeemScript = redeem.output;
    payInput["witnessUtxo"] = {
      value: BigInt(utxo.satoshi),
      script: toUint8Array(script),
    }; // { value: utxo.satoshi, script };
  }
  return payInput;
}

export async function fillInternalKey({
  publicKey,
  addressType,
}: {
  publicKey: Buffer;
  addressType: string;
}) {
  const payInput: any = {};
  if (["P2TR"].includes(addressType)) {
    payInput["tapInternalKey"] = publicKey.subarray(1);
  }
  if (["P2SH"].includes(addressType)) {
    console.log("input.tapInternalKey");
    const { redeem } = payments.p2sh({
      redeem: payments.p2wpkh({
        pubkey: publicKey,
        network: TYPED_NETWORK,
      }),
      network: TYPED_NETWORK,
    });
    if (!redeem) throw new Error("redeemScript");
    payInput.redeemScript = redeem.output;
  }
  return payInput;
}

export const getUtxos = async (address: string, network?: API.Network) => {
  // const mempoolReturn = mempoolJS({
  //   hostname: 'mempool.space',
  //   network: network === 'mainnet' ? 'main' : 'testnet',
  // })
  // const rawUtxoList = await mempoolReturn.bitcoin.addresses.getAddressTxsUtxo({
  //   address,
  // })
  // const utxos: API.UTXO[] = []
  // for (const utxoElement of rawUtxoList) {
  //   if (utxoElement.value > 1000) {
  //     utxos.push({
  //       txId: utxoElement.txid,
  //       vout: utxoElement.vout,
  //       satoshi: utxoElement.value,
  //       confirmed: utxoElement.status.confirmed,
  //       inscriptions: null,
  //       outputIndex: utxoElement.vout,
  //       satoshis: utxoElement.value,
  //     })
  //   }
  // }
  // return utxos
  const addressType = determineAddressInfo(address).toUpperCase();
  const utxos = await window.metaidwallet.btc.getUtxos({
    needRawTx: ["P2PKH"].includes(addressType),
    useUnconfirmed: true,
  });
  for (let i = 0; i < utxos.length; i++) {
    const { txId, vout } = utxos[i];
    if (!utxos[i].confirmed) {
      const ret = await window.metaidwallet.btc.addSafeUtxo({
        address,
        unspentOutput: `${txId}:${vout}`,
      });
      console.log(ret, "addSafeUtxo");
    }
  }
  return utxos;
};

export const addUtxoSafe = async (
  address: string,
  utxos: { txId: string; vout: number }[]
) => {
  console.log(utxos, "addUtxoSafe");
  for (let i = 0; i < utxos.length; i++) {
    try {
      const { txId, vout } = utxos[i];
      const ret = await window.metaidwallet.btc.addSafeUtxo({
        address,
        unspentOutput: `${txId}:${vout}`,
      });
      console.log(ret, "addUtxoSafe");
    } catch (err) {
      console.log(err);
    }
  }
};

export function toXOnly(pubKey: Buffer) {
  return pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);
}

export async function updateInputKey({
  publicKey,
  addressType,
  network,
}: {
  publicKey: Buffer;
  addressType: string;
  network: API.Network;
}) {
  const payInput: any = {};
  if (["P2TR"].includes(addressType)) {
    const tapInternalKey = toXOnly(publicKey);
    payInput["tapInternalKey"] = tapInternalKey;
  }
  if (["P2SH"].includes(addressType)) {
    console.log("input.tapInternalKey");
    const { redeem } = payments.p2sh({
      redeem: payments.p2wpkh({
        pubkey: publicKey,
        network: TYPED_NETWORK,
      }),
      network: TYPED_NETWORK,
    });
    if (!redeem) throw new Error("redeemScript");
    payInput.redeemScript = redeem.output;
  }
  return payInput;
}

export const getUtxoBalance = async (address?: string) => {
  if (!address) {
    address = await window.metaidwallet.btc.getAddress();
  }
  const utxos = await getUtxos(address);
  return utxos.reduce((acc, cur) => acc + cur.satoshis, 0);
};

export const getMvcBalance = async (address?: string) => {
  if (!address) {
    address = await window.metaidwallet.getAddress();
  }
  if (!address) {
    return 0;
  }
  const utxos = await window.metaidwallet.getUtxos(address);
  return utxos.reduce((acc, cur) => acc + cur.value, 0);
};

export const checkWalletAddress = async (address: string) => {
  const _address = await window.metaidwallet.btc.getAddress();
  if (address !== _address) {
    return { status: false, message: "Wallet address is not matched" };
  }
  return { status: true };
};

export const getPkScriprt = (address: string, network: API.Network) => {
  initEccLib(ecc);
  const btcNetwork =
    network === "mainnet" ? networks.bitcoin : networks.testnet;
  const paymentPrevOutputScript = libAddress.toOutputScript(
    address,
    btcNetwork
  );
  return Buffer.from(paymentPrevOutputScript).toString("hex");
};
