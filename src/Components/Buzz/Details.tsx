import { BASE_MAN_URL, curNetwork, FallbackImage, FLAG } from "@/config";
import { fetchBuzzDetail, fetchCurrentBuzzComments, fetchCurrentBuzzLikes, getControlByContentPin, getDecryptContent, getIDCoinInfo, getMRC20Info, getPinDetailByPid, getUserInfo } from "@/request/api";
import { CheckCircleOutlined, DownOutlined, GiftOutlined, HeartFilled, HeartOutlined, LinkOutlined, LockOutlined, MessageOutlined, PlusCircleFilled, SyncOutlined, UnlockFilled, UploadOutlined } from "@ant-design/icons"
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, theme, Image, message, Space, Spin, Tag, Typography } from "antd";
import { is, isEmpty, isNil, set } from "ramda";
import { useEffect, useMemo, useRef, useState } from "react";
import { useModel, history, useIntl } from "umi";
import Comment from "../Comment";
import NewPost from "../NewPost";
import './index.less'
import ForwardTweet from "./ForwardTweet";
import { IMvcEntity } from "@metaid/metaid";
import { FollowIconComponent } from "../Follow";
import dayjs from "dayjs";
import { buildAccessPass, decodePayBuzz } from "@/utils/buzz";
const { Paragraph, Text } = Typography;
import _btc from '@/assets/btc.png'
import Unlock from "../Unlock";
import { detectUrl, formatMessage, handleSpecial, openWindowTarget, sleep } from "@/utils/utils";

import UserAvatar from "../UserAvatar";
import ImageGallery from "./ImageGallery";
import { fetchTranlateResult } from "@/request/baidu-translate";
import Trans from "../Trans";
import NFTGallery from "./NFTGallery";

type Props = {
    buzzItem: API.Buzz
    like?: API.LikeRes[]
    showActions?: boolean,
    padding?: number
    reLoading?: boolean
    refetch?: () => Promise<any>
    isForward?: boolean,
    loading?: boolean
    handleClick?: () => void
}

export default ({ buzzItem, showActions = true, refetch, isForward = false, loading, like = [], handleClick }: Props) => {
    const { token: {
        colorBorderSecondary,
        colorBorder,
        colorBgBlur,
        colorBgContainer
    } } = theme.useToken();
    const {  locale } = useIntl()
    const [isTranslated, setIsTranslated] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [showTrans, setShowTrans] = useState(false);
    const [transResult, setTransResult] = useState<string[]>([]);
    const [showComment, setShowComment] = useState(false);
    const [showNewPost, setShowNewPost] = useState(false);
    const [showUnlock, setShowUnlock] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null); // 引用内容容器
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false); // 是否溢出
    const [paying, setPaying] = useState(false);
    const queryClient = useQueryClient();
    const { btcConnector, user, isLogin, connect, feeRate, chain, mvcConnector, checkUserSetting } = useModel('user');
    const { showConf, fetchServiceFee, manPubKey } = useModel('dashboard');
    const [handleLikeLoading, setHandleLikeLoading] = useState(false);
    const [likes, setLikes] = useState<string[]>([]);
    const currentUserInfoData = useQuery({
        queryKey: ['userInfo', buzzItem!.address],
        enabled: !isNil(buzzItem?.address),
        queryFn: () => {
            return getUserInfo({ address: buzzItem!.address })
        },
    });

    useEffect(() => {
        if (!buzzItem) {
            return
        }
        const _likes = buzzItem.like ?? [];
        const _like = like ?? [];
        setLikes([..._likes, ..._like.map(item => item.CreateMetaid)])

    }, [buzzItem, like])

    const payBuzz = useMemo(() => {
        let _summary = buzzItem!.content;
        const isSummaryJson = _summary.startsWith('{') && _summary.endsWith('}');
        const parseSummary = isSummaryJson ? JSON.parse(_summary) : {};
        return isSummaryJson ? parseSummary : undefined;
    }, [buzzItem])




    const isLiked = useMemo(() => {
        if (!buzzItem || !user) return false

        return likes.includes(user.metaid)
    }, [likes])
    const handleLike = async () => {
        if(!isLogin){
            message.error(formatMessage('Please connect your wallet first'))
            return
        }
        const isPass = checkUserSetting()
        if (!isPass) return
        const pinId = buzzItem!.id;
        if (isLiked) {
            message.error('You have already liked that buzz...');
            return;
        }
        setHandleLikeLoading(true)
        try {
            if (chain === 'btc') {
                const likeEntity = await btcConnector!.use('like');
                const likeRes = await likeEntity.create({
                    dataArray: [
                        {
                            body: JSON.stringify({ isLike: '1', likeTo: pinId }),
                            flag: FLAG,
                            contentType: 'text/plain;utf-8',
                            path: `${showConf?.host || ''}/protocols/paylike`
                        },
                    ],
                    options: {
                        noBroadcast: 'no',
                        feeRate: Number(feeRate),
                        service: fetchServiceFee('like_service_fee_amount', 'BTC')
                    },
                });
                if (!isNil(likeRes?.revealTxIds[0])) {
                    setLikes([...likes, user.metaid])
                    // await sleep(5000);
                    // queryClient.invalidateQueries({ queryKey: ['homebuzzesnew'] });
                    // queryClient.invalidateQueries({ queryKey: ['payLike', buzzItem!.id] });



                    message.success('like buzz successfully');
                }
            } else {
                const likeEntity = (await mvcConnector!.use('like')) as IMvcEntity;
                console.log({
                    body: JSON.stringify({
                        isLike: '1',
                        likeTo: pinId,
                    }),
                    path: `${showConf?.host || ''}/protocols/paylike`,
                    'signMessage': 'like buzz',
                })
                const likeRes = await likeEntity.create({
                    data: {
                        body: JSON.stringify({
                            isLike: '1',
                            likeTo: pinId,
                        }),
                        path: `${showConf?.host || ''}/protocols/paylike`
                    },
                    options: {
                        network: curNetwork,
                        signMessage: 'like buzz',
                        service: fetchServiceFee('like_service_fee_amount', 'MVC')
                    },
                })
                console.log('likeRes', likeRes)
                if (!isNil(likeRes?.txid)) {
                    // await sleep(8000);
                    // refetch && refetch()
                    // queryClient.invalidateQueries({ queryKey: ['homebuzzesnew'] })
                    // queryClient.invalidateQueries({
                    //     queryKey: ['payLike', buzzItem!.id],
                    // })
                    // await sleep(5000);
                    setLikes([...likes, user.metaid])
                    message.success('like buzz successfully')
                }
            }


        } catch (error) {
            console.log('error', error);
            const errorMessage = (error as any)?.message ?? error;
            const toastMessage = errorMessage?.includes(
                'Cannot read properties of undefined'
            )
                ? 'User Canceled'
                : errorMessage;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message.error(toastMessage);
        }
        setHandleLikeLoading(false)
    };
    const quotePinId = useMemo(() => {
        if (isForward) return ''
        let _summary = buzzItem!.content;
        const isSummaryJson = _summary.startsWith('{') && _summary.endsWith('}');
        const parseSummary = isSummaryJson ? JSON.parse(_summary) : {};
        return isSummaryJson && !isEmpty(parseSummary?.quotePin ?? '')
            ? parseSummary.quotePin
            : '';
    }, [buzzItem, isForward])



    const { isLoading: isQuoteLoading, data: quoteDetailData, } = useQuery({
        enabled: !isEmpty(quotePinId),
        queryKey: ['buzzDetail', quotePinId,],
        queryFn: () => fetchBuzzDetail({ pinId: quotePinId }),
    })

    const { data: accessControl } = useQuery({
        enabled: !isEmpty(payBuzz),
        queryKey: ['buzzAccessControl', buzzItem!.id],
        queryFn: () => getControlByContentPin({ pinId: buzzItem!.id }),
    })



    const { data: decryptContent, refetch: refetchDecrypt } = useQuery({

        queryKey: ['buzzdecryptContent', buzzItem!.id, chain, user.address],
        queryFn: () => decodePayBuzz(buzzItem, manPubKey!, isLogin),
    })

    const handlePay = async () => {
        if(!isLogin){
            message.error(formatMessage('Please connect your wallet first'))
            return
        }
        const isPass = checkUserSetting()
        if (!isPass) return
        setPaying(true)
        try {
            if (accessControl && accessControl.data) {
                const { data } = accessControl;
                const { payCheck } = data;
                await buildAccessPass(
                    data.pinId,
                    showConf?.host || '',
                    btcConnector!,
                    feeRate,
                    payCheck.payTo,
                    payCheck.amount,
                )
                await sleep(2000);
                refetchDecrypt()
                message.success('Pay successfully, please wait for the transaction to be confirmed!')
                setShowUnlock(false);



            }
        } catch (e) {
            message.error(e.message)
        }
        setPaying(false)
    }

    const { data: mrc20 } = useQuery({
        enabled: Boolean(accessControl?.data?.holdCheck),
        queryKey: ['mrc20', accessControl],
        queryFn: async () => {
            const { data } = await getMRC20Info({ tick: accessControl!.data.holdCheck.ticker })
            if (data.mrc20Id) {
                const userInfo = await getUserInfo({ address: data.address });
                return {
                    ...data,
                    deployerUserInfo: userInfo
                }
            }
            return Promise.resolve(null)
        }
    })

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
            const encryptContent = decryptContent.status === 'purchased' ? decryptContent.encryptContent : ''
            const res = await fetchTranlateResult({
                sourceText: `${decryptContent.publicContent}\n${encryptContent}`,
                from: locale === 'en-US' ? 'zh' : 'en',
                to: locale === 'en-US' ? 'en' : 'zh',
            })

            setTransResult(res!.trans_result.map(item => {
                return item.dst
            }))

            setIsTranslated(true);
        } catch (e) {
            message.error('Translate Failed');
        }
        setIsTranslating(false);
    }

    const textContent = useMemo(() => {
        if (!decryptContent) return ''
        if (!showTrans || isTranslating) {
            const encryptContent = decryptContent.status === 'purchased' ? decryptContent.encryptContent : ''
            return `${decryptContent.publicContent}${(decryptContent.publicContent && encryptContent) ? '\n' : ''}${encryptContent}`
        } else {
            return transResult.join('\n')
        }

    }, [showTrans, transResult, decryptContent, isTranslating])


    return <Card className="tweet"
        loading={loading}
        style={{ width: '100%', borderColor: isForward ? colorBorder : colorBorderSecondary }}
        styles={{ header: { height: 40, borderColor: isForward ? colorBorder : colorBorderSecondary } }}
        title={
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar" style={{ cursor: 'pointer', position: 'relative' }} >
                    <UserAvatar src={currentUserInfoData.data?.avatar} size={40} />
                    <FollowIconComponent metaid={currentUserInfoData.data?.metaid || ''} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} onClick={(e) => {
                    e.stopPropagation()
                    history.push(`/profile/${buzzItem.creator}`)
                }}>
                    <Text style={{ fontSize: 14, lineHeight: 1 }}> {currentUserInfoData.data?.name || 'Unnamed'}</Text>
                    <Text type="secondary" style={{ fontSize: 10, lineHeight: 1 }}>{currentUserInfoData.data?.metaid.slice(0, 8)}</Text>
                </div>
            </div>
        }
    >


        <div className="content" style={{
            cursor: 'pointer'
        }} >

            <div onClick={() => {
                handleClick ? handleClick() : history.push(`/buzz/${buzzItem.id}`)

            }}>
                {
                    textContent.length > 0 && <div className="text" ref={contentRef} style={{
                        position: 'relative',
                        maxHeight: isExpanded ? 'none' : 200,
                        overflow: 'hidden',
                        transition: 'max-height 0.3s ease',
                    }}  >
                        {(textContent ?? '').split('\n').map((line: string, index: number) => (
                            <span key={index} style={{}}>
                                <div
                                    style={{ minHeight: 22 }}
                                    dangerouslySetInnerHTML={{
                                        __html: handleSpecial(detectUrl(line)),
                                    }}
                                />
                            </span>
                        ))}

                        <Button type='link' style={{ padding: 0 }} loading={isTranslating} onClick={(e) => { e.stopPropagation(); handleTranslate() }}>
                            {showTrans ? formatMessage('Show original content') : formatMessage('Translate')}
                        </Button>

                        {
                            isOverflowing && !isExpanded && (
                                <div style={{
                                    width: '100%',
                                    paddingTop: 78,
                                    backgroundImage: `linear-gradient(-180deg,${colorBgBlur} 0%,${colorBgContainer} 100%)`,
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    zIndex: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Button variant="filled" color="primary" size='small' onClick={(e) => { e.stopPropagation(); setIsExpanded(true) }} icon={<DownOutlined />} />
                                </div>
                            )
                        }
                    </div>
                }

                {
                    decryptContent && <NFTGallery nfts={decryptContent.nfts} />
                }


                {
                    decryptContent && <ImageGallery decryptContent={decryptContent} />
                }

                {
                    decryptContent?.buzzType === 'pay' && <Spin spinning={accessControl?.data.mempool === 1}>{
                        accessControl?.data?.payCheck && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, background: "rgba(32, 32, 32, 0.06)", borderRadius: 8, padding: '4px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Text type="warning" style={{ lineHeight: '16px' }}>{
                                    accessControl?.data?.payCheck?.amount
                                }</Text>
                                <img src={_btc} alt="" width={16} height={16} />
                            </div>
                            <Button shape='round' size='small' type='primary'
                                disabled={decryptContent?.status === 'purchased' || decryptContent?.status === 'mempool'} onClick={async (e) => {
                                    e.stopPropagation();
                                    if(!isLogin){
                                        message.error(formatMessage('Please connect your wallet first'))
                                        return
                                    }
                                    const isPass = checkUserSetting()
                                    if (!isPass) return
                                    setShowUnlock(true)
                                }}
                                loading={decryptContent?.status === 'mempool'}
                            >
                                <Trans wrapper>
                                    {decryptContent.status === 'unpurchased' ? 'Unlock' : 'Unlocked'}
                                </Trans>
                            </Button>
                        </div>
                    }
                        {
                            accessControl?.data?.holdCheck && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, background: "rgba(32, 32, 32, 0.06)", borderRadius: 8, padding: '4px 12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Text type="warning" style={{ lineHeight: '16px' }}>
                                        {
                                            `Hold ${accessControl?.data?.holdCheck?.amount} ${accessControl?.data?.holdCheck?.ticker}`
                                        }
                                    </Text>
                                    {
                                        mrc20 && <UserAvatar src={mrc20.deployerUserInfo.avatar} size={20} />
                                    }
                                </div>
                                <Button shape='round' size='small' type='primary'
                                    disabled={decryptContent?.status === 'purchased' || decryptContent?.status === 'mempool'} onClick={async (e) => {
                                        window.open(`https://${curNetwork === 'testnet' ? 'testnet' : 'www'}.metaid.market/idCoin/${accessControl?.data?.holdCheck?.ticker}`, openWindowTarget())
                                    }}
                                    loading={decryptContent?.status === 'mempool'}
                                >
                                    Mint
                                </Button>
                            </div>
                        }

                    </Spin>
                }


                {(!isEmpty(quotePinId)) && (

                    <Card onClick={(e) => {
                        e.stopPropagation()

                    }} style={{ padding: 0, marginBottom: 12, boxShadow: 'none' }} bordered={false} styles={{ body: { padding: 0 } }} loading={isQuoteLoading}>
                        {quoteDetailData?.data && <ForwardTweet buzzItem={quoteDetailData?.data.tweet} showActions={false} />}
                    </Card>

                )}
                <Space>
                    <Button
                        size='small'
                        type="link"
                        icon={
                            <LinkOutlined />
                        }
                        style={{
                            fontSize: 12
                        }}
                        onClick={(e) => {
                            e.stopPropagation();

                            const link = buzzItem.chainName === 'btc' ? `${curNetwork === "testnet"
                                ? "https://mempool.space/testnet/tx/"
                                : "https://mempool.space/tx/"
                                }${buzzItem.genesisTransaction}`
                                : `https://${curNetwork === "testnet" ? "test" : "www"
                                }.mvcscan.com/tx/${buzzItem.genesisTransaction}`
                            window.open(link, '_blank')
                        }}
                    >
                        {buzzItem.genesisTransaction.slice(0, 8)}
                    </Button>
                    <Tag icon={buzzItem.genesisHeight === 0 ? <SyncOutlined spin /> : null} bordered={false} color={buzzItem.chainName === 'mvc' ? 'blue' : 'orange'}>{buzzItem.chainName}</Tag>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>{dayjs
                        .unix(buzzItem.timestamp)
                        .format('YYYY-MM-DD HH:mm:ss')}</Typography.Text>

                </Space>

            </div>




            {showActions && <div className="actions">

                <Button type='text' icon={<MessageOutlined />} onClick={async () => {
                    if(!isLogin){
                        message.error(formatMessage('Please connect your wallet first'))
                        return
                    }
                    const isPass = checkUserSetting()
                    if (!isPass) return;

                    showComment ? setShowComment(false) : setShowComment(true)
                }}>
                    {buzzItem.commentCount}
                </Button>


                <Button type='text' loading={handleLikeLoading} onClick={handleLike} icon={isLiked ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />}>
                    {likes.length}
                </Button>
                <div className="item">
                    <GiftOutlined />
                </div>
                <div className="item">
                    <Button type='text' icon={<UploadOutlined />} onClick={() => {
                        if(!isLogin){
                            message.error(formatMessage('Please connect your wallet first'))
                            return
                        }
                        const isPass = checkUserSetting()
                        if (!isPass) return;
                        showNewPost ? setShowNewPost(false) : setShowNewPost(true)
                    }} />
                </div>
            </div>}
        </div>


        <Comment tweetId={buzzItem.id} onClose={() => {
            setShowComment(false)
        }} show={showComment} refetch={refetch} />
        <NewPost show={showNewPost} onClose={() => { setShowNewPost(false) }} quotePin={buzzItem} />
        <Unlock show={showUnlock && (decryptContent?.status !== 'purchased' && decryptContent?.status !== 'mempool')} onClose={() => { setShowUnlock(false) }}  >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
                flexDirection: 'column'
            }}>
                <img src={_btc} alt="" width={60} height={60} />
                <Typography.Title level={4}>{accessControl?.data?.payCheck?.amount} BTC</Typography.Title>
                
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    width: '100%'

                }}>
                    <Button shape='round' variant='filled' size='large' color='primary' block onClick={() => {
                        setShowUnlock(false)
                    }} >
                        <Trans wrapper>Cancel</Trans>
                    </Button>
                    <Button shape='round' size='large' block loading={paying} type='primary'
                        onClick={async (e) => {
                            e.stopPropagation()
                            handlePay()
                        }
                        } >
                        <Trans wrapper>Unlock</Trans>

                    </Button>

                </div>
            </div>
        </Unlock>
    </Card>
}