import { setAssistEnable, setDistributionEnable } from "@/request/dashboard"
import { getDistribution, setDistribution } from "@/request/metaso"
import { QuestionCircleOutlined } from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query"
import { Button, Card, message, Popover, Slider, Switch, theme, Tooltip, Typography } from "antd"
import { useEffect, useState } from "react"
import { useModel } from "umi"

export default () => {
    const { admin, fetchConfig } = useModel('dashboard')
    const {
        token: {
            colorBgLayout,
            borderRadius
        }
    } = theme.useToken()
    const onChange = async (checked: boolean) => {
        await setAssistEnable({
            assist: checked,
        }
        )
        await fetchConfig()

    }



    return <div>

       

        <Card>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 20,
                background: colorBgLayout,
                borderRadius: borderRadius
            }}>
                <Typography.Text>Assist</Typography.Text>
                <Switch value={
                    admin?.assist
                } onChange={onChange} />
            </div>



        </Card>
    </div>
}