import { FollowButtonComponent } from "@/Components/Follow";
import PendingUser from "@/Components/UserInfo/PendingUser";
import { fetchFollowerList, fetchFollowingList } from "@/request/api";
import { useQuery } from "@tanstack/react-query";
import { Card, List } from "antd";
import { isEmpty } from "ramda";
type Props = {
    metaid: string
    type: 'following' | 'follower'
}
export default ({ metaid, type }: Props) => {

    const { data } = useQuery({
        queryKey: [type, metaid],
        enabled: !isEmpty(metaid),
        queryFn: () =>
            type === 'follower' ? fetchFollowerList({
                metaid: metaid,
                params: { cursor: '0', size: '100', followDetail: true },
            }) : fetchFollowingList({
                metaid: metaid,
                params: { cursor: '0', size: '100', followDetail: true },
            }),
    });
    console.log(data)
    return <Card><List
        itemLayout="horizontal"
        dataSource={data?.list}
        renderItem={(item: any, index) => (
            <List.Item>
                <PendingUser address={item.address} />
                <FollowButtonComponent metaid={item?.metaid || ''} size='small' />
            </List.Item>
        )}
    /></Card>
}