import { AVATAR_BASE_URL, BASE_MAN_URL, curNetwork } from "@/config";
import { fetchFollowDetailPin, fetchFollowerList, fetchFollowingList, getUserInfo } from "@/request/api";
import { useQuery } from "@tanstack/react-query";
import { Alert, Avatar, Button, Card, Divider, Space, theme, Typography } from "antd"
import { F, isEmpty } from "ramda";
import { useModel, history } from "umi";
import { FollowButtonComponent } from "../Follow";
import UserAvatar from "../UserAvatar";
import { EditOutlined } from "@ant-design/icons";
import Trans from "../Trans";
import './index.less'
import { openWindowTarget } from "@/utils/utils";
import NumberFormat from "../NumberFormat";

type Props = {
    address: string;
    IDCoin?: API.IdCoin;
}
export default ({ address, IDCoin }: Props) => {
    const { btcConnector, user } = useModel('user');
    const { showConf } = useModel('dashboard')
    const {
        token: { colorPrimary, colorText, colorFillAlter },
    } = theme.useToken()

    const profileUserData = useQuery({
        enabled: Boolean(address),
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
                        <img src={`${AVATAR_BASE_URL}` + profileUserData?.data?.background} alt="example" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                        <p>MetaID: <Typography.Link copyable={{
                            text: profileUserData?.data?.metaid,
                        }}
                            target="_blank"
                            underline
                            href={`${curNetwork === 'mainnet' ? 'https://metaid.io/' : 'https://metaid-testnet.vercel.app/'}metaid-detail/${profileUserData?.data?.metaid}`}
                        >{profileUserData?.data?.metaid.slice(0, 8)}</Typography.Link></p>
                        <p>Address: <Typography.Text copyable={{
                            text: address,
                        }}>{address.slice(0, 8)}</Typography.Text></p>

                    </div>



                    <FollowButtonComponent metaid={profileUserData?.data?.metaid || ''} />
                    {
                        address === user.address && <Button icon={<EditOutlined />} variant='filled' color='default' shape='circle' onClick={() => {
                            history.push('/setting')
                        }
                        } />
                    }


                </div>

                {
                    IDCoin && <Button color="default" variant="solid" shape='round' size='small' style={{
                        marginBottom: 12
                    }}>
                        Handler:@{IDCoin.tick.toUpperCase()}
                    </Button>

                }

                <Typography.Paragraph style={{ fontSize: 13 }}>
                    {profileUserData?.data?.bio || '-'}
                </Typography.Paragraph>

                {
                    IDCoin && <div>
                        <Typography.Text type='secondary' style={{
                            fontSize: 12,
                            display: 'block',
                            marginTop: 18,
                            marginBottom: 9
                        }}><Trans>IDCOIN</Trans></Typography.Text>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 12,
                            background: colorFillAlter,
                            borderRadius: 12,
                            padding: 16,
                            gap: 12,
                            flexWrap: 'wrap',
                        }}>

                            <Space>
                                <UserAvatar src={profileUserData?.data?.avatar} size={40} />
                                <Space direction="vertical" size={0}>
                                    <Typography.Text strong style={{ color: colorText, fontSize: 16 }}>${IDCoin.tick.toUpperCase()}</Typography.Text>
                                    <Typography.Text type='secondary' style={{ fontSize: 12 }}>Supply: {IDCoin.totalSupply}</Typography.Text>
                                    <Typography.Text type='secondary' style={{ fontSize: 12 }}>Limit: {IDCoin.totalMinted}/{IDCoin.mintCount}</Typography.Text>
                                </Space>
                            </Space>
                            <div>
                                <Typography.Text type='secondary' style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                                    <Trans>Floor price</Trans>
                                </Typography.Text>
                                <Typography.Text strong>
                                    <NumberFormat value={IDCoin.floorPrice} isBig decimal={8} tiny suffix="BTC" />
                                </Typography.Text>

                            </div>
                            <Button
                                shape="round"
                                type="primary"
                                size="small"
                                onClick={() => {
                                    IDCoin.totalMinted === IDCoin.mintCount ? window.open(`https://www.metaid.market/idCoin/${IDCoin.tick}`, openWindowTarget()) : window.open(`https://www.metaid.market/inscribe/MRC-20/${IDCoin.tick}`, openWindowTarget())
                                }}

                            >
                                <Trans wrapper>{IDCoin.totalMinted === IDCoin.mintCount ? 'Trade' : 'Mint'}</Trans>
                            </Button>
                        </div>
                    </div>

                }
                <div>
                    <Space >
                        <Space style={{ cursor: 'pointer' }} onClick={() => {
                            history.push(`/follow/${profileUserData?.data?.metaid}?type=followers`)
                        }}>
                            <span style={{ color: colorPrimary }}>{followerListData?.total || 0}</span>
                            <span><Trans>Followers</Trans> </span>
                        </Space>
                        <Divider type='vertical' />
                        <Space style={{ cursor: 'pointer' }} onClick={() => {
                            history.push(`/follow/${profileUserData?.data?.metaid}?type=following`)
                        }}>
                            <span style={{ color: colorPrimary }}>{followingListData?.total || 0}</span>
                            <span><Trans>Following</Trans></span>
                        </Space>
                    </Space>
                </div>



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