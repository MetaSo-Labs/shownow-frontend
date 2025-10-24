# AudioRenderer 多语言和文件名修复

## 修复的问题

### 1. 硬编码中文问题
**问题**：`<Text strong>{alt || '音频文件'}</Text>` 使用了硬编码的中文
**解决**：使用多语言函数 `formatMessage('Audio File')`

### 2. 默认文件名问题  
**问题**：当没有alt属性时，显示"文件 1"等默认名称
**解决**：实现智能显示名称生成逻辑

## 修改内容

### 语言文件添加
**zh-CN.ts**:
```typescript
"Audio File": "音频文件",
"Your browser does not support audio playback": "您的浏览器不支持音频播放"
```

**en-US.ts**:
```typescript
"Audio File": "Audio File", 
"Your browser does not support audio playback": "Your browser does not support audio playback"
```

### AudioRenderer.tsx 修改

1. **导入多语言支持**:
```typescript
import { formatMessage } from '@/utils/utils';
import { getFileName } from './utils';
```

2. **添加originalUrl参数**:
```typescript
interface AudioRendererProps {
  url: string;
  originalUrl: string; // 新增
  alt?: string;
  // ...
}
```

3. **智能显示名称生成**:
```typescript
const getDisplayName = () => {
  if (alt && alt.trim()) {
    return alt.trim();
  }
  if (fileName && fileName.trim()) {
    return fileName.trim();
  }
  return formatMessage('Audio File');
};
```

4. **多语言文本替换**:
```typescript
// 原来
<Text strong>{alt || '音频文件'}</Text>
{/* 您的浏览器不支持音频播放。 */}

// 现在  
<Text strong>{getDisplayName()}</Text>
{formatMessage('Your browser does not support audio playback')}
```

### MediaRenderer.tsx 修改
为所有子组件统一传递 `originalUrl` 参数：

```typescript
const commonProps = {
  url: processedUrl,
  originalUrl: url, // 新增
  alt,
  className,
  style,
  onClick,
};
```

## 效果对比

### 修复前
- 显示："音频文件" (硬编码中文)
- 错误提示："您的浏览器不支持音频播放。" (硬编码中文)
- 无意义的默认名称

### 修复后  
- 中文环境：显示有意义的文件名或"音频文件"
- 英文环境：显示有意义的文件名或"Audio File"
- 错误提示自动多语言切换
- 优先显示用户提供的描述性名称

## 显示名称优先级

1. **alt 属性** (最高优先级)
2. **fileName** (从URL提取的文件名)
3. **多语言默认名称** (最低优先级)

这样既解决了硬编码中文的问题，又提供了更好的用户体验。