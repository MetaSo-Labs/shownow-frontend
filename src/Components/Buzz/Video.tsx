import { getPinDetailByPid } from "@/request/api"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

export default ({ pid }: {
    pid: string
}) => {
    const [videoSrc, setVideoSrc] = useState<string>()
    const { data: fileIndex } = useQuery({
        queryKey: ['video', pid],
        queryFn: () => {
            return getPinDetailByPid({
                pid
            })
        },
    })

    const 
    return <div>Video</div>
}