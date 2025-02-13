import { ProCard, ProCardTabsProps } from "@ant-design/pro-components";
import { Space, Tooltip, Typography } from "antd";
import { useState } from "react";
import BlockTable from "./blockTable";
import { QuestionCircleOutlined } from "@ant-design/icons";

export default () => {
    const [tab, setTab] = useState('host');

    return < div >
        
        <Space style={{ marginBlockEnd: 16 }}>
            <Typography.Title style={{margin:0}} level={4}>Block List Management Center</Typography.Title>
            <Tooltip title="Changes will take effect in 2 minutes.">
                <QuestionCircleOutlined size={30} />
            </Tooltip>
        </Space>
        <ProCard
            bodyStyle={{ padding: 0 }}
            tabs={{
                activeKey: tab,
                items: [
                    {
                        label: `Host`,
                        key: 'host',
                        children: <BlockTable type="host" />,
                    },
                    {
                        label: `MetaID`,
                        key: 'metaid',
                        children:<BlockTable type="metaid" />,
                    },
                    {
                        label: `Pin`,
                        key: 'pin',
                        children: <BlockTable type="pinid" />,
                    },
                ],
                onChange: (key) => {
                    setTab(key);
                },
            }}
        />
    </div >
}