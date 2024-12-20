import UploadAvatar from "@/Components/ProfileCard/UploadAvatar";
import UploadBackground from "@/Components/ProfileCard/UploadBackground";
import Trans from "@/Components/Trans";
import { BASE_MAN_URL, curNetwork } from "@/config";
import { getUserInfo } from "@/request/api";
import { image2Attach } from "@/utils/file";
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
    const { user, btcConnector, mvcConnector, chain, feeRate, fetchUserInfo } = useModel('user');
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const connector = chain === 'btc' ? btcConnector : mvcConnector;
    const profileUserData = useQuery({
        queryKey: ['userInfo', user.address],
        enabled: Boolean(user.address && connector),
        queryFn: () => getUserInfo({ address: user.address }),
    });

    useEffect(() => {
        form.setFieldsValue({
            name: profileUserData.data?.name,
            avatar: profileUserData.data?.avatar ? `${BASE_MAN_URL}${profileUserData.data?.avatar}` : '',
            background: profileUserData.data?.background ? `${BASE_MAN_URL}${profileUserData.data?.background}` : '',
        })
    }, [profileUserData.data])

    const updateUser = async () => {
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
                            message.success('Create Successfully')
                        } else {
                            message.error('User Canceled')
                        }

                    }

                }
            }
            fetchUserInfo()
        } catch (e) {
            console.log(e, 'error');
            message.error(e.message)
        }
        setSubmitting(false);
    }
    return <div>
        <Button shape='round' style={{ color: showConf?.colorButton, background: showConf?.gradientColor }}>
            <Trans>Account</Trans>
        </Button>
        <Card title={<Trans>Personal data</Trans>} style={{ marginTop: 12 }} bordered={false} extra={
            <Button shape='round' type="primary" style={{ color: showConf?.colorButton, background: showConf?.gradientColor }} loading={submitting} onClick={updateUser}>
                <Trans>Save</Trans>
            </Button>
        }>
            <Form
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 14 }}
                layout="horizontal"
              
                form={form}
            >
                <Card style={{ padding: 0 }} styles={{ body: { padding: 0 } }} bordered={false} cover={
                    <div
                        style={{ height: 240, objectFit: 'cover', borderRadius: 10 }}
                    >
                        <Form.Item name='background' wrapperCol={{ span: 24 }} style={{ width: '100%' }}>
                            <UploadBackground />
                        </Form.Item>

                    </div>
                }>
                    <div style={{ padding: 20 }}>

                        <div className="avatar" style={{ marginTop: -60 }}>
                            <Form.Item name='avatar'>
                                <UploadAvatar />
                            </Form.Item>
                        </div>
                    </div>

                </Card>



                <Form.Item style={{marginTop:20}} label={<Trans>Name</Trans>} name='name'>
                    <Input />
                </Form.Item>




            </Form>






        </Card>

    </div>
}