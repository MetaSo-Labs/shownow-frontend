# NewPost 组件功能扩展总结

## 🎯 完成的功能

### ✅ 主要变更

1. **新增文件类型支持（仅MVC链）**：
   - 文档：PDF, DOC, DOCX, TXT, RTF
   - 压缩包：ZIP, RAR, 7Z, TAR, GZ
   - 音频：MP3, AAC, WAV, FLAC, OGG
   - 其他：JSON, XML, CSV

2. **文件扩展名支持**：
   - ✅ 图片文件：在生成 metafile URI 时添加扩展名（如 `.jpg`, `.png`）
   - ✅ 其他文件：在生成 metafile URI 时添加扩展名（如 `.pdf`, `.zip`）

3. **UI 增强**：
   - 新增其他文件上传按钮（📄 图标）
   - 文件预览卡片显示文件名和类型
   - 文件大小限制：10MB

## 🔧 技术实现

### 核心修改

1. **状态管理**：
   ```tsx
   const [otherFiles, setOtherFiles] = useState<any[]>([]);
   ```

2. **文件处理函数**：
   ```tsx
   const handleOtherFilesUpload = (file: any) => {
     // 文件类型验证和大小检查
   }
   ```

3. **metafile URI 生成**：
   ```tsx
   // 图片文件
   const extension = imageFile.fileName ? 
     `.${imageFile.fileName.split('.').pop()?.toLowerCase()}` : '';
   
   finalAttachMetafileUri.push(
     'metafile://' + txId + 'i0' + extension
   );
   
   // 其他文件
   const extension = otherFile.extension ? `.${otherFile.extension}` : '';
   const metafileUri = 'metafile://' + txId + 'i0' + extension;
   ```

## 📋 使用说明

### 文件上传限制
- **链支持**：仅MVC链支持其他文件类型（BTC链仅支持图片）
- **文件大小**：最大10MB
- **锁定模式**：加密模式下不支持其他文件上传

### URL格式示例
- 图片：`metafile://abc123i0.jpg`
- PDF：`metafile://def456i0.pdf`
- 音频：`metafile://ghi789i0.mp3`
- 压缩包：`metafile://jkl012i0.zip`

### 向下兼容
- 保持原有图片和视频上传功能不变
- 原有不含扩展名的URI仍然支持
- 新的URI格式与媒体渲染系统完美配合

## 🎨 UI 变化

1. **新增上传按钮**：文档图标，仅在MVC链且非锁定模式下可用
2. **文件预览**：显示文件名的卡片式预览
3. **文件管理**：支持删除已上传的其他文件

这次更新让 ShowNow 支持了更丰富的文件类型分享，用户可以上传文档、音频、压缩包等多种格式的文件！