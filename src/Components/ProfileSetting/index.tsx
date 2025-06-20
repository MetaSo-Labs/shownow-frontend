import { useModel } from "umi"
import Popup from "../ResponPopup"
import Trans from "../Trans"
import { Button, Form, Input, message, Row } from "antd"
import SelectChain from "../NewPost/SelectChain"
import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getUserInfo } from "@/request/api"
import { BASE_MAN_URL, curNetwork } from "@/config"
import { image2Attach } from "@/utils/file"
import UploadAvatar from "../ProfileCard/UploadAvatar"
import { getEffectiveBTCFeerate } from "@/utils/utils"

type Props = {
    show: boolean
    onClose: () => void

}
export default () => {
    const { showProfileEdit, setShowProfileEdit, chain, btcConnector, mvcConnector, feeRate, mvcFeeRate, fetchUserInfo } = useModel('user')
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
        enabled: Boolean(connector && showProfileEdit),
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
                    },
                }).catch(e => {
                    throw new Error(e)
                });
                if (!res) {
                    message.error('Create Failed')
                } else {
                    const { avatarRes, backgroundRes, nameRes } = res;
                    if (avatarRes || backgroundRes || nameRes) {
                        const nameStatus = nameRes?.status ?? '';
                        const avatarStatus = avatarRes?.status ?? '';
                        const backgroundStatus = backgroundRes?.status ?? '';
                        if (!nameStatus && !avatarStatus && !backgroundStatus) {
                            message.success('Create Successfully')
                        } else {
                            message.error('User Canceled')
                        }

                    }

                }
            }
            fetchUserInfo()
            setShowProfileEdit(false)
        } catch (e: any) {
            console.log(e, 'error');
            message.error(e.message)
        }
        setSubmitting(false);
    }
    if (!connector) return null
    return <Popup onClose={() => {
        setShowProfileEdit(false)
    }} show={showProfileEdit} modalWidth={480} closable title={<Trans>Profile</Trans>}>
        <Row gutter={[12, 12]}>
            <SelectChain chainNet={chainNet} setChainNet={setChainNet} />
        </Row>
        <Form
            layout='vertical'
            form={form}
        >
            <Form.Item name='avatar' label={<Trans>Avatar</Trans>}>
                <UploadAvatar />
            </Form.Item>
            <Form.Item label={<Trans>Name</Trans>} name='name'>
                <Input size='large' />
            </Form.Item>
        </Form>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12
        }}>
            <Button onClick={() => {
                setShowProfileEdit(false)
            }} block size='large' shape='round' variant='filled' color='primary'>
                <Trans wrapper>Cancel</Trans>
            </Button>
            <Button onClick={updateUser} block loading={submitting} size='large' type='primary' shape='round'>
                <Trans wrapper>Save</Trans>
            </Button>
        </div>
    </Popup>
}