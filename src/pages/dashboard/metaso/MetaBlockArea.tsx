import NumberFormat from "@/Components/NumberFormat"
import { fetchAreaInfo, fetchMetaBlockAreaInfo } from "@/request/metaso"
import { GifOutlined, GiftOutlined } from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query"
import { Button, Card, Descriptions, DescriptionsProps, Progress, Space, Typography } from "antd"
import { useMemo } from "react"
import { useModel } from "umi"

export default () => {
    const { admin } = useModel('dashboard')
    const { data, isFetching } = useQuery({
        queryKey: ['metablockArea', admin?.host],
        enabled: Boolean(admin?.host),
        queryFn: () => {
            return fetchMetaBlockAreaInfo({
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
            label: 'Current TX Total',
            children: <NumberFormat wrapper style={{
                fontSize: 24,
                fontWeight: 'bold',

            }} value={areaInfo?.currentTxCount} suffix=''></NumberFormat>
        },
        {
            key: '2',
            label: 'My ΔMDV/ ΔtMDV',
            span: 2,
            children: <Space>
                <NumberFormat
                    wrapper
                    style={{
                        fontSize: 24,
                        fontWeight: 'bold'
                    }}
                    value={areaInfo?.ownMdvDeltaValueStr}
                />
                <Typography.Text type='secondary'>
                    <NumberFormat

                        wrapper
                        style={{
                            fontSize: 24,

                        }}
                        prefix='/'
                        value={areaInfo?.currentMdvDeltaValueStr}
                    />
                </Typography.Text>

            </Space>,
        },
        {
            key: '3',
            label: 'Block Progress Bar ',
            span: 3,
            children: <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <Progress percent={areaInfo?.progressBlockTotal ? areaInfo.progressBlockCount / areaInfo.progressBlockTotal * 100 : 0} showInfo={false} />
                <div style={{ whiteSpace: 'nowrap' }}>
                    <NumberFormat
                        wrapper
                        style={{
                            fontSize: 24,
                            fontWeight: 'bold',
                            color: '#2563EB'
                        }}
                        value={areaInfo?.progressBlockCount}
                        suffix=' Blocks'
                    />
                    <Typography.Text type='secondary'>
                        <NumberFormat

                            wrapper
                            style={{
                                fontSize: 16,

                            }}
                            prefix='/ '
                            value={areaInfo?.progressBlockTotal}
                            suffix=' Blocks'
                        />
                    </Typography.Text>

                </div>
            </div>,
        },

    ];
    return <div>
        <Typography.Title level={4}>MetaBlock Area</Typography.Title>
        <Card loading={isFetching}>
            <Descriptions layout="vertical" items={items} />
        </Card>
    </div>
}