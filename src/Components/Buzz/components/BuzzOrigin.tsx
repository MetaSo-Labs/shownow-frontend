import { Typography } from "antd";
import { useModel } from "umi";

type BuzzOriginProps = {
    host: string;
}

export default ({ host }: BuzzOriginProps) => {
    if (!host) {
        return null
    }
    const { domainMap } = useModel('dashboard');
    const domain = domainMap[host];
    if (!domain) return <>
        <Typography.Text type='secondary' style={{ fontSize: 10, lineHeight: 1 }}>from</Typography.Text>
        <Typography.Text style={{ fontSize: 10, lineHeight: 1 }}> {host.length > 10 ? host.substring(0, 10) + '...' : host}</Typography.Text>
    </>
    return <>
        <Typography.Text type='secondary' style={{ fontSize: 10, lineHeight: 1 }}>from</Typography.Text>
        {/^(?!\-)(?:[A-Za-z0-9-]{1,63}\.?)+(?<=\.[A-Za-z]{2,})$/.test(domain) ? <Typography.Link href={`https://${domain}`} target="_blank" style={{ fontSize: 10, lineHeight: 1 }} onClick={(e) => e.stopPropagation()}>
            {domain}
        </Typography.Link> : <Typography.Text style={{ fontSize: 10, lineHeight: 1 }}>{domain.length > 10 ? domain.substring(0, 10) + '...' : domain} </Typography.Text>}

    </>
}