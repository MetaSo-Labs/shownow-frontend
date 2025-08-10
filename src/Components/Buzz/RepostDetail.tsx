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
    detectUrl,
    determineAddressInfo,
    formatMessage,
    getEffectiveBTCFeerate,
    handleSpecial,
    openWindowTarget,
    sleep,
} from "@/utils/utils";

import UserAvatar from "../UserAvatar";
import ImageGallery from "./ImageGallery";
import { fetchTranlateResult } from "@/request/baidu-translate";
import Trans from "../Trans";
import NFTGallery from "./NFTGallery";
import _mvc from "@/assets/mvc.png";
import DonateModal from "./components/DonateModal";
import Decimal from "decimal.js";
import Unlock from "../Unlock";
import Video from "./Video";
import BuzzOrigin from "./components/BuzzOrigin";
import BlockedBuzz from "./BlockedBuzz";
import MRC20Icon from "../MRC20Icon";
import PayContent from "./components/PayContent";
import TextContent from "./TextContent";

// TODO: use metaid manage state

type Props = {
    buzzItem: API.Buzz;
    loading?: boolean;
    bordered?: boolean;
    backgeround?: string;
    showHeader?: boolean;
    panding?: number
    showFooter?: boolean;


};

export default ({
    buzzItem,
    loading,
    bordered = true,
    backgeround,
    showHeader = true,
    panding = 24,
    showFooter = true

}: Props) => {
    const {
        token: { colorBorderSecondary, colorBorder, colorBgBlur, colorBgContainer },
    } = theme.useToken();
    const { locale } = useIntl();
    const [isTranslated, setIsTranslated] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [showTrans, setShowTrans] = useState(false);
    const [transResult, setTransResult] = useState<string[]>([]);
    const [showNewPost, setShowNewPost] = useState(false);
    const [showUnlock, setShowUnlock] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null); // 引用内容容器
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false); // 是否溢出
    const [paying, setPaying] = useState(false);
    const [unlocking, setUnlocking] = useState(false);
    const {
        btcConnector,
        user,
        isLogin,
        connect,
        feeRate,
        mvcFeeRate,
        chain,
        mvcConnector,
        checkUserSetting,
    } = useModel("user");
    const { showConf, fetchServiceFee, manPubKey } = useModel("dashboard");
    const [handleLikeLoading, setHandleLikeLoading] = useState(false);
    const [likes, setLikes] = useState<string[]>([]);
    const [donates, setDonates] = useState<string[]>([]);
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
    const [donateCount, setDonateCount] = useState(buzzItem.donateCount || 0);
    const [isDonated, setIsDonated] = useState(false);
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
    const { data: accessControl } = useQuery({
        enabled: !isEmpty(payBuzz?.id),
        queryKey: ["buzzAccessControl", payBuzz?.id],
        queryFn: () => getControlByContentPin({ pinId: payBuzz?.id }),
    });

    const { data: decryptContent, refetch: refetchDecrypt, isLoading: decryptLoading } = useQuery({
        queryKey: ["buzzdecryptContent", buzzItem!.id, chain, user.address],
        queryFn: () => decodePayBuzz(buzzItem, manPubKey!, isLogin),
    });

    useEffect(() => {
        // 检测内容是否溢出
        if (contentRef.current) {
            const { scrollHeight, offsetHeight } = contentRef.current;
            setIsOverflowing(scrollHeight > offsetHeight);
        }
    }, [contentRef.current]); // 当内容变化时重新检测

    const handleTranslate = async () => {
        if (!decryptContent) return;
        setShowTrans(!showTrans);
        if (isTranslated) {
            setIsTranslated(false);
            return;
        }
        setIsTranslating(true);
        try {
            const encryptContent =
                decryptContent.status === "purchased"
                    ? decryptContent.encryptContent
                    : "";
            const res = await fetchTranlateResult({
                sourceText: `${decryptContent.publicContent}\n${encryptContent}`,
                from: locale === "en-US" ? "zh" : "en",
                to: locale === "en-US" ? "en" : "zh",
            });

            setTransResult(
                res!.trans_result.map((item) => {
                    return item.dst;
                })
            );

            setIsTranslated(true);
        } catch (e) {
            message.error("Translate Failed");
        }
        setIsTranslating(false);
    };

    const textContent = useMemo(() => {
        if (!decryptContent) return "";
        if (!showTrans || isTranslating) {
            const encryptContent =
                decryptContent.status === "purchased"
                    ? decryptContent.encryptContent
                    : "";
            return `${decryptContent.publicContent}${decryptContent.publicContent && encryptContent ? "\n" : ""}${encryptContent}`;
        } else {
            return transResult.join("\n");
        }
    }, [showTrans, transResult, decryptContent, isTranslating]);

    const handleDonate = async () => {
        if (!isLogin) {
            message.error(formatMessage("Please connect your wallet first"));
            return;
        }
        const isPass = checkUserSetting();
        if (!isPass) return;

        if (!donateAmount || parseFloat(donateAmount) <= 0) {
            message.error("Please enter a valid amount");
            return;
        }

        setPaying(true);
        setDonateLoading(true);
        try {
            if (selectedChain === "btc") {
                const donateEntity = await btcConnector!.use("simpledonate");
                const donateRes = await donateEntity.create({
                    dataArray: [
                        {
                            body: JSON.stringify({
                                createTime: Date.now().toString(),
                                to: buzzItem.address,
                                coinType: chain,
                                amount: donateAmount,
                                toPin: buzzItem.id,
                                message: donateMessage,
                            }),
                            flag: FLAG,
                            contentType: "text/plain;utf-8",
                            path: `${showConf?.host || ""}/protocols/simpledonate`,
                        },
                    ],
                    options: {
                        noBroadcast: "no",
                        feeRate: getEffectiveBTCFeerate(Number(feeRate)),
                        outputs: [
                            {
                                address: buzzItem.address,
                                satoshis: new Decimal(donateAmount).times(1e8).toString(),
                            },
                        ],
                        service: fetchServiceFee("donate_service_fee_amount", "BTC"),
                    },
                });
                if (donateRes.status) {
                    throw new Error(donateRes.status)
                }

                if (!isNil(donateRes?.revealTxIds[0])) {
                    message.success("Donate successfully");
                    setShowGift(false);
                    setDonateAmount("");
                    setDonateMessage("");
                    // setIsDonated(true);
                    setDonateCount(prev => prev + 1);
                    setDonates([...donates, user.metaid]);
                }
            } else if (selectedChain === "mvc") {
                console.log(chain);

                const donateEntity = (await mvcConnector!.use("simpledonate")) as IMvcEntity;
                console.log(donateEntity, 'donateEntity');
                const donateRes = await donateEntity.create({
                    data: {
                        body: JSON.stringify({
                            createTime: Date.now().toString(),
                            to: buzzItem.address,
                            coinType: chain,
                            amount: donateAmount,
                            toPin: buzzItem.id,
                            message: donateMessage,
                        }),
                        flag: FLAG,
                        contentType: "text/plain;utf-8",
                        path: `${showConf?.host || ""}/protocols/simpledonate`,
                        feeRate: Number(mvcFeeRate),
                    },
                    options: {
                        network: curNetwork,
                        signMessage: "donate buzz",
                        service: fetchServiceFee("donate_service_fee_amount", "MVC"),
                        outputs: [
                            {
                                address: buzzItem.address,
                                satoshis: new Decimal(donateAmount).times(1e8).toString(),
                            },
                        ],
                    },
                })

                console.log(donateRes, 'donateRes');



                if (!isNil(donateRes?.txid)) {
                    message.success("Donate successfully");
                    setShowGift(false);
                    setDonateAmount("");
                    setDonateMessage("");
                    // setIsDonated(true);
                    setDonates([...donates, user.metaid]);
                }
            } else {
                throw new Error("Donate not supported on this chain");
            }
        } catch (error: unknown) {
            const errorMessage = (error as any)?.message ?? error;
            const toastMessage = errorMessage?.includes(
                'Cannot read properties of undefined'
            )
                ? 'User Canceled'
                : errorMessage;
            message.error(toastMessage);
        }
        setPaying(false);
        setDonateLoading(false);
    };



    if (buzzItem.blocked && user.metaid !== buzzItem.creator) {
        return <Card><BlockedBuzz /></Card>
    }

    return (
        <Card
            className="tweet"
            loading={loading}
            style={{
                width: "100%",
                borderColor: colorBorder,
                background: backgeround || colorBgContainer,
                boxShadow: "none",

            }}
            styles={{
                header: {
                    height: 40,
                    borderColor: bordered ? colorBorder : 'transparent',
                },
                body: {
                    padding: panding
                }
            }}
            bordered={bordered}
            title={showHeader ?
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
                        <UserAvatar src={currentUserInfoData.data?.avatar} size={40} />
                        <FollowIconComponent
                            metaid={currentUserInfoData.data?.metaid || ""}
                        />
                    </div>
                    <div
                        style={{ display: "flex", flexDirection: "column", gap: 8 }}
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
                </div> : null
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
                        history.push(`/buzz/${buzzItem.id}`);
                    }}
                >
                    {textContent.length > 0 && (
                        <div
                            className="text"
                            ref={contentRef}
                            style={{
                                position: "relative",
                                maxHeight: isExpanded ? "none" : 200,
                                overflow: "hidden",
                                transition: "max-height 0.3s ease",
                            }}
                        >
                            <TextContent textContent={textContent} />

                            <Button
                                type="link"
                                style={{ padding: 0 }}
                                loading={isTranslating}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleTranslate();
                                }}
                            >
                                {showTrans
                                    ? formatMessage("Show original content")
                                    : formatMessage("Translate")}
                            </Button>

                            {isOverflowing && !isExpanded && (
                                <div
                                    style={{
                                        width: "100%",
                                        paddingTop: 78,
                                        backgroundImage: `linear-gradient(-180deg,${colorBgBlur} 0%,${colorBgContainer} 100%)`,
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        zIndex: 10,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Button
                                        variant="filled"
                                        color="primary"
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsExpanded(true);
                                        }}
                                        icon={<DownOutlined />}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {decryptContent && <NFTGallery nfts={decryptContent.nfts} />}

                    {decryptContent && <ImageGallery decryptContent={decryptContent} />}
                    {
                        decryptContent && decryptContent.video && decryptContent.video[0] && <Video pid={decryptContent.video[0]} />
                    }
                    <PayContent decryptContent={decryptContent} accessControl={accessControl} refetchDecrypt={refetchDecrypt} />

                    {
                        showFooter && <Space>
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
                    }

                </div>
            </div>
            <NewPost
                show={showNewPost}
                onClose={() => {
                    setShowNewPost(false);
                }}
                quotePin={buzzItem}
            />
            <DonateModal
                show={showGift}
                onClose={() => {
                    setShowGift(false);
                    setDonateAmount("");
                    setDonateMessage("");
                    setSelectedChain(chain);
                }}
                isLegacy={determineAddressInfo(buzzItem.address) === 'p2pkh'}
                userInfo={{
                    avatar: currentUserInfoData.data?.avatar,
                    name: currentUserInfoData.data?.name,
                    metaid: currentUserInfoData.data?.metaid,
                }}
                balance={balance}
                chain={selectedChain}
                setChain={setSelectedChain}
                paying={paying}
                donateAmount={donateAmount}
                donateMessage={donateMessage}
                setDonateAmount={setDonateAmount}
                setDonateMessage={setDonateMessage}
                onDonate={handleDonate}
            />


        </Card>
    );
};
