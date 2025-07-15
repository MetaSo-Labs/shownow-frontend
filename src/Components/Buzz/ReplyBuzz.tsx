import { isEmpty } from "ramda";
import RepostDetail from "./RepostDetail";
import { useQuery } from "@tanstack/react-query";
import { fetchBuzzContent, fetchBuzzDetail, getReplyContent } from "@/request/api";
import { Alert, Button, Card, Divider, Skeleton, theme, Typography } from "antd";
import PendingUserAvatar from "../UserInfo/PendingUserAvatar";
import Trans from "../Trans";
import { useEffect } from "react";
import { FormatBuzz, formatSimpleBuzz } from "@/utils/buzz";
import ImageGallery from "./ImageGallery";
import { SimpleBuzzContent } from "./SimpleBuzz";
import { history } from "umi";
import BuzzOriginLink from "./components/BuzzOriginLink";

type Props = {
    buzzId: string;
    replyPinId: string;
    replyAddress: string;
    userAddress: string;
    host?: string;
    fromHost?: string;
    type?: 'repost' | 'comment';
}
export default ({ buzzId, replyPinId, replyAddress, userAddress, host = '', type, fromHost = '' }: Props) => {
    const { token: { colorBgLayout } } = theme.useToken();

    const { isLoading: isLoadingUser, data: replyContent } = useQuery({
        queryKey: ['replyContent', replyPinId],
        queryFn: () => getReplyContent({ pinId: replyPinId! }),
        enabled: !isEmpty(replyPinId),
    });







    return <Card style={{ padding: 0, marginBottom: 12, boxShadow: "none", border: 'none', background: colorBgLayout }}>
        <div style={{ display: 'flex', gap: 8 }}>
            <PendingUserAvatar address={replyAddress} size={34} />
            <BuzzOriginLink host={type === 'repost' ? fromHost : host} buzzId={type === 'repost' ? replyPinId : buzzId}>
                <Typography.Text style={{ lineHeight: '34px' }}  >{replyContent?.content||<Skeleton.Button active size='small' style={{marginTop:6}} />}</Typography.Text>
            </BuzzOriginLink>
        </div>
        <Divider type="vertical" style={{ height: 26, margin: '12px 17px' }} />
        <div style={{ display: 'flex', gap: 8 }}>
            <PendingUserAvatar address={userAddress} size={34} />
            <SimpleBuzzContent buzzId={buzzId} host={host} />
        </div>


    </Card>
}