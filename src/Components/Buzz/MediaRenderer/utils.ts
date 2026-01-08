import { METAFS_API as BASE_MAN_URL } from "@/config";
import { formatMessage } from "@/utils/utils";

export enum FileType {
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  DOCUMENT = "document",
  ARCHIVE = "archive",
  OTHER = "other",
}

// 图片格式
const IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "svg",
  "webp",
  "avif",
  "bmp",
  "ico",
];

// 视频格式
const VIDEO_EXTENSIONS = [
  "mp4",
  "webm",
  "av1",
  "avi",
  "mov",
  "wmv",
  "flv",
  "mkv",
  "3gp",
];

// 音频格式
const AUDIO_EXTENSIONS = ["mp3", "aac", "wav", "flac", "ogg", "wma", "m4a"];

// 文档格式
const DOCUMENT_EXTENSIONS = ["pdf", "doc", "docx", "txt", "rtf"];

// 压缩包格式
const ARCHIVE_EXTENSIONS = ["zip", "rar", "7z", "tar", "gz", "bz2"];

/**
 * 从 URL 中提取文件扩展名
 */
export function getFileExtension(url: string): string {
  // 处理 metafile:// 格式
  if (url.startsWith("metafile://")) {
    const path = url.replace("metafile://", "");
    const parts = path.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  }

  // 处理普通 URL
  const parts = url.split(".");
  if (parts.length > 1) {
    const ext = parts[parts.length - 1].toLowerCase();
    // 移除可能的查询参数
    return ext.split("?")[0].split("#")[0];
  }

  return "";
}

/**
 * 根据文件扩展名判断文件类型
 */
export function getFileType(url: string): FileType {
  // 特殊处理：检查URL路径中的类型标识
  if (url.includes("/video/")) {
    return FileType.VIDEO;
  }
  if (url.includes("/audio/")) {
    return FileType.AUDIO;
  }
  if (url.includes("/image/")) {
    return FileType.IMAGE;
  }

  const extension = getFileExtension(url);

  // 如果没有扩展名，默认当作图片处理
  if (!extension) {
    return FileType.IMAGE;
  }

  if (IMAGE_EXTENSIONS.includes(extension)) {
    return FileType.IMAGE;
  }

  if (VIDEO_EXTENSIONS.includes(extension)) {
    return FileType.VIDEO;
  }

  if (AUDIO_EXTENSIONS.includes(extension)) {
    return FileType.AUDIO;
  }

  if (DOCUMENT_EXTENSIONS.includes(extension)) {
    return FileType.DOCUMENT;
  }

  if (ARCHIVE_EXTENSIONS.includes(extension)) {
    return FileType.ARCHIVE;
  }

  return FileType.OTHER;
}

/**
 * 处理文件 URL，支持新旧格式
 * 旧格式：/video/{pinid}
 * 新格式：metafile://{pinId}.{文件类型}
 */
export function getFileUrl(url: string): string {
  // 如果是 metafile:// 格式，转换为 MAN URL
  if (url.startsWith("metafile://")) {
    const fullPath = url.replace("metafile://", "");

    // 处理特殊格式：metafile://video/pinId, metafile://audio/pinId 等
    if (
      fullPath.startsWith("video/") ||
      fullPath.startsWith("audio/") ||
      fullPath.startsWith("image/")
    ) {
      const pinId = fullPath.split("/")[1]; // 获取 / 后面的 pinId
      return `${BASE_MAN_URL}/content/${pinId}`;
    }

    // 处理普通格式：metafile://pinId.ext
    return `${BASE_MAN_URL}/content/${fullPath}`;
  }

  // 如果是旧的 /video/ 格式，保持兼容
  if (url.startsWith("/video/")) {
    const pinId = url.replace("/video/", "");
    return `${BASE_MAN_URL}/content/${pinId}`;
  }

  // 如果已经是完整 URL，直接返回
  if (url.startsWith("http")) {
    return url;
  }

  // 其他情况，当作 pinId 处理
  return `${BASE_MAN_URL}/content/${url}`;
}

/**
 * 从 URL 中提取 pinId
 */
export function getPinId(url: string): string {
 
  if (url.startsWith("metafile://")) {
    const fullPath = url.replace("metafile://", "");
    // 处理特殊格式：metafile://video/pinId, metafile://audio/pinId 等
    if (
      fullPath.startsWith("video/") ||
      fullPath.startsWith("audio/") ||
      fullPath.startsWith("image/")
    ) {
      return fullPath.split("/")[1]; // 获取 / 后面的 pinId
    }

    // 处理普通格式：metafile://pinId.ext
    // 移除文件扩展名

    const parts = fullPath.split(".");
    return parts.length > 1 ? parts.slice(0, -1).join(".") : fullPath;
  }

  if (url.startsWith("/video/")) {
    return url.replace("/video/", "");
  }

  // 从完整 URL 中提取
  if (url.includes("/content/")) {
    const parts = url.split("/content/");
    return parts[parts.length - 1];
  }

  const parts = url.split(".");
  return parts.length > 1 ? parts.slice(0, -1).join(".") : url;
}

/**
 * 从 URL 中提取文件名（不含扩展名）
 */
export function getFileName(url: string): string {
  // 处理 metafile:// 格式
  if (url.startsWith("metafile://")) {
    const path = url.replace("metafile://", "");
    const parts = path.split(".");
    // 返回不含扩展名的部分
    return parts.length > 1 ? parts.slice(0, -1).join(".") : path;
  }

  // 处理普通 URL
  const pathPart = url.split("/").pop() || "";
  const parts = pathPart.split(".");
  // 返回不含扩展名的部分
  return parts.length > 1 ? parts.slice(0, -1).join(".") : pathPart;
}

/**
 * 获取文件类型的显示名称
 */
export function getFileTypeDisplayName(fileType: FileType): string {
  switch (fileType) {
    case FileType.IMAGE:
      return "图片";
    case FileType.VIDEO:
      return "视频";
    case FileType.AUDIO:
      return "音频";
    case FileType.DOCUMENT:
      return "文档";
    case FileType.ARCHIVE:
      return "压缩包";
    case FileType.OTHER:
    default:
      return "文件";
  }
}

/**
 * 获取文件类型的多语言显示名称
 */
export function getFileTypeDisplayNameI18n(fileType: FileType): string {
  switch (fileType) {
    case FileType.IMAGE:
      return formatMessage("Image");
    case FileType.VIDEO:
      return formatMessage("Video");
    case FileType.AUDIO:
      return formatMessage("Audio");
    case FileType.DOCUMENT:
      return formatMessage("Document");
    case FileType.ARCHIVE:
      return formatMessage("Archive");
    case FileType.OTHER:
    default:
      return formatMessage("File");
  }
}

/**
 * 获取文件类型对应的图标
 */
export function getFileTypeIcon(fileType: FileType): string {
  switch (fileType) {
    case FileType.IMAGE:
      return "🖼️";
    case FileType.VIDEO:
      return "🎥";
    case FileType.AUDIO:
      return "🎵";
    case FileType.DOCUMENT:
      return "📄";
    case FileType.ARCHIVE:
      return "📦";
    case FileType.OTHER:
    default:
      return "📎";
  }
}

/**
 * 根据文件扩展名获取MIME类型
 */
export function getMimeType(extension: string): string {
  const ext = extension.toLowerCase();

  // 图片格式
  if (IMAGE_EXTENSIONS.includes(ext)) {
    switch (ext) {
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      case "svg":
        return "image/svg+xml";
      case "webp":
        return "image/webp";
      case "avif":
        return "image/avif";
      case "bmp":
        return "image/bmp";
      case "ico":
        return "image/x-icon";
      default:
        return "image/jpeg";
    }
  }

  // 视频格式
  if (VIDEO_EXTENSIONS.includes(ext)) {
    switch (ext) {
      case "mp4":
        return "video/mp4";
      case "webm":
        return "video/webm";
      case "avi":
        return "video/x-msvideo";
      case "mov":
        return "video/quicktime";
      case "wmv":
        return "video/x-ms-wmv";
      case "flv":
        return "video/x-flv";
      case "mkv":
        return "video/x-matroska";
      case "3gp":
        return "video/3gpp";
      default:
        return "video/mp4";
    }
  }

  // 音频格式
  if (AUDIO_EXTENSIONS.includes(ext)) {
    switch (ext) {
      case "mp3":
        return "audio/mpeg";
      case "aac":
        return "audio/aac";
      case "wav":
        return "audio/wav";
      case "flac":
        return "audio/flac";
      case "ogg":
        return "audio/ogg";
      case "wma":
        return "audio/x-ms-wma";
      case "m4a":
        return "audio/mp4";
      default:
        return "audio/mpeg";
    }
  }

  // 文档格式
  if (DOCUMENT_EXTENSIONS.includes(ext)) {
    switch (ext) {
      case "pdf":
        return "application/pdf";
      case "doc":
        return "application/msword";
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      case "txt":
        return "text/plain";
      case "rtf":
        return "application/rtf";
      default:
        return "application/octet-stream";
    }
  }

  // 压缩包格式
  if (ARCHIVE_EXTENSIONS.includes(ext)) {
    switch (ext) {
      case "zip":
        return "application/zip";
      case "rar":
        return "application/vnd.rar";
      case "7z":
        return "application/x-7z-compressed";
      case "tar":
        return "application/x-tar";
      case "gz":
        return "application/gzip";
      case "bz2":
        return "application/x-bzip2";
      default:
        return "application/zip";
    }
  }

  return "application/octet-stream";
}

/**
 * 获取预览URL（保留扩展名）
 * 预览时保留扩展名，让服务器能正确识别文件类型并设置Content-Type
 */
export function getPreviewUrl(url: string): string {
  return getFileUrl(url); // 预览时使用原始带扩展名的URL
}

/**
 * 获取下载URL（不含扩展名）
 * 下载时使用的URL应该去除文件扩展名
 */
export function getDownloadUrl(url: string): string {
  // 如果是 metafile:// 格式，转换为不含扩展名的 MAN URL
  if (url.startsWith("metafile://")) {
    const fullPath = url.replace("metafile://", "");

    // 处理特殊格式：metafile://video/pinId, metafile://audio/pinId 等
    if (
      fullPath.startsWith("video/") ||
      fullPath.startsWith("audio/") ||
      fullPath.startsWith("image/")
    ) {
      const pinId = fullPath.split("/")[1]; // 获取 / 后面的 pinId
      return `${BASE_MAN_URL}/content/${pinId}`;
    }

    // 处理普通格式：metafile://pinId.ext
    // 移除文件扩展名，获取纯 pinId
    const parts = fullPath.split(".");
    const pinId = parts.length > 1 ? parts.slice(0, -1).join(".") : fullPath;
    return `${BASE_MAN_URL}/content/${pinId}`;
  }

  // 如果是旧的 /video/ 格式，保持兼容
  if (url.startsWith("/video/")) {
    const pinId = url.replace("/video/", "");
    return `https://file.metaid.io/metafile-indexer/api/v1/files/content/${pinId}`;
  }

  // 如果已经是完整 URL，需要移除扩展名
  if (url.startsWith("http")) {
    // 先检查URL的路径部分是否包含扩展名
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const pathParts = pathname.split("/");
      const lastPart = pathParts[pathParts.length - 1];

      // 检查最后一部分是否包含扩展名
      const dotIndex = lastPart.lastIndexOf(".");
      if (dotIndex > 0) {
        const extension = lastPart.substring(dotIndex + 1);
        // 检查是否是有效的文件扩展名（长度小于5且只包含字母数字）
        if (extension.length <= 4 && /^[a-zA-Z0-9]+$/.test(extension)) {
          // 移除扩展名
          const nameWithoutExt = lastPart.substring(0, dotIndex);
          pathParts[pathParts.length - 1] = nameWithoutExt;
          urlObj.pathname = pathParts.join("/");
          const newUrl = urlObj.toString();
          return newUrl;
        }
      }
    } catch (e) {
      // 如果URL解析失败，使用字符串方法
      console.warn("Failed to parse URL, using string method:", e);
    }

    // 备用方法：使用字符串处理
    const urlParts = url.split(".");
    if (urlParts.length > 1) {
      const lastPart = urlParts[urlParts.length - 1];
      // 检查最后一部分是否是文件扩展名（长度小于5且不包含特殊字符）
      if (lastPart.length <= 4 && /^[a-zA-Z0-9]+(\?.*|#.*)?$/.test(lastPart)) {
        // 移除扩展名，但保留可能的查询参数
        const extensionWithParams = lastPart.split(/[?#]/);
        if (extensionWithParams[0].length <= 4) {
          return (
            urlParts.slice(0, -1).join(".") +
            (extensionWithParams.length > 1
              ? "?" + lastPart.split("?").slice(1).join("?")
              : "")
          );
        }
      }
    }
    return url;
  }

  // 其他情况，当作 pinId 处理，需要移除可能的扩展名
  if (url.includes(".")) {
    const parts = url.split(".");
    if (parts.length > 1) {
      const extension = parts[parts.length - 1];
      // 检查是否是有效的文件扩展名（长度小于5且只包含字母数字）
      if (extension.length <= 4 && /^[a-zA-Z0-9]+$/.test(extension)) {
        // 移除扩展名
        const fileNameWithoutExt = parts.slice(0, -1).join(".");
        return `${BASE_MAN_URL}/content/${fileNameWithoutExt}`;
      }
    }
  }
  return `${BASE_MAN_URL}/content/${url}`;
}

/**
 * 文件信息接口定义
 */
export interface FileInfo {
  pin_id: string;
  tx_id: string;
  path: string;
  operation: string;
  encryption: string;
  content_type: string;
  file_type: string;
  file_extension: string;
  file_name: string;
  file_size: number;
  file_md5: string;
  file_hash: string;
  storage_path: string;
  chain_name: string;
  block_height: number;
  timestamp: number;
  creator_meta_id: string;
  creator_address: string;
  owner_meta_id: string;
  owner_address: string;
}

export interface FileInfoResponse {
  code: number;
  message: string;
  processingTime: number;
  data: FileInfo;
}

/**
 * 从 API 获取文件信息
 */
export async function fetchFileInfo(pinId: string): Promise<FileInfo | null> {
  try {
    const response = await fetch(
      `https://file.metaid.io/metafile-indexer/api/v1/files/${pinId}`
    );
    if (!response.ok) {
      console.error('Failed to fetch file info:', response.status);
      return null;
    }
    const result: FileInfoResponse = await response.json();
    if (result.code === 0 && result.data) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching file info:', error);
    return null;
  }
}
