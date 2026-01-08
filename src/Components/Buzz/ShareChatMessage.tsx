import { getUserInfo, getUserInfoByMetaid } from "@/request/api";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Card, Space, Tag, theme, Typography } from "antd";
import { isNil } from "lodash";
import UserAvatar from "../UserAvatar";
import { history } from "umi";
import { FollowIconComponent } from "../Follow";
import BuzzOrigin from "./components/BuzzOrigin";
import IDCoinBadge from "../IDCoinBadge";
import Trans from "../Trans";
import { useMemo, useRef, useState } from "react";
import TextContent from "./TextContent";
import TextWithTrans from "./TextWithTrans";
import { LinkOutlined, SyncOutlined } from "@ant-design/icons";
import { curNetwork } from "@/config";
import dayjs from "dayjs";
import Actions from "./Actions";
import ChatGroup from "./ChatGroup";
import EnhancedMediaGallery from "./EnhancedMediaGallery";
const { Text } = Typography;

type Props = {
    buzzItem: API.Buzz;
    like?: API.LikeRes[];
    donate?: API.DonateRes[];
    showActions?: boolean;
    padding?: number;
    reLoading?: boolean;
    refetch?: () => Promise<any>;
    isForward?: boolean;
    loading?: boolean;
    handleClick?: () => void;
};

type ShareChatMessageData = {
    communityId: string
    groupId: string
    userMetaId: string
    comment: string
    message: {
        content: string
        contentType: 'jpeg' | 'png' | 'text/plain'
        metanetId: string
        chain: 'btc' | 'mvc'
        protocol: '/protocols/simplefilegroupchat' | "/protocols/simplegroupchat"
        timestamp: number
        txId: string
        pinId: string
    }
}
export default ({ buzzItem, showActions = true, padding = 20, reLoading = false, refetch, like = [], handleClick, donate = [], isForward = false }: Props) => {
    const {
        token: { colorBorder, colorBorderSecondary }
    } = theme.useToken();
    const contentRef = useRef<HTMLDivElement>(null); // 引用内容容器
    const [isExpanded, setIsExpanded] = useState(false);
    const currentUserInfoData = useQuery({
        queryKey: ["userInfo", buzzItem!.creator],
        enabled: !isNil(buzzItem?.creator),
        queryFn: () => {
            return getUserInfo({ address: buzzItem!.creator });
        },
    });


    const chatMessage = useMemo<ShareChatMessageData>(() => {
        return JSON.parse(buzzItem?.content || '{}') as ShareChatMessageData
    }, [buzzItem]);


    const originUserInfo = useQuery({
        queryKey: ["userInfo", chatMessage!.userMetaId],
        enabled: !isNil(chatMessage?.userMetaId),
        queryFn: () => {
            return getUserInfoByMetaid({ metaid: chatMessage!.userMetaId });
        },
    });

    return <Card
        className="tweet"
        style={{
            width: "100%",
            borderColor: isForward ? colorBorder : colorBorderSecondary,
        }}
        styles={{
            header: {
                // height: ,
                borderColor: isForward ? colorBorder : colorBorderSecondary,
            },
            body: {
                paddingTop: 12,
            }
        }}
        title={
            <div style={{
                height: "100%",
                padding: '12px 0',
            }}>
                <div
                    style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <div
                        className="avatar"
                        style={{ cursor: "pointer", position: "relative" }}
                    >
                        <UserAvatar src={currentUserInfoData.data?.avatar} size={40} onClick={(e) => {
                            e.stopPropagation();
                            history.push(`/profile/${buzzItem.creator}`);
                        }} />
                        <FollowIconComponent
                            metaid={currentUserInfoData.data?.metaid || ""}
                        />
                    </div>
                    <div
                        style={{ display: "flex", flexDirection: "column", gap: 8, cursor: "pointer" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            history.push(`/profile/${buzzItem.creator}`);
                        }}
                    >
                        <Text style={{ fontSize: 14, lineHeight: 1 }}>
                            {currentUserInfoData.data?.name || "Unnamed"}
                        </Text>
                        <div style={{ display: "flex", gap: 8, alignItems: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 10, lineHeight: 1 }}>
                                {currentUserInfoData.data?.metaid.slice(0, 8)}
                            </Text>
                            <BuzzOrigin host={buzzItem.host} />
                        </div>

                    </div>


                </div>
                <IDCoinBadge address={buzzItem.address} />
            </div>
        }

    >
        {
            buzzItem.blocked && <Alert message={
                <Trans>This Buzz has been blocked by the administrator.</Trans>
            } type="warning" banner />
        }

        <div
            className="content"
            style={{
                cursor: "pointer",
            }}
        >
            <div
                onClick={() => {
                    handleClick ? handleClick() : history.push(`/buzz/${buzzItem.id}`);
                }}
            >
                <TextWithTrans text={chatMessage.comment} />




                <Card
                    className="tweet"
                    style={{
                        width: "100%",
                        borderColor: isForward ? colorBorder : colorBorderSecondary,
                    }}
                    styles={{
                        header: {
                            // height: ,
                            borderColor: isForward ? colorBorder : colorBorderSecondary,
                        },
                        body: {
                            paddingTop: 12,
                        }
                    }}
                    title={
                        <div style={{
                            height: "100%",
                            padding: '12px 0',
                        }}>
                            <div
                                style={{
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                }}
                            >
                                <div
                                    className="avatar"
                                    style={{ cursor: "pointer", position: "relative" }}
                                >
                                    <UserAvatar src={originUserInfo.data?.avatar} size={40} onClick={(e) => {
                                        e.stopPropagation();
                                        history.push(`/profile/${originUserInfo.data?.address}`);
                                    }} />
                                    <FollowIconComponent
                                        metaid={originUserInfo.data?.metaid || ""}
                                    />
                                </div>
                                <div
                                    style={{ display: "flex", flexDirection: "column", gap: 8, cursor: "pointer" }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        history.push(`/profile/${originUserInfo.data?.address}`);
                                    }}
                                >
                                    <Text style={{ fontSize: 14, lineHeight: 1 }}>
                                        {" "}
                                        {originUserInfo.data?.name || "Unnamed"}
                                    </Text>
                                    <div style={{ display: "flex", gap: 8, alignItems: 'center' }}>
                                        <Text type="secondary" style={{ fontSize: 10, lineHeight: 1 }}>
                                            {originUserInfo.data?.metaid.slice(0, 8)}
                                        </Text>
                                        <BuzzOrigin host={buzzItem.host} />
                                    </div>

                                </div>


                            </div>
                            <IDCoinBadge address={originUserInfo.data?.address} />
                        </div>
                    }

                >
                    {
                        chatMessage.message.contentType === 'text/plain' && <TextWithTrans text={chatMessage.message.content} />
                    }
                    {
                        chatMessage.message.contentType === 'text/markdown' && <TextWithTrans text={chatMessage.message.content} />
                    }
                    {
                        chatMessage.message.protocol === '/protocols/simplefilegroupchat' && <EnhancedMediaGallery decryptContent={
                            {
                                publicFiles: [chatMessage.message.content],
                                publicContent: '',
                                encryptContent: '',
                                encryptFiles: [],
                                buzzType: "normal",
                                status: 'purchased'
                            }
                        } />
                    }

                    <ChatGroup groupId={chatMessage.groupId} />
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
                                    chatMessage.message.chain === "btc"
                                        ? `${curNetwork === "testnet"
                                            ? "https://mempool.space/testnet/tx/"
                                            : "https://mempool.space/tx/"
                                        }${chatMessage.message.txId}`
                                        : `https://${curNetwork === "testnet" ? "test" : "www"
                                        }.mvcscan.com/tx/${chatMessage.message.txId}`;
                                window.open(link, "_blank");
                            }}
                        >
                            {chatMessage.message.txId.slice(0, 8)}
                        </Button>
                        <Tag

                            bordered={false}
                            color={chatMessage.message.chain === "btc" ? "orange" : "blue"}
                        >
                            {chatMessage.message.chain === 'btc' ? 'BTC' : 'MVC'}
                        </Tag>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {dayjs.unix(chatMessage.message.timestamp).format("YYYY-MM-DD HH:mm:ss")}
                        </Typography.Text>
                    </Space>
                </Card>

                <Space style={{
                    marginTop: 20
                }}>
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
                                buzzItem.chainName === "btc"
                                    ? `${curNetwork === "testnet"
                                        ? "https://mempool.space/testnet/tx/"
                                        : "https://mempool.space/tx/"
                                    }${buzzItem.genesisTransaction}`
                                    : `https://${curNetwork === "testnet" ? "test" : "www"
                                    }.mvcscan.com/tx/${buzzItem.genesisTransaction}`;
                            window.open(link, "_blank");
                        }}
                    >
                        {buzzItem.genesisTransaction.slice(0, 8)}
                    </Button>
                    <Tag
                        icon={buzzItem.genesisHeight === 0 ? <SyncOutlined spin /> : null}
                        bordered={false}
                        color={buzzItem.chainName === "mvc" ? "blue" : "orange"}
                    >
                        {buzzItem.chainName.toUpperCase()}
                    </Tag>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs.unix(buzzItem.timestamp).format("YYYY-MM-DD HH:mm:ss")}
                    </Typography.Text>
                </Space>

            </div>
        </div>
        <Actions buzzItem={buzzItem} like={like} donate={donate} />
    </Card>;
};