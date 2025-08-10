import UploadAvatar from "@/Components/ProfileCard/UploadAvatar";
import UploadBackground from "@/Components/ProfileCard/UploadBackground";
import Trans from "@/Components/Trans";
import { AVATAR_BASE_URL, BASE_MAN_URL, curNetwork } from "@/config";
import { getUserInfo } from "@/request/api";
import { image2Attach } from "@/utils/file";
import { formatMessage, sleep } from "@/utils/utils";
import { PlusOutlined } from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query";
import { Avatar, Button, Card, Form, Input, message, Upload } from "antd"
import { useEffect, useState } from "react";
import { useModel } from "umi"
const normFile = (e: any) => {
    if (Array.isArray(e)) {
        return e;
    }
    return e?.fileList;
};

export default () => {
    const { showConf } = useModel('dashboard');
    const { user, btcConnector, mvcConnector, chain, feeRate, fetchUserInfo, isLogin } = useModel('user');
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const connector = chain === 'btc' ? btcConnector : mvcConnector;


    useEffect(() => {
        form.setFieldsValue({
            name: user?.name,
            avatar: user?.avatar || '',
            background: user?.background || '',
            bio: user?.bio,
        })
    }, [user])

    const updateUser = async () => {
        if (!isLogin) {
            message.error(formatMessage('Please connect your wallet first'))
            return
        }
        const values = form.getFieldsValue();
        setSubmitting(true);
        if (typeof values.avatar !== 'string') {
            const [image] = await image2Attach([values.avatar] as FileList);
            values.avatar = Buffer.from(image.data, "hex").toString("base64")
        } else {
            delete values.avatar
        }
        if (typeof values.background !== 'string') {
            const [image] = await image2Attach([values.background] as FileList);
            values.background = Buffer.from(image.data, "hex").toString("base64")
        } else {
            delete values.background
        }
        const connector = chain === 'btc' ? btcConnector : mvcConnector;
        try {
            if (user.name) {
                const res = await connector!.updateUserInfo({
                    userData: {
                        ...values
                    },
                    options: {
                        feeRate: Number(feeRate),
                        network: curNetwork,
                    },
                }).catch(e => {
                    throw new Error(e)
                });
                if (!res) {
                    message.error('Update Failed')
                } else {
                    const { avatarRes, backgroundRes, nameRes, bioRes } = res;
                    if (avatarRes || backgroundRes || nameRes || bioRes) {
                        const nameStatus = nameRes?.status ?? '';
                        const avatarStatus = avatarRes?.status ?? '';
                        const backgroundStatus = backgroundRes?.status ?? '';
                        const bioStatus = bioRes?.status ?? '';
                        if (!nameStatus && !avatarStatus && !backgroundStatus && !bioStatus) {
                            await sleep(2000)
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
                        feeRate: Number(feeRate),
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
                            await sleep(2000)
                            message.success('Create Successfully')
                        } else {
                            message.error('User Canceled')
                        }

                    }

                }
            }
            sessionStorage.setItem(`${user.address}_profile`, JSON.stringify({
                ...user,
                ...values,
            }))
            
            fetchUserInfo()
        } catch (e) {
            console.log(e, 'error');
            message.error(e.message)
        }
        setSubmitting(false);
    }
    return <div style={{marginBottom:100}}>
        <Button shape='round' style={{ color: showConf?.colorButton, background: showConf?.gradientColor }}>
            <Trans>Account</Trans>
        </Button>
        <Card title={<Trans>Personal data</Trans>} style={{ marginTop: 12 }} bordered={false} extra={
            <Button shape='round' type="primary" style={{ color: showConf?.colorButton, background: showConf?.gradientColor }} loading={submitting} onClick={updateUser}>
                <Trans wrapper>Save</Trans>
            </Button>
        }>
            <Form
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
                layout="horizontal"

                form={form}
            >
                <Card style={{ padding: 0 }} styles={{ body: { padding: 0 } }} bordered={false} cover={
                    <div
                        style={{ width: '100%', height: 0, paddingBottom: '33.333%', borderRadius: 10, position: 'relative' }}
                    >
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '10px 10px 0 0', overflow: 'hidden', width: '100%', height: '100%' }}>
                            <Form.Item name='background' wrapperCol={{ span: 24 }} style={{ width: '100%', height: '100%' }} noStyle>
                                <UploadBackground />
                            </Form.Item>
                        </div>



                    </div>
                }>
                    <div style={{ padding: 20 }}>

                        <div className="avatar" style={{ marginTop: -60 }}>
                            <Form.Item name='avatar' labelCol={{
                                span: 0
                            }}
                                wrapperCol={{
                                    span: 24
                                }}
                                style={{
                                    padding: 0,
                                    width: 100,
                                    background: 'rgba(255,255,255,0)',
                                }}
                            >
                                <UploadAvatar />
                            </Form.Item>
                        </div>
                    </div>

                </Card>



                <Form.Item style={{ marginTop: 20 }} label={<Trans>Name</Trans>} name='name' >
                    <Input size='large' />
                </Form.Item>

                <Form.Item style={{ marginTop: 20 }} label={<Trans>Bio</Trans>} name='bio'>
                    <Input.TextArea maxLength={160} style={{ height: 120, resize: 'none' }} size='large' showCount />
                </Form.Item>




            </Form>






        </Card>

    </div>
}