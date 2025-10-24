import React, { useEffect, useMemo, useState } from 'react';
import { Image, theme } from 'antd';
import { useLocation } from 'umi';
import MediaRenderer from './MediaRenderer';
import { getFileType, FileType, getDownloadUrl } from './MediaRenderer/utils';
import { BASE_MAN_URL, FallbackImage } from '@/config';
import './imageGallery.less';

type Props = {
  decryptContent: {
    publicContent: string;
    encryptContent: string;
    publicFiles: string[];
    encryptFiles: string[];
    buzzType: "normal" | "pay";
    status: API.PayStatus;
  }
}

export default ({ decryptContent }: Props) => {
  const { pathname } = useLocation();
  const { token: { borderRadiusLG } } = theme.useToken();
  const [container, setContainer] = useState('image-container');

  const allFiles = useMemo(() => {
    const publicFiles = decryptContent?.publicFiles || [];
    const encryptFiles = decryptContent?.encryptFiles || [];
    return [...publicFiles, ...encryptFiles];
  }, [decryptContent]);


  const { images, otherFiles } = useMemo(() => {
    const images: string[] = [];
    const otherFiles: string[] = [];

    allFiles.forEach((file) => {
      // 处理加密文件（base64 格式）
      if (file.startsWith('data:') || (!file.includes('.') && file.length > 100)) {
        images.push(file);
        return;
      }

      const fileType = getFileType(file);
      if (fileType === FileType.IMAGE) {
        images.push(file);
      } else {
        otherFiles.push(file);
      }
    });

    return { images, otherFiles };
  }, [allFiles]);

  const imageCount = images.length;

  useEffect(() => {
    setContainer('image-container');
  }, [pathname]);

  // 根据图片数量设置不同的样式类
  const getGridClass = (count: number) => {
    switch (count) {
      case 1:
        return 'one-images';
      case 2:
        return 'two-images';
      case 3:
        return 'three-images';
      case 4:
        return 'four-images';
      case 5:
        return 'five-images';
      case 6:
        return 'six-images';
      case 7:
        return 'seven-images';
      case 8:
        return 'eight-images';
      case 9:
        return 'nine-images';
      default:
        return 'nine-images'; // 超过 9 张图则不显示更多
    }
  };

  const renderImageFile = (file: string, index: number) => {
    // 处理加密文件（base64）
    if (file.startsWith('data:') || (!file.includes('.') && file.length > 100)) {
      return (
        <Image
          key={`encrypt-${index}`}
          style={{
            objectFit: 'cover',
            height: '100%',
            borderRadius: borderRadiusLG,
            display: index > 8 ? 'none' : 'block',
          }}
          src={file.startsWith('data:') ? file : `data:image/jpeg;base64,${file}`}
          fallback={FallbackImage}
          className="image-item"
        />
      );
    }

    // 处理普通图片文件
    // 使用getDownloadUrl去除扩展名，保持与MediaRenderer一致的URL处理
    const imageUrl = getDownloadUrl(file);
    return (
      <Image
        key={`public-${index}`}
        style={{
          objectFit: 'cover',
          height: '100%',
          maxHeight: 400,
          borderRadius: borderRadiusLG,
          display: index > 8 ? 'none' : 'block',
        }}
        src={imageUrl}
        fallback={FallbackImage}
        className="image-item"
      />
    );
  };

  const renderOtherFile = (file: string, index: number) => {
    return (
      <div key={`other-${index}`} style={{ marginBottom: 8 }}>
        <MediaRenderer
          url={file}
          alt={`File ${index + 1}`}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        />
      </div>
    );
  };

  if (allFiles.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: 12, marginTop: 12 }}>
      {/* 渲染图片 */}
      {images.length > 0 && (
        <div
          onClick={(e) => { e.stopPropagation(); setContainer('root'); }}
          id='image-container'
          className={`image-container ${getGridClass(imageCount)}`}
        >
          <Image.PreviewGroup
            preview={{
              onChange: (current, prev) => console.log(`current index: ${current}, prev index: ${prev}`),
              getContainer: () => document.getElementById(container) as HTMLElement,
              movable: true,
              onVisibleChange: (visible, prevVisible) => {
                if (!visible) {
                  setContainer('image-container');
                }
              }
            }}
          >
            {images.map((file, index) => renderImageFile(file, index))}
          </Image.PreviewGroup>
        </div>
      )}

      {/* 渲染其他类型文件 */}
      {otherFiles.map((file, index) => renderOtherFile(file, index))}
    </div>
  );
};