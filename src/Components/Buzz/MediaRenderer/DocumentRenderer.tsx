import React from 'react';
import { Card, Button, Typography, message } from 'antd';
import { FilePdfOutlined, FileTextOutlined, DownloadOutlined } from '@ant-design/icons';
import { getFileExtension, getFileName, getDownloadUrl, getMimeType } from './utils';
import { formatMessage } from '@/utils/utils';

interface DocumentRendererProps {
  url: string;
  originalUrl: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

const { Text } = Typography;

const DocumentRenderer: React.FC<DocumentRendererProps> = ({
  url,
  originalUrl,
  alt,
  className,
  style,
  onClick,
}) => {
  const extension = getFileExtension(originalUrl).toLowerCase();
  const extensionUpper = extension.toUpperCase();
  const fileName = getFileName(originalUrl);

  const getIcon = () => {
    if (extension === 'pdf') {
      return <FilePdfOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />;
    }
    return <FileTextOutlined style={{ fontSize: 32, color: '#1890ff' }} />;
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const downloadUrl = getDownloadUrl(originalUrl);
    
    // 生成一个有意义的文件名
    const generateFileName = () => {
      if (alt && alt.trim()) {
        return alt.trim();
      }
      if (fileName && fileName.trim()) {
        return fileName.trim();
      }
      // 从URL中提取pinId作为文件名
      const pinId = downloadUrl.split('/').pop() || '';
      if (pinId) {
        return pinId;
      }
      // 最后使用时间戳作为文件名
      return `file_${Date.now()}`;
    };
    
    const downloadFileName = generateFileName();
    
    if (extension === 'pdf') {
      // PDF文件需要特殊处理，强制下载而不是预览
      try {
        message.loading(formatMessage('Preparing download...'), 0);
        const response = await fetch(downloadUrl);
        message.destroy();
        
        if (!response.ok) {
          throw new Error(`${formatMessage('Server error')}: ${response.status}`);
        }
        
        const blob = await response.blob();
        // 确保blob具有正确的MIME类型
        const mimeType = getMimeType(extension);
        const typedBlob = new Blob([blob], { type: mimeType });
        const url = window.URL.createObjectURL(typedBlob);
        const link = document.createElement('a');
        link.href = url;
        // 使用生成的有意义的文件名
        link.download = downloadFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        message.success(formatMessage('Download started'));
      } catch (error) {
        message.destroy();
        console.error('Download failed:', error);
        message.error(formatMessage('Download failed, please try again'));
        // 如果fetch失败，回退到直接打开URL
        window.open(downloadUrl, '_blank');
      }
    } else {
      // 其他文档类型也使用相同的方式处理，确保MIME类型正确
      try {
        const response = await fetch(downloadUrl);
        if (!response.ok) {
          throw new Error(`${formatMessage('Server error')}: ${response.status}`);
        }
        
        const blob = await response.blob();
        const mimeType = getMimeType(extension);
        const typedBlob = new Blob([blob], { type: mimeType });
        const url = window.URL.createObjectURL(typedBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = downloadFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
        // 如果fetch失败，回退到直接打开URL
        window.open(downloadUrl, '_blank');
      }
    }
  };

  return (
    <Card
      className={className}
      style={{
        marginBottom: 12,
        cursor: 'pointer',
        ...style,
      }}
      bodyStyle={{ padding: 16 }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {getIcon()}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>
            {alt || fileName || formatMessage('Document')}
          </Text>
          <Text type="secondary">
            {extensionUpper} {formatMessage('Document')}
          </Text>
        </div>

        <div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            size="small"
          >
            {formatMessage('Download')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DocumentRenderer;