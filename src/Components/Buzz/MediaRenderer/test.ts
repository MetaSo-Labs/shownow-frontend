// 文件类型识别测试示例

import { getFileType, FileType, getDownloadUrl } from './utils';

// 文件类型测试用例
const fileTypeTestCases = [
  // 没有后缀的文件 - 应该返回 IMAGE
  { url: 'metafile://abc123', expected: FileType.IMAGE },
  { url: '/video/xyz789', expected: FileType.IMAGE },
  { url: 'https://man.metaid.io/content/def456', expected: FileType.IMAGE },
  
  // 有图片后缀的文件 - 应该返回 IMAGE  
  { url: 'metafile://abc123.jpg', expected: FileType.IMAGE },
  { url: 'metafile://abc123.png', expected: FileType.IMAGE },
  
  // 有视频后缀的文件 - 应该返回 VIDEO
  { url: 'metafile://abc123.mp4', expected: FileType.VIDEO },
  { url: 'metafile://abc123.webm', expected: FileType.VIDEO },
  
  // 有文档后缀的文件 - 应该返回 DOCUMENT
  { url: 'metafile://abc123.pdf', expected: FileType.DOCUMENT },
  { url: 'metafile://abc123.doc', expected: FileType.DOCUMENT },
  
  // 有压缩包后缀的文件 - 应该返回 ARCHIVE
  { url: 'metafile://abc123.zip', expected: FileType.ARCHIVE },
  { url: 'metafile://abc123.rar', expected: FileType.ARCHIVE },
];

// 下载URL测试用例
const downloadUrlTestCases = [
  // metafile:// 格式 - 应该移除扩展名
  { 
    url: 'metafile://4e8e5ef721753f87b24e165d649af3fdf50d8fb954e6e7787731283f9ec241eci0.pdf', 
    expected: '${BASE_MAN_URL}/content/4e8e5ef721753f87b24e165d649af3fdf50d8fb954e6e7787731283f9ec241eci0' 
  },
  { 
    url: 'metafile://abc123i0.zip', 
    expected: '${BASE_MAN_URL}/content/abc123i0' 
  },
  { 
    url: 'metafile://xyz789i0.jpg', 
    expected: '${BASE_MAN_URL}/content/xyz789i0' 
  },
  // 没有扩展名的情况
  { 
    url: 'metafile://abc123i0', 
    expected: '${BASE_MAN_URL}/content/abc123i0' 
  },
  // 完整URL - 应该移除扩展名
  { 
    url: 'https://www.show.now/man/content/4e8e5ef721753f87b24e165d649af3fdf50d8fb954e6e7787731283f9ec241eci0.pdf', 
    expected: 'https://www.show.now/man/content/4e8e5ef721753f87b24e165d649af3fdf50d8fb954e6e7787731283f9ec241eci0' 
  },
  {
    url: 'https://example.com/file/test.zip',
    expected: 'https://example.com/file/test'
  },
  {
    url: 'https://example.com/file/document.docx',
    expected: 'https://example.com/file/document'
  },
  // 旧格式 /video/
  { 
    url: '/video/abc123i0', 
    expected: '${BASE_MAN_URL}/content/abc123i0' 
  },
  // 不含扩展名的URL应保持不变
  {
    url: 'https://example.com/file/noextension',
    expected: 'https://example.com/file/noextension'
  },
  // 带查询参数的URL
  {
    url: 'https://example.com/file/test.pdf?download=true',
    expected: 'https://example.com/file/test?download=true'
  }
];

// 运行文件类型测试
console.log('文件类型识别测试：');
fileTypeTestCases.forEach(({ url, expected }) => {
  const actual = getFileType(url);
  const passed = actual === expected;
  console.log(`${passed ? '✅' : '❌'} ${url} -> ${actual} (期望: ${expected})`);
});

console.log('\n下载URL生成测试：');
downloadUrlTestCases.forEach(({ url, expected }) => {
  const actual = getDownloadUrl(url);
  const passed = actual === expected;
  console.log(`${passed ? '✅' : '❌'} ${url}`);
  console.log(`    实际: ${actual}`);
  console.log(`    期望: ${expected}`);
  console.log('');
});

export { fileTypeTestCases, downloadUrlTestCases };