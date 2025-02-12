import { Psbt, address as addressLib, initEccLib, script,networks } from "bitcoinjs-lib";
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

  const psbt = new Psbt(
    {
      network: options.network === "mainnet" ? networks.bitcoin : networks.testnet,
    }, 
  );
  const utxos = await window.metaidwallet.getUtxos();
  const utxo = utxos.find((utxo) => utxo.address === address);
  if (!utxo) {
    throw new Error("no utxo");
  }
  psbt.addInput({
    hash: utxo.txid,
    index: utxo.outIndex,
  });
  psbt.addOutput({
    address: address,
    value: BigInt(1),
  });
  const metaidOpreturn = buildOpReturnV2(metaidData, {
    network: options?.network ?? "testnet",
  });
  console.log(metaidOpreturn,'metaidOpreturn');
  // 将字符串和 Buffer 转换为 Buffer 数组
  const dataBuffers = metaidOpreturn.filter(item => item !== undefined && item !== null).map((item: any) =>
    Buffer.isBuffer(item) ? item : Buffer.from(item, "utf-8")
  );

  psbt.addOutput({
    script: script.compile([script.OPS.OP_RETURN, ...dataBuffers]),
    value: BigInt(0),
  });

  // if (
  //   options?.service &&
  //   options?.service.address &&
  //   options?.service.satoshis
  // ) {
  //   console.log(options.service.address, options.service.satoshis);
  //   psbt.addOutput({
  //     address: options.service.address,
  //     value: BigInt(options.service.satoshis),
  //   });
  // }

  // if (options?.outputs) {
  //   for (const output of options.outputs) {
  //     psbt.addOutput({
  //       address: output.address,
  //       value: BigInt(output.satoshis),
  //     });
  //   }
  // }
  psbt.addOutput({
    address,
    value: BigInt(utxo.value),
  });
  const txHex = psbt.toHex();
  const url = `${options.assistDomian}/v1/assist/gas/mvc/pre`;
  const preRes = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      txHex,
      address,
    }),
  });
  const preData = await preRes.json();
  if (preData.error) {
    throw new Error(preData.error);
  }
  const tx = Psbt.fromHex(preData.txHex);
  console.log(tx);
};
