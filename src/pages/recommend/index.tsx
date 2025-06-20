import { fetchAllBuzzs, fetchAllHotBuzzs, fetchAllRecommendBuzzs, fetchBuzzs, fetchFollowingList, fetchMyFollowingBuzzs, fetchMyFollowingTotal, getIndexTweet } from "@/request/api";
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
    const { btcConnector, user } = useModel('user');
    const tweetSet = useRef<Set<string>>(new Set());
    const containerRef = useRef<any>();
    const contentRef = useRef<any>();
    const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage, refetch } =
        useInfiniteQuery({
            queryKey: ['homebuzzrecommend', user.address],

            queryFn: async ({ pageParam: [lastId1, lastId2] }) => {
                const recommend = fetchAllRecommendBuzzs({
                    size: 10,
                    lastId: lastId1,
                    userAddress: user.address || '',
                });
                const news = fetchAllBuzzs({
                    size: 1,
                    lastId: lastId2,
                })
                const [recommendData, newsData] = await Promise.all([recommend, news]);
                if (!recommendData?.data || !newsData?.data) {
                    return {
                        list: [],
                        lastIds: ['', ''],
                    }
                }
                let list = [...(recommendData?.data?.list || [])];
                // 过滤掉已存在的推文
                (recommendData?.data?.list || []).forEach((item: API.Buzz) => {
                    if (item.id) {
                        tweetSet.current.add(item.id);
                    }
                });
                (newsData?.data?.list || []).forEach((item: API.Buzz) => {
                    if (tweetSet.current.has(item.id)) {
                        return;
                    }
                    if (item.id) {
                        list.push(item);
                        tweetSet.current.add(item.id);
                    }
                });

                return {
                    list,
                    lastIds: [recommendData?.data?.lastId, newsData?.data?.lastId],
                }
            },

            initialPageParam: ['', ''],
            getNextPageParam: (lastPage, allPages) => {
                const { lastIds } = lastPage
                if (!lastIds[0]) return
                return lastIds
            },
        });

    const tweets = useMemo(() => {
        return data ? data?.pages.reduce((acc, item) => {
            return [...acc || [], ...(item.list ?? []).filter(item => !item.blocked) || []]
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
        id="scrollableDivrecommend"
        ref={containerRef}
        style={{
            height: '100%',
            overflow: 'auto',
            paddingBottom:60
        }}
    >
        <InfiniteScroll
            dataLength={tweets.length}
            next={fetchNextPage}
            hasMore={hasNextPage}
            loader={<Card><Skeleton avatar paragraph={{ rows: 1 }} active /></Card>}
            endMessage={<Divider plain><Trans>It is all, nothing more 🤐</Trans></Divider>}
            scrollableTarget="scrollableDivrecommend"
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