
import { curNetwork } from "@/config"
import { Avatar } from "antd"
import { useMemo, useState } from "react"
import { useModel } from "umi"
type Props = {
    size?: number
    tick: string
    metadata?: string
}
export default ({ size = 40, tick, metadata = '' }: Props) => {
    const {showConf}=useModel('dashboard')
    const [err, setErr] = useState(false)
    const src = useMemo(() => {
        if (metadata && !err) {
            try {
                const data = JSON.parse(metadata);
               
                if (data.icon) {
                    return data.icon.replace('metafile://', `https://man${curNetwork === 'testnet' ? '-test' : ''}.metaid.io/content/`)
                }
                if (data.cover) {
                    return data.cover.replace('metafile://', `https://man${curNetwork === 'testnet' ? '-test' : ''}.metaid.io/content/`)
                }

            } catch (err) {
                return ''
            }
        }
        return ''
    }, [metadata, err])
    return <Avatar src={src ? <img src={src} onError={() => { setErr(true) }}></img> : null} style={{ background: showConf?.brandColor, color: '#fff', fontWeight: 'bold', fontSize: size * 16 / 40, minWidth: size }} size={size}>{tick && tick[0].toUpperCase()}</Avatar>
}