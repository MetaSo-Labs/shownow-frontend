import { setDistributionEnable } from "@/request/dashboard"
import { getDistribution, setDistribution } from "@/request/metaso"
import { QuestionCircleOutlined } from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query"
import { Button, Card, message, Popover, Slider, Switch, theme, Tooltip, Typography } from "antd"
import { useEffect, useState } from "react"
import { useModel } from "umi"

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
            <Typography.Title level={4}>My Allocation <QuestionCircleOutlined /></Typography.Title>
        </Popover>
        <Card>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 20,
                background: colorBgLayout,
                borderRadius: borderRadius
            }}>
                <Typography.Text>Primary issuance</Typography.Text>
                <Switch value={
                    admin?.distribution
                } onChange={onChange} />
            </div>

            {
                admin?.distribution && <div>
                    <Slider value={distributionRate} disabled={isFetching} max={100} onChange={
                        (value) => {
                            setDistributionRate(value)
                        }
                    } />
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