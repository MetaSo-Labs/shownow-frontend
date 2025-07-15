import { getUserInfo } from "@/request/api";
import { useQuery } from "@tanstack/react-query";
import { Skeleton, Space, Typography } from "antd";
import { history } from "umi";
import UserAvatar from "../UserAvatar";

type Props = {
    address: string,
    size?: number
}
export default ({ address, size = 34 }: Props) => {
    const {
        data: profileUserData,
        isFetching,
    } = useQuery({
        queryKey: ['userInfo', address],
        queryFn: () => getUserInfo({ address }),
    });
    return isFetching ? <Skeleton.Input active size='small' style={{
        maxWidth: 100
    }} /> :
        <Typography.Text strong style={{ cursor: 'pointer' }} onClick={() => {
            history.push(`/profile/${address}`)
        }}>
            {profileUserData?.name || address?.slice(0, 6) + '...'}
        </Typography.Text>

}