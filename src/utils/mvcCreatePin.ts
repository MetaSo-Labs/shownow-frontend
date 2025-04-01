import { TxComposer, mvc } from "meta-contract";

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
  const privateKey =
    "5d22e5db4258b8fff21e9d79784a13356ff6d409db3baaf42c701247f7bb8109";
  if (!utxo) {
    throw new Error("no utxo");
  }
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

  let tx2 = new mvc.Transaction();
  const preTx = txObj.outputs.slice(-2);
  txObj.inputs.forEach((v, index) => {
    v.output = preTx[index];
    tx2.addInput(new mvc.Transaction.Input(v));
  });
  txObj.outputs.forEach((v) => {
    tx2.addOutput(new mvc.Transaction.Output(v));
  });
  tx.nLockTime = txObj.nLockTime;
  tx.version = txObj.version;
  let txComposer = new TxComposer(tx2);
  txComposer.unlockP2PKHInput(new mvc.PrivateKey(privateKey, "testnet"), 0);
  const commitUrl = `${options.assistDomian}/v1/assist/gas/mvc/commit`;
  const commitRes = await fetch(commitUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      txHex: txComposer.getRawHex(),
      orderId: preData.data.orderId,
    }),
  });
  const commitData = await commitRes.json();
  console.log(commitData);
};

// Example usage:

// await createPinWithAssist(
//   {
//     body: JSON.stringify({
//       content: "test",
//       contentType: "text/plain",
//     }),
//     path: `/protocols/simplebuzz`,
//     operation: "create",
//   },
//   {
//     network: "testnet",
//     signMessage: "create buzz",
//     serialAction: "finish",
//     assistDomian: 'https://www.metaso.network/assist-open-api-testnet'
//   }
// );
