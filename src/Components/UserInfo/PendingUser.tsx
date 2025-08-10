import { getUserInfo } from "@/request/api";
import { useQuery } from "@tanstack/react-query";
import { Skeleton, Space, Tooltip, Typography } from "antd";
import { history, useMatch, useModel } from "umi";
import UserAvatar from "../UserAvatar";
import { useMemo } from "react";

type Props = {
    address: string
    isOwner?: boolean,
    showBio?: boolean
}
export default ({ address, isOwner, showBio = false }: Props) => {
    const { user } = useModel('user')
    const {
        data: profileUserData2,
        isFetching,
    } = useQuery({
        enabled: Boolean(address) && !isOwner,
        queryKey: ['userInfo', address],
        queryFn: () => getUserInfo({ address }),
    });
    const profileUserData = useMemo(() => {
        if (isOwner) {
            return { ...user }
        }
        return profileUserData2
    }, [profileUserData2, isOwner])




    return isFetching ? <Space>
        <Skeleton.Avatar active size={40} shape='circle' />
        <Skeleton.Input active size='default' style={{
            maxWidth: 100
        }} />
    </Space> : <Space style={{
        cursor: 'pointer'
    }} onClick={() => {
        history.push(`/profile/${address}`)
    }}>
        <UserAvatar src={profileUserData?.avatar} size={40} />
        <div>
            <Typography.Text strong style={{
                display: 'block',
                maxWidth: 100,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}>{profileUserData?.name || address?.slice(0, 6) + '...'}</Typography.Text>
            <Typography.Text type='secondary' copyable={
                {
                    text: profileUserData?.metaid,
                    tooltips: ['Copy', 'Copied!'],
                }
            } style={{
                display: 'block',
                maxWidth: 100,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}>MetaID:{profileUserData?.metaid || profileUserData?.metaid?.slice(0, 4) + '...'}</Typography.Text>
            {showBio && <Typography.Text type='secondary' style={{
                display: 'block',
                maxWidth: 100,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}><Tooltip title={profileUserData?.bio || '-'}>{profileUserData?.bio || '-'}</Tooltip></Typography.Text>}
        </div>
    </Space>
}