import {
  Psbt,
  address as addressLib,
  initEccLib,
  script,
  networks,
  Transaction,
  payments,
} from "bitcoinjs-lib";
import { TxComposer, mvc } from "meta-contract";
import { sighashType } from "meta-contract/dist/tx-composer";
import { request } from "umi";

export function buildOpReturnV2(
  metaidData: any,
  options?: { network: API.Network }
): any {
  const res1 = ["metaid", metaidData.operation];
  let res2 = [];
  if (metaidData.operation !== "init") {
    res2.push(metaidData.path!);
    res2.push(metaidData?.encryption ?? "0");
    res2.push(metaidData?.version ?? "1.0.0");
    res2.push(metaidData?.contentType ?? "text/plain;utf-8");

    const body = !metaidData.body
      ? undefined
      : Buffer.isBuffer(metaidData.body)
        ? metaidData.body
        : Buffer.from(metaidData.body, metaidData?.encoding ?? "utf-8");
    res2.push(body);
  }
  return [...res1, ...res2] as any;
}

export async function fetchUtxos({
  address,
  network,
}: {
  address: string;
  network: API.Network;
}): Promise<
  {
    txid: string;
    outIndex: number;
    address: string;
    value: number;
    height: number;
  }[]
> {
  const { list } = await request(
    `https://www.metalet.space/wallet-api/v4/mvc/address/utxo-list`,
    {
      method: "GET",
      params: {
        address,
        net: network,
      },
    }
  ).then((res) => res.data.data);

  return list.filter((utxo) => utxo.value >= 600);
}

export async function fetchBiggestUtxo({
  address,
  network,
}: {
  address: string;
  network: BtcNetwork;
}): Promise<{
  txid: string;
  outIndex: number;
  address: string;
  value: number;
}> {
  return await fetchUtxos({ address, network }).then((utxos) => {
    if (utxos.length === 0) {
      console.log({ address });
      throw new Error("No UTXO");
    }
    return utxos.reduce((prev, curr) => {
      return prev.value > curr.value ? prev : curr;
    }, utxos[0]);
  });
}
export const createPinWithAssist = async (
  metaidData: any,
  options: {
    signMessage?: string;
    serialAction?: "combo" | "finish";
    network: API.Network;
    service?: {
      address: string;
      satoshis: string;
    };
    outputs?: {
      address: string;
      satoshis: string;
    }[];
    assist?: boolean;
    assistDomian: string;
  }
) => {
  const address = await window.metaidwallet.getAddress();
  const utxos = await window.metaidwallet.getUtxos();
  const utxo = utxos.find((utxo) => utxo.address === address);
  // const privateKey =
  //   "5d22e5db4258b8fff21e9d79784a13356ff6d409db3baaf42c701247f7bb8109";
  // const address = "mn7d2BYmUJ3Nvt7FAfKeGbiEjnHuPLkmYL";
  // const utxo = {
  //   flag: "e196df5ff3d67b0660bea985427d9bf17b8aa2796be7246a979eb049c2063c07_2",
  //   address: "mn7d2BYmUJ3Nvt7FAfKeGbiEjnHuPLkmYL",
  //   txid: "e196df5ff3d67b0660bea985427d9bf17b8aa2796be7246a979eb049c2063c07",
  //   outIndex: 2,
  //   value: 99998,
  //   height: 117888,
  // };
  if (!utxo) {
    throw new Error("no utxo");
  }
  // const txHex = buildTxHex1(
  //   [
  //     {
  //       txid: utxo.txid,
  //       index: utxo.outIndex,
  //       value: utxo.value,
  //     },
  //   ],
  //   address,
  //   Buffer.from(buildOpReturnV2(metaidData), "utf-8").toString("hex"),
  //   Buffer.from(address, "hex").toString("hex"),
  //   utxo.value
  // );
  const pinTxComposer = new TxComposer();
  pinTxComposer.appendP2PKHInput({
    address: new mvc.Address(address, options.network),
    satoshis: utxo.value,
    txId: utxo.txid,
    outputIndex: utxo.outIndex,
  });

  pinTxComposer.appendP2PKHOutput({
    address: new mvc.Address(address, options.network),
    satoshis: 1,
  });
  const metaidOpreturn = buildOpReturnV2(metaidData, {
    network: options?.network ?? "testnet",
  });
  pinTxComposer.appendOpReturnOutput(metaidOpreturn);
  const changeAddress = new mvc.Address(address, options.network);
  pinTxComposer.appendP2PKHOutput({
    address: changeAddress,
    satoshis: utxo.value,
  });
  const url = `${options.assistDomian}/v1/assist/gas/mvc/pre`;
  const preRes = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      txHex: pinTxComposer.getRawHex(),
      address,
    }),
  });
  const preData = await preRes.json();
  if (preData.error) {
    throw new Error(preData.error);
  }

  const tx = new mvc.Transaction(preData.data.txHex);
  const txObj = tx.toObject();
  console.log(tx);
  console.log(pinTxComposer.toObject());
  console.log(new TxComposer(tx).serialize());
  console.log(tx.toObject(), "tx.toObject()");
  const preTxComposer = new TxComposer(tx); //
  console.log(preTxComposer, "preTxComposer");

  let tx2 = new mvc.Transaction();
  const preTx = txObj.outputs.slice(-2);
  txObj.inputs.forEach((v, index) => {
    // console.log(v, index, "inputs");
    v.output = preTx[index];
    tx2.addInput(new mvc.Transaction.Input(v));
  });
  txObj.outputs.forEach((v) => {
    tx2.addOutput(new mvc.Transaction.Output(v));
  });
  tx.nLockTime = txObj.nLockTime;
  tx.version = txObj.version;
  let txComposer = new TxComposer(tx2);
  // txComposer.appendP2PKHInput({
  //   address: new mvc.Address(address, options.network),
  //   satoshis: utxo.value,
  //   txId: utxo.txid,
  //   outputIndex: utxo.outIndex,
  // });
  // const utxo2 = {
  //   flag: "93333e5fb658e42d0cd489420e6f989a8b0787f7b6a4ada08b86465cc96db3d9_2",
  //   address: "mhYJKXKYAUQMGKjMzYNatAVYuRJNLvquQZ",
  //   txid: "93333e5fb658e42d0cd489420e6f989a8b0787f7b6a4ada08b86465cc96db3d9",
  //   outIndex: 2,
  //   value: 10000000,
  //   height: 117872,
  // };
  // txComposer.appendP2PKHInput({
  //   address: new mvc.Address(utxo2.address, options.network),
  //   satoshis: utxo2.value,
  //   txId: utxo2.txid,
  //   outputIndex: utxo2.outIndex,
  // });
  txComposer.sigHashList = [];
  txComposer.changeOutputIndex = -1;
  console.log(txComposer, "txComposer");

  // txComposer.unlockP2PKHInput(new mvc.PrivateKey(privateKey, "testnet"), 0);
  
  // const toPayTransactions = [];
  // pinTxComposer.appendP2PKHOutput({
  //   address: new mvc.Address(address, options.network),
  //   satoshis: 1,
  // });
  // toPayTransactions.push({
  //   txComposer: pinTxComposer.serialize(),
  //   message: "Sign partial transaction",
  // });

  const ret = await window.metaidwallet.signPartialTx({
    toPayTransactions: [
      {
        txComposer: txComposer.serialize(),
        message: "create pin",
      },
    ],
    utxos: [utxo],
    sighashType: 195,
    hasMetaid: false,
  });
  console.log(ret);
  return;
  // const ret = await window.metaidwallet.signTransactions({
  //   transactions: [{
  //     txHex: preData.data.txHex,
  //     address: address,
  //     inputIndex: 0,
  //     scriptHex: "",
  //     satoshis: utxo.value,
  //     sigtype: 65,
  //   }],
  // },true);
  // console.log(ret);

  // debugger;

  // console.log(preTxComposer);
  // const txHex3 = txComposer.getRawHex();
  // if(ret[0])
  const commitUrl = `${options.assistDomian}/v1/assist/gas/mvc/commit`;
  const commitRes = await fetch(commitUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      txHex: ret.signedTransactions[0].txHex,
      orderId: preData.data.orderId,
    }),
  });
  const commitData = await commitRes.json();
  console.log(commitData);
  // console.log(preTxComposer);

  // const newTxComposer = new TxComposer();
  // preTxComposer.tx.inputs.forEach((input) => {

  //   newTxComposer.appendInput({
  //     txId: input.prevTxId,
  //     outputIndex: input.outputIndex,
  //   });
  // });
  // preTxComposer.tx.outputs.forEach((output) => {

  //   newTxComposer.appendOutput({
  //     lockingScript: output.script,
  //     satoshis: output.satoshis,
  //   });
  // });

  // console.log(newTxComposer.serialize());
  // const txObj = preTxComposer.toObject();
  // const raw = {
  //   ...txObj,
  //   txPrevOutputs: [...txObj.tx.outputs.slice(-2)],
  // };

  // txObj.tx.inputs.forEach((input, index) => {
  //   console.log(raw.txPrevOutputs[index]);
  //   input.output = raw.txPrevOutputs[index];
  // });

  // const serializedTx = JSON.stringify({
  //   ...txObj,
  //   txPrevOutputs: [...txObj.tx.outputs.slice(-2)],
  // });
  // console.log(4);
  // console.log(TxComposer.deserialize(serializedTx).toObject());

  // await window.metaidwallet.pay({
  //   transactions:[
  //     {
  //       txComposer: serializedTx,
  //       message: "Create pin",
  //     }
  //   ]
  // })

  // const ret = await window.metaidwallet.signPartialTx({
  //   toPayTransactions: [
  //     {
  //       txComposer: serializedTx,
  //       message: "create pin",
  //     },
  //   ],
  //   utxos: [utxo],
  //   hasMetaid: false,
  // });
  // console.log(tx, ret);
};

/**
 * 构建 txHex1
 * @param userInputs 用户的 UTXO 数组，每个对象包含 txid（字符串）、index（数字）、value（数字，单位：聪）
 * @param pin 需要存储的 PIN 数据（字符串）
 * @param opReturnData op_return 输出携带的数据（十六进制字符串，不含前缀）
 * @param changeAddress 用户找零地址，这里假设已转换为公钥哈希的 hex 字符串（20字节）
 * @param changeValue 找零金额（单位：聪）
 * @returns 返回构造好的交易十六进制字符串 txHex1
 */
function buildTxHex1(
  userInputs: { txid: string; index: number; value: number }[],
  pin: string,
  opReturnData: string,
  changeAddress: string,
  changeValue: number
): string {
  let txHex = "";

  // 1. 版本 (4 字节 little-endian)，这里使用版本 1
  txHex += "01000000";

  // 2. 输入数量 (varint)
  txHex += toVarInt(userInputs.length);

  // 3. 遍历所有输入
  for (let i = 0; i < userInputs.length; i++) {
    const input = userInputs[i];
    // 3.1 交易ID：原始 txid 需反转字节顺序（32 字节）
    txHex += reverseHex(input.txid);
    // 3.2 输出索引（4 字节 little-endian）
    txHex += toLittleEndianHex(input.index, 4);
    // 3.3 scriptSig 长度及内容
    // 根据说明，index为0的输入不需要签名，因此 scriptSig 为空，长度为 0
    txHex += "00";
    // 3.4 序列号（4 字节，这里使用 0xffffffff）
    txHex += "ffffffff";
  }

  // 4. 输出数量 (固定 3 个输出)
  txHex += toVarInt(3);

  // 4.1 输出1：用于存储 PIN 的输出，金额为 1 聪
  // 金额 1 聪转换为 8 字节 little-endian
  txHex += toLittleEndianHex(1, 8);
  // 构造 scriptPubKey：直接将 PIN 数据以 pushData 形式嵌入（注意：实际场景中可能有更复杂的逻辑）
  const pinHex = Buffer.from(pin, "utf8").toString("hex");
  const pinScript = toPushData(pinHex);
  txHex += toVarInt(pinScript.length / 2); // script 长度（字节数）
  txHex += pinScript;

  // 4.2 输出2： op_return 输出，金额为 0
  txHex += toLittleEndianHex(0, 8);
  // op_return 脚本：OP_RETURN（0x6a） + pushData opReturnData
  const opReturnScript = "6a" + toPushData(opReturnData);
  txHex += toVarInt(opReturnScript.length / 2);
  txHex += opReturnScript;

  // 4.3 输出3：找零输出，金额为 changeValue
  txHex += toLittleEndianHex(changeValue, 8);
  // 构造 P2PKH 脚本：
  // 格式：OP_DUP (0x76) + OP_HASH160 (0xa9) + PUSH (0x14) + <20字节 pubKeyHash> + OP_EQUALVERIFY (0x88) + OP_CHECKSIG (0xac)
  const changeScript = "76a914" + changeAddress + "88ac";
  txHex += toVarInt(changeScript.length / 2);
  txHex += changeScript;

  // 5. Locktime (4 字节，这里设为 0)
  txHex += "00000000";

  return txHex;
}

/**
 * 将一个数字转换为指定字节数的小端十六进制字符串
 * @param value 数值
 * @param bytes 字节数
 */
function toLittleEndianHex(value: number, bytes: number): string {
  const hex = value.toString(16).padStart(bytes * 2, "0");
  let leHex = "";
  for (let i = 0; i < hex.length; i += 2) {
    leHex = hex.substring(i, i + 2) + leHex;
  }
  return leHex;
}

/**
 * 生成 varint 编码（仅处理小于 0xfd 的情况）
 * @param num 数值
 */
function toVarInt(num: number): string {
  if (num < 0xfd) {
    return num.toString(16).padStart(2, "0");
  }
  // 为简单起见，本示例只处理 num < 0xfd 的情况
  throw new Error("暂不支持大于等于 0xfd 的数字");
}

/**
 * 生成 pushData 格式的脚本段
 * 如果数据长度小于 0x4c，则直接用长度作为 pushData opcode
 * @param hexData 待推送的数据（十六进制字符串）
 */
function toPushData(hexData: string): string {
  const dataLength = hexData.length / 2;
  if (dataLength < 0x4c) {
    return dataLength.toString(16).padStart(2, "0") + hexData;
  }
  // 超过简单范围不做处理
  throw new Error("数据太长，暂不支持");
}

/**
 * 反转十六进制字符串的字节顺序（用于 txid 等），要求 hex 长度为偶数
 * @param hex 待反转的十六进制字符串
 */
function reverseHex(hex: string): string {
  if (hex.length % 2 !== 0) {
    throw new Error("Hex 字符串长度必须为偶数");
  }
  let reversed = "";
  for (let i = hex.length; i > 0; i -= 2) {
    reversed += hex.substring(i - 2, i);
  }
  return reversed;
}
