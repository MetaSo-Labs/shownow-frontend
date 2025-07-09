import { isEmpty } from "ramda";
import RepostDetail from "./RepostDetail";
import { useQuery } from "@tanstack/react-query";
import { fetchBuzzDetail, getReplyContent } from "@/request/api";
import { Card, Divider, theme, Typography } from "antd";
import PendingUserAvatar from "../UserInfo/PendingUserAvatar";

type Props = {
    buzzId: string;
    replyPinId: string;
    replyAddress: string;
    userAddress: string;
}
export default ({ buzzId, replyPinId, replyAddress, userAddress }: Props) => {
    const { token: { colorBgLayout } } = theme.useToken();

    const { isLoading: isLoadingUser, data: replyContent } = useQuery({
        queryKey: ['replyContent', replyPinId],
        queryFn: () => getReplyContent({ pinId: replyPinId! }),
        enabled: !isEmpty(buzzId),
    });
    const { isLoading, data: buzzDetail, refetch } = useQuery({
        enabled: !isEmpty(buzzId),
        queryKey: ['buzzDetail', buzzId],
        queryFn: () => fetchBuzzDetail({ pinId: buzzId! }),
    })
    console.log('replyContent', replyContent);
    if (isLoading || !buzzDetail) return <Card
        onClick={(e) => {
            e.stopPropagation();
        }}
        style={{ padding: 0, marginBottom: 12, boxShadow: "none" }}
        bordered={false}
        styles={{ body: { padding: 0 } }}
        loading={isLoading}
    >

    </Card>;

    return <Card style={{ padding: 0, marginBottom: 12, boxShadow: "none", border: 'none', background: colorBgLayout }}>
        <div style={{ display: 'flex', gap: 8 }}>
            <PendingUserAvatar address={replyAddress} size={34} />
            <Typography.Text style={{ lineHeight: '34px' }} >{replyContent?.content}</Typography.Text>
        </div>
        <Divider type="vertical" style={{height:26,margin:'12px 17px'}} />
        <div style={{ display: 'flex', gap: 8 }}>
            <PendingUserAvatar address={userAddress} size={34} />
            <RepostDetail buzzItem={{ ...buzzDetail.data.tweet, blocked: buzzDetail.data.blocked }} loading={isLoading} bordered={false} backgeround={colorBgLayout} showHeader={false} panding={0} />
        </div>


    </Card>
}