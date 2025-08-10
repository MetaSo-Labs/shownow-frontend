import { fetchAllBuzzs, fetchBuzzs, getIndexTweet, getUserInfo } from "@/request/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import './index.less'
import { Grid, Carousel, Col, Divider, List, Row, Skeleton, Spin } from "antd";
import defaultImg from '@/assets/img 2@1x.png'
import { GiftOutlined, HeartOutlined, MessageOutlined, UploadOutlined } from "@ant-design/icons";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useModel, useMatch } from "umi";
import { curNetwork } from "@/config";
import Buzz from "@/Components/Buzz";
import InfiniteScroll from 'react-infinite-scroll-component';
import { isNil } from "ramda";
import ProfileCard from "@/Components/ProfileCard";
import Recommend from "@/Components/Recommend";
import Trans from "@/Components/Trans";
import KeepAliveWrap from "@/Components/KeepAliveWrap";
import { fetchIDCoinInfo, fetchIDCoinInfoByAddress } from "@/request/metaso";
const { useBreakpoint } = Grid

const Home = () => {
    const { md } = useBreakpoint()
    const match = useMatch('/profile/:address');
    const match2 = useMatch('/user/:tick');

    const { btcConnector, user } = useModel('user');

    const { data: coinData, isFetching } = useQuery({
        queryKey: ['coinData', match2?.params.tick],
        queryFn: () => fetchIDCoinInfo({ tick: match2?.params.tick?.toUpperCase() }),
        enabled: Boolean(match2?.params.tick),
    });

    const { data: coinData2, isFetching: isFetching2 } = useQuery({
        queryKey: ['coinData2', match?.params.address, user.address],
        queryFn: () => fetchIDCoinInfoByAddress({ address: match?.params.address || user.address }),
        enabled: Boolean(match?.params.address || user.address),
    });

    const address = useMemo(() => {
        if (match2 && match2.params.tick) {
            if (isFetching) return ''
            if (coinData?.data?.address) {
                return coinData.data.address;
            }
            return ''
        }
        if (!match || !match.params.address) {
            return user?.address;
        } else {
            return match.params.address;
        }
    }, [match, user, isFetching, coinData, match2])

    const isMy = useMemo(() => {
        return user?.address === address;
    }, [address, user])



    const containerRef = useRef<any>();
    const contentRef = useRef<any>();






    const profileUserData = useQuery({
        enabled: Boolean(address),
        queryKey: ['userInfo', address],
        queryFn: () => getUserInfo({ address }),
    });


    const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage, refetch } =
        useInfiniteQuery({
            queryKey: ['profilebuzzesnew', profileUserData.data?.metaid],
            enabled: Boolean(profileUserData.data?.metaid),
            queryFn: ({ pageParam }) =>
                fetchAllBuzzs({
                    size: 10,
                    lastId: pageParam,
                    metaid: profileUserData.data?.metaid,
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
            return [...acc || [], ...(item.data.list ?? []).filter(buzz => (!buzz.blocked || (buzz.blocked === true && buzz.createMetaId === user?.metaid))) || []]
        }, []) : []
    }, [data])
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
        className="profilePage"
        id="scrollableDiv3"
        ref={containerRef}
        style={{
            height: `100%`,
            overflow: 'auto',
        }}
    >
        <Spin spinning={profileUserData.isLoading || isLoading} size="large">
            <div style={{ paddingBottom: 12 }}>
                <ProfileCard address={address} IDCoin={coinData?.data || coinData2?.data || undefined} />
            </div>
            {isLoading && <Skeleton avatar paragraph={{ rows: 2 }} active />}

            <InfiniteScroll
                dataLength={tweets.length}
                next={fetchNextPage}
                hasMore={hasNextPage}
                loader={<Skeleton avatar paragraph={{ rows: 2 }} active />}
                endMessage={<Divider plain><Trans>It is all, nothing more 🤐</Trans> </Divider>}
                scrollableTarget="scrollableDiv3"
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
        </Spin>
    </div>


}
export default () => {
    return <Home />
}