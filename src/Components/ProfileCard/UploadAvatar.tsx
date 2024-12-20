import React, { useEffect, useState } from "react";


import { Form, Input, Upload, Button, message, Avatar, UploadProps, theme } from "antd";
import { FileImageFilled, LoadingOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useModel } from "umi";
import Trans from "../Trans";

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

const UploadAvatar = (props: any) => {
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
        <button style={{ border: 0, background: 'none', color: colorText }} type="button">
            <PlusOutlined />
            <div style={{ marginTop: 8 }}><Trans>Upload</Trans></div>
        </button>
    );
    const handleUpload = async ({ file, onSuccess, onError }) => {
        onSuccess()
    }

    return (
        <Upload
            beforeUpload={beforeUpload}
            onChange={handleChange}
            name="avatar"
            listType={props.listType || "picture-circle"}
            className="avatar-uploader"
            showUploadList={false}
            style={{ overflow: 'hidden',background:'#fff' }}
            customRequest={handleUpload}

        >
            {imageUrl ? <div style={{ position: 'relative', width: 100, height: 100 }}>
                <img src={imageUrl} alt="avatar" style={{ width: 100, height: 100, objectFit: 'cover',  overflow: 'hidden' }} />
                <Button style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} shape='circle' type='link'  icon={<FileImageFilled />}></Button>
            </div> : uploadButton}
        </Upload>
    );
};

export default UploadAvatar;
