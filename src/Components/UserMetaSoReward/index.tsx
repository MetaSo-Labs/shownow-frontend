import { Button, Card, Descriptions, message, Modal, notification, Space, theme, Typography } from "antd";
import Trans from "../Trans";
import { useQuery } from "@tanstack/react-query";
import { claimCommit, claimCommitUser, claimPre, claimPreUser, fetchUserCoinInfo } from "@/request/metaso";
import NumberFormat from "../NumberFormat";
import { useModel } from "umi";
import Records from "./Records";
import { useState } from "react";
import { buildClaimPsbt } from "@/utils/metaso";
import { curNetwork } from "@/config";
import Decimal from "decimal.js";


type Props = {
    address: string;
    host: string;
}
export default ({ address, host }: Props) => {
    const { showConf, admin } = useModel('dashboard')
    const [commiting, setCommiting] = useState(false)
    const [modal, contextHolder] = Modal.useModal();
    const [api, contextHolder2] = notification.useNotification();
    const { feeRate } = useModel('user')
    const {
        token: {
            colorPrimary
        }
    } = theme.useToken()
    const { data, isFetching, refetch } = useQuery({
        queryKey: ['fetchUserCoinInfo', address, host],
        queryFn: () => {
            return fetchUserCoinInfo({
                host,
                address
            })
        }
    })

    const successNotice = (txid: string) => {
        const key = `open${Date.now()}`;
        const btn = (
            <Space>
                <Button type="primary" size="small" onClick={() => {
                    const link = `${curNetwork === "testnet"
                        ? "https://mempool.space/testnet/tx/"
                        : "https://mempool.space/tx/"
                        }${txid}`

                    window.open(link, "_blank");
                }}>
                    open
                </Button>
            </Space>
        );
        api.open({
            message: 'Claim Success',
            description: txid,
            btn,
            key,
        });
    };

    const handleClaim = async () => {
        setCommiting(true)
        try {
            if (Number(data?.data.pendingReward) <= 0) {
                throw new Error('No pending reward')
            }

            const publicKey = await window.metaidwallet.btc.getPublicKey();
            const _address = await window.metaidwallet.btc.getAddress();
            if (address !== _address) throw new Error('Address not match')
            const signature: any = await window.metaidwallet.btc.signMessage('metaso.network');


            const { code, message: msg, data: order } = await claimPreUser({
                receiveAddress: address,
                host,
                networkFeeRate: feeRate,
                claimAmount: data!.data.pendingReward
            },
                {
                    headers: {
                        "X-Signature": signature,
                        "X-Public-Key": publicKey,
                    },
                }
            )
            if (code !== 0) throw new Error(msg)
            const { fee } = await buildClaimPsbt(
                order,
                curNetwork,
                address,
                feeRate,
                false,
                false,
            )


            const confirmed = await modal.confirm({
                title: <Trans>Trade Confirm</Trans>,

                content: <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 16,
                    textAlign: 'left',
                }}>
                    <Descriptions column={1} items={[{
                        label: <Trans>Amount</Trans>,
                        children: <NumberFormat value={order.claimAmount} suffix=' $METASO'></NumberFormat>,
                    }, {
                        label: <Trans>Receive Address</Trans>,
                        children: address,
                    },
                    {
                        label: <Trans>Gas Fee</Trans>,
                        children: <NumberFormat value={new Decimal(fee).add(order.minerGas).toFixed(8)} suffix=' SAT'></NumberFormat>,
                    },
                    {
                        label: <Trans>Fee Rate</Trans>,
                        children: <NumberFormat value={feeRate} suffix=' sat/vB'></NumberFormat>,
                    }]} />
                </div>
            });
            if (!confirmed) {
                throw new Error('canceled')
            }
            const { rawTx } = await buildClaimPsbt(
                order,
                curNetwork,
                address,
                feeRate,
            )

            const commitRes = await claimCommitUser({
                orderId: order.orderId,
                commitTxOutIndex: 0,
                commitTxRaw: rawTx
            })
            if (commitRes.code !== 0) throw new Error(commitRes.message);

            successNotice(commitRes.data.commitTxId)
            await refetch()
        } catch (e: any) {
            if (e.message === 'Insufficient funds to reach the target amount') {
                message.error('Insufficient BTC for network fee')

            } else {
                message.error(e.message)
            }



        }
        setCommiting(false)
    }

    return <div>
        <Typography.Title level={5}>
            <Trans>Metaso</Trans>
        </Typography.Title>
        <Card loading={isFetching}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ color: colorPrimary, fontSize: 20, fontWeight: 'bold' }}><NumberFormat value={data?.data.pendingReward} suffix=' $METASO' /></div>
                    <Typography.Text type='secondary'>
                        <Trans>Pending Rewards</Trans>
                    </Typography.Text>
                </div>
                <Space>
                    <Button size='small' shape='round' type="primary" disabled={data?.data.pendingReward <= 0} onClick={handleClaim} loading={commiting}>
                        <Trans wrapper>Claim</Trans>
                    </Button>
                    <Records />
                </Space>
            </div>
        </Card>
        {contextHolder}
        {contextHolder2}
    </div>
}