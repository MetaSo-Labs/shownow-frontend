# 媒体渲染组件 (MediaRenderer)

## 概述

新的媒体渲染系统支持多种文件类型的智能识别和渲染，兼容新旧两种URL格式。

## 支持的格式

### 新格式
- `metafile://{pinId}.{文件类型}` 

### 旧格式（兼容）
- `/video/{pinid}`

## 文件类型支持

### 默认行为
**没有文件扩展名的URL默认按图片渲染**
- 例如：`metafile://abc123` 会被识别为图片类型
- 例如：`/video/xyz789` 也会被识别为图片类型（保持向下兼容）

### 1. 图片格式
**支持的扩展名**: jpg, jpeg, png, gif, svg, webp, avif, bmp, ico

**渲染方式**: 直接在页面中显示，支持预览和缩放

### 2. 视频格式  
**支持的扩展名**: mp4, webm, av1, avi, mov, wmv, flv, mkv, 3gp

**渲染方式**: 使用 Plyr 播放器组件在网页中播放
- 支持分片视频（自动检测和合并）
- 懒加载（进入视口时才加载）
- 自定义播放器控件

### 3. 音频格式
**支持的扩展名**: mp3, aac, wav, flac, ogg, wma, m4a

**渲染方式**: 使用 HTML5 音频播放器
- 显示音频图标和文件信息
- 内置播放控件

### 4. 文档格式
**支持的扩展名**: pdf, doc, docx, txt, rtf

**渲染方式**: 
- PDF: 支持浏览器预览 + 下载
- 其他文档: 仅支持下载

### 5. 压缩包格式
**支持的扩展名**: zip, rar, 7z, tar, gz, bz2

**渲染方式**: 显示压缩包图标，支持下载

### 6. 其他格式
**渲染方式**: 显示通用文件图标，支持下载

## 下载功能

- 所有可下载文件都不会自动添加扩展名后缀
- 下载文件名优先级：alt属性 > 从URL提取的文件名 > 默认名称
- 支持在新标签页中打开（PDF预览）

## 组件使用

### MediaRenderer 组件
```tsx
<MediaRenderer 
  url="metafile://example.pdf" 
  alt="示例文档"
  onClick={(e) => e.stopPropagation()}
/>
```

### EnhancedMediaGallery 组件
```tsx
<EnhancedMediaGallery 
  decryptContent={decryptContent} 
/>
```

## URL 处理

系统会自动处理不同格式的URL：

1. `metafile://abc123.pdf` → `https://man.metaid.io/content/abc123.pdf`
2. `/video/abc123` → `https://man.metaid.io/content/abc123`
3. 完整URL直接使用

## 兼容性

- 向下兼容原有的图片和视频渲染
- 保持原有的ImageGallery和Video组件功能
- 新增对更多文件类型的支持