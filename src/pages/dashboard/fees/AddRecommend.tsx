import PendingUser from "@/Components/UserInfo/PendingUser";
import { curNetwork } from "@/config";
import { addRecommendedItem } from "@/request/api";
import { isValidBitcoinAddress } from "@/utils/utils";
import { PlusOutlined } from "@ant-design/icons";
import { ModalForm, ProFormText } from "@ant-design/pro-components";
import { Button, Form, message } from "antd";
type AddRecommendProps = {
    reload: () => void;
}
export default ({ reload }: AddRecommendProps) => {
    const [form] = Form.useForm<{ authorAddress: string; remark: string }>();
    const authorAddress = Form.useWatch('authorAddress', form);
    return (
        <ModalForm<{
            authorAddress: string;
            remark: string
        }>
            title="Add Recommend User"
            trigger={
                <Button type="primary">
                    <PlusOutlined />
                    Add
                </Button>
            }
            form={form}
            autoFocusFirstInput
            modalProps={{
                destroyOnClose: true,
                onCancel: () => console.log('run'),
            }}
            submitTimeout={2000}
            onFinish={async (values) => {
                const valid = isValidBitcoinAddress(values.authorAddress, curNetwork)
                if (!valid) {
                    message.error('Please enter a valid btc address');
                    return false;
                }
                const ret = await addRecommendedItem({
                    authorAddress: values.authorAddress,
                    authorName: values.remark || values.authorAddress,
                });
                if (ret.code !== 1) {
                    message.error(ret.message);
                    return false;
                }
                reload();
                return true;
            }}
        >
            <ProFormText
                width="md"
                name="authorAddress"
                label="Address"
                tooltip="Please enter the address of the recommend user"
                placeholder="Please enter a address"
                rules={[{ required: true, message: 'Please enter a address!' }]}
            />
            {authorAddress && <PendingUser address={authorAddress} />}
            <ProFormText
                width="md"
                name="remark"
                label="Remark"
                tooltip="Please enter the remark of the recommend user"
                placeholder="Please enter a remark"
                rules={[{ required: false, }]}
            />

        </ModalForm>)
}