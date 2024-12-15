import { saveConf, saveFees } from "@/request/dashboard";
import { FooterToolbar, ProCard, ProForm, ProFormDigit, ProFormText } from "@ant-design/pro-components"
import { Col, Divider, message, Row, Space } from "antd"
import { useModel  } from "umi";
import '../index.less'
import { useEffect, useState } from "react";

export default () => {
    const { fees, updateFees } = useModel('dashboard')
    const [tab, setTab] = useState('BTC');
    const [form] = ProForm.useForm();
    const onFinish = async (chain: 'BTC' | 'MVC', values: any) => {
        const _fee = fees.find((item: any) => item.chain === chain);
        if (!_fee) return;
        await saveFees(_fee.id, values);
        await updateFees();
        message.success('Save successfully');
    }

    useEffect(()=>{
        updateFees()
    },[updateFees])
    return <ProCard
        split="vertical"
        tabs={{
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


                    </ProForm>,
                },
            ],
            onChange: (key) => {
                setTab(key);
            },
        }}
    >


    </ProCard>
}