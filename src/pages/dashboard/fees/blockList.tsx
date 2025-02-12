import { ProCard, ProCardTabsProps } from "@ant-design/pro-components";
import { Space, Typography } from "antd";
import { useState } from "react";
import BlockTable from "./blockTable";

export default () => {
    const [tab, setTab] = useState('host');

    return < div >
        <Space style={{ marginBlockEnd: 16 }}>
            <Typography.Title level={4}>Block List Management Center</Typography.Title>
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
                        children: <BlockTable type="pin" />,
                    },
                ],
                onChange: (key) => {
                    setTab(key);
                },
            }}
        />
    </div >
}