import Buzz from "@/Components/Buzz";
import Trans from "@/Components/Trans";
import { searchBuzzs } from "@/request/api";
import { formatMessage } from "@/utils/utils";
import { EditOutlined } from "@ant-design/icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Divider, Grid, Input, List, Skeleton } from "antd";
import { useEffect, useMemo, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useModel } from "umi";

const { useBreakpoint } = Grid
export default () => {
    const { showConf } = useModel('dashboard')
    const { searchWord, setSearchWord } = useModel('user')
    const { md } = useBreakpoint();

    const containerRef = useRef<any>();
    const contentRef = useRef<any>();





    const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage, refetch } =
        useInfiniteQuery({
            queryKey: ['search', searchWord],
            enabled: Boolean(searchWord),
            queryFn: ({ pageParam }) =>
                searchBuzzs({
                    size: 5,
                    lastId: pageParam,
                    key: searchWord,
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
    return <div>
        {!md && <Input size="large" prefix={
            <EditOutlined style={{ color: showConf?.brandColor }} />

        } placeholder={formatMessage('Search')}
            value={searchWord}
            onChange={(e) => {
                setSearchWord(e.target.value)
            }}

        />}

        <div
            id="scrollableDivSearch"
            ref={containerRef}
            style={{
                height: '100%',
                overflow: 'auto',
            }}
        >
            {isLoading && <Skeleton avatar paragraph={{ rows: 2 }} active />}
            <InfiniteScroll
                dataLength={tweets.length}
                next={fetchNextPage}
                hasMore={hasNextPage}
                loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
                endMessage={<Divider plain><Trans>It is all, nothing more 🤐</Trans></Divider>}
                scrollableTarget="scrollableDivSearch"
            >
                <List
                    ref={contentRef}
                    dataSource={tweets}
                    renderItem={(item: API.Pin) => (
                        <List.Item key={item.id}>
                            <Buzz buzzItem={item} refetch={refetch} />
                        </List.Item>
                    )}
                />
            </InfiniteScroll>
        </div>
    </div>
}