import { saveConf, saveDomain, saveFees } from "@/request/dashboard";
import { FooterToolbar, ProCard, ProForm, ProFormDigit, ProFormText } from "@ant-design/pro-components"
import { Col, Divider, message, Row, Space } from "antd"
import { useModel, history } from "umi";
import '../index.less'
import { useEffect, useState } from "react";
import Rpc from "../rpc";
import BlockList from "./blockList";
import Introduction from "./introduction";
import Airdrop from "./airdrop";
import Assist from "./assist";

export default () => {
    const [activeKey, setActiveKey] = useState('1');
    const { fees, updateFees, admin, setLogined } = useModel('dashboard')
    const [tab, setTab] = useState('BTC');
    const [form] = ProForm.useForm();
    const onFinish = async (chain: 'BTC' | 'MVC', values: any) => {
        const _fee = fees.find((item: any) => item.chain === chain);
        if (!_fee) return;
        await saveFees(_fee.id, values);
        await updateFees();
        message.success('Save successfully');
    }

    useEffect(() => {
        updateFees()
    }, [updateFees])
    return <ProCard
        split="vertical"
        style={{
            // background: 'rgba(255,255,255,0)',
        }}
        bodyStyle={{
            background: 'rgba(255,255,255,0)',
        }}
        tabs={{

            activeKey,
            items: [
                {
                    key: '1',
                    label: 'Fee',
                    children: <ProCard
                        split="vertical"
                        style={{
                            background: 'rgba(255,255,255,0)',
                        }}
                        tabs={{
                            type: 'card',
                            activeKey: tab,
                            items: [
                                {
                                    label: `BTC`,
                                    key: 'BTC',
                                    children: <ProForm style={{ padding: 24 }}
                                        layout="horizontal"
                                        labelCol={{ span: 6 }}
                                        wrapperCol={{ span: 18 }}
                                        submitter={{
                                            searchConfig: {
                                                submitText: 'Save',
                                                resetText: 'Reset'
                                            },
                                            render: (props, doms) => {
                                                return <Row>
                                                    <Col span={14} offset={4}>
                                                        <Space>{doms}</Space>
                                                    </Col>
                                                </Row>
                                            },
                                        }}
                                        onFinish={(values: any) => {
                                            return onFinish('BTC', values)
                                        }}
                                        initialValues={fees.find((item: any) => item.chain === 'BTC')}

                                    >
                                        <ProFormText
                                            width="md"
                                            name="service_fee_address"
                                            label="Service Fee Address"
                                            placeholder="Enter the address to receive service fees"
                                        />
                                        <ProFormDigit
                                            width="md"
                                            name="follow_service_fee_amount"
                                            label="Follow Service Fee Amount"
                                            placeholder="Enter the fee amount for follow actions"
                                            fieldProps={{ precision: 0, suffix: 'SAT' }}

                                        />
                                        <ProFormDigit
                                            width="md"
                                            name="post_service_fee_amount"
                                            label="Post Service Fee Amount"
                                            placeholder="Enter the fee amount for post actions"
                                            fieldProps={{ precision: 0, suffix: 'SAT' }}
                                        />
                                        <ProFormDigit
                                            width="md"
                                            name="comment_service_fee_amount"
                                            label="Comment Service Fee Amount"
                                            placeholder="Enter the fee amount for comment actions"
                                            fieldProps={{ precision: 0, suffix: 'SAT' }}
                                        />

                                        <ProFormDigit
                                            width="md"
                                            name="like_service_fee_amount"
                                            label="Like Service Fee Amount"
                                            placeholder="Enter the fee amount for like actions"
                                            fieldProps={{ precision: 0, suffix: 'SAT' }}
                                        />
                                        <ProFormDigit
                                            width="md"
                                            name="donate_service_fee_amount"
                                            label="Donate Service Fee Amount"
                                            placeholder="Enter the fee amount for Donate actions"
                                            fieldProps={{ precision: 0, suffix: 'SAT' }}
                                        />


                                    </ProForm>,
                                },
                                {
                                    label: `MVC`,
                                    key: 'MVC',
                                    children: <ProForm style={{ padding: 24 }}
                                        layout="horizontal"
                                        labelCol={{ span: 6 }}
                                        wrapperCol={{ span: 18 }}
                                        submitter={{
                                            searchConfig: {
                                                submitText: 'Save',
                                                resetText: 'Reset'
                                            },
                                            render: (props, doms) => {
                                                return <Row>
                                                    <Col span={14} offset={4}>
                                                        <Space>{doms}</Space>
                                                    </Col>
                                                </Row>
                                            },
                                        }}
                                        onFinish={(values: any) => {
                                            return onFinish('MVC', values)
                                        }}
                                        initialValues={fees.find((item: any) => item.chain === 'MVC')}

                                    >
                                        <ProFormText
                                            width="md"
                                            name="service_fee_address"
                                            label="Service Fee Address"
                                            placeholder="Enter the address to receive service fees"

                                        />
                                        <ProFormDigit
                                            width="md"
                                            name="follow_service_fee_amount"
                                            label="Follow Service Fee Amount"
                                            placeholder="Enter the fee amount for follow actions"
                                            fieldProps={{ precision: 0, suffix: 'SAT' }}
                                        />
                                        <ProFormDigit
                                            width="md"
                                            name="post_service_fee_amount"
                                            label="Post Service Fee Amount"
                                            placeholder="Enter the fee amount for post actions"
                                            fieldProps={{ precision: 0, suffix: 'SAT' }}
                                        />
                                        <ProFormDigit
                                            width="md"
                                            name="comment_service_fee_amount"
                                            label="Comment Service Fee Amount"
                                            placeholder="Enter the fee amount for comment actions"
                                            fieldProps={{ precision: 0, suffix: 'SAT' }}
                                        />

                                        <ProFormDigit
                                            width="md"
                                            name="like_service_fee_amount"
                                            label="Like Service Fee Amount"
                                            placeholder="Enter the fee amount for like actions"
                                            fieldProps={{ precision: 0, suffix: 'SAT' }}
                                        />
                                        <ProFormDigit
                                            width="md"
                                            name="donate_service_fee_amount"
                                            label="Donate Service Fee Amount"
                                            placeholder="Enter the fee amount for Donate actions"
                                            fieldProps={{ precision: 0, suffix: 'SAT' }}
                                        />


                                    </ProForm>,
                                },
                            ],
                            onChange: (key) => {
                                setTab(key);
                            },
                        }}

                    ></ProCard>
                },
                {
                    key: '2',
                    label: 'RPC',
                    children: <Rpc />
                },
                {
                    key: '3',
                    label: 'Domain Name & Host',
                    children: <ProCard ghost gutter={8} >
                        <ProForm<{
                            domainName: string;
                        }>
                            onFinish={async (values) => {
                                try {
                                    await saveDomain(values);
                                    await updateFees();
                                    message.success('Save successfully');
                                } catch (e: any) {
                                    if (e.response && e.response.status === 401) {
                                        message.error('Unauthorized')
                                        setLogined(false)
                                        return;
                                    }
                                    console.log(e)
                                    message.error(e.message)
                                }

                            }}
                            submitter={{
                                searchConfig: {
                                    submitText: 'Save',
                                    resetText: 'Reset'
                                },
                            }}
                            initialValues={admin}
                            autoFocusFirstInput
                        >
                            <ProFormText
                                width='lg'
                                name="domainName"
                                label="Domain Name"
                                placeholder="Please enter the domain name of the MetaAccess "
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter the domain name of the MetaAccess',
                                    },
                                    {
                                        pattern: /^(?!\-)(?:[A-Za-z0-9-]{1,63}\.?)+(?<=\.[A-Za-z]{2,})$/,
                                        message: 'Please enter a valid domain name'
                                    }
                                ]}
                                fieldProps={{
                                    addonBefore: 'https://'
                                }}


                            />
                            <ProFormText
                                width='lg'
                                name="host"
                                label="Host"
                                placeholder=""

                            />
                        </ProForm>
                    </ProCard>
                },
                {
                    key: '4',
                    label: 'Screen',
                    children: <BlockList />
                },
                {
                    key: '5',
                    label: 'About',
                    children: <Introduction />
                },
                {
                    key: '6',
                    label: 'Token Airdrop',
                    children: <Airdrop />
                },
                {
                    key: '7',
                    label: 'Assist',
                    children: <Assist />
                },
            ],
            onChange: (key) => {
                setActiveKey(key)
            }
        }}
    >




    </ProCard>
}