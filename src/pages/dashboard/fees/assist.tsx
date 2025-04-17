import { setAssistEnable, setDistributionEnable } from "@/request/dashboard"
import { getDistribution, setDistribution } from "@/request/metaso"
import { QuestionCircleOutlined } from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query"
import { Alert, Button, Card, message, Popover, Slider, Switch, theme, Tooltip, Typography } from "antd"
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

       
<Alert type="info" message='The gas payment function for on-chain transactions. When enabled, this feature will provide each user with a certain amount of free gas on MVC for uploading buzz content to the blockchain.'></Alert>
        <Card style={{
            marginTop: 20,
           
        }}>
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