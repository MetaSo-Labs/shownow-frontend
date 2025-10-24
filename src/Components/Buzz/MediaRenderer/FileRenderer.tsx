import React from 'react';
import { Card, Button, Typography } from 'antd';
import { 
  FileZipOutlined, 
  FileOutlined, 
  DownloadOutlined 
} from '@ant-design/icons';
import { getFileExtension, getFileTypeIcon, FileType, getFileType, getFileName, getDownloadUrl } from './utils';
import { formatMessage } from '@/utils/utils';

interface FileRendererProps {
  url: string;
  originalUrl: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

const { Text } = Typography;

const FileRenderer: React.FC<FileRendererProps> = ({
  url,
  originalUrl,
  alt,
  className,
  style,
  onClick,
}) => {
  const extension = getFileExtension(originalUrl).toLowerCase();
  const extensionUpper = extension.toUpperCase();
  const fileType = getFileType(originalUrl);
  const fileName = getFileName(originalUrl);

  const getIcon = () => {
    if (fileType === FileType.ARCHIVE) {
      return <FileZipOutlined style={{ fontSize: 32, color: '#722ed1' }} />;
    }
    return <FileOutlined style={{ fontSize: 32, color: '#8c8c8c' }} />;
  };

  const getFileTypeName = () => {
    switch (fileType) {
      case FileType.ARCHIVE:
        return formatMessage('Archive');
      default:
        return formatMessage('File');
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
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
    
    // 对于非PDF文件，使用window.open可能更可靠
    window.open(downloadUrl, '_blank');
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
            {alt || fileName || getFileTypeName()}
          </Text>
          <Text type="secondary">
            {extensionUpper} {getFileTypeName()}
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

export default FileRenderer;