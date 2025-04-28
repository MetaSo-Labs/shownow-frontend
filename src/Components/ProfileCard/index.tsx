import { BASE_MAN_URL, curNetwork } from "@/config";
import { fetchFollowDetailPin, fetchFollowerList, fetchFollowingList, getUserInfo } from "@/request/api";
import { useQuery } from "@tanstack/react-query";
import { Alert, Avatar, Button, Card, Divider, Space, Typography } from "antd"
import { F, isEmpty } from "ramda";
import { useModel, history } from "umi";
import { FollowButtonComponent } from "../Follow";
import UserAvatar from "../UserAvatar";
import { EditOutlined } from "@ant-design/icons";
import Trans from "../Trans";
import './index.less'

type Props = {
    address: string
}
export default ({ address }: Props) => {
    const { btcConnector, user } = useModel('user');
    const { showConf } = useModel('dashboard')

    const profileUserData = useQuery({
        queryKey: ['userInfo', address],
        queryFn: () => getUserInfo({ address }),
    });


    const { data: followingListData } = useQuery({
        queryKey: ['following', profileUserData?.data?.metaid],
        enabled: !isEmpty(profileUserData?.data?.metaid ?? ''),
        queryFn: () =>
            fetchFollowingList({
                metaid: profileUserData?.data?.metaid ?? '',
                params: { cursor: '0', size: '100', followDetail: false },
            }),
    });

    const { data: followerListData } = useQuery({
        queryKey: ['follower', profileUserData?.data?.metaid],
        enabled: !isEmpty(profileUserData?.data?.metaid ?? ''),
        queryFn: () =>
            fetchFollowerList({
                metaid: profileUserData?.data?.metaid ?? '',
                params: { cursor: '0', size: '100', followDetail: false },
            }),
    });
    return (
        <Card style={{ padding: 0 }} styles={{ body: { padding: 0 } }} bordered={false} cover={
            <div
                style={{ height: 0, position: 'relative', width: '100%', background: showConf?.gradientColor, borderRadius: 10, paddingBottom: '33.333%' }}

            >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '10px 10px 0 0', overflow: 'hidden', width: '100%', height: '100%' }}>
                    {
                        profileUserData?.data?.background &&
                        <img src={`${BASE_MAN_URL}` + profileUserData?.data?.background} alt="example" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    }
                </div>


            </div>
        }>
            <div style={{ padding: 20 }}>

                <div className="avatar" style={{ marginTop: -60 }}>
                    <UserAvatar src={profileUserData?.data?.avatar} size={80} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>


                    <div style={{ marginTop: 10 }}>
                        <h3>{profileUserData?.data?.name}</h3>
                        <p>MetaID: <Typography.Text copyable={{
                            text: profileUserData?.data?.metaid,
                        }}>{profileUserData?.data?.metaid.slice(0, 8)}</Typography.Text></p>
                    </div>


                    <FollowButtonComponent metaid={profileUserData?.data?.metaid || ''} />
                    {
                        address === user.address && <Button icon={<EditOutlined />} variant='filled' color='default' shape='circle' onClick={() => {
                            history.push('/setting')
                        }
                        } />
                    }


                </div>

                <Space >
                    <Space>
                        <span>{followerListData?.total || 0}</span>
                        <span><Trans>Followers</Trans> </span>
                    </Space>
                    <Divider type='vertical' />
                    <Space>
                        <span>{followingListData?.total || 0}</span>
                        <span><Trans>Following</Trans></span>
                    </Space>
                </Space>

            </div>
            {
                profileUserData?.data?.blocked && <Alert message={
                    <Trans>
                        This user has been blocked by the administrator.
                    </Trans>
                } type="warning" banner />
            }


        </Card>
    )
}