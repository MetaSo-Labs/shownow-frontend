import Trans from "@/Components/Trans"
import { Avatar, Button, Card, Divider, List, Skeleton } from "antd"
import './index.less'
import { useEffect, useState } from "react";
import { Notification, NotificationStore } from "@/utils/NotificationStore";
import { useModel } from "umi";
import NotificationItem from "@/Components/NotificationItem";


const PAGE_SIZE = 10;
export default () => {
    const { user, updateNotify } = useModel('user');
    const [initLoading, setInitLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Notification[]>([]);
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

    const fetchData = async (currentPage: number, _activeTabKey?: string) => {
        if (!user.address) {
            return Promise.resolve([]);
        }
        const store = new NotificationStore();

        const currentAddress = user.address;
        await store.markAllAsRead(currentAddress)
        await updateNotify()
        const data = await store.getAllNotifications(currentAddress, {
            offset: (currentPage - 1) * PAGE_SIZE,
            limit: PAGE_SIZE,
            notifcationType: _activeTabKey === 'reward' ? '/protocols/simpledonate' : undefined,
        })
        return data

    };

    useEffect(() => {
        fetchData(page, activeTabKey).then((res) => {
            const results = Array.isArray(res) ? res : [];
            setInitLoading(false);
            setData(results);
            setList(results);
            setLoading(false);
            if (results.length < PAGE_SIZE) {
                setHasMore(false);
            }
        });
    }, [page, activeTabKey]);

    const onLoadMore = () => {
        setLoading(true);
        setList(data.concat(Array.from({ length: PAGE_SIZE }).map(() => ({ loading: true }))));
        const nextPage = page + 1;
        setPage(nextPage);

    };

    const loadMore =
        !initLoading && !loading ? (
            <div
                style={{
                    textAlign: 'center',
                    marginTop: 12,
                    height: 32,
                    lineHeight: '32px',
                }}
            >
                {
                    hasMore ? <Button onClick={onLoadMore}>loading more</Button> : <Divider plain><Trans>It is all, nothing more 🤐</Trans></Divider>
                }

            </div>
        ) : null;
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
            className="notifications-list"
            loading={initLoading}
            itemLayout="horizontal"
            loadMore={loadMore}
            dataSource={list}
            renderItem={(item) => (
                <List.Item

                >
                    <Skeleton avatar title={false} loading={item.loading} active>
                        <NotificationItem notification={item} address={user.address} />
                    </Skeleton>
                </List.Item>
            )}
        />

    </Card>
}