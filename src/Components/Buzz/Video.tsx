import { BASE_MAN_URL } from "@/config"
import { getPinDetailByPid } from "@/request/api"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import Plyr from "plyr-react";
import "plyr-react/plyr.css"
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
    if (!pid) return null
    const [videoSrc, setVideoSrc] = useState<string>()

    const { data: metafile } = useQuery({
        queryKey: ['getPinDetailByPid', { pid }],
        enabled: !!pid,
        queryFn: () => {
            return fetch(`${BASE_MAN_URL}/content/${pid}`).then(res => res.json())
        }
    })

    useEffect(() => {
        if (metafile) {
            const chunkUrls = (metafile as Metafile).chunkList.map(chunk => `${BASE_MAN_URL}/content/${chunk.pinId==='0b29aaea8ab91226e4dfea10c093dd8c20e0c9f088e6f279f91babf8a2f04d56i0'?'d7e28e460e90bd6c84ec53651bc9f46bd4416dd338abaa3b17669b081fa0b212i0':chunk.pinId}`);
            fetchChunksAndCombine(chunkUrls, metafile.dataType).then(setVideoSrc)
        }
    }, [metafile])

    return <div onClick={(e) => e.stopPropagation()}>
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
                    "rewind",
                    "fast-forward",
                    "progress",
                    "current-time",
                    "mute",
                    "volume",
                    "captions",
                    "settings",
                    // "pip",
                    "fullscreen"
                ],
                captions: { active: true, language: "auto", update: true },
                previewThumbnails: { enabled: false, src: "" }
            }}
        />
    </div>
}