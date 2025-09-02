import { fetchChatGroupInfo } from "@/request/metaso";
import { useQuery } from "@tanstack/react-query";
import { Skeleton, Space, theme, Typography } from "antd";
import { isEmpty } from "lodash";
import { useMemo } from "react";
import _chatAvatar from '@/assets/chatAvatar.png'
type Props = {
    groupId: string;
}
export default ({ groupId }: Props) => {
    const { isLoading, data } = useQuery({
        enabled: !isEmpty(groupId),
        queryKey: ["chatGroup", groupId],
        queryFn: () => fetchChatGroupInfo({ groupId: groupId }),
    });
    const groupInfo = useMemo(() => {
        if (!data) return null;
        return data.data;
    }, [data])

    const { token: {
        colorFillAlter
    } } = theme.useToken();

    return <>{
        isLoading ? <Skeleton active /> : null
    } {groupInfo && <Typography.Paragraph onClick={()=>{
        window.open(`https://chat.show.now/talk/channels/public/${groupId}`, '_blank');
    }}>
        <Typography.Text type='secondary'>From the public group chat</Typography.Text>
        <Typography.Text> "{groupInfo.roomName}"</Typography.Text>
        <div
            style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 12,
                background: colorFillAlter,
                borderRadius: 12,
                padding: 16,
                gap: 20,
                marginTop:16
            }}
        >
            <img src={_chatAvatar} alt="" style={{ height: 60 }} />
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 4
            }}>
                <div style={{
                    backgroundImage: 'linear-gradient(264deg, #FFC051 0%, #F700FB 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    fontSize: 16,
                    fontWeight: 600
                }}> {groupInfo.roomName}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30 }}>
                    <Space><Typography.Text type='secondary'>Creator:</Typography.Text><Typography.Text >{groupInfo.createUserInfo.name}</Typography.Text></Space>
                    <Space><Typography.Text type='secondary'>Member</Typography.Text><Typography.Text >{groupInfo.userCount}</Typography.Text></Space>
                </div>

            </div>
        </div>
    </Typography.Paragraph>}</>
}