import { BASE_MAN_URL } from "@/config"
import { getPinDetailByPid } from "@/request/api"
import { useQuery } from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState } from "react"
import Plyr from "plyr-react";
import "plyr-react/plyr.css"
import './video.less'
import { useModel } from "umi";
import { Spin } from "antd";
async function fetchChunksAndCombine(chunkUrls: string[], dataType: string) {
    const responses = await Promise.all(chunkUrls.map(url => fetch(url)));
    const arrays = await Promise.all(responses.map(response => response.arrayBuffer()));
    const combined = new Uint8Array(arrays.reduce((acc, curr) => acc.concat(Array.from(new Uint8Array(curr)) as any), []));
    const videoBlob = new Blob([combined], { type: dataType });
    const videoUrl = URL.createObjectURL(videoBlob);
    return videoUrl;
}

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
export default ({ pid }: {
    pid: string;
}) => {
    const { showConf } = useModel('dashboard');
    if (!pid) return null;
    const ref = useRef<HTMLDivElement>(null)
    const [videoSrc, setVideoSrc] = useState<string>();
    const [isIntersecting, setIsIntersecting] = useState(false)
    const [loading, setLoading] = useState(false)

    const { data: metafile } = useQuery({
        queryKey: ['getPinDetailByPid', { pid }],
        enabled: !!pid,
        queryFn: () => {
            return fetch(`${BASE_MAN_URL}/content/${pid}`).then(res => res.json())
        }
    });
    const _fetchChunksAndCombine = useCallback(async () => {
        setLoading(true)
        try {
            if (isIntersecting && metafile) {
                const chunkUrls = (metafile as Metafile).chunkList.map(chunk => `${BASE_MAN_URL}/content/${chunk.pinId}`);
                const src = await fetchChunksAndCombine(chunkUrls, metafile.dataType);
                setVideoSrc(src)
            }
        } catch (e) {
            console.error(e)
        }

        setLoading(false)
    }, [isIntersecting, metafile])


    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting)
            },
            { threshold: 0.75 }
        )
        if (ref.current) observer.observe(ref.current)

        return () => {
            observer.disconnect()
        }
    }, [])

    useEffect(() => {
        _fetchChunksAndCombine()
    }, [_fetchChunksAndCombine])

    return <Spin spinning={!videoSrc} ><div ref={ref} onClick={(e) => e.stopPropagation()} style={{
        borderRadius: "16px",
        marginBottom: 12,
        overflow: "hidden",
        width: '100%',
        height: '300px',
        '--plyr-color-main': showConf?.brandColor,
    } as React.CSSProperties} className="video">
        <Plyr
            source={{
                type: "video",
                // @ts-ignore
                sources: [{ src: videoSrc, }],
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

    </div>
    </Spin>
}