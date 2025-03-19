import { Affix, Tabs, TabsProps } from "antd";
import { useEffect, useState } from "react";
import { history, useLocation } from "umi";
import Trans from "../Trans";

export default () => {
    const location = useLocation();
    const [curMenu, setCurMenu] = useState<string>('home');
    const path = location.pathname;
    useEffect(() => {
        if (path === '/' || path === '/home') {
            setCurMenu('new')
        } else {
            setCurMenu(path.split('/home/')[1])
        }

    }, [path])
    const items: TabsProps['items'] = [
        {
            key: 'new',
            label: <Trans>New</Trans>,
            children: null,
        },
        {
            key: 'hot',
            label: <Trans>Hot</Trans>,
            children: null,
        },
        {
            key: 'following',
            label: <Trans>Following</Trans>,
            children: null,
        },
        {
            key: 'recommend',
            label: <Trans>For You</Trans>,
            children: null,
            disabled: true
        },
    ];
    const onChange = (key: string) => {
        console.log(key);
    }
    return <Tabs activeKey={curMenu} items={items} onChange={onChange} onTabClick={
        (key) => {
            history.push(`/home/${key}`)
            setCurMenu(key)
        }
    } />

}