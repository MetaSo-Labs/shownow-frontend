import { curNetwork, FLAG } from "@/config";
import { formatMessage, getEffectiveBTCFeerate } from "@/utils/utils";
import { GiftFilled, GiftOutlined, HeartFilled, HeartOutlined, MessageOutlined, UploadOutlined } from "@ant-design/icons";
import { IMvcEntity } from "@feiyangl1020/metaid";
import { Button, message, theme } from "antd";
import { isNil } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { useModel } from "umi";
import Donate from "../Donate";
import Comment from "../Comment";
import NewPost from "../NewPost";

type Props = {
    buzzItem: API.Buzz;
    like?: API.LikeRes[];
    donate?: API.DonateRes[];
}
export default ({ buzzItem, like = [], donate = [] }: Props) => {
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
    const { showConf, fetchServiceFee } = useModel('dashboard');
    const { token: {
        colorPrimary
    } } = theme.useToken();
    const [showComment, setShowComment] = useState(false);
    const [showGift, setShowGift] = useState(false);
    const [likes, setLikes] = useState<string[]>([]);
    const [donates, setDonates] = useState<string[]>([]);
    const [donateCount, setDonateCount] = useState<number>(0);
    const [handleLikeLoading, setHandleLikeLoading] = useState(false);
    const [showNewPost, setShowNewPost] = useState(false);

    useEffect(() => {
        if (!buzzItem) {
            return;
        }
        const _likes = buzzItem.like ?? [];
        const _like = like ?? [];
        setLikes([..._likes, ..._like.map((item) => item.CreateMetaid)]);
        const _donates = buzzItem.donate ?? [];
        const _donate = donate ?? [];
        setDonates([..._donates, ..._donate.map((item) => item.CreateMetaid)]);
        setDonateCount(buzzItem.donateCount ?? 0);
    }, [buzzItem, like, donate]);

    const isLiked = useMemo(() => {
        if (!buzzItem || !user) return false;

        return likes.includes(user.metaid);
    }, [likes]);

    const isDonatedUser = useMemo(() => {
        if (!buzzItem || !user) return false;
        return donates.includes(user.metaid);
    }, [donates]);

    const handleLike = async () => {
        if (!isLogin) {
            message.error(formatMessage("Please connect your wallet first"));
            return;
        }
        const isPass = checkUserSetting();
        if (!isPass) return;
        const pinId = buzzItem!.id;
        if (isLiked) {
            message.error("You have already liked that buzz...");
            return;
        }
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
                    setLikes([...likes, user.metaid]);
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
                        // feeRate: Number(mvcFeeRate),
                    },
                });
                if (!isNil(likeRes?.txid)) {
                    setLikes([...likes, user.metaid]);
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
    return <><div className="actions">
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
                const isPass = checkUserSetting();
                if (!isPass) return;

                showComment ? setShowComment(false) : setShowComment(true);
            }}
        >
            {buzzItem.commentCount}
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
            {likes.length}
        </Button>
        <Button
            type="text"
            icon={
                isDonatedUser ? (
                    <GiftFilled style={{ color: colorPrimary }} />
                ) : (
                    <GiftOutlined />
                )
            }
            onClick={async () => {
                if (!isLogin) {
                    message.error(
                        formatMessage("Please connect your wallet first")
                    );
                    return;
                }
                const isPass = checkUserSetting();
                if (!isPass) return;

                showGift ? setShowGift(false) : setShowGift(true);
            }}
        >
            {donateCount}
        </Button>

        <Button
            type="text"
            icon={<UploadOutlined />}
            onClick={() => {
                if (!isLogin) {
                    message.error(
                        formatMessage("Please connect your wallet first")
                    );
                    return;
                }
                const isPass = checkUserSetting();
                if (!isPass) return;
                showNewPost ? setShowNewPost(false) : setShowNewPost(true);
            }}
        >
            {buzzItem.forwardCount}
        </Button>

    </div>
        <Comment
            tweetId={buzzItem.id}
            onClose={() => {
                setShowComment(false);
            }}
            show={showComment}
        />
        <NewPost
            show={showNewPost}
            onClose={() => {
                setShowNewPost(false);
            }}
            quotePin={buzzItem}
        />
        <Donate donateAddress={buzzItem.creator} show={showGift} onClose={() => setShowGift(false)} pinId={buzzItem.id} callback={() => {
            setDonateCount(donateCount + 1);
        }} />
    </>
}