import { Affix, Tabs, TabsProps } from "antd";
import { useEffect, useMemo, useState } from "react";
import { history, useLocation, useModel } from "umi";
import Trans from "../Trans";
import './index.less'

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

export default () => {
    const { isLogin } = useModel('user')
    const location = useLocation();
    const [curMenu, setCurMenu] = useState<string>('home');
    const path = location.pathname;
    const { showConf } = useModel('dashboard')
    useEffect(() => {
        if (path === '/' || path === '/home') {
            setCurMenu('new')
        } else {
            setCurMenu(path.split('/home/')[1])
        }

    }, [path])


    const items2: TabsProps['items'] = useMemo(() => {
        if (!showConf) return [items[0]];
        return showConf?.tabs.map((item) => {
            const _item = items.find((i) => i.key === item);
            if (item === 'following' && !isLogin) return null
            return _item
        }).filter(Boolean)
    }, [showConf, isLogin])
    const onChange = (key: string) => {
        console.log(key);
    }
    return <Tabs activeKey={curMenu} items={items2} onChange={onChange} className="homeTabs" centered onTabClick={
        (key) => {
            history.push(`/home/${key}`)
            setCurMenu(key)
        }
    } />

}