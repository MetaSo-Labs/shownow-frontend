import Trans from "@/Components/Trans"
import { Button, Card, Divider, Space, theme, Typography } from "antd"
import { useMemo, useState } from "react"
import { useModel } from "umi"
const DescItem = ({ label, value }) => {
    return <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0px 20px'

    }}>
        <Typography.Text ><Trans>{label}</Trans></Typography.Text>
        <Typography.Text>{value} SAT</Typography.Text>
    </div>
}
export default () => {
    const {
        token: {
            colorPrimary,
            colorTextSecondary
        }
    } = theme.useToken()
    const [activeKey, setActiveKey] = useState('BTC');
    const { fees, admin } = useModel('dashboard')

    const curFee = useMemo(() => {
        return fees.find((item) => item.chain === activeKey)
    }, [fees, activeKey])
    const [activeTabKey2, setActiveTabKey2] = useState<string>('fee');
    const onTab2Change = (key: string) => {
        setActiveTabKey2(key);
    };

    const tabListNoTitle = [
        {
            key: 'fee',
            label: <Trans>Fee</Trans>,
        },
        {
            key: 'introduction',
            label: <Trans>Introduction</Trans>,
        },
    ];
    return <Card bordered={false} tabList={tabListNoTitle}
        activeTabKey={activeTabKey2}
        onTabChange={onTab2Change}>
        {
            activeTabKey2 === 'fee' ? <>
                <Space>
                    <Button variant='filled' color={activeKey === 'BTC' ? 'primary' : 'default'} onClick={() => setActiveKey('BTC')}>
                        BTC
                    </Button>
                    <Button variant='filled' color={activeKey === 'MVC' ? 'primary' : 'default'} onClick={() => setActiveKey('MVC')}>
                        MVC
                    </Button>
                </Space>
                <Card style={{
                    marginTop: 20
                }} styles={{
                    body: {
                        padding: '20px 0'
                    }
                }}>
                    <DescItem label='Follow Service Fee' value={curFee?.follow_service_fee_amount} />
                    <Divider />
                    <DescItem label='Post Service Fee' value={curFee?.post_service_fee_amount} />
                    <Divider />
                    <DescItem label='Comment Service Fee' value={curFee?.comment_service_fee_amount} />
                    <Divider />
                    <DescItem label='Like Service Fee' value={curFee?.like_service_fee_amount} />
                    <Divider />
                    <DescItem label='Donate Service Fee' value={curFee?.donate_service_fee_amount} />

                </Card></> : <Card title={<Trans>Introduction</Trans>} styles={{
                    header: {
                        
                    }
                }}>
                <div
                style={{ whiteSpace: 'pre-line',color:colorTextSecondary }}
                    >
                        {admin?.introduction || ''}
                    </div>
            </Card>
        }

    </Card>
}