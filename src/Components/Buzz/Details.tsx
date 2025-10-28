import { curNetwork, FLAG } from "@/config";
import {
    fetchBuzzDetail,
    getControlByContentPin,
    getMRC20Info,
    getUserInfo,
} from "@/request/api";
import {
    DownOutlined,
    GiftFilled,
    GiftOutlined,
    HeartFilled,
    HeartOutlined,
    LinkOutlined,
    MessageOutlined,
    SyncOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Button,
    Card,
    theme,
    message,
    Space,
    Spin,
    Tag,
    Typography,
    Alert,
} from "antd";
import { isEmpty, isNil } from "ramda";
import { useEffect, useMemo, useRef, useState } from "react";
import { useModel, history, useIntl } from "umi";
import Comment from "../Comment";
import NewPost from "../NewPost";
import "./index.less";
import ForwardTweet from "./ForwardTweet";
import { IMvcEntity } from "@metaid/metaid";
import { FollowIconComponent } from "../Follow";
import dayjs from "dayjs";
import { buildAccessPass, buildMRc20AccessPass, decodePayBuzz } from "@/utils/buzz";
import { getMvcBalance, getUtxoBalance } from "@/utils/psbtBuild";
const { Paragraph, Text } = Typography;
import _btc from "@/assets/btc.png";
import {
    detectMentions,
    detectUrl,
    determineAddressInfo,
    formatMessage,
    getEffectiveBTCFeerate,
    handleSpecial,
    openWindowTarget,
    sleep,
} from "@/utils/utils";

import UserAvatar from "../UserAvatar";
import EnhancedMediaGallery from "./EnhancedMediaGallery";
import Trans from "../Trans";
import _mvc from "@/assets/mvc.png";
import DonateModal from "./components/DonateModal";
import Decimal from "decimal.js";
import Unlock from "../Unlock";
import BuzzOrigin from "./components/BuzzOrigin";
import MRC20Icon from "../MRC20Icon";
import PayContent from "./components/PayContent";
import IDCoinBadge from "../IDCoinBadge";
import TextContent from "./TextContent";
import TextWithTrans from "./TextWithTrans";
import Actions from "./Actions";

// TODO: use metaid manage state

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

export default ({
    buzzItem,
    showActions = true,
    refetch,
    isForward = false,
    loading,
    like = [],
    donate = [],
    handleClick,
}: Props) => {
    const {
        token: { colorBorderSecondary, colorBorder, colorBgBlur, colorBgContainer },
    } = theme.useToken();
   
    const {
       
        user,
        isLogin,
        
        chain,
        
    } = useModel("user");
    const {  manPubKey } = useModel("dashboard");
   
    const currentUserInfoData = useQuery({
        queryKey: ["userInfo", buzzItem!.creator],
        enabled: !isNil(buzzItem?.creator),
        queryFn: () => {
            return getUserInfo({ address: buzzItem!.creator });
        },
    });
    const [showGift, setShowGift] = useState(false);
    const [donateAmount, setDonateAmount] = useState<string>("");
    const [donateMessage, setDonateMessage] = useState<string>("");
    const [balance, setBalance] = useState<number>(0);
    const [donateLoading, setDonateLoading] = useState(false);

    const [selectedChain, setSelectedChain] = useState<string>(
        determineAddressInfo(buzzItem.address) === 'p2pkh' ? chain : 'btc'
    );

    useEffect(() => {
        const fetchBalance = async () => {
            if (isLogin && selectedChain === "btc") {
                try {
                    const bal = await getUtxoBalance();
                    setBalance(bal);
                } catch (e) {
                    console.error("Failed to fetch balance:", e);
                }
            } else if (isLogin && selectedChain === "mvc") {
                try {
                    const bal = await getMvcBalance();
                    setBalance(bal);
                } catch (e) {
                    console.error("Failed to fetch balance:", e);
                }
            }
        };
        fetchBalance();
    }, [isLogin, selectedChain]);



    const payBuzz = useMemo(() => {
        try {
            let _summary = buzzItem!.content;
            const isSummaryJson = _summary.startsWith("{") && _summary.endsWith("}");
            const parseSummary = isSummaryJson ? JSON.parse(_summary) : {};
            return parseSummary.publicContent ? buzzItem : undefined;
        } catch (e) {
            console.error("Error parsing buzz content:", e);
            return undefined;
        }

    }, [buzzItem]);



    
   
    const quotePinId = useMemo(() => {
        if (isForward) return "";
        try {
            let _summary = buzzItem!.content;
            const isSummaryJson = _summary.startsWith("{") && _summary.endsWith("}");
            const parseSummary = isSummaryJson ? JSON.parse(_summary) : {};
            return isSummaryJson && !isEmpty(parseSummary?.quotePin ?? "")
                ? parseSummary.quotePin
                : "";
        } catch (e) {
            console.error("Error parsing buzz content:", e);
            return "";
        }

    }, [buzzItem, isForward]);

    const { isLoading: isQuoteLoading, data: quoteDetailData } = useQuery({
        enabled: !isEmpty(quotePinId),
        queryKey: ["buzzDetail", quotePinId],
        queryFn: () => fetchBuzzDetail({ pinId: quotePinId }),
    });
    const { data: accessControl } = useQuery({
        enabled: !isEmpty(payBuzz?.id),
        queryKey: ["buzzAccessControl", payBuzz?.id],
        queryFn: () => getControlByContentPin({ pinId: payBuzz!.id }),
    });

    const { data: decryptContent, refetch: refetchDecrypt, isLoading: decryptLoading } = useQuery({
        queryKey: ["buzzdecryptContent", buzzItem!.id, chain, user.address],
        queryFn: () => decodePayBuzz(buzzItem, manPubKey!, isLogin),
    });


    const _textContent = useMemo(() => {
        if (!decryptContent) return "";
        const encryptContent =
            decryptContent.status === "purchased"
                ? decryptContent.encryptContent
                : "";
        return `${decryptContent.publicContent}${decryptContent.publicContent && encryptContent ? "\n" : ""}${encryptContent}`;
    }, [decryptContent])




    

    return (
        <Card
            className="tweet"
            loading={loading || decryptLoading}
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
                                {" "}
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
                    <TextWithTrans text={_textContent} />

                    {decryptContent && <EnhancedMediaGallery decryptContent={decryptContent} />}
                    <PayContent decryptContent={decryptContent} accessControl={accessControl} refetchDecrypt={refetchDecrypt} />

                    {!isEmpty(quotePinId) && (
                        <Card
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            style={{ padding: 0, marginBottom: 12, boxShadow: "none" }}
                            variant='borderless'
                            styles={{ body: { padding: 0 } }}
                            loading={isQuoteLoading}
                        >
                            {quoteDetailData?.data && (
                                <ForwardTweet
                                    buzzItem={{ ...quoteDetailData?.data.tweet, blocked: quoteDetailData?.data.blocked }}
                                    showActions={false}
                                />
                            )}
                        </Card>
                    )}
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

                {showActions && (
                    <Actions buzzItem={buzzItem} like={like} donate={donate} />
                )}
            </div>
        </Card >
    );
};
