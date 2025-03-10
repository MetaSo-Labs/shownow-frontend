import { uploadIcon } from "@/request/dashboard";
import { ModalForm, ProFormUploadButton } from "@ant-design/pro-components";
import { Button, Form, message } from "antd";

export default () => {
    const [form] = Form.useForm<{ file: File }>();
    return (
        <ModalForm<{ file: File }>
            title="Set Site Icon"
            width={400}
            trigger={
                <Button type="primary">
                    Set Site Icon
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
                const formData = new FormData();
                // todo: 上传文件
                formData.append('file', values.file[0].originFileObj);
                try {
                    const ret = await uploadIcon(formData);
                    message.success('Upload successfully');
                    return true;
                } catch (e: any) {
                    message.error(e.response && e.response.data && e.response.data.message || e.message)
                    return false;
                }

            }}
        >
            <ProFormUploadButton
                name="file"
                label="Icon"
                max={1}
                title="Upload "
                fieldProps={{
                    name: 'file',
                    listType: 'picture-card',
                }}
                rules={[{ required: true, message: 'Please upload a file!' }]}
                tooltip={
                    <>Please upload a .ico file <a href="https://realfavicongenerator.net/" target='_blank'>ICO File Generator </a> </>
                }
            />
        </ModalForm>
    );
};