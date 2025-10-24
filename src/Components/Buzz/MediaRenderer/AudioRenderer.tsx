import React from 'react';
import { Card, Typography } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import { getFileExtension, getFileName } from './utils';
import { formatMessage } from '@/utils/utils';

interface AudioRendererProps {
  url: string;
  originalUrl: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

const { Text } = Typography;

const AudioRenderer: React.FC<AudioRendererProps> = ({
  url,
  originalUrl,
  alt,
  className,
  style,
  onClick,
}) => {
  const extension = getFileExtension(originalUrl).toUpperCase();
  const fileName = getFileName(originalUrl);

  // 生成有意义的显示名称
  const getDisplayName = () => {
    if (alt && alt.trim()) {
      return alt.trim();
    }
    if (fileName && fileName.trim()) {
      return fileName.trim();
    }
    return formatMessage('Audio File');
  };

  return (
    <Card
      className={className}
      style={{
        marginBottom: 12,
        ...style,
      }}
      bodyStyle={{ padding: 12 }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <SoundOutlined style={{ fontSize: 24, color: '#1890ff' }} />
        <div>
          <Text strong>{getDisplayName()}</Text>
          {extension && (
            <Text type="secondary" style={{ marginLeft: 8 }}>
              {extension}
            </Text>
          )}
        </div>
      </div>
      <audio
        controls
        style={{ width: '100%' }}
        preload="metadata"
        onClick={(e) => e.stopPropagation()}
      >
        <source src={url.replace(`.${extension.toLowerCase()}`, '')} />
        {formatMessage('Your browser does not support audio playback')}
      </audio>
    </Card>
  );
};

export default AudioRenderer;