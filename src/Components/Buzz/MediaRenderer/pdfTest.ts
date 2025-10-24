// 测试PDF URL处理
import { getFileUrl, getDownloadUrl, getFileType, getFileExtension } from './utils';

console.log('=== PDF URL 处理测试 ===');

// 测试案例1: metafile://格式的PDF
const testUrl1 = 'metafile://b219e5271e012fb8f711fa029fb76be6ea19bc674e95d2200555806d7f67a1dei0.pdf';
console.log('原始URL:', testUrl1);
console.log('预览URL (getFileUrl):', getFileUrl(testUrl1));
console.log('下载URL (getDownloadUrl):', getDownloadUrl(testUrl1));
console.log('文件类型:', getFileType(testUrl1));
console.log('扩展名:', getFileExtension(testUrl1));
console.log('---');

// 测试案例2: 直接文件名格式的PDF
const testUrl2 = 'b219e5271e012fb8f711fa029fb76be6ea19bc674e95d2200555806d7f67a1dei0.pdf';
console.log('原始URL:', testUrl2);
console.log('预览URL (getFileUrl):', getFileUrl(testUrl2));
console.log('下载URL (getDownloadUrl):', getDownloadUrl(testUrl2));
console.log('文件类型:', getFileType(testUrl2));
console.log('扩展名:', getFileExtension(testUrl2));
console.log('---');

// 测试案例3: 完整HTTP URL格式的PDF
const testUrl3 = 'https://www.show.now/man/content/b219e5271e012fb8f711fa029fb76be6ea19bc674e95d2200555806d7f67a1dei0.pdf';
console.log('原始URL:', testUrl3);
console.log('预览URL (getFileUrl):', getFileUrl(testUrl3));
console.log('下载URL (getDownloadUrl):', getDownloadUrl(testUrl3));
console.log('文件类型:', getFileType(testUrl3));
console.log('扩展名:', getFileExtension(testUrl3));

export default {};