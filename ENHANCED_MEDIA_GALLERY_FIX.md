# EnhancedMediaGallery URL 扩展名移除修复

## 修复内容

### 问题描述
EnhancedMediaGallery 组件在渲染图片时，URL 包含了文件扩展名，与 MediaRenderer 的处理方式不一致：

**修复前**：
```
http://127.0.0.1:3000/man/content/aaa5d159dc8e28c5c9832183e2edbb394cf6c88dee4146e329642b6a55796ef3i0.jpg
```

**修复后**：
```
http://127.0.0.1:3000/man/content/aaa5d159dc8e28c5c9832183e2edbb394cf6c88dee4146e329642b6a55796ef3i0
```

### 修改内容

1. **导入 getDownloadUrl 函数**
```typescript
import { getFileType, FileType, getDownloadUrl } from './MediaRenderer/utils';
```

2. **简化 URL 处理逻辑**
```typescript
// 修复前：复杂的条件判断
const imageUrl = file.startsWith('metafile://') 
  ? `${BASE_MAN_URL}/content/${file.replace('metafile://', '')}`
  : file.startsWith('http') 
    ? file 
    : `${BASE_MAN_URL}/content/${file}`;

// 修复后：统一使用 getDownloadUrl
const imageUrl = getDownloadUrl(file);
```

3. **清理调试日志**
移除了 `console.log('Rendering image file URL:', imageUrl);` 调试输出

## 技术优势

### 1. 统一性
- EnhancedMediaGallery 和 MediaRenderer 现在使用相同的 URL 处理逻辑
- 保证了整个应用中图片 URL 处理的一致性

### 2. 简洁性
- 移除了复杂的条件判断逻辑
- 代码更简洁易维护

### 3. 扩展名移除
- 图片 URL 不再包含文件扩展名
- 与用户要求保持一致

## 兼容性

### 支持的 URL 格式
- `metafile://` 格式：自动转换并移除扩展名
- HTTP 完整 URL：处理并移除扩展名  
- 纯 pinId：添加基础 URL 并确保无扩展名

### 不影响的功能
- Base64 加密文件处理逻辑保持不变
- 图片预览功能正常工作
- 图片网格布局不受影响

## 清理工作

同时清理了 AudioRenderer 中的调试日志：
```typescript
// 移除了
console.log('Audio file extension:', originalUrl, '->', extension);
```

## 验证结果

修复后，图片 URL 将是干净的格式，不包含文件扩展名，与 MediaRenderer 的行为完全一致。