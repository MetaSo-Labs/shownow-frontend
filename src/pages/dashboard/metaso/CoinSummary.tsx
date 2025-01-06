import NumberFormat from "@/Components/NumberFormat"
import { fetchCoinSummary } from "@/request/metaso"
import { useQuery } from "@tanstack/react-query"
import { Card, Col, Row, Typography } from "antd"
import { useMemo } from "react"
import _coin from '@/assets/dashboard/usd-coin.svg'
import _chart from '@/assets/dashboard/chart-2.svg'
import _global from '@/assets/dashboard/global.svg'
import { ArrowUp } from "lucide-react"
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons"


export default () => {

    const { data, isFetching } = useQuery({
        queryKey: ['coinSummary'],
        queryFn: () => {
            return fetchCoinSummary()
        },
    })
    const coinSummary = useMemo(() => {
        return data?.data
    }, [data])
    return <div>

        <Row gutter={[24, 24]}>
            <Col {...{ xs: 24, sm: 24, md: 8, lg: 8, xl: 8 }}>
                <Card
                    loading={isFetching}
                    bordered={false}
                    style={{
                        backgroundImage: 'linear-gradient(141deg, #3B82F6 -5%, #9333EA 105%)'
                    }}>
                    <img src={_coin} alt="" style={{ width: 140, position: 'absolute', bottom: 0, right: 24 }} />
                    <Typography.Text style={{
                        color: '#fff',
                        opacity: 0.8
                    }}>$METASO Price</Typography.Text>
                    <Typography.Title level={4} style={{ color: "#fff", marginTop: 10 }}><NumberFormat prefix='$ ' value={coinSummary?.priceUsd} /></Typography.Title>
                    <Typography.Text style={{
                        color: '#fff',

                    }}><NumberFormat prefix={
                        <>{
                            Number(coinSummary?.priceChange24h) >= 0 ? <ArrowUpOutlined size={16} style={{ color: '#86EFAC' }}></ArrowUpOutlined> : <ArrowDownOutlined size={16} style={{ color: '#DF7348' }}></ArrowDownOutlined>
                        }

                        </>
                    } suffix='%' value={coinSummary?.priceChange24h} precision={2}></NumberFormat></Typography.Text>
                </Card>
            </Col>
            <Col {...{ xs: 24, sm: 24, md: 8, lg: 8, xl: 8 }}>
                <Card
                    loading={isFetching}
                    bordered={false}
                    style={{
                        backgroundImage: 'linear-gradient(141deg, #31EACB -4%, #2763DB 105%)'
                    }}>
                    <img src={_chart} alt="" style={{ width: 140, position: 'absolute', bottom: 0, right: 24 }} />
                    <Typography.Text style={{
                        color: '#fff',
                        opacity: 0.8
                    }}>Market Cap</Typography.Text>
                    <Typography.Title level={4} style={{ color: "#fff", marginTop: 10 }}><NumberFormat prefix='$ ' value={coinSummary?.marketCapUsd} /></Typography.Title>
                    <Typography.Text style={{
                        color: '#fff',

                    }}><NumberFormat prefix={
                        <>
                            {
                                Number(coinSummary?.marketCapChange24h) >= 0 ? <ArrowUpOutlined size={16} style={{ color: '#86EFAC' }}></ArrowUpOutlined> : <ArrowDownOutlined size={16} style={{ color: '#DF7348' }}></ArrowDownOutlined>
                            }

                        </>
                    } suffix='%' value={coinSummary?.marketCapChange24h}></NumberFormat></Typography.Text>
                </Card>
            </Col>

            <Col {...{ xs: 24, sm: 24, md: 8, lg: 8, xl: 8 }}>
                <Card
                    loading={isFetching}
                    bordered={false}
                    style={{
                        backgroundImage: 'linear-gradient(141deg, #EC4899 -5%, #DC2626 105%)'
                    }}>
                    <img src={_global} alt="" style={{ width: 140, position: 'absolute', bottom: 0, right: 24 }} />
                    <Typography.Text style={{
                        color: '#fff',
                        opacity: 0.8
                    }}>Circulating Supply</Typography.Text>
                    <Typography.Title level={4} style={{ color: "#fff", marginTop: 10 }}><NumberFormat value={coinSummary?.circulatingSupply} /></Typography.Title>
                    <Typography.Text style={{
                        color: '#fff',

                    }}><NumberFormat value={coinSummary?.circulatingSupply / coinSummary?.totalSupply * 100} precision={2} suffix='%' /> Percent of the Total Supply</Typography.Text>
                </Card>
            </Col>
        </Row>
    </div>
}