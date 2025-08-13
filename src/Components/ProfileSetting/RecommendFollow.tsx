import { useModel } from "umi"
import Trans from "../Trans"
import { Button, Col, Row, Spin, Typography } from "antd"
import Popup from "../ResponPopup"
import { isEmpty } from "lodash";
import { fetchFollowerList, fetchFollowingList, getRecommendedFollow } from "@/request/api";
import { useQuery } from "@tanstack/react-query";
import PendingUser from "../UserInfo/PendingUser";
import Follow from "@/pages/follow";
import { FollowButtonComponent } from "../Follow";
const type = 'following';
const page = 1;
const size = 10;
export default () => {
    const { showRecommendFollow, setShowRecommendFollow, setShowFirstPost, chain, btcConnector, mvcConnector, feeRate, mvcFeeRate, user, isLogin } = useModel('user');
    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['getRecommendedFollow'],
        queryFn: () =>
            getRecommendedFollow({ num: 6 }),
    });

    if (!isLogin) return null
    return <Popup onClose={() => {
        setShowRecommendFollow(false)
    }} show={showRecommendFollow} style={{
        borderRadius: 24,
    }} modalWidth={740} bodyStyle={{
        padding: "10px 36px 24px 36px"
    }} title={<Trans>Find Your People</Trans>}>
        <Typography.Text type='secondary' style={{ textAlign: 'center', display: 'block', marginBottom: 16 }}>
            <Trans>Get started by following some awesome Web3 creators we’ve picked for you , they’re active, insightful, and worth the follow.</Trans>
        </Typography.Text>
        <Spin spinning={isLoading} >
            <Row gutter={[16, 16]} >

                {data?.data?.map((item) => {
                    return <Col md={12} xs={24}>
                        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <PendingUser address={item.address} showBio />
                            <FollowButtonComponent metaid={item.metaid} useAssist size='small' />
                        </div>

                    </Col>
                })}
            </Row>
        </Spin>
        <Button style={{ marginTop: 20, width: '100%', marginBottom: 20, textDecoration: 'underline' }} type='link' onClick={() => {
            refetch()
        }}>
            <Trans>recommandMore</Trans>
        </Button>

        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            maxWidth: 400,
            marginLeft: 'auto',
            marginRight: 'auto'
        }}>
            <Button onClick={() => {
                setShowRecommendFollow(false)
            }} block size='large' shape='round' variant='filled' color='primary'>
                <Trans wrapper>Close</Trans>
            </Button>
            <Button onClick={() => {
                setShowRecommendFollow(false);
                setShowFirstPost(true);

            }} block size='large' type='primary' shape='round'>
                <Trans wrapper>Next</Trans>
            </Button>
        </div>
    </Popup>
}