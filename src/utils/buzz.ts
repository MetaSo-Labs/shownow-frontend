import {
  CreateOptions,
  IMvcConnector,
  IMvcEntity,
  MvcTransaction,
} from "@feiyangl1020/metaid";
import { AttachmentItem, processFile } from "./file";
import {
  decryptPayloadAES,
  encryptPayloadAES,
  generateAESKey,
  sha256sum,
  sleep,
} from "./utils";
import { curNetwork, FLAG } from "@/config";
import { IBtcConnector } from "@feiyangl1020/metaid";
import { InscribeData } from "@feiyangl1020/metaid/src/core/entity/btc";
import Decimal from "decimal.js";
import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs";
import ECPairFactory, { ECPairInterface, SignerAsync } from "ecpair";
import * as bitcoin from "bitcoinjs-lib";
import { dec, isEmpty } from "ramda";
import { v4 as uuidv4 } from "uuid";
import {
  broadcast,
  getControlByContentPin,
  getDecryptContent,
  getNFTItem,
  getPinDetailByPid,
} from "@/request/api";
import * as crypto from "crypto";
import { isArray } from "lib/tool";
bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);
type PostParams = {
  content: string;
  encryptImages: AttachmentItem[];
  publicImages: AttachmentItem[];
  encryptContent: string;
  nfts: string[];
  manDomain?: string;
};
export const postPayBuzz = async (
  {
    content,
    encryptImages,
    publicImages,
    encryptContent,
    nfts,
    manDomain = "",
  }: PostParams,
  price: string,
  address: string,
  feeRate: number,
  host: string,
  chain: API.Chain,
  btcConnector: IBtcConnector | undefined,
  mvcConnector: IMvcConnector | undefined,
  manPubKey: string,
  serviceFee:
    | {
        address: string;
        satoshis: string;
      }
    | undefined,
  payType?: string,
  payTicker?: API.IdCoin,
  payMrc20?: API.MRC20TickInfo | undefined,
  payMrc20Amount?: number | undefined
) => {
  let transactions: MvcTransaction[] = [];
  const randomKey = generateAESKey();
  const publicContent = content;
  const _encryptContent = encryptContent
    ? encryptPayloadAES(
        randomKey,
        Buffer.from(encryptContent, "utf-8").toString("hex")
      )
    : "";
  const { attachments, fileTransactions } = await postImages(
    publicImages,
    feeRate,
    host,
    chain,
    btcConnector,
    mvcConnector
  );
  transactions = fileTransactions;
  const {
    attachments: encryptAttachments,
    fileTransactions: encryptFileTransactions,
  } = await postEncryptImages(
    encryptImages,
    feeRate,
    host,
    chain,
    btcConnector,
    mvcConnector,
    randomKey,
    transactions
  );
  transactions = encryptFileTransactions;

  const payload = {
    publicContent,
    encryptContent: _encryptContent,
    contentType: "text/plain",
    publicFiles: [...nfts, ...attachments],
    encryptFiles: encryptAttachments,
  };
  const path = `${host || ""}/protocols/paybuzz`;
  const metaidData: InscribeData = {
    operation: "create",
    body: JSON.stringify(payload),
    path,
    contentType: "text/plain",
    flag: "metaid",
  };

  let pid = "";
  if (chain === "btc") {
    const ret = await btcConnector!.inscribe({
      inscribeDataArray: [metaidData],
      options: {
        noBroadcast: "no",
        feeRate: Number(feeRate),
        service: serviceFee,
      },
    });
    if (ret.status) throw new Error(ret.status);
    const [revealTxId] = ret.revealTxIds;
    pid = `${revealTxId}i0`;
  } else {
    const { transactions: pinTransations } = await mvcConnector!.createPin(
      metaidData,
      {
        network: curNetwork,
        signMessage: "create paybuzz",
        serialAction: "combo",
        transactions: [...transactions],
        service: serviceFee,
      }
    );
    transactions = pinTransations as MvcTransaction[];
    pid = transactions[transactions.length - 1].txComposer.getTxId() + "i0";
  }

  const { sharedSecret, ecdhPubKey } = await window.metaidwallet.common.ecdh({
    externalPubKey: manPubKey,
  });

  const contorlPayload: any = {
    controlPins: [pid],
    manDomain: manDomain || "",
    manPubkey: manPubKey,
    creatorPubkey: ecdhPubKey,
    encryptedKey: encryptPayloadAES(sharedSecret, randomKey),
  };

  if (payType === "mrc20" && payTicker) {
    contorlPayload.holdCheck = {
      type: "mrc20",
      ticker: payTicker.tick,
      amount: "1",
    };
  } else if (payType === "paymrc20" && payMrc20 && payMrc20Amount) {
    contorlPayload.payCheck = {
      type: "mrc20",
      ticker: payMrc20.tick,
      amount: payMrc20Amount,
      payTo: address,
    };
  } else if (payType === "holdmrc20" && payMrc20) {
    contorlPayload.holdCheck = {
      type: "mrc20",
      ticker: payMrc20.tick,
      amount: "1",
    };
  } else {
    contorlPayload.payCheck = {
      type: "chainCoin",
      ticker: "",
      amount: price,
      payTo: address,
    };
  }
  const contorlPath = `${host || ""}/metaaccess/accesscontrol`;
  const contorlMetaidData: InscribeData = {
    operation: "create",
    body: JSON.stringify(contorlPayload),
    path: contorlPath,
    contentType: "text/plain",
    flag: "metaid",
  };

  if (chain === "btc") {
    const ret = await btcConnector!.inscribe({
      inscribeDataArray: [contorlMetaidData],
      options: {
        noBroadcast: "no",
        feeRate: Number(feeRate),
        service: serviceFee,
      },
    });
    if (ret.status) throw new Error(ret.status);
  } else {
    await mvcConnector!.createPin(contorlMetaidData, {
      network: curNetwork,
      signMessage: "create accesscontrol",
      serialAction: "finish",
      transactions: [...transactions],
    });
  }

  return {
    payload: payload,
    pid,
  };
};

export const postVideo = async (
  file: File,
  host: string,
  chain: API.Chain,
  btcConnector: IBtcConnector | undefined,
  mvcConnector: IMvcConnector | undefined,
  mvcFeeRate: number
) => {
  //TODO

  let chunkTransactions: MvcTransaction[] = [];

  const chunkSize = 1024 * 1024 * 0.2;
  const { chunks, chunkNumber, sha256, fileSize, dataType, name } =
    await processFile(file, chunkSize);
  let chunkPids: string[] = [];
  let chunkList: any[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const { chunk, hash } = chunks[i];
    const metaidData: InscribeData = {
      operation: "create",
      body: chunk,
      path: `${host || ""}/file/chunk/${hash}`,
      contentType: "metafile/chunk;binary",
      encoding: "base64",
      flag: "metaid",
    };
    if (chain === "btc") {
      // todo
    } else {
      const serialAction = (i + 1) % 4 === 0 ? "finish" : "combo";
      const { transactions, txid, txids } = await mvcConnector!.createPin(
        metaidData,
        {
          network: curNetwork,
          signMessage: "file chunk",
          serialAction: serialAction,
          transactions: chunkTransactions,
          feeRate: mvcFeeRate,
        }
      );
      console.log(txids, "txids");
      console.log(txid, "txid");
      if (serialAction === "finish") {
        await sleep(20000);
      }

      if (txids || i === chunks.length - 1) {
        if (txids) {
          chunkList = [
            ...chunkList,
            ...txids.map((txid: string) => {
              return {
                sha256: hash,
                pinId: txid + "i0",
              };
            }),
          ];
        } else {
          chunkList = [
            ...chunkList,
            ...transactions!.map((tx) => {
              return {
                sha256: hash,
                pinId: tx.txComposer.getTxId() + "i0",
              };
            }),
          ];
        }
      }

      chunkTransactions = transactions as MvcTransaction[];
    }
  }
  const metaidData: InscribeData = {
    operation: "create",
    body: JSON.stringify({
      chunkList: chunkList,
      fileSize,
      chunkSize,
      dataType,
      name,
      chunkNumber,
      sha256,
    }),
    path: `${host || ""}/file/index/${uuidv4()}`,
    contentType: "metafile/index;utf-8",
    flag: "metaid",
  };
  const { transactions: pinTransations } = await mvcConnector!.createPin(
    metaidData,
    {
      network: curNetwork,
      signMessage: "file index",
      serialAction: "combo",
      transactions: [...(chunkTransactions ?? [])],
      feeRate: mvcFeeRate,
    }
  );
  chunkTransactions = pinTransations as MvcTransaction[];
  return {
    transactions: chunkTransactions,
    metafile:
      "metafile://video/" +
      chunkTransactions[chunkTransactions.length - 1].txComposer.getTxId() +
      "i0",
  };
};

export const postChunk = async () => {
  //TODO
};

export const postImages = async (
  images: AttachmentItem[],
  feeRate: number,
  host: string,
  chain: API.Chain,
  btcConnector: IBtcConnector | undefined,
  mvcConnector: IMvcConnector | undefined
) => {
  if (images.length === 0)
    return {
      attachments: [],
      fileTransactions: [],
    };

  const fileOptions: CreateOptions[] = [];
  for (const image of images) {
    fileOptions.push({
      body: Buffer.from(image.data, "hex").toString("base64"),
      contentType: `${image.fileType};binary`,
      encoding: "base64",
      flag: FLAG,
      path: `${host || ""}/file`,
    });
  }
  if (chain === "btc") {
    const fileEntity = await btcConnector!.use("file");
    const imageRes = await fileEntity.create({
      dataArray: fileOptions,
      options: {
        noBroadcast: "no",
        feeRate: Number(feeRate),
      },
    });
    return {
      attachments: imageRes.revealTxIds.map(
        (rid) => "metafile://" + rid + "i0"
      ),
      fileTransactions: [],
    };
  } else {
    let fileTransactions: MvcTransaction[] = [];
    const fileEntity = (await mvcConnector!.use("file")) as IMvcEntity;
    const finalAttachMetafileUri: string[] = [];

    for (let i = 0; i < fileOptions.length; i++) {
      const fileOption = fileOptions[i];
      const { transactions } = await fileEntity.create({
        data: fileOption,
        options: {
          network: curNetwork,
          signMessage: "upload image file",
          serialAction: "combo",
          transactions: fileTransactions,
        },
      });

      if (!transactions) {
        throw new Error("upload image file failed");
      }

      finalAttachMetafileUri.push(
        "metafile://" +
          transactions[transactions.length - 1].txComposer.getTxId() +
          "i0"
      );
      console.log("finalAttachMetafileUri", finalAttachMetafileUri);
      fileTransactions = transactions;
    }

    return {
      fileTransactions,
      attachments: finalAttachMetafileUri,
    };
  }
};

export const postEncryptImages = async (
  images: AttachmentItem[],
  feeRate: number,
  host: string,
  chain: API.Chain,
  btcConnector: IBtcConnector | undefined,
  mvcConnector: IMvcConnector | undefined,
  randomKey: string,
  _fileTransactions: MvcTransaction[]
) => {
  if (images.length === 0)
    return {
      attachments: [],
      fileTransactions: [..._fileTransactions],
    };

  const fileOptions: CreateOptions[] = [];
  for (const image of images) {
    fileOptions.push({
      body: encryptPayloadAES(
        randomKey,
        Buffer.from(image.data, "hex").toString("hex")
      ),
      contentType: `binary`,
      encoding: "binary",
      flag: FLAG,
      path: `${host || ""}/file`,
    });
  }
  if (chain === "btc") {
    const fileEntity = await btcConnector!.use("file");
    const imageRes = await fileEntity.create({
      dataArray: fileOptions,
      options: {
        noBroadcast: "no",
        feeRate: Number(feeRate),
      },
    });
    return {
      attachments: imageRes.revealTxIds.map(
        (rid) => "metafile://" + rid + "i0"
      ),
      fileTransactions: [],
    };
  } else {
    let fileTransactions: MvcTransaction[] = [..._fileTransactions];
    const fileEntity = (await mvcConnector!.use("file")) as IMvcEntity;
    const finalAttachMetafileUri: string[] = [];

    for (let i = 0; i < fileOptions.length; i++) {
      const fileOption = fileOptions[i];
      const { transactions } = await fileEntity.create({
        data: fileOption,
        options: {
          network: curNetwork,
          signMessage: "upload image file",
          serialAction: "combo",
          transactions: fileTransactions,
        },
      });

      if (!transactions) {
        throw new Error("upload image file failed");
      }

      finalAttachMetafileUri.push(
        "metafile://" +
          transactions[transactions.length - 1].txComposer.getTxId() +
          "i0"
      );
      fileTransactions = transactions;
    }

    return {
      fileTransactions,
      attachments: finalAttachMetafileUri,
    };
  }
};

export const buildAccessPass = async (
  pid: string,
  host: string,
  btcConnector: IBtcConnector | undefined,
  feeRate: number,
  payAddress: string,
  payAmount: string
) => {
  //TODO
  const payload = {
    accessControlID: pid,
  };
  const path = `${host || ""}/metaaccess/accesspass`;
  const metaidData: InscribeData = {
    operation: "create",
    body: JSON.stringify(payload),
    path,
    contentType: "text/plain",
    flag: "metaid",
  };
  const res = await btcConnector!.inscribe({
    inscribeDataArray: [metaidData],
    options: {
      noBroadcast: "no",
      feeRate: Number(feeRate),
      service: {
        address: payAddress, // payCheck.payTo
        satoshis: new Decimal(payAmount).mul(1e8).toString(), // payCheck.amount
      },
    },
  });
  if (res.status) throw new Error(res.status);
};

export const buildMRc20AccessPass = async (
  pid: string,
  host: string,
  btcConnector: IBtcConnector | undefined,
  feeRate: number,
  payAddress: string,
  payAmount: string,
  payMrc20: API.MRC20TickInfo
) => {
  const body = JSON.stringify([
    {
      amount: String(payAmount),
      vout: 1,
      id: payMrc20.mrc20Id,
    },
  ]);
  const payload = {
    accessControlID: pid,
  };
  const path = `${host || ""}/metaaccess/accesspass`;
  const metaidData: InscribeData = {
    operation: "create",
    body: JSON.stringify(payload),
    path,
    contentType: "text/plain",
    flag: "metaid",
  };
  if (!window.metaidwallet.btc.transferMRC20WithInscribe) {
    throw new Error(
      "transferMRC20WithInscribe is not supported in this wallet"
    );
  }
  const { commitTx, revealTx } = await window.metaidwallet.btc
    .transferMRC20WithInscribe({
      body,
      amount: payAmount,
      mrc20TickId: payMrc20.mrc20Id,
      flag: "metaid",
      commitFeeRate: feeRate,
      revealFeeRate: feeRate,
      inscribeMetaIdData: metaidData,
    })
    .catch((e) => {
      throw new Error(e);
    });
  if (!commitTx || !revealTx) {
    throw new Error("build mrc20 access pass failed");
  }
  console.log(commitTx, revealTx, "commitTx, revealTx");
  await broadcast(commitTx.rawTx, "btc");
  await sleep(1000);
  await broadcast(revealTx.rawTx, "btc");
  return { commitTx, revealTx };
};

function sha256ToHex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export const decodePayBuzz = async (
  buzzItem: API.Buzz,
  manPubKey: string,
  isLogin: boolean
): Promise<{
  publicContent: string;
  encryptContent: string;
  publicFiles: string[];
  encryptFiles: string[];
  nfts: API.NFT[];
  video: string[];
  buzzType: "normal" | "pay";
  status: API.PayStatus;
}> => {
  let _summary = buzzItem!.content;

  let isSummaryJson = _summary.startsWith("{") && _summary.endsWith("}");
  // console.log("isjson", isSummaryJson);
  // console.log("summary", summary);
  let parseSummary = { content: "" };
  try {
    parseSummary = isSummaryJson ? JSON.parse(_summary) : {};
  } catch (e) {
    console.log("parse summary error", e);
    isSummaryJson = false;
  }
  // const parseSummary = isSummaryJson ? JSON.parse(_summary) : {};
  if (!isSummaryJson) {
    return {
      publicContent: _summary,
      encryptContent: "",
      publicFiles: [],
      encryptFiles: [],
      nfts: [],
      video: [],
      buzzType: "normal",
      status: "unpurchased",
    };
  }

  if (!isEmpty(parseSummary?.attachments ?? [])) {
    const _publicFiles: string[] = [];
    const _nfts: API.NFT[] = [];
    const _videos: string[] = [];
    if (Array.isArray(parseSummary.attachments[0])) {
      parseSummary.attachments = parseSummary.attachments[0];
    }
    for (let i = 0; i < parseSummary.attachments.length; i++) {
      if (parseSummary.attachments[i].startsWith("metafile://nft/mrc721/")) {
        const _nftId = parseSummary.attachments[i].split(
          "metafile://nft/mrc721/"
        )[1];
        try {
          const nft = await getNFTItem({ pinId: _nftId });
          parseSummary.attachments[i] = JSON.parse(
            atob(nft.data.content)
          ).attachment[0].content;
          _nfts.push({
            ...nft.data,
            previewImage: parseSummary.attachments[i],
          });
        } catch (e) {}
      } else {
        if (parseSummary.attachments[i].startsWith("metafile://video/")) {
          _videos.push(
            parseSummary.attachments[i].split("metafile://video/")[1]
          );
        } else {
          if (parseSummary.attachments[i].startsWith("metafile://")) {
            parseSummary.attachments[i] =
              parseSummary.attachments[i].split("metafile://")[1];
          }
          _publicFiles.push(parseSummary.attachments[i]);
        }
      }
    }

    return {
      publicContent: parseSummary.content,
      encryptContent: "",
      publicFiles: _publicFiles,
      nfts: _nfts,
      encryptFiles: [],
      video: _videos,
      buzzType: "normal",
      status: "unpurchased",
    };
  }

  if (
    parseSummary.encryptContent ||
    !isEmpty(parseSummary?.encryptFiles ?? [])
  ) {
    const _publicFiles: string[] = [];
    const _nfts: API.NFT[] = [];
    for (let i = 0; i < parseSummary.publicFiles.length; i++) {
      if (parseSummary.publicFiles[i].startsWith("metafile://nft/mrc721/")) {
        const _nftId = parseSummary.publicFiles[i].split(
          "metafile://nft/mrc721/"
        )[1];
        try {
          const nft = await getNFTItem({ pinId: _nftId });
          parseSummary.publicFiles[i] = JSON.parse(
            atob(nft.data.content)
          ).attachment[0].content;
          _nfts.push({
            ...nft.data,
            previewImage: parseSummary.publicFiles[i],
          });
        } catch (e) {}
      } else {
        if (parseSummary.publicFiles[i].startsWith("metafile://")) {
          parseSummary.publicFiles[i] =
            parseSummary.publicFiles[i].split("metafile://")[1];
        }
        _publicFiles.push(parseSummary.publicFiles[i]);
      }
    }

    const { data: controlPin } = await getControlByContentPin({
      pinId: buzzItem!.id,
    });
    if (!controlPin) {
      return {
        publicContent: parseSummary.publicContent,
        encryptContent: "",
        publicFiles: _publicFiles,
        encryptFiles: [],
        video: [],
        nfts: _nfts,
        buzzType: "normal",
        status: "unpurchased",
      };
    }
    if (!isLogin) {
      return {
        publicContent: parseSummary.publicContent,
        encryptContent: "",
        publicFiles: _publicFiles,
        encryptFiles: parseSummary.encryptFiles,
        nfts: _nfts,
        video: [],
        buzzType: "pay",
        status: "unpurchased",
      };
    }
    // const { creatorPubkey, encryptedKey, manPubkey } = controlPin;
    const btcAddress = await window.metaidwallet.btc.getAddress();
    const mvcAddress = await window.metaidwallet.getAddress();
    if (buzzItem.creator === btcAddress || buzzItem.creator === mvcAddress) {
      const { manPubkey, encryptedKey } = controlPin;
      const { sharedSecret, ecdhPubKey } =
        await window.metaidwallet.common.ecdh({
          externalPubKey: manPubKey,
        });
      const key = decryptPayloadAES(sharedSecret, encryptedKey);
      const encryptContent = decryptPayloadAES(
        key,
        parseSummary.encryptContent
      );
      const { encryptFiles } = parseSummary;
      let decryptFiles: string[] = [];
      if (encryptFiles.length > 0) {
        const pids = encryptFiles.map((d: string) => d.split("metafile://")[1]);
        const _pins = await Promise.all(
          pids.map((pid: string) => getPinDetailByPid({ pid }))
        );
        const pins = _pins.filter((d) => Boolean(d));
        decryptFiles = pins.map((pin) => {
          return Buffer.from(
            decryptPayloadAES(key, pin.contentSummary),
            "hex"
          ).toString("base64");
        });
      }

      return {
        publicContent: parseSummary.publicContent,
        encryptContent: Buffer.from(encryptContent, "hex").toString("utf-8"),
        publicFiles: _publicFiles,
        nfts: _nfts,
        video: [],
        encryptFiles: decryptFiles,
        buzzType: "pay",
        status: "purchased",
      };
    }

    const { sharedSecret, ecdhPubKey } = await window.metaidwallet.common.ecdh({
      externalPubKey: manPubKey,
    });

    const timestamp = Math.floor(Date.now() / 1000);
    const _signStr = `${sharedSecret}${timestamp}${btcAddress}`;
    const sign = sha256ToHex(_signStr);
    let data;
    try {
      const decryptRet = await getDecryptContent(
        {
          publickey: ecdhPubKey,
          address: btcAddress,
          sign: sign,
          timestamp,
          pinId: buzzItem!.id,
          controlPath: "",
          controlPinId: controlPin.pinId,
        },
        controlPin.manDomain
      );
      data = decryptRet.data;
    } catch (e) {
      console.error("getDecryptContent error", e);
    }

    if (!data) {
      return {
        publicContent: parseSummary.publicContent,
        encryptContent: parseSummary.encryptContent,
        publicFiles: _publicFiles,
        nfts: _nfts,
        encryptFiles: parseSummary.encryptFiles,
        buzzType: "pay",
        video: [],
        status: "unpurchased",
      };
    }
    return {
      publicContent: parseSummary.publicContent,
      encryptContent:
        data.status === "purchased" ? data.contentResult || "" : "",
      publicFiles: _publicFiles,
      nfts: _nfts,
      video: [],
      encryptFiles:
        data.status === "purchased"
          ? data.filesResult || []
          : parseSummary.encryptFiles,
      buzzType: "pay",
      status: data.status,
    };
  }

  return {
    publicContent: parseSummary.content,
    encryptContent: "",
    publicFiles: [],
    encryptFiles: [],
    video: [],
    nfts: [],
    buzzType: "normal",
    status: "unpurchased",
  };
};
