import React, { useEffect, useState } from "react";


import { Form, Input, Upload, Button, message, Avatar, UploadProps, theme } from "antd";
import { FileImageFilled, LoadingOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useModel } from "umi";
import Trans from "../Trans";
import './index.less'

const getBase64 = (img: FileType, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
};

const beforeUpload = (file: FileType) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG file!');
    }
    const isLt300k = file.size / 1024 / 1024 < 0.3;
    if (!isLt300k) {
        message.error("file must smaller than 300k!");
        return false;
    }
    return isJpgOrPng && isLt300k;
};

const UploadBackground = (props: any) => {
    const { token: { colorText } } = theme.useToken()
    const { user } = useModel('user');
    const [imageUrl, setImageUrl] = useState<string>(props.value);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (props.value && typeof props.value === 'string' && props.value.indexOf('http') === 0) {
            setImageUrl(props.value)
        }
    }, [props.value])

    const handleChange: UploadProps['onChange'] = (info) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            getBase64(info.file.originFileObj as FileType, (url) => {
                setLoading(false);
                setImageUrl(url);
                if (props.onChange) {
                    props.onChange(info.file.originFileObj);
                }
            });
        }
    };

    const uploadButton = (
        <Button block icon={<PlusOutlined />} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '240px', border: 'none' }} type='text'>
            <Trans>Upload</Trans>
        </Button>
    );
    const handleUpload = async ({ file, onSuccess, onError }) => {
        onSuccess()
    }

    return (
        <Upload.Dragger
            beforeUpload={beforeUpload}
            onChange={handleChange}

            showUploadList={false}
            customRequest={handleUpload}
            style={{ width: '100%', height: 240, padding: 0, boxSizing: 'border-box', overflow: 'hidden' }}
            className="setting-background-uploader"

        >
            {imageUrl ? <div style={{ position: 'relative', width: '100%', height: 240, overflow: 'hidden',borderRadius: 8 }}>
                <img src={imageUrl} alt="avatar" style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 8, overflow: 'hidden' }} />
                <Button style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} shape='circle' type='text' icon={<FileImageFilled />}></Button>
            </div> : uploadButton}
        </Upload.Dragger>
    );
};

export default UploadBackground;
