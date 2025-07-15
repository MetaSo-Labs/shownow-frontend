import Trans from "@/Components/Trans";
import { message, Tooltip, Typography } from "antd";
import { history, useModel } from "umi";

type BuzzOriginProps = {
    host: string;
    buzzId?: string;
    children?: React.ReactNode;
    style?: React.CSSProperties;
}

export default ({ host, children, style, buzzId }: BuzzOriginProps) => {
    if (!host) {
        return null
    }
    const { domainMap } = useModel('dashboard');
    const domain = domainMap[host.toLowerCase()];
    if (!domain || !/^(?!\-)(?:[A-Za-z0-9-]{1,63}\.?)+(?<=\.[A-Za-z]{2,})$/.test(domain)) return <Tooltip title={<Trans>Domain is not configured for the original node.</Trans>} style={{ cursor: 'disable' }}>
        {children}
    </Tooltip>
    return <div onClick={(e) => {
        e.stopPropagation()
        if (domain === window.location.hostname) {
            history.push(`/buzz/${buzzId}`);
        }
        window.open(`https://${domain}/buzz/${buzzId}`, '_blank');
    }} style={{ cursor: 'pointer', display: 'inline', ...style }} >
        {children}
    </div>
}
