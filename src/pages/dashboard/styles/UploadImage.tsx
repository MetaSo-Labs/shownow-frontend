import React, { useState } from "react";
import { Form, Input, Upload, Button, message, Avatar, Typography } from "antd";
import { LoadingOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { uploadImage } from "@/request/dashboard";

const UploadImage = (props: any) => {
    const [loading, setLoading] = useState(false);
    const [precent, setPrecent] = useState(0);
    const [imageUrl, setImageUrl] = useState<string>();
    const handleUpload = async ({ file, onSuccess, onError }) => {
        setLoading(true);
        setPrecent(0)
        setImageUrl(undefined);
        try {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
                throw new Error('You can only upload JPG/PNG file!');
            }

            const formData = new FormData();
            // todo: 上传文件
            formData.append('file', file);
            const ret = await uploadImage(formData);
            console.log('ret', ret)
            message.success("Upload successful");
            onSuccess(null, file);
            props.onChange && props.onChange(ret.url);
        } catch (err: any) {
            console.error("Upload error:", err);
            message.error(err.message ?? "Upload failed");
            onError(err);
            setLoading(false);
            setPrecent(0)
            setImageUrl(undefined);
        }
    };


    const uploadButton = (
        <div style={{ border: 0, background: 'none', cursor: 'pointer' }} >
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <Typography.Text style={{ marginTop: 8 }}>Upload </Typography.Text>
        </div>
    );

    return (
        <Upload customRequest={handleUpload} name="avatar"
            listType="picture-card"
            className="avatar-uploader" showUploadList={false} style={{ overflow: 'hidden' }}>
            {props.value ? <Avatar shape="square" style={{ width: 96, height: 96 }} src={<img src={props.value}></img>}></Avatar> : uploadButton}

        </Upload>
    );
};

export default UploadImage;
