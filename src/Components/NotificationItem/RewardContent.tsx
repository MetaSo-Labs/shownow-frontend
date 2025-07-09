import { getRewardContent } from "@/request/api";
import { GifOutlined, GiftOutlined } from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query";
import { Card, theme, Typography } from "antd"
import { isEmpty } from "ramda";
import _btc from '@/assets/btc.png';
import _space from '@/assets/mvc.png';
type Props = {
    pinId: string;
}
export default ({ pinId }: Props) => {
    const { token: {
        colorPrimary,
        colorBgLayout
    } } = theme.useToken();
    const { data: rewardData, isLoading } = useQuery({
        queryKey: ['rewardData', pinId],
        queryFn: () => getRewardContent({ pinId }),
        enabled: !isEmpty(pinId),
    });
    console.log('rewardData', rewardData);
    return <Card style={{ background: colorBgLayout, border: 'none', boxShadow: 'none' }} loading={isLoading} styles={{
        body: {
            padding: 12
        }
    }}>
        <Typography style={{display:'inline-flex',alignItems:'center',gap:5}}><GiftOutlined style={{ color: colorPrimary }} /> Reward you <img src={rewardData?.coinType === 'btc' ? _btc : _space} alt="" style={{ width: 20, height: 20 }} />{rewardData?.amount} {rewardData?.coinType === 'btc' ? 'BTC' : 'SPACE'} </Typography>
    </Card>
}