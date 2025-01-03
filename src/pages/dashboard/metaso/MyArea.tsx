import NumberFormat from "@/Components/NumberFormat"
import { fetchAreaInfo } from "@/request/metaso"
import { GifOutlined, GiftOutlined } from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query"
import { Button, Card, Descriptions, DescriptionsProps, Space, Typography } from "antd"
import { useMemo } from "react"
import { useModel } from "umi"

export default () => {
    const { admin } = useModel('dashboard')
    const { data, isFetching } = useQuery({
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
    const items: DescriptionsProps['items'] = [
        {
            key: '1',
            label: 'Total Acquisition Quantity',
            children: <NumberFormat wrapper style={{
                fontSize: 24,
                fontWeight: 'bold'
            }} value={areaInfo?.totalReward} suffix=' $METASO'></NumberFormat>
        },
        {
            key: '2',
            label: 'Current Expected Metablock Rewards',
            children: <NumberFormat wrapper style={{
                fontSize: 24,
                fontWeight: 'bold'
            }} value={areaInfo?.currentReward} suffix=' $METASO'></NumberFormat>,
        },
        {
            key: '3',
            label: 'Pending Rewards',
            children: <Space>
                <NumberFormat wrapper style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: '#2563EB'
                }} value={areaInfo?.pendingReward} suffix=' $METASO'></NumberFormat>
                <Button type='primary' icon={<GiftOutlined />} disabled={areaInfo?.pendingReward <= 0}>Claim</Button>
            </Space>,
        },
        {
            key: '4',
            label: 'Last Metablock Rewards',
            children: <NumberFormat wrapper style={{
                fontSize: 24,
                fontWeight: 'bold'
            }} value={areaInfo?.lastReward} suffix=' $METASO'></NumberFormat>,
        },
        {
            key: '5',
            label: "Last Metablock's Share ",
            children: <NumberFormat wrapper style={{
                fontSize: 24,
                fontWeight: 'bold'
            }} value={areaInfo?.scale} suffix=' %'></NumberFormat>,
        },
    ];
    return <div>
        <Typography.Title level={4}>My Area</Typography.Title>
        <Card loading={isFetching}>
            <Descriptions layout="vertical" items={items} />
        </Card>
    </div>
}