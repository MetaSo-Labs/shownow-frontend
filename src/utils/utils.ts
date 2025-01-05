import CryptoJS from "crypto-js";
import ECPairFactory from "ecpair";
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs";
import * as crypto from "crypto";

import { ec as EC } from "elliptic";
import { IMAGESIZE } from "@/config";
import { getIntl, getLocale } from "umi";

const ec = new EC("secp256k1");
export function generateAESKey() {
  // 32 字节 = 256 位
  const key = CryptoJS.lib.WordArray.random(32);
  // 将密钥转换为十六进制字符串
  return key.toString(CryptoJS.enc.Hex);
}

export function encryptPayloadAES(keyHex: string, payload: string): string {
  const key = CryptoJS.enc.Hex.parse(keyHex);
  const payloadWordArray = CryptoJS.enc.Hex.parse(payload);
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(payloadWordArray, key, {
    iv: iv,
    mode: CryptoJS.mode.CFB,
    padding: CryptoJS.pad.NoPadding,
  });

  const ivAndCiphertext = iv.concat(encrypted.ciphertext);
  return ivAndCiphertext.toString(CryptoJS.enc.Hex);
}

export function decryptPayloadAES(
  keyHex: string,
  encryptedHex: string
): string {
  // 将 Hex 格式的密钥解析为 CryptoJS WordArray
  const key = CryptoJS.enc.Hex.parse(keyHex);

  // 将加密内容解析为 WordArray
  const encryptedWordArray = CryptoJS.enc.Hex.parse(encryptedHex);

  // 提取 IV（前 16 字节）
  const iv = CryptoJS.lib.WordArray.create(
    encryptedWordArray.words.slice(0, 4),
    16
  );

  // 提取密文（去掉前 16 字节的 IV 部分）
  const ciphertext = CryptoJS.lib.WordArray.create(
    encryptedWordArray.words.slice(4),
    encryptedWordArray.sigBytes - 16
  );

  // 使用 AES 解密
  const decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphertext }, key, {
    iv: iv,
    mode: CryptoJS.mode.CFB,
    padding: CryptoJS.pad.NoPadding,
  });

  // 去除多余的字节（可能是乱码）
  const rawData = decrypted.toString(CryptoJS.enc.Hex);

  // 因为输入是 Hex 字符串，去掉可能存在的填充字节
  return rawData.slice(0, ciphertext.sigBytes * 2);
}

export function sha256sum(data: Buffer): Buffer {
  return crypto.createHash("sha256").update(data).digest();
}

export const handleSpecial = (summary: string) => {
  summary = summary
    .replace("<metaid_flag>", "metaid_flag")
    .replace("<operation>", "operation")
    .replace("<path>", "path")
    .replace("<encryption>", "encryption")
    .replace("<version>", "version")
    .replace("<content-type>", "content-type")
    .replace("<payload>", "payload");
  return summary;
};

export const detectUrl = (summary: string) => {
  const urlReg = /(https?:\/\/[^\s]+)/g;

  const urls = summary.match(urlReg);
  if (urls) {
    urls.forEach(function (url) {
      summary = summary.replace(
        url,
        `<a href="${url}" target="_blank" style="text-decoration: underline;">${url}</a>`
      );
    });
  }
  return summary;
};

export const openWindowTarget = () => {
  if (window.innerWidth > 768) {
    return "_blank";
  }
  return "_self";
};

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const formatMessage = (children: string) => {
  const intl = getIntl(getLocale());
  return intl.formatMessage({
    id: children,
    defaultMessage: children,
  });
};

export function checkImageSize(file: File) {
  if (file.size > 1024 * IMAGESIZE) {
    return [false, formatMessage("Image must smaller than 300k!")];
  } else {
    return [true, ""];
  }
}

export function determineAddressInfo(address: string): string {
  if (address.startsWith('bc1q')) {
    return 'p2wpkh'
  }
  if (address.startsWith('tb1q')) {
    return 'p2wpkh'
  }

  if (address.startsWith('bc1p')) {
    return 'p2tr'
  }

  if (address.startsWith('tb1p')) {
    return 'p2tr'
  }

  if (address.startsWith('1')) {
    return 'p2pkh'
  }
  if (address.startsWith('3') || address.startsWith('2')) {
    return 'p2sh'
  }
  if (address.startsWith('m') || address.startsWith('n')) {
    return 'p2pkh'
  }
  return 'unknown'
}
