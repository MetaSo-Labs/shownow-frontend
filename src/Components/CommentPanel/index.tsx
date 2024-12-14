import {  getUserInfo } from "@/request/api";
import { useQuery } from "@tanstack/react-query";
import {  List } from "antd";
import { isNil } from "ramda";
import { useModel } from "umi";
import UserAvatar from "../UserAvatar";

type CommentPanelProps = {
    tweetId: string,
    refetchNum: number,
    commentData?: API.CommentRes[]
}

const CommentItem = ({ commentRes }: { commentRes: API.CommentRes }) => {
    const { btcConnector } = useModel('user')
    const currentUserInfoData = useQuery({
        enabled: !isNil(commentRes?.createAddress),
        queryKey: ['userInfo', commentRes?.createAddress],
        queryFn: () => getUserInfo({ address: commentRes?.createAddress }),
    });
    return <List.Item>
        <List.Item.Meta
            avatar={<UserAvatar src={currentUserInfoData.data?.avatar} />}
            title={<a href="">{currentUserInfoData.data?.name}</a>}
            description={currentUserInfoData.data?.metaid.slice(0, 8)}
        />
        {commentRes?.content}
    </List.Item>
}

export default ({ tweetId, refetchNum,commentData }: CommentPanelProps) => {
    // const commentData = useQuery({
    //     enabled: !isNil(tweetId),
    //     queryKey: ['comment-detail', tweetId],
    //     queryFn: () => fetchCurrentBuzzComments({ pinId: tweetId }),
    // });
    // useEffect(() => {
    //     if (refetchNum) {
    //         commentData.refetch()
    //     }
    // }, [refetchNum])
    const commentsNum = (commentData ?? []).length;
    return <List
        itemLayout="horizontal"
        dataSource={commentData ?? []}
        renderItem={(item, index) => (
            <CommentItem commentRes={item} />
        )}
    />
}