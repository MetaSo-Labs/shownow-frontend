import { setDistributionEnable } from "@/request/dashboard"
import { getDistribution, setDistribution } from "@/request/metaso"
import { QuestionCircleOutlined } from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query"
import { Button, Card, message, Popover, Slider, Switch, theme, Tooltip, Typography } from "antd"
import { SliderSingleProps } from "antd/lib"
import { useEffect, useState } from "react"
import { useModel } from "umi"
const formatter: NonNullable<SliderSingleProps['tooltip']>['formatter'] = (value) => `${value}%`;

export default () => {
    const { admin, fetchConfig } = useModel('dashboard')
    const [distributionRate, setDistributionRate] = useState(0)
    const {
        token: {
            colorBgLayout,
            borderRadius
        }
    } = theme.useToken()
    const onChange = async (checked: boolean) => {
        await setDistributionEnable({
            distribution: checked,
        }
        )
        await fetchConfig()

    }

    const { data, isFetching, refetch } = useQuery({
        queryKey: ['getDistribution', admin?.host],
        enabled: Boolean(admin?.host),
        queryFn: () => {
            return getDistribution({
                host: admin!.host
            })
        },
    })

    useEffect(() => {
        if (data?.data) {
            setDistributionRate(Number(data?.data.distributionRate / 100))
        }

    }, [data])
    const saveDistribution = async () => {
        try {


            const res = await setDistribution({
                host: admin!.host,
                distributionRate: distributionRate * 100
            })
            await refetch()
            message.success('Save success')
        } catch (e) {
            message.error('Save failed')
        }
    }
    return <div>
        <Popover placement='topLeft' content={<div style={{
            maxWidth: 300
        }} >
            Upon activation and allocation ratio configuration, the Metaso secondary distribution mechanism automatically triggers predefined incentive pool allocations based on real-time updated user contribution rankings, achieving intelligent mapping between contribution metrics and incentive values
        </div>} title="Metaso secondary distribution">
            <Typography.Title level={4}>Secondary Distribution <QuestionCircleOutlined /></Typography.Title>
        </Popover>
        <Card>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 20,
                background: colorBgLayout,
                borderRadius: borderRadius
            }}>
                <Typography.Text>Enable Secondary Distribution</Typography.Text>
                <Switch value={
                    admin?.distribution
                } onChange={onChange} />
            </div>

            {
                admin?.distribution && <div style={{
                    marginTop: 20
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                        <Slider style={{ flexGrow: 1 }} value={distributionRate} disabled={isFetching} max={100} tooltip={{ formatter }} onChange={
                            (value) => {
                                setDistributionRate(value)
                            }
                        } />
                        <Typography.Text style={{ display: 'block' }} type='secondary'> {distributionRate}%</Typography.Text>
                    </div>
                    <Typography.Text style={{ display: 'block' }} type='danger'>The $METASO earned in this node will be automatically redistributed to users at a {distributionRate}% ratio based on their contribution value. </Typography.Text>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        padding: 20
                    }}>
                        <Button type='primary' onClick={saveDistribution}>
                            Save
                        </Button>
                    </div>


                </div>
            }

        </Card>
    </div>
}