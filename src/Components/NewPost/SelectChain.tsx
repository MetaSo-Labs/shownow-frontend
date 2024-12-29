import { Button, Col, Radio, Row, Tag, Typography } from "antd"
import Trans from "../Trans"
import _btc from '@/assets/btc.png'
import _mvc from '@/assets/mvc.png'

type Props = {
    chainNet: API.Chain
    setChainNet: (chain: API.Chain) => void
}
export default ({
    chainNet,
    setChainNet
}: Props) => {

    return <>
        <Col span={24}><Typography.Text strong> <Trans>Select Network</Trans></Typography.Text></Col>
        <Col span={24}>
            <Row gutter={[12, 12]}>
                <Col md={12} xs={24}>
                    <Button onClick={() => {
                        setChainNet('btc')
                    }} style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} block>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <img src={_btc} style={{ height: 40, width: 40 }}></img>
                            <Typography.Text >BTC Network</Typography.Text>
                        </div>
                        <Radio checked={chainNet === 'btc'} />
                    </Button>
                </Col>
                <Col md={12} xs={24}>
                    <Button onClick={() => {
                        setChainNet('mvc')
                    }} style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} block>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <img src={_mvc} style={{ height: 40, width: 40 }}></img>
                            <div style={{ display: "flex", flexDirection: 'column', gap: 4 }}>
                                <Typography.Text >MicrovisonChain</Typography.Text>
                                <Tag style={{
                                    fontSize: 8,
                                    width: 80,
                                    lineHeight: 1.2,
                                    textAlign: 'center'
                                }} color='orange' bordered={false}><Trans>Bitcoin Sidechain</Trans></Tag>
                            </div>

                        </div>
                        <Radio checked={chainNet === 'mvc'} />
                    </Button>
                </Col>
            </Row>
        </Col>
    </>
}