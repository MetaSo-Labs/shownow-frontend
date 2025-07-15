import MRC20Icon from "@/Components/MRC20Icon";
import Trans from "@/Components/Trans";
import Unlock from "@/Components/Unlock";
import UserAvatar from "@/Components/UserAvatar";
import { curNetwork } from "@/config";
import { getMRC20Info, getUserInfo } from "@/request/api";
import { buildAccessPass, buildMRc20AccessPass, FormatBuzz } from "@/utils/buzz";
import { formatMessage, openWindowTarget, sleep } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { Button, message, Spin, theme, Typography } from "antd";
import { useState } from "react";
import { useModel } from "umi";
import _btc from "@/assets/btc.png";
import { LockOutlined } from "@ant-design/icons";
import payBg from "@/assets/payBg.png";

type Props = {
    decryptContent: FormatBuzz | undefined,
    accessControl: API.ControlByContentPinRet | undefined,
    refetchDecrypt: (options?: any) => Promise<any>
}
export default ({ decryptContent, accessControl, refetchDecrypt }: Props) => {
    const [showUnlock, setShowUnlock] = useState(false);
    const [unlocking, setUnlocking] = useState(false);
    const { showConf } = useModel('dashboard');
    const {
        btcConnector,
        isLogin,
        feeRate,
        checkUserSetting,
    } = useModel("user");
    const { token: {
        colorBgLayout,
        colorFillAlter
    } } = theme.useToken();
    const { data: mrc20 } = useQuery({
        enabled: Boolean(accessControl?.data?.holdCheck),
        queryKey: ["mrc20", accessControl],
        queryFn: async () => {
            const { data } = await getMRC20Info({
                tick: accessControl!.data.holdCheck.ticker,
            });
            if (data.mrc20Id) {
                const userInfo = await getUserInfo({ address: data.address });
                return {
                    ...data,
                    deployerUserInfo: userInfo,
                };
            }
            return Promise.resolve(null);
        },
    });

    const { data: payMrc20 } = useQuery({
        enabled: Boolean(accessControl?.data?.payCheck?.type === 'mrc20'),
        queryKey: ["mrc20", accessControl],
        queryFn: async () => {
            const { data } = await getMRC20Info({
                tick: accessControl!.data.payCheck.ticker,
            });
            if (data.mrc20Id) {

                return {
                    ...data,
                };
            }
            return Promise.resolve(null);
        },
    });

    const handlePay = async () => {
        if (!isLogin) {
            message.error(formatMessage("Please connect your wallet first"));
            return;
        }
        const isPass = checkUserSetting();
        if (!isPass) return;
        setUnlocking(true);
        try {
            if (accessControl && accessControl.data) {
                const { data } = accessControl;
                const { payCheck } = data;
                if (payCheck.type !== 'mrc20') {
                    await buildAccessPass(
                        data.pinId,
                        showConf?.host || "",
                        btcConnector!,
                        feeRate,
                        payCheck.payTo,
                        payCheck.amount
                    );
                } else {
                    await buildMRc20AccessPass(
                        data.pinId,
                        showConf?.host || "",
                        btcConnector!,
                        feeRate,
                        payCheck.payTo,
                        payCheck.amount,
                        payMrc20!
                    )
                }

                await sleep(1000);
                refetchDecrypt();
                message.success(
                    "Pay successfully, please wait for the transaction to be confirmed!"
                );
                setShowUnlock(false);
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
        setUnlocking(false);
    };
    return <>
        {decryptContent?.buzzType === "pay" && (
            <Spin spinning={accessControl?.data?.mempool === 1}>
                {decryptContent?.status === "unpurchased" && (<div className="buzzPayContent">

                    <div
                        className="payContent"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "column",
                            gap: 8,
                            justifyContent: "space-between",
                            marginBottom: 12,

                            borderRadius: 12,
                            padding: '80px 16px',
                        }}
                    >
                        <LockOutlined style={{ fontSize: 24, color: '#fff' }} />
                        {accessControl?.data?.payCheck && (
                            <Typography.Text type='secondary' style={{ lineHeight: "16px", color: '#fff' }}>
                                This is paid content. A payment of
                                <Typography.Text type='secondary' style={{ lineHeight: "16px", color: '#fff' }} strong>
                                    {` ${accessControl?.data?.payCheck?.amount} `}

                                    {accessControl?.data?.payCheck?.type === 'mrc20' ? (payMrc20 && <><Typography.Text type='secondary' style={{ lineHeight: "16px", color: '#fff' }}> ${payMrc20.tick}</Typography.Text></>) : 'BTC'}</Typography.Text> is required for access.
                            </Typography.Text>
                        )}
                        {accessControl?.data?.holdCheck && (
                            <Typography.Text type='secondary' style={{ lineHeight: "16px", color: '#fff' }}>
                                Access is restricted. Only token holders are allowed.
                            </Typography.Text>
                        )}

                    </div>
                </div>)}

                {accessControl?.data?.payCheck && (
                    <div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 12,
                                background: colorFillAlter,
                                borderRadius: 12,
                                padding: 16,
                            }}
                        >
                            <div
                                style={{ display: "flex", alignItems: "center", gap: 8 }}
                            >
                                <Typography.Text type="warning" style={{ lineHeight: "16px" }}>
                                    {accessControl?.data?.payCheck?.amount}
                                </Typography.Text>
                                {accessControl?.data?.payCheck?.type === 'mrc20' ? (payMrc20 && <><Typography.Text>${payMrc20.tick}</Typography.Text><MRC20Icon size={20} tick={payMrc20.tick} metadata={payMrc20.metadata} /></>) : <img src={_btc} alt="" width={16} height={16} />}

                            </div>
                            <Button
                                shape="round"
                                variant="filled"
                                color="primary"
                                disabled={
                                    decryptContent?.status === "purchased" ||
                                    decryptContent?.status === "mempool"
                                }
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!isLogin) {
                                        message.error(
                                            formatMessage("Please connect your wallet first")
                                        );
                                        return;
                                    }
                                    const isPass = checkUserSetting();
                                    if (!isPass) return;
                                    setShowUnlock(true);
                                }}
                                loading={decryptContent?.status === "mempool"}
                            >
                                <Trans wrapper>
                                    {decryptContent.status === "unpurchased"
                                        ? "Unlock"
                                        : "Unlocked"}
                                </Trans>
                            </Button>
                        </div>
                        {
                            decryptContent?.status === "mempool" && <Typography.Text type='warning' style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', lineHeight: '20px', paddingBottom: 12 }}>
                                <Trans>Waiting for transaction confirmation. Access will be available once confirmed.</Trans>
                            </Typography.Text>
                        }
                    </div>
                )}
                {accessControl?.data?.holdCheck && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 12,
                            background: colorFillAlter,
                            borderRadius: 12,
                            padding: 16,
                        }}
                    >
                        <div
                            style={{ display: "flex", alignItems: "center", gap: 8 }}
                        >
                            <Typography.Text type="warning" style={{ lineHeight: "16px" }}>
                                {`Hold ${accessControl?.data?.holdCheck?.amount} $${accessControl?.data?.holdCheck?.ticker}`}
                            </Typography.Text>
                            {mrc20 && (
                                mrc20.metadata ?
                                    <MRC20Icon size={20} tick={mrc20.tick} metadata={mrc20.metadata} /> :
                                    <UserAvatar
                                        src={mrc20.deployerUserInfo?.avatar}
                                        size={20}
                                    />

                            )}
                        </div>
                        <Button
                            shape="round"
                            variant="filled"
                            color="primary"

                            disabled={
                                decryptContent?.status === "purchased" ||
                                decryptContent?.status === "mempool"
                            }
                            onClick={async (e) => {
                                window.open(
                                    `https://${curNetwork === "testnet" ? "testnet" : "www"}.metaid.market/${mrc20 && mrc20.metadata ? 'mrc20' : 'idCoin'}/${accessControl?.data?.holdCheck?.ticker}`,
                                    openWindowTarget()
                                );
                            }}
                            loading={decryptContent?.status === "mempool"}
                        >
                            <Trans wrapper>Mint</Trans>
                        </Button>
                    </div>
                )}
            </Spin>
        )}

        <Unlock show={showUnlock && (decryptContent?.status !== 'purchased' && decryptContent?.status !== 'mempool')} onClose={() => { setShowUnlock(false) }}  >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
                flexDirection: 'column',
                padding: 20
            }}>
                {accessControl?.data?.payCheck?.type === 'mrc20' ? (payMrc20 && <MRC20Icon size={60} tick={payMrc20?.tick} metadata={payMrc20?.metadata} />) : <img src={_btc} alt="" width={60} height={60} />}

                <Typography.Title level={4}>{accessControl?.data?.payCheck?.amount} {accessControl?.data?.payCheck?.type === 'mrc20' ? '$' + payMrc20?.tick : 'BTC'}</Typography.Title>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    width: '100%'

                }}>
                    <Button shape='round' variant='filled' size='large' color='primary' block onClick={(e) => {
                        e.stopPropagation()
                        setShowUnlock(false)
                    }} >
                        <Trans wrapper>Cancel</Trans>
                    </Button>
                    <Button shape='round' size='large' block loading={unlocking} type='primary'
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

    </>
}