import { fetchAllBuzzs, fetchAllHotBuzzs, fetchAllRecommendBuzzs, fetchBuzzs, fetchFollowingList, fetchMyFollowingBuzzs, fetchMyFollowingTotal, getIndexTweet, reportBuzzView } from "@/request/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import './index.less'
import { Grid, Col, Divider, List, Row, Skeleton, Card } from "antd";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useModel } from "umi";
import Buzz from "@/Components/Buzz";
import InfiniteScroll from 'react-infinite-scroll-component';
import Trans from "@/Components/Trans";
import KeepAliveWrap from "@/Components/KeepAliveWrap";
import InfiniteScrollV2 from "@/Components/InfiniteScrollV2";
const { useBreakpoint } = Grid

const Home = () => {
    const { btcConnector, user } = useModel('user');
    const tweetSet = useRef<Set<string>>(new Set());
    const containerRef = useRef<any>();
    const contentRef = useRef<any>();
    const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage, refetch, isFetching } =
        useInfiniteQuery({
            queryKey: ['homebuzzrecommend', user.address],

            queryFn: async ({ pageParam: [lastId1] }) => {
                console.log('Fetching page with lastId:', lastId1);
                const recommendData = await fetchAllRecommendBuzzs({
                    size: 10,
                    lastId: lastId1,
                    userAddress: user.address || localStorage.getItem('metaso_uuid') || '',
                });
                if (!recommendData?.data) {
                    return {
                        list: [],
                        lastIds: [''],
                    }
                }
                let list = [...(recommendData?.data?.list || [])];


                return {
                    list,
                    lastIds: [recommendData?.data?.lastId],
                }
            },

            initialPageParam: ['',],
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

    const [readItems, setReadItems] = useState<string[]>([]);
    const sentIds = useRef<Set<string>>(new Set()); // 用 Set 来存储已发送的 id
    const observerRef = useRef<IntersectionObserver | null>(null);

    const sendReadItemsToBackend = async (ids: string[]) => {
        try {
            if (!user?.address) return;
            reportBuzzView({
                pinIdList: ids,
                address: user.address
            })
            ids.forEach((id) => sentIds.current.add(id));
        } catch (error) {
            console.error('Error sending read items to backend', error);
        }
    };

    // 强制上报所有未上报的记录
    const forceReportAllPendingItems = async () => {
        // 直接从所有已加载的数据中获取ID，不再从readItems中过滤
        const allItemIds = (tweets as any[])?.map((item: any) => item.id)?.filter((id: string) => !sentIds.current.has(id)) || [];
        if (allItemIds.length > 0) {
            console.log('Force reporting all pending items before fetchNextPage:', allItemIds);
            await sendReadItemsToBackend(allItemIds);
        }
    };

    // 数据更新后检查高度
    useEffect(() => {
        if (!containerRef.current || !contentRef.current || isLoading || !hasNextPage) return;
        const containerHeight = containerRef.current.clientHeight;
        const contentHeight = contentRef.current.scrollHeight;
        // 如果内容高度不足且还有数据，继续加载
        if (contentHeight <= containerHeight) {
            // 在获取下一页之前，先上报所有未上报的记录
            forceReportAllPendingItems().then(() => {
                fetchNextPage();
            });
        }
    }, [tweets, hasNextPage, isLoading, forceReportAllPendingItems, fetchNextPage]);

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
        const newReadItems: string[] = [];
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const itemId = entry.target.getAttribute('data-id') || '0';
                if (!readItems.includes(itemId) && !sentIds.current.has(itemId)) {
                    newReadItems.push(itemId);
                }
            }
        });

        if (newReadItems.length > 0) {
            setReadItems((prev) => [...prev, ...newReadItems]);
        }
    };

    useEffect(() => {
        const itemsToReport = readItems.filter((itemId) => !sentIds.current.has(itemId));
        if (itemsToReport.length > 0) {
            sendReadItemsToBackend(itemsToReport);
        }
    }, [readItems, tweets]);


    useEffect(() => {
        if (!user?.address) return;
        observerRef.current = new IntersectionObserver(handleIntersection, {
            root: null,
            rootMargin: '0px',
            threshold: 0.5, // 50% visibility to trigger intersection
        });

        const targets = document.querySelectorAll('.recomdend-list-item');
        targets.forEach((target) => {
            observerRef.current?.observe(target);
        });

        return () => {
            observerRef.current?.disconnect();
        };
    }, [tweets, user.address]);

    // 使用 useCallback 优化 onMore 函数，避免每次渲染都重新创建
    const handleLoadMore = useCallback(async () => {
        if (hasNextPage && !isFetchingNextPage && !isLoading && !isFetching) {
            console.log('Fetching next page...');
            // 在获取下一页之前，先上报所有未上报的记录
            await forceReportAllPendingItems();
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, isLoading, isFetching, fetchNextPage, forceReportAllPendingItems]);




    return <div
        // id="scrollableDivrecommend"
        ref={containerRef}
        style={{
            height: '100%',
            overflow: 'auto',
            paddingBottom: 60
        }}
    >
        {/* <InfiniteScroll
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
                    <List.Item key={item.id} data-id={item.id} className="recomdend-list-item">
                        <Buzz buzzItem={item} refetch={refetch} />
                    </List.Item>
                )}
            />
        </InfiniteScroll> */}

        <List
            loading={isLoading}
            dataSource={tweets}
            ref={contentRef}
            renderItem={(item: API.Pin) => (
                <List.Item key={item.id} data-id={item.id} className="recomdend-list-item">
                    <Buzz buzzItem={item} refetch={refetch} />
                </List.Item>
            )}
        />
        <InfiniteScrollV2
            id="mason_grid_recommend"
            onMore={handleLoadMore}
        />
        {(isLoading || isFetchingNextPage || isFetching) && <Card><Skeleton avatar paragraph={{ rows: 2 }} active /></Card>}
        {(!isFetching && !hasNextPage) &&
            <Divider plain><Trans>It is all, nothing more 🤐</Trans></Divider>}
    </div>


}
export default () => {
    return <Home />
}