/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import Compressor from "compressorjs";
import imageCompression from "browser-image-compression";
import CryptoJs from "crypto-js";
import encHex from "crypto-js/enc-hex";
const CryptoJS = CryptoJs;

export enum IsEncrypt {
  Yes = 1,
  No = 0,
}

export interface AttachmentItem {
  fileName: string;
  fileType: string;
  data: string;
  encrypt: IsEncrypt;
  sha256: string;
  size: number;
  url: string;
}

export function parseMetaFile(rawUri: string): string {
  // console.log("url", rawUri);
  // remove prefix: metafile://, then replace .jpeg with .jpg
  const METAFILE_API_HOST = "https://api.show3.io/metafile";
  const METACONTRACT_API_HOST = "https://api.show3.io/metafile/metacontract";

  const uri = rawUri.split(/metafile:\/\/|metacontract:\/\//)[1];
  // if there is no extension name in metaFile, add .png
  if (rawUri.includes("metafile")) {
    return `${METAFILE_API_HOST}/${uri}`;
  } else if (rawUri.includes("metacontract")) {
    return `${METACONTRACT_API_HOST}/${uri}`;
  } else {
    return rawUri;
  }
}

export function parseAvatarWithMetaid(metaid: string): string {
  const METAFILE_API_HOST = "https://api.show3.io/metafile";

  return `${METAFILE_API_HOST}/avatar/compress/${metaid}`;
}
export function parseAvatarWithUri(originUri: string, txid: string) {
  const METAFILE_API_HOST = "https://api.show3.io/metafile";
  if (originUri.includes("metafile")) {
    return `${METAFILE_API_HOST}/compress/${txid}`;
  }
  if (originUri.includes("sensibile")) {
    return `${METAFILE_API_HOST}/sensible/${
      originUri.split("sensibile://")[1]
    }`;
  }
  if (originUri.includes("metacontract")) {
    return `${METAFILE_API_HOST}/metacontract/${
      originUri.split("metacontract://")[1]
    }`;
  }
}

// https://api.show3.io/metafile/sensible/0d0fc08db6e27dc0263b594d6b203f55fb5282e2/204dafb6ee543796b4da6f1d4134c1df2609bdf1/6
// https://api.show3.io/metafile/avatar/compress/2df27132058cd24ff9ef2939315c9ca0d8ec88733f5bda0df130b7798efea972

// export async function compressImage(image: File) {
//   const compress = (quality: number): Promise<File> =>
//     new Promise((resolve, reject) => {
//       new Compressor(image, {
//         quality,
//         convertSize: 100_000, // 100KB
//         success: resolve as () => File,
//         error: reject,
//       });
//     });

//   // Use 0.6 compression ratio first; If the result is still larger than 1MB, use half of the compression ratio; Repeat 5 times until the result is less than 1MB, otherwise raise an error
//   let useQuality = 0.6;
//   for (let i = 0; i < 5; i++) {
//     const compressed = await compress(useQuality);
//     if (compressed.size < 1_000_000) {
//       return compressed;
//     }
//     useQuality /= 2;
//   }

//   throw new Error('Image is too large');
// }

export async function compressImage(image: File) {
  const options = {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
  };
  const compressedFile = await imageCompression(image, options);
  return compressedFile;
}

// 降文件转为 AttachmentItem， 便于操作/上链
export function FileToAttachmentItem(
  file: File,
  encrypt: IsEncrypt = IsEncrypt.No
) {
  return new Promise<AttachmentItem>(async (resolve) => {
    function readResult(blob: Blob) {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          // @ts-ignore
          const wordArray = CryptoJs.lib.WordArray.create(reader.result);
          // @ts-ignore
          const buffer = Buffer.from(reader.result);
          // console.log("buffer", buffer, reader.result);
          hex += buffer.toString("hex"); // 更新hex
          // 增量更新计算结果
          sha256Algo.update(wordArray); // 更新hash
          resolve();
        };
        reader.readAsArrayBuffer(blob);
      });
    }
    // 分块读取，防止内存溢出，这里设置为20MB,可以根据实际情况进行配置
    const chunkSize = 20 * 1024 * 1024;

    let hex = ""; // 二进制
    const sha256Algo = CryptoJs.algo.SHA256.create();

    for (let index = 0; index < file.size; index += chunkSize) {
      await readResult(file.slice(index, index + chunkSize));
    }
    resolve({
      data: hex,
      fileName: file.name,
      fileType: file.type,
      sha256: encHex.stringify(sha256Algo.finalize()),
      url: URL.createObjectURL(file),
      encrypt,
      size: file.size,
    });
  });
}
export function FileToBinaryData(
  file: File,
  encrypt: IsEncrypt = IsEncrypt.No
) {
  return new Promise<AttachmentItem>(async (resolve) => {
    function readResult(file: File) {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = () => {
          // @ts-ignore
          const wordArray = CryptoJs.lib.WordArray.create(reader.result);
          // 增量更新计算结果
          sha256Algo.update(wordArray); // 更新hash
          // @ts-ignore
          // const buffer = Buffer.from(reader.result);
          // console.log("buffer", buffer, reader.result);
          // hex += buffer.toString("hex"); // 更新hex

          binaryData = reader.result?.toString("UTF-8");
          // String.fromCharCode.apply(null, reader.result)
          resolve();
        };
      });
    }

    const sha256Algo = CryptoJs.algo.SHA256.create();
    let binaryData = "";
    await readResult(file);

    resolve({
      data: binaryData,
      fileName: file.name,
      fileType: file.type,
      sha256: encHex.stringify(sha256Algo.finalize()),
      url: URL.createObjectURL(file),
      encrypt,
      size: file.size,
    });
  });
}

export const image2Attach = async (images: FileList) => {
  const attachments: AttachmentItem[] = [];

  for (let i = 0; i < images.length; i++) {
    // 压缩图片
    const current = images[i];

    const compressed = await compressImage(current);
    const result = await FileToAttachmentItem(
      current.type === "image/gif" ? current : compressed
    );
    if (result) attachments.push(result);

    // if (attachments.length <= 3) {
    // } else {
    // 	break;
    // }
  }
  return attachments;
};

export const mergeFileLists = (
  fileListA: FileList,
  fileListB: FileList
): FileList => {
  const dataTransfer = new DataTransfer();

  for (let i = 0; i < fileListA.length; i++) {
    dataTransfer.items.add(fileListA[i]);
  }

  for (let i = 0; i < fileListB.length; i++) {
    dataTransfer.items.add(fileListB[i]);
  }

  return dataTransfer.files;
};

export function removeFileFromList(fileList: FileList, index: number) {
  // Step 1: Create a new File array without the file at the specified index
  const filesArray = Array.from(fileList)
    .slice(0, index)
    .concat(Array.from(fileList).slice(index + 1));

  // Step 2: Create a new FileList object with the remaining files
  const newFileList = new DataTransfer();
  for (let i = 0; i < filesArray.length; i++) {
    newFileList.items.add(filesArray[i]);
  }

  // Step 3: Return the new FileList object
  return newFileList.files;
}

export const convertToFileList = (images: any) => {
  const dataTransfer = new DataTransfer();

  images.forEach((image) => {
    dataTransfer.items.add(image.file); // 添加每个 File 对象
  });

  return dataTransfer.files; // 返回 FileList 对象
};

// Calculate the SHA-256 hash of a chunk
export function calculateChunkHash(chunk: ArrayBuffer): string {
  // Convert ArrayBuffer to CryptoJS WordArray
  const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(chunk));
  // Compute the SHA-256 hash
  const hash = CryptoJS.SHA256(wordArray);
  // Return the hash as a hexadecimal string
  return hash.toString(CryptoJS.enc.Hex);
}
// Convert a chunk to a hex string
function chunkToHexString(chunk: ArrayBuffer): string {
  // Convert ArrayBuffer to CryptoJS WordArray
  const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(chunk));
  // Convert the WordArray to a hex string
  return wordArray.toString(CryptoJS.enc.Hex);
}
export async function processFile(
  file: File,
  chunkSize: number = 0.1 * 1024 * 1024
): Promise<{ chunk: string; hash: string }[]> {
  const totalChunks = Math.ceil(file.size / chunkSize);
  const chunks = Array.from({ length: totalChunks }, (_, index) => {
    const start = index * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    return file.slice(start, end);
  });
  const parts = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkBuffer = await chunk.arrayBuffer();
    const chunkHex = chunkToHexString(chunkBuffer);
    const chunkHash = calculateChunkHash(chunkBuffer);
    parts.push({
      chunk: chunkHex,
      hash: chunkHash,
    });
  }
  return parts;
}
