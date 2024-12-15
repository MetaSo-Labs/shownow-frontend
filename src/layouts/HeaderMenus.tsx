import { MenuOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu, Space } from "antd";
import type { MenuProps } from 'antd';
import { useState } from "react";
import { menus } from "./Menus";
import { history, Link } from 'umi';

export default () => {
    const items: MenuProps['items'] = menus.map(item => ({
        key: item.key,
        label: item.label,
    }))

    return <Dropdown menu={{
        items, onClick: (item) => {
            history.push(`/${item.key}`)
        }
    }}>
        <a onClick={(e) => e.preventDefault()}>
            <Button>
                <MenuOutlined />
            </Button>


        </a>
    </Dropdown>;
}