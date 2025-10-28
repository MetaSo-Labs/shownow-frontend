import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import { useModel } from 'umi';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';
import { getPinId } from './utils';
import './video.less';

interface VideoRendererProps {
    url: string;
    alt?: string;
    className?: string;
    style?: React.CSSProperties;
    onClick?: (e: React.MouseEvent) => void;
}

// 用于处理分片视频的类型定义
type Chunk = {
    sha256: string;
    pinId: string;
};

type Metafile = {
    chunkList: Chunk[];
    fileSize: number;
    chunkSize: number;
    dataType: string;
    name: string;
    chunkNumber: number;
    sha256: string;
};

async function fetchChunksAndCombine(chunkUrls: string[], dataType: string) {
    const responses = await Promise.all(chunkUrls.map(url => fetch(url)));
    const arrays = await Promise.all(responses.map(response => response.arrayBuffer()));
    const combined = new Uint8Array(arrays.reduce((acc, curr) => acc.concat(Array.from(new Uint8Array(curr)) as any), []));
    const videoBlob = new Blob([combined], { type: dataType });
    const videoUrl = URL.createObjectURL(videoBlob);
    return videoUrl;
}

const VideoRenderer: React.FC<VideoRendererProps> = ({
    url,
    alt,
    className,
    style,
    onClick,
}) => {
    const { showConf } = useModel('dashboard');
    const ref = useRef<HTMLDivElement>(null);
    const [videoSrc, setVideoSrc] = useState<string>();
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isChunkedVideo, setIsChunkedVideo] = useState(false);

    const pinId = getPinId(url);
    console.log('VideoRenderer URL and pinId:', url, pinId);

    // 检查是否为分片视频
    const checkIfChunkedVideo = useCallback(async () => {
        try {
            const response = await fetch(url);
            const contentType = response.headers.get('content-type') || '';
            console.log('Fetched content type:', contentType);
            // 如果是 JSON 响应，可能是分片视频的元数据
            if (contentType.includes('application/json') || contentType.includes('text/plain')) {
                const metafile = await response.json() as Metafile;
                if (metafile.chunkList && metafile.chunkList.length > 0) {
                    setIsChunkedVideo(true);
                    return metafile;
                }
            }

            // 如果是普通视频文件，直接使用 URL
            if (contentType.includes('video/')) {
                setVideoSrc(url);
                return null;
            }

            return null;
        } catch (error) {
            console.error('Error checking video type:', error);
            // 如果检查失败，尝试直接使用 URL
            setVideoSrc(url);
            return null;
        }
    }, [url]);

    const processChunkedVideo = useCallback(async () => {
        if (!isIntersecting || !isChunkedVideo) return;

        setLoading(true);
        try {
            const metafile = await checkIfChunkedVideo();
            if (metafile) {
                const chunkUrls = metafile.chunkList.map(chunk =>
                    url.replace(pinId, chunk.pinId)
                );
                const processedUrl = await fetchChunksAndCombine(chunkUrls, metafile.dataType);
                setVideoSrc(processedUrl);
            }
        } catch (error) {
            console.error('Error processing chunked video:', error);
        } finally {
            setLoading(false);
        }
    }, [isIntersecting, isChunkedVideo, url, pinId, checkIfChunkedVideo]);

    // 初始化检查视频类型
    useEffect(() => {
        checkIfChunkedVideo();
    }, [checkIfChunkedVideo]);

    // 处理分片视频
    useEffect(() => {
        processChunkedVideo();
    }, [processChunkedVideo]);

    // 交叉观察器，用于懒加载
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
            },
            { threshold: 0.75 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    console.log('VideoRenderer state:', { videoSrc, isChunkedVideo, isIntersecting, loading });

    return (
        <Spin spinning={loading}>
            <div
                ref={ref}
                onClick={onClick}
                // className={className}
                className="video"
                style={{
                    borderRadius: '16px',
                    marginBottom: 12,
                    overflow: 'hidden',
                    width: '100%',
                    height: '300px',
                    '--plyr-color-main': showConf?.brandColor,
                    // ...style,
                } as React.CSSProperties}
            >
                {videoSrc && (
                    <Plyr
                        source={{
                            type: 'video' as const,
                            sources: [{ src: videoSrc, type: 'video/mp4' }],
                        }}
                        options={{
                            controls: [
                                "play-large",
                                "play",
                                "progress",
                                "current-time",
                                "mute",
                                "fullscreen"
                            ],
                            captions: { active: true, language: "auto", update: true },
                            previewThumbnails: { enabled: false, src: "" }
                        }}
                    />
                )}
            </div>
        </Spin>
    );
};

export default VideoRenderer;