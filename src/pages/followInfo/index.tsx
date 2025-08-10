import { Tabs } from "antd";
import { TabsProps } from "antd/lib";
import { useLocation, useMatch, useModel, useSearchParams } from "umi";
import FollowPanel from "./followPanel";
import { useEffect, useMemo, useState } from "react";

export default () => {
    const match = useMatch('/follow/:metaid')
    const { search } = useLocation();
    const [type, setType] = useState<string>();
    const { user } = useModel('user');
    const metaid = useMemo(() => {
        if (!match || !match.params.metaid) {
            return user?.metaid || '';
        } else {
            return match.params.metaid;
        }
    }, [match, user])

    useEffect(() => {
        const params = new URLSearchParams(search);
        const type = params.get('type') || 'following';
        setType(type);
    }, [search])
    const onChange = (key: string) => {
       
        setType(key);

    };
    const items: TabsProps['items'] = [
        {
            key: 'following',
            label: 'Following',
            children: <FollowPanel metaid={metaid} type="following" />,
        },
        {
            key: 'followers',
            label: 'Followers',
            children: <FollowPanel metaid={metaid} type="follower" />,
        },
    ];
    return <Tabs items={items} activeKey={type} onChange={onChange} style={{ marginBottom: 100 }} />;
}