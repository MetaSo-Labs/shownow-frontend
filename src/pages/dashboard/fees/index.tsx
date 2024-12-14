import { saveConf } from "@/request/dashboard";
import { FooterToolbar, ProCard, ProForm, ProFormDigit, ProFormText } from "@ant-design/pro-components"
import { Col, Divider, message, Row, Space } from "antd"
import { useModel } from "umi";
import '../index.less'

export default () => {
    const { showConf, loading, fetchConfig } = useModel('dashboard')
    const [form] = ProForm.useForm();
    const onFinish = async (values: any) => {
        console.log(values);
        await saveConf({ ...showConf, ...values, alias: 'default' });
        await fetchConfig();
        message.success('Save successfully');
    }
    return <ProCard split="vertical"  >
        <ProForm style={{ padding: 24 }}
            layout="horizontal"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 14 }}
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
            onFinish={onFinish}
            initialValues={showConf}

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
            />
            <ProFormDigit
                width="md"
                name="post_service_fee_amount"
                label="Post Service Fee Amount"
                placeholder="Enter the fee amount for post actions"
            />
            <ProFormDigit
                width="md"
                name="comment_service_fee_amount"
                label="Comment Service Fee Amount"
                placeholder="Enter the fee amount for comment actions"
            />

            <ProFormDigit
                width="md"
                name="like_service_fee_amount"
                label="Like Service Fee Amount"
                placeholder="Enter the fee amount for like actions"
            />


        </ProForm>
    </ProCard>
}