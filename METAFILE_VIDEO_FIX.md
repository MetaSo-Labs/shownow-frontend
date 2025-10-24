# metafile://video/ URL格式支持修复

## 问题描述

用户发现无法渲染 `metafile://video/85d290cb22bac3a8d542c1b769e436080032ed76ed0771b6ea35814b86f7df7ei0` 这种格式的视频。

### 问题分析

这种URL格式的特点：
- 前缀：`metafile://video/`
- 没有文件扩展名
- 路径中包含类型标识 `video/`

原来的代码只处理：
1. `metafile://pinId.ext` (带扩展名)
2. `/video/pinId` (旧格式)

但没有处理 `metafile://video/pinId` 这种新格式。

## 修复内容

### 1. getFileType 函数优化

**修复前**：只根据文件扩展名判断类型，无扩展名默认为图片
```typescript
const extension = getFileExtension(url);
if (!extension) {
    return FileType.IMAGE; // 误判为图片
}
```

**修复后**：优先检查URL路径中的类型标识
```typescript
// 特殊处理：检查URL路径中的类型标识
if (url.includes('/video/')) {
    return FileType.VIDEO;
}
if (url.includes('/audio/')) {
    return FileType.AUDIO;
}
if (url.includes('/image/')) {
    return FileType.IMAGE;
}
```

### 2. getFileUrl 函数增强

**修复前**：简单替换 `metafile://`
```typescript
const pinId = url.replace('metafile://', '');
return `${BASE_MAN_URL}/content/${pinId}`;
```

**修复后**：区分处理不同格式
```typescript
if (url.startsWith('metafile://')) {
    const fullPath = url.replace('metafile://', '');
    
    // 处理特殊格式：metafile://video/pinId
    if (fullPath.startsWith('video/') || fullPath.startsWith('audio/') || fullPath.startsWith('image/')) {
        const pinId = fullPath.split('/')[1];
        return `${BASE_MAN_URL}/content/${pinId}`;
    }
    
    // 处理普通格式：metafile://pinId.ext
    return `${BASE_MAN_URL}/content/${fullPath}`;
}
```

### 3. getDownloadUrl 函数更新

同样的逻辑应用到下载URL生成，确保一致性。

### 4. getPinId 函数修复

确保能正确提取各种格式的pinId。

## URL格式支持对比

| 格式 | 修复前 | 修复后 |
|------|--------|--------|
| `metafile://video/pinId` | ❌ 识别为图片 | ✅ 正确识别为视频 |
| `metafile://audio/pinId` | ❌ 识别为图片 | ✅ 正确识别为音频 |
| `metafile://pinId.mp4` | ✅ 正确识别 | ✅ 正确识别 |
| `/video/pinId` | ✅ 正确识别 | ✅ 正确识别 |

## 处理结果示例

### 输入URL
```
metafile://video/85d290cb22bac3a8d542c1b769e436080032ed76ed0771b6ea35814b86f7df7ei0
```

### 处理结果
- **文件类型**: VIDEO (原来是IMAGE)
- **渲染URL**: `https://www.show.now/man/content/85d290cb22bac3a8d542c1b769e436080032ed76ed0771b6ea35814b86f7df7ei0`
- **下载URL**: 同上（无扩展名）

## 兼容性保证

✅ 向后兼容所有已有格式
✅ 新增对 `metafile://type/pinId` 格式的支持
✅ 保持原有URL处理逻辑不变

## 测试验证

可以通过 `test-metafile-video.html` 测试页面验证不同URL格式的处理结果。

现在视频渲染应该可以正常工作了！