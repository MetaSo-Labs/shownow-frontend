import { fetchAllBuzzs, fetchAllHotBuzzs, fetchBuzzs, fetchFollowingList, fetchMyFollowingBuzzs, fetchMyFollowingTotal, getIndexTweet } from "@/request/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import './index.less'
import { Grid, Col, Divider, List, Row, Skeleton, Card } from "antd";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useModel } from "umi";
import Buzz from "@/Components/Buzz";
import InfiniteScroll from 'react-infinite-scroll-component';
import Trans from "@/Components/Trans";
import KeepAliveWrap from "@/Components/KeepAliveWrap";
const { useBreakpoint } = Grid

const Home = () => {

    const containerRef = useRef<any>();
    const contentRef = useRef<any>();
    const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage, refetch } =
        useInfiniteQuery({
            queryKey: ['homebuzzhot',],
            queryFn: ({ pageParam }) =>
                fetchAllHotBuzzs({
                    size: 30,
                    lastId: pageParam,
                }),
            initialPageParam: '',
            getNextPageParam: (lastPage, allPages) => {
                const { data: { lastId } } = lastPage
                if (!lastId) return
                return lastId;
            },
            refetchInterval: 1000 * 60 * 3, // 每3分钟刷新一次
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
        id="scrollableDivHot"
        ref={containerRef}
        style={{
            height: '100%',
            overflow: 'auto',
            paddingBottom: 60
        }}
    >
        {isLoading && <Card><Skeleton avatar paragraph={{ rows: 2 }} active /></Card>}
        <InfiniteScroll
            dataLength={tweets.length}
            next={fetchNextPage}
            hasMore={hasNextPage}
            loader={<Card><Skeleton avatar paragraph={{ rows: 2 }} active /></Card>}
            endMessage={<Divider plain><Trans>It is all, nothing more 🤐</Trans></Divider>}
            scrollableTarget="scrollableDivHot"
        >
            <List
                ref={contentRef}
                loading={isLoading}
                dataSource={tweets}
                renderItem={(item: API.Pin) => (
                    <List.Item key={item.id}>
                        <Buzz buzzItem={item} refetch={refetch} />
                    </List.Item>
                )}
            />
        </InfiniteScroll>
    </div>


}
export default () => {
    return <Home />
}