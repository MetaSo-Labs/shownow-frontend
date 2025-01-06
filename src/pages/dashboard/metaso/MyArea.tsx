import NumberFormat from "@/Components/NumberFormat"
import { curNetwork } from "@/config"
import { claimCommit, claimPre, fetchAreaInfo } from "@/request/metaso"
import { buildClaimPsbt } from "@/utils/metaso"
import { GifOutlined, GiftOutlined } from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query"
import { Button, Card, Descriptions, DescriptionsProps, message, Modal, Space, Typography } from "antd"
import Decimal from "decimal.js"
import { useMemo, useState } from "react"
import { useModel } from "umi"

export default () => {
    const [modal, contextHolder] = Modal.useModal();
    const { admin } = useModel('dashboard')
    const { feeRate } = useModel('user');
    const [commiting, setCommiting] = useState(false);
    const { data, isFetching, refetch } = useQuery({
        queryKey: ['coinSummary', admin?.host],
        enabled: Boolean(admin?.host),
        queryFn: () => {
            return fetchAreaInfo({
                host: admin!.host
            })
        },
    })
    const areaInfo = useMemo(() => {
        return data?.data
    }, [data]);

    const handleClaim = async () => {
        setCommiting(true)
        try {
            if (!areaInfo) throw new Error('No data')
            const address = await window.metaidwallet.btc.getAddress();
            if (address !== admin?.host) {
                throw new Error('Address not match');
            }
            const { code, message: msg, data: order } = await claimPre({
                receiveAddress: admin!.host,
                networkFeeRate: feeRate,
                claimAmount: areaInfo!.pendingReward
            })


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
                title: 'Trade Confirm',

                content: <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 16,
                    textAlign: 'left',
                }}>
                    <Descriptions column={1} items={[{
                        label: 'Amount',
                        children: <NumberFormat value={order.claimAmount} suffix=' $METASO'></NumberFormat>,
                    }, {
                        label: 'Receive Address',
                        children: order.receiveAddress,
                    },
                    {
                        label: 'Gas Fee',
                        children: <NumberFormat value={new Decimal(fee).add(order.minerGas).toFixed(8)} suffix=' SAT'></NumberFormat>,
                    },
                    {
                        label: 'Fee Rate',
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

            const commitRes = await claimCommit({
                orderId: order.orderId,
                commitTxOutIndex: 0,
                commitTxRaw: rawTx
            })
            if (commitRes.code !== 0) throw new Error(commitRes.message);
            message.success('Claim success')
            await refetch()
        } catch (e: any) {
            console.log(e)
            message.error(e.message)

        }
        setCommiting(false)
    }
    const items: DescriptionsProps['items'] = [
        {
            key: '1',
            label: 'Total Acquisition Quantity',
            children: <NumberFormat wrapper style={{
                fontSize: 24,
                fontWeight: 'bold'
            }} value={areaInfo?.totalAcquisitionReward} suffix=' $METASO'></NumberFormat>
        },
        {
            key: '2',
            label: 'Current Expected Metablock Rewards',
            children: <NumberFormat wrapper style={{
                fontSize: 24,
                fontWeight: 'bold'
            }} value={areaInfo?.currentExpectedMetaBlockReward} suffix=' $METASO'></NumberFormat>,
        },
        {
            key: '3',
            label: 'Pending Rewards',
            rowSpan: 2,
            children: <Space direction='vertical'>
                <NumberFormat wrapper style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: '#2563EB'
                }} value={areaInfo?.pendingReward} suffix=' $METASO'></NumberFormat>
                <Button type='primary' loading={commiting} icon={<GiftOutlined />} disabled={areaInfo?.pendingReward <= 0} onClick={handleClaim}>Claim</Button>
            </Space>,
        },
        {
            key: '4',
            label: 'Last Metablock Rewards',
            children: <NumberFormat wrapper style={{
                fontSize: 24,
                fontWeight: 'bold'
            }} value={areaInfo?.lastMetaBlockReward} suffix=' $METASO'></NumberFormat>,
        },
        {
            key: '5',
            label: "Last Metablock's Share ",
            children: <NumberFormat wrapper style={{
                fontSize: 24,
                fontWeight: 'bold'
            }} value={areaInfo?.lastMetaBlockShare} suffix=' %'></NumberFormat>,
        },
    ];
    return <div>
        <Typography.Title level={4}>My Area</Typography.Title>
        <Card loading={isFetching}>
            <Descriptions layout="vertical" items={items} />
        </Card>
        {contextHolder}
    </div>
}