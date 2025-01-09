import { getUserInfo } from "@/request/api";
import { useQuery } from "@tanstack/react-query";
import { Skeleton, Space, Typography } from "antd";
import { history } from "umi";
import UserAvatar from "../UserAvatar";

type Props = {
    address: string
}
export default ({ address }: Props) => {
    const {
        data: profileUserData,
        isFetching,
    } = useQuery({
        queryKey: ['userInfo', address],
        queryFn: () => getUserInfo({ address }),
    });
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
        <Typography.Text strong style={{
            display: 'block',
            maxWidth: 100,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        }}>{profileUserData?.name}</Typography.Text>
    </Space>
}