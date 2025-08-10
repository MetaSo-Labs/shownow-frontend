import { useModel } from "umi"
import Popup from "../ResponPopup"
import Trans from "../Trans"
import { Button, Form, Input, message, Row, Typography } from "antd"
import SelectChain from "../NewPost/SelectChain"
import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getUserInfo } from "@/request/api"
import { ASSIST_ENDPOINT, BASE_MAN_URL, curNetwork } from "@/config"
import { image2Attach } from "@/utils/file"
import UploadAvatar from "../ProfileCard/UploadAvatar"
import { getEffectiveBTCFeerate } from "@/utils/utils"

type Props = {
    show: boolean
    onClose: () => void

}
export default () => {
    const { showProfileEdit, setShowProfileEdit, chain, btcConnector, mvcConnector, feeRate, mvcFeeRate, fetchUserInfo, setShowRecommendFollow, setShowSetting } = useModel('user')
    const { admin } = useModel('dashboard')
    const [chainNet, setChainNet] = useState<API.Chain>(chain);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        setChainNet(chain)
    }, [chain])

    const connector = useMemo(() => {
        return chainNet === 'btc' ? btcConnector : mvcConnector
    }, [chainNet, btcConnector, mvcConnector])

    const profileUserData = useQuery({
        queryKey: ['userInfo', 'edit', connector?.user?.address],
        enabled: Boolean(connector && showProfileEdit && connector!.user.address),
        queryFn: () => getUserInfo({ address: connector!.user.address }),
    });

    useEffect(() => {
        form.setFieldsValue({
            name: profileUserData.data?.name,
            avatar: profileUserData.data?.avatar ? `${BASE_MAN_URL}${profileUserData.data?.avatar}` : '',
        })
    }, [profileUserData.data])

    const updateUser = async () => {
        if (!profileUserData.data) return
        const values = form.getFieldsValue();
        setSubmitting(true);
        if (values.avatar && typeof values.avatar !== 'string') {
            const [image] = await image2Attach([values.avatar] as FileList);
            values.avatar = Buffer.from(image.data, "hex").toString("base64")
        } else {
            delete values.avatar
        }
        if (values.background && typeof values.background !== 'string') {
            const [image] = await image2Attach([values.background] as FileList);
            values.background = Buffer.from(image.data, "hex").toString("base64")
        } else {
            delete values.background
        }
        try {
        if (profileUserData.data.name) {
            const res = await connector!.updateUserInfo({
                userData: {
                    ...values
                },
                options: {
                    feeRate: chainNet === 'btc' ? getEffectiveBTCFeerate(Number(feeRate)) : Number(mvcFeeRate),
                    network: curNetwork,
                },
            }).catch(e => {
                throw new Error(e)
            });
            if (!res) {
                message.error('Update Failed')
            } else {
                const { avatarRes, backgroundRes, nameRes } = res;
                if (avatarRes || backgroundRes || nameRes) {
                    const nameStatus = nameRes?.status ?? '';
                    const avatarStatus = avatarRes?.status ?? '';
                    const backgroundStatus = backgroundRes?.status ?? '';
                    if (!nameStatus && !avatarStatus && !backgroundStatus) {
                        message.success('Update Successfully')
                    } else {
                        message.error('User Canceled')
                    }

                }

            }
        } else {
            const res = await connector!.createUserInfo({
                userData: values,
                options: {
                    feeRate: chainNet === 'btc' ? getEffectiveBTCFeerate(Number(feeRate)) : Number(mvcFeeRate),
                    network: curNetwork,
                    assistDomain: ASSIST_ENDPOINT,
                },
            }).catch(e => {
                throw new Error(e)
            });
            if (!res) {
                message.error('Create Failed')
            } else {
                const { avatarRes, backgroundRes, nameRes, bioRes } = res;
                if (avatarRes || backgroundRes || nameRes || bioRes) {
                    const nameStatus = nameRes?.status ?? '';
                    const avatarStatus = avatarRes?.status ?? '';
                    const backgroundStatus = backgroundRes?.status ?? '';
                    const bioStatus = bioRes?.status ?? '';
                    if (!nameStatus && !avatarStatus && !backgroundStatus && !bioStatus) {
                        message.success('Create Successfully')
                        sessionStorage.setItem(`${connector?.user?.address}_profile`, JSON.stringify({
                            name: values.name,
                            avatar: values.avatar,
                            bio: values.bio,
                        }))
                    } else {
                        message.error('User Canceled')
                    }

                }

            }
        }
        fetchUserInfo();
        setShowSetting(false)
        setShowProfileEdit(false)
        setShowRecommendFollow(true)

        } catch (e: any) {
            console.log(e, 'error');
            message.error(e.message)
        }
        setSubmitting(false);
    }
    if (!connector) return null
    return <Popup onClose={() => {
        setShowProfileEdit(false)
    }} show={showProfileEdit} style={{
        borderRadius: 24,
    }} modalWidth={740} bodyStyle={{
         padding: "10px 36px 24px 36px"
    }} closable title={<Trans>Set Up Your Profile</Trans>}>
        <Typography.Text type='secondary' style={{ textAlign: 'center', display: 'block', marginBottom: 16 }}>
            <Trans>Make your account stand out — add a unique avatar and display name!</Trans>
        </Typography.Text>
        <Row gutter={[12, 12]}>
            <SelectChain chainNet={chainNet} setChainNet={setChainNet} BtcLabel={<Typography.Text type='secondary' style={{ fontSize: 10 }}><Trans>Use Bitcoin, it costs about 2k -100k sats(about $2~200)</Trans></Typography.Text>} MvcLabel={<Typography.Text type='secondary' style={{ fontSize: 10 }}><Trans>Use Bitcoin sidechain, it is free (sponsored by Show.Now)</Trans></Typography.Text>} />
        </Row>
        <Form
            layout='vertical'
            form={form}
            style={{
                marginTop: 24
            }}
        >
            <Form.Item name='avatar' label={<Typography.Text type='secondary'><Trans>Basic Info</Trans></Typography.Text>}>
                <UploadAvatar />
            </Form.Item>
            <Form.Item name='name'>
                <Input size='large' placeholder='Name' />
            </Form.Item>
            <Form.Item name='bio'>
                <Input.TextArea size='large' placeholder='Profile  (Optional)' maxLength={160} style={{ height: 120, resize: 'none' }}  showCount />
            </Form.Item>
        </Form>
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
                setShowProfileEdit(false)
            }} block size='large' shape='round' variant='filled' color='primary'>
                <Trans wrapper>Close</Trans>
            </Button>
            <Button onClick={updateUser} block loading={submitting} size='large' type='primary' shape='round'>
                <Trans wrapper>Next</Trans>
            </Button>
        </div>
    </Popup>
}