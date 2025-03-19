import { Tabs } from "antd";
import { TabsProps } from "antd/lib";
import { useMatch, useModel } from "umi";
import FollowPanel from "./followPanel";
import { useMemo } from "react";

export default () => {
    const match = useMatch('/follow/:metaid');
    const { btcConnector, user } = useModel('user');
    const metaid = useMemo(() => {
        if (!match || !match.params.metaid) {
            return user?.metaid || '';
        } else {
            return match.params.metaid;
        }
    }, [match, user])
    const onChange = (key: string) => {
        console.log(key);
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
    return <Tabs defaultActiveKey="following" items={items} onChange={onChange} />;
}