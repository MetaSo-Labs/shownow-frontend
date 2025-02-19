import { fetchAllBuzzs } from "@/request/api";
import { useEffect, useMemo, useRef, useState } from "react"
import './index.less'
import { Divider, List, Row, Skeleton, Grid, Drawer } from "antd";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useModel } from "umi";
import Buzz from "@/Components/Buzz";
import InfiniteScroll from 'react-infinite-scroll-component';
import Trans from "@/Components/Trans";

import KeepAliveWrap from "@/Components/KeepAliveWrap";
import Tweet, { TweetCard } from "../tweet";

const { useBreakpoint } = Grid

const Home = () => {
    const { btcConnector, user } = useModel('user')
    const [open, setOpen] = useState(false)
    const [currentBuzzId, setCurrentBuzzId] = useState('');
    const containerRef = useRef<any>();
    const contentRef = useRef<any>();
    const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage, refetch } =
        useInfiniteQuery({
            queryKey: ['homebuzzesnew', user.address],
            queryFn: ({ pageParam }) =>
                fetchAllBuzzs({
                    size: 5,
                    lastId: pageParam,
                }),
            initialPageParam: '',
            getNextPageParam: (lastPage, allPages) => {
                const { data: { lastId } } = lastPage
                if (!lastId) return
                return lastId;
            },
        });

    const tweets = useMemo(() => {
        return data ? data?.pages.reduce((acc, item) => {
            return [...acc || [], ...(item.data.list ?? []).filter(item => !item.blocked) || []]
        }, []) : []
    }, [data])

    // 数据更新后检查高度
    useEffect(() => {
        if (!containerRef.current || !contentRef.current || isLoading || !hasNextPage) return;
        const containerHeight = containerRef.current.clientHeight;
        const contentHeight = contentRef.current.scrollHeight;
        // 如果内容高度不足且还有数据，继续加载
        if (contentHeight <= containerHeight) {
            fetchNextPage();
        }
    }, [data, hasNextPage, isLoading]);


    return <div
        id="scrollableDiv1"
        ref={containerRef}
        style={{
            height: '100%',
            overflow: 'auto',
        }}
    >
        {isLoading && <Skeleton avatar paragraph={{ rows: 2 }} active />}
        <InfiniteScroll
            dataLength={(tweets ?? []).length}
            next={fetchNextPage}
            hasMore={hasNextPage}
            loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
            endMessage={<Divider plain><Trans>It is all, nothing more 🤐</Trans></Divider>}
            scrollThreshold={0.9}
            scrollableTarget="scrollableDiv1"
        >
            <List
                dataSource={tweets}
                ref={contentRef}
                renderItem={(item: API.Pin) => (
                    <List.Item key={item.id} >
                        <Buzz buzzItem={item} refetch={refetch} />
                    </List.Item>
                )}
            />
        </InfiniteScroll>
        <Drawer
            title=""
            placement="right"
            closable={true}
            onClose={() => setOpen(false)}
            open={open}
            getContainer={false}
            width='100%'
            zIndex={99}
            styles={{ header: { display: 'none' }, body: { padding: 0 }, content: { borderRadius: 8 }, mask: { backgroundColor: 'rgba(0,0,0,0)' } }}
        >
            {currentBuzzId && <TweetCard quotePinId={currentBuzzId} onClose={() => {
                setOpen(false); history.pushState({}, '', '/home')

            }} />}

        </Drawer>
    </div>


}


export default () => {
    return <Home />

}