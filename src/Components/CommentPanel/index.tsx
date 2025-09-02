import { fetchComments, getUserInfo } from "@/request/api";
import { useQuery } from "@tanstack/react-query";
import { Button, Divider, List, message, Space, Tag, theme, Typography } from "antd";
import { isNil } from "ramda";
import { useModel } from "umi";
import UserAvatar from "../UserAvatar";
import PendingUserAvatar from "../UserInfo/PendingUserAvatar";
import PendingUser from "../UserInfo/PendingUser";
import { GiftOutlined, HeartFilled, HeartOutlined, LinkOutlined, MessageOutlined, UploadOutlined } from "@ant-design/icons";
import { curNetwork, FLAG } from "@/config";
import dayjs from "dayjs";
import { formatMessage, getEffectiveBTCFeerate } from "@/utils/utils";
import { useMemo, useState } from "react";
import { IMvcEntity } from "@feiyangl1020/metaid";
import Comment from "../Comment";
import Donate from "../Donate";
import NewPost from "../NewPost";
import Popup from "../ResponPopup";

type CommentPanelProps = {
    tweetId: string,
    refetchNum: number,
    commentData?: API.CommentRes[]
}

export const CommentItem = ({ item, level }: { item: API.CommentRes, level: number }) => {
    const { token: {
        colorFillAlter
    } } = theme.useToken()
    const { user, btcConnector, mvcConnector, isLogin, chain, feeRate, mvcFeeRate } = useModel('user');
    const [showDonate, setShowDonate] = useState(false);
    const { showConf, fetchServiceFee } = useModel('dashboard');
    const [likeCount, setLikeCount] = useState(item.likeNum);
    const [donateCount, setDonateCount] = useState(item.donateNum);
    const [likeAddress, setLikeAddress] = useState(item.likeAddress ?? []);
    const [forwardCount, setForwardCount] = useState(item.forwardNum);
    const [commentCount, setCommentCount] = useState(item.commentNum);
    const [handleLikeLoading, setHandleLikeLoading] = useState(false);
    const [showChildComment, setShowChildComment] = useState(false);
    const [childComment, setChildComment] = useState<API.CommentRes[]>([]);
    const [showComment, setShowComment] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showNewPost, setShowNewPost] = useState(false);
    const handleLike = async () => {
        if (!isLogin) {
            message.error(formatMessage("Please connect your wallet first"));
            return;
        }
        if (isLiked) {
            message.error(formatMessage("You have already liked this comment"));
            return;
        }

        const pinId = item!.pinId;
        setHandleLikeLoading(true);
        try {
            if (chain === "btc") {
                const likeEntity = await btcConnector!.use("like");
                const likeRes = await likeEntity.create({
                    dataArray: [
                        {
                            body: JSON.stringify({ isLike: "1", likeTo: pinId }),
                            flag: FLAG,
                            contentType: "application/json;utf-8",
                            path: `${showConf?.host || ""}/protocols/paylike`,
                        },
                    ],
                    options: {
                        noBroadcast: "no",
                        feeRate: getEffectiveBTCFeerate(Number(feeRate)),
                        service: fetchServiceFee("like_service_fee_amount", "BTC"),
                    },
                });
                if (!isNil(likeRes?.revealTxIds[0])) {
                    setLikeCount(likeCount + 1);
                    setLikeAddress([...likeAddress, user.address]);
                    message.success("like buzz successfully");
                }
            } else {
                const likeEntity = (await mvcConnector!.use("like")) as IMvcEntity;
                const likeRes = await likeEntity.create({
                    data: {
                        body: JSON.stringify({
                            isLike: "1",
                            likeTo: pinId,
                        }),
                        path: `${showConf?.host || ""}/protocols/paylike`,
                    },
                    options: {
                        network: curNetwork,
                        signMessage: "like buzz",
                        service: fetchServiceFee("like_service_fee_amount", "MVC"),
                        feeRate: Number(mvcFeeRate),
                    },
                });
                console.log("likeRes", likeRes);
                if (!isNil(likeRes?.txid)) {
                    setLikeCount(likeCount + 1);
                    setLikeAddress([...likeAddress, user.address]);
                    message.success("like buzz successfully");
                }
            }
        } catch (error) {
            console.log("error", error);
            const errorMessage = (error as any)?.message ?? error;
            const toastMessage = errorMessage?.includes(
                "Cannot read properties of undefined"
            )
                ? "User Canceled"
                : errorMessage;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message.error(toastMessage);
        }
        setHandleLikeLoading(false);
    };

    const loadChildComment = async () => {
        setLoading(true);
        const commentRes = await fetchComments({ pinId: item.pinId });
        if (commentRes && commentRes.data?.comments) {
            let list = [...commentRes.data.comments ?? [], ...childComment];
            const commentSet = new Set<string>();
            list = list.filter((comment) => {
                if (commentSet.has(comment.pinId)) {
                    return false;
                }
                commentSet.add(comment.pinId);
                return true;
            })


            setChildComment(list);
            setShowChildComment(true);
        }
        setLoading(false);
    }

    const isLiked = useMemo(() => {
        return likeAddress.includes(user.address)
    }, [likeAddress, user.address])

    return <div key={item.pinId}>
        <PendingUser address={item.createAddress} />
        <div style={{ paddingLeft: 48, display: 'flex', flexDirection: 'column', gap: 4, marginTop: 16 }}>
            <Typography.Text >{item?.content}</Typography.Text>
            <Space>
                <Button
                    size="small"
                    type="link"
                    icon={<LinkOutlined />}
                    style={{
                        fontSize: 12,
                    }}
                    onClick={(e) => {
                        e.stopPropagation();

                        const link =
                            item.chainName === "btc"
                                ? `${curNetwork === "testnet"
                                    ? "https://mempool.space/testnet/tx/"
                                    : "https://mempool.space/tx/"
                                }${item.pinId}`
                                : `https://${curNetwork === "testnet" ? "test" : "www"
                                }.mvcscan.com/tx/${item.pinId.slice(0, item.pinId.length - 2)}`;
                        window.open(link, "_blank");
                    }}
                >
                    {item.pinId.slice(0, 8)}
                </Button>
                <Tag

                    bordered={false}
                    color={item.chainName === "mvc" ? "blue" : "orange"}
                >
                    {item.chainName.toUpperCase()}
                </Tag>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs.unix(item.timestamp).format("YYYY-MM-DD HH:mm:ss")}
                </Typography.Text>
            </Space>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                <Button
                    type="text"
                    icon={<MessageOutlined />}
                    onClick={async () => {
                        if (!isLogin) {
                            message.error(
                                formatMessage("Please connect your wallet first")
                            );
                            return;
                        }
                        setShowComment(true)


                    }}
                >
                    {commentCount}
                </Button>

                <Button
                    type="text"
                    loading={handleLikeLoading}
                    onClick={handleLike}
                    icon={
                        isLiked ? (
                            <HeartFilled style={{ color: "red" }} />
                        ) : (
                            <HeartOutlined />
                        )
                    }
                >
                    {likeCount}
                </Button>
                <Button
                    type="text"
                    icon={
                        <GiftOutlined />
                    }
                    onClick={() => setShowDonate(true)}


                >
                    {donateCount}
                </Button>

                <Button
                    type="text"
                    icon={<UploadOutlined />}
                    onClick={() => {
                        setShowNewPost(true);
                    }}
                >
                    {forwardCount}
                </Button>

            </div>
            <Divider style={{ margin: '8px 0' }} />
            {
                commentCount > 0 && <>
                    {showChildComment && <>
                        {level < 1 ? <List
                            itemLayout="horizontal"
                            dataSource={childComment ?? []}
                            renderItem={(item) => (
                                <CommentItem
                                    key={item.pinId}
                                    item={item}
                                    level={level + 1}
                                />
                            )}
                        /> : <Popup title='Replies' onClose={() => {
                            setShowChildComment(false);
                            setChildComment([]);
                        }} show={showChildComment && level >= 1} modalWidth={680} bodyStyle={{ padding: 24 }} closable>
                            <div>
                                <PendingUser address={item.createAddress} />
                                <div style={{ paddingLeft: 48, display: 'flex', flexDirection: 'column', gap: 4, marginTop: 16 }}>
                                    <Typography.Text >{item?.content}</Typography.Text>
                                    <Space>
                                        <Button
                                            size="small"
                                            type="link"
                                            icon={<LinkOutlined />}
                                            style={{
                                                fontSize: 12,
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();

                                                const link =
                                                    item.chainName === "btc"
                                                        ? `${curNetwork === "testnet"
                                                            ? "https://mempool.space/testnet/tx/"
                                                            : "https://mempool.space/tx/"
                                                        }${item.pinId}`
                                                        : `https://${curNetwork === "testnet" ? "test" : "www"
                                                        }.mvcscan.com/tx/${item.pinId.slice(0, item.pinId.length - 2)}`;
                                                window.open(link, "_blank");
                                            }}
                                        >
                                            {item.pinId.slice(0, 8)}
                                        </Button>
                                        <Tag

                                            bordered={false}
                                            color={item.chainName === "mvc" ? "blue" : "orange"}
                                        >
                                            {item.chainName.toUpperCase()}
                                        </Tag>
                                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                            {dayjs.unix(item.timestamp).format("YYYY-MM-DD HH:mm:ss")}
                                        </Typography.Text>
                                    </Space>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                                        <Button
                                            type="text"
                                            icon={<MessageOutlined />}
                                            onClick={async () => {
                                                if (!isLogin) {
                                                    message.error(
                                                        formatMessage("Please connect your wallet first")
                                                    );
                                                    return;
                                                }
                                                setShowComment(true)


                                            }}
                                        >
                                            {commentCount}
                                        </Button>

                                        <Button
                                            type="text"
                                            loading={handleLikeLoading}
                                            onClick={handleLike}
                                            icon={
                                                isLiked ? (
                                                    <HeartFilled style={{ color: "red" }} />
                                                ) : (
                                                    <HeartOutlined />
                                                )
                                            }
                                        >
                                            {likeCount}
                                        </Button>
                                        <Button
                                            type="text"
                                            icon={
                                                <GiftOutlined />
                                            }
                                            onClick={() => setShowDonate(true)}


                                        >
                                            {donateCount}
                                        </Button>

                                        <Button
                                            type="text"
                                            icon={<UploadOutlined />}
                                            onClick={() => {
                                                setShowNewPost(true);
                                            }}
                                        >
                                            {forwardCount}
                                        </Button>

                                    </div>




                                </div>
                            </div>
                            <Divider orientation="left">All Replies</Divider>
                            <List

                                itemLayout="horizontal"
                                dataSource={childComment ?? []}
                                renderItem={(item) => (
                                    <CommentItem
                                        key={item.pinId}
                                        item={item}
                                        level={level + 1}
                                    />
                                )}
                            />

                        </Popup>}
                    </>}
                    {commentCount - childComment.length > 0 && <Button type="link" onClick={loadChildComment} loading={loading}>
                        View all Reply  ({commentCount - childComment.length})
                    </Button>}


                </>
            }


        </div>
        <Comment tweetId={item.pinId ?? ''} onClose={(mockComment?: API.CommentRes) => {
            setShowComment(false)
            if (mockComment) {
                setChildComment([...childComment, mockComment])
                setCommentCount(commentCount + 1);
                setShowChildComment(true);
            }
        }} show={showComment} />
        <Donate donateAddress={item.createAddress} show={showDonate} onClose={() => setShowDonate(false)} pinId={item.pinId} callback={() => {
            setDonateCount(donateCount + 1);
        }} />

        <NewPost
            show={showNewPost}
            onClose={() => {
                setShowNewPost(false);
            }}
            quoteComment={item}
        />

    </div>
}



export default ({ commentData }: CommentPanelProps) => {


    return <><List
        itemLayout="horizontal"
        dataSource={commentData ?? []}
        renderItem={(item) => (
            <CommentItem
                key={item.pinId}
                item={item}
                level={0}
            />
        )}
    />
    </>
}