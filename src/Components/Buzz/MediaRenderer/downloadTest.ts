// 测试下载URL去除扩展名功能
import { getDownloadUrl } from './utils';

// 模拟BASE_MAN_URL (需要根据实际配置修改)
console.log('下载URL测试:');

// 测试用例1: metafile://带PDF扩展名
const testUrl1 = 'metafile://4e8e5ef721753f87b24e165d649af3fdf50d8fb954e6e7787731283f9ec241eci0.pdf';
const result1 = getDownloadUrl(testUrl1);
console.log('输入:', testUrl1);
console.log('输出:', result1);
console.log('应该不包含 .pdf 扩展名');
console.log('---');

// 测试用例2: metafile://带ZIP扩展名  
const testUrl2 = 'metafile://abc123i0.zip';
const result2 = getDownloadUrl(testUrl2);
console.log('输入:', testUrl2);
console.log('输出:', result2);
console.log('应该不包含 .zip 扩展名');
console.log('---');

// 测试用例3: 完整HTTP URL带扩展名
const testUrl3 = 'https://www.show.now/man/content/test.docx';
const result3 = getDownloadUrl(testUrl3);
console.log('输入:', testUrl3);
console.log('输出:', result3);
console.log('应该不包含 .docx 扩展名');
console.log('---');

// 测试用例4: 没有扩展名的情况
const testUrl4 = 'metafile://abc123i0';
const result4 = getDownloadUrl(testUrl4);
console.log('输入:', testUrl4);
console.log('输出:', result4);
console.log('应该保持不变');

export default {};