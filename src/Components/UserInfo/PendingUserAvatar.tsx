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
        enabled: Boolean(address),
        queryKey: ['userInfo', address],
        queryFn: () => getUserInfo({ address }),
    });
    return isFetching ? <Skeleton.Avatar active size={size} shape='circle' /> :
        <UserAvatar src={profileUserData?.avatar} size={size} onClick={() => {
            history.push(`/profile/${address}`)
        }} />

}