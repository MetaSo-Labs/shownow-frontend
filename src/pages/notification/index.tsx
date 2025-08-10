import Trans from "@/Components/Trans"
import { Avatar, Button, Card, Divider, List, Skeleton } from "antd"
import './index.less'
import { useEffect, useMemo, useState } from "react";
import { Notification, NotificationStore } from "@/utils/NotificationStore";
import { useModel } from "umi";
import NotificationItem from "@/Components/NotificationItem";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScrollV2 from "@/Components/InfiniteScrollV2";


const PAGE_SIZE = 10;
export default () => {
    const { user, updateNotify } = useModel('user');
    const [initLoading, setInitLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [list, setList] = useState<Notification[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeTabKey, setActiveTabKey] = useState('all');
    const tabList = [
        {
            key: 'all',
            label: <Trans>All</Trans>
        },
        {
            key: 'reward',
            label: <Trans>Reward</Trans>,
        },
        {
            key: 'mint',
            label: <Trans>Mint</Trans>,
            disabled: true
        },
    ];


    useEffect(() => {
        const fetchData = async () => {
            if (!user.address) {
                return
            }
            const store = new NotificationStore();

            const currentAddress = user.address;
            await store.markAllAsRead(currentAddress)
            await updateNotify()

        };
        fetchData();

    }, [user.address]);


    const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage, refetch, isFetching } =
        useInfiniteQuery({
            queryKey: ['notifications', user.address, activeTabKey],
            enabled: !!user.address,
            initialPageParam: 1,
            queryFn: async ({ pageParam }) => {
                const store = new NotificationStore();
                const data = await store.getAllNotifications(user.address, {
                    offset: (pageParam - 1) * PAGE_SIZE,
                    limit: PAGE_SIZE,
                    notifcationType: activeTabKey === 'reward' ? '/protocols/simpledonate' : undefined,
                })
                return {
                    list: data,
                    page: pageParam,
                    hasMore: data.length === PAGE_SIZE,
                }
            },
            getNextPageParam: (lastPage, allPages) => {
                if (!lastPage.hasMore) return undefined;
                return lastPage.page + 1;
            },
        });


    const notifications: Notification[] = useMemo(() => {
        return data ? data?.pages?.reduce((acc: Notification[], item) => {
            return [...acc || [], ...(item.list ?? [])]
        }, []) as Notification[] : []
    }, [data])





    return <Card title={<Trans>Notifications</Trans>} bordered={false} className="notificationPage" tabList={tabList}
        activeTabKey={activeTabKey}
        onTabChange={(key) => {
            setActiveTabKey(key);
            setPage(1);

        }}
        tabProps={{
            centered: true,
            className: "homeTabs"
        }}>

        <List
            loading={isLoading}
            dataSource={notifications}
            renderItem={(item: Notification) => (
                <List.Item key={item.fromPinId} >
                    <NotificationItem notification={item} address={user.address} />
                </List.Item>
            )}
        />

        <InfiniteScrollV2
            id="notifications"
            onMore={() => {
                if (hasNextPage && !isFetchingNextPage) {
                    fetchNextPage()
                }
            }}
        />
        {(isLoading || isFetchingNextPage) && <Card><Skeleton avatar paragraph={{ rows: 2 }} active /></Card>}
        {(!isFetching && !hasNextPage && notifications.length > 0) &&
            <Divider plain><Trans>It is all, nothing more 🤐</Trans></Divider>}

    </Card>
}