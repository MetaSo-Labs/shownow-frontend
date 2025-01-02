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
            colorPrimary
        }
    } = theme.useToken()
    const [activeKey, setActiveKey] = useState('BTC');
    const { fees } = useModel('dashboard')

    const curFee = useMemo(() => {
        return fees.find((item) => item.chain === activeKey)
    }, [fees, activeKey])
    return <Card bordered={false}>
        <Typography.Text strong style={{ color: colorPrimary }}><Trans>Fee</Trans></Typography.Text>
        <Divider />
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
            <DescItem label='Follow Serivice Fee' value={curFee?.follow_service_fee_amount} />
            <Divider />
            <DescItem label='Post Serivice Fee' value={curFee?.post_service_fee_amount} />
            <Divider />
            <DescItem label='Commet Serivice Fee' value={curFee?.comment_service_fee_amount} />
            <Divider />
            <DescItem label='Like Serivice Fee' value={curFee?.like_service_fee_amount} />

        </Card>
    </Card>
}