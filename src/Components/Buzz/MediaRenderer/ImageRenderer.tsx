import React from 'react';
import { Image } from 'antd';
import { FallbackImage } from '@/config';

interface ImageRendererProps {
  url: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

const ImageRenderer: React.FC<ImageRendererProps> = ({
  url,
  alt,
  className,
  style,
  onClick,
}) => {
    console.log('Rendering image with URL:', url);
  return (
    <Image
      src={url}
      alt={alt}
      className={className}
      style={{
        objectFit: 'cover',
        borderRadius: '8px',
        maxWidth: '100%',
        maxHeight: '400px',
        ...style,
      }}
      fallback={FallbackImage}
      onClick={onClick}
      preview={{
        mask: false,
      }}
    />
  );
};

export default ImageRenderer;