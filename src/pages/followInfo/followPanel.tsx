import { FollowButtonComponent } from "@/Components/Follow";
import PendingUser from "@/Components/UserInfo/PendingUser";
import { fetchFollowerList, fetchFollowingList } from "@/request/api";
import { useQuery } from "@tanstack/react-query";
import { Card, List } from "antd";
import { isEmpty } from "ramda";
import { useState } from "react";
type Props = {
    metaid: string
    type: 'following' | 'follower'
}
export default ({ metaid, type }: Props) => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const { data } = useQuery({
        queryKey: [type, metaid, page, pageSize],
        enabled: !isEmpty(metaid),
        queryFn: () =>
            type === 'follower' ? fetchFollowerList({
                metaid: metaid,
                params: { cursor: String((page - 1) * pageSize), size: String(pageSize), followDetail: true },
            }) : fetchFollowingList({
                metaid: metaid,
                params: { cursor: String((page - 1) * pageSize), size: String(pageSize), followDetail: true },
            }),
    });
    return <Card><List
        itemLayout="horizontal"
        dataSource={data?.list ?? []}
        pagination={{
            position: 'bottom', align: 'end', current: page, pageSize: pageSize, total: data?.total || 0, onChange: (page, pageSize) => {
                console.log(page, pageSize);
                setPage(page)
                setPageSize(pageSize)
            }
        }}
        renderItem={(item: any, index) => (
            <List.Item>
                <PendingUser address={item.address} />
                <FollowButtonComponent metaid={item?.metaid || ''} size='small' />
            </List.Item>
        )}
    /></Card>
}