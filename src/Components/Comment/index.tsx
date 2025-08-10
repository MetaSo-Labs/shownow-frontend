
import { useIntl, useModel } from "umi"
import Popup from "../ResponPopup"
import UserInfo from "../UserInfo"
import { Button, Input, message, Space } from "antd";
import { FileImageOutlined, SmileOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { useState } from "react";
import { curNetwork, FLAG } from "@/config";
import { isNil } from "ramda";
import { useQueryClient } from "@tanstack/react-query";
import commentEntitySchema, { getCommentEntitySchemaWithCustomHost } from "@/entities/comment";
import { formatMessage, getEffectiveBTCFeerate, sleep } from "@/utils/utils";
import Trans from "../Trans";
import EmojiPicker from "emoji-picker-react";
const { TextArea } = Input;
type Props = {
    show: boolean,
    onClose: (mockComment?: API.CommentRes) => void
    tweetId: string
}
export default ({ show, onClose, tweetId }: Props) => {

    const { user, btcConnector, feeRate, mvcFeeRate, chain, mvcConnector, checkUserSetting, isLogin } = useModel('user')
    const { showConf, fetchServiceFee } = useModel('dashboard');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [content, setContent] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const handleAddComment = async () => {
        if (!isLogin) {
            message.error(formatMessage('Please connect your wallet first'))
            return
        }
        const isPass = checkUserSetting();
        if (!isPass) {
            return;
        }
        setIsAdding(true);

        try {
            const finalBody: any = {
                content: content,
                contentType: 'text/plain',
                commentTo: tweetId,
            };
            console.log('finalBody', finalBody);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (chain === 'btc') {
                const createRes = await btcConnector!.inscribe({
                    inscribeDataArray: [
                        {
                            operation: 'create',
                            path: `${showConf?.host ?? ''}/protocols/paycomment`,
                            body: JSON.stringify(finalBody),
                            contentType: 'text/plain;utf-8',
                            flag: FLAG,
                        },
                    ],
                    options: {
                        noBroadcast: 'no',
                        feeRate: getEffectiveBTCFeerate(Number(feeRate)),
                        service: fetchServiceFee('comment_service_fee_amount', 'BTC'),
                        network: curNetwork,
                    },
                });

                console.log('create res for inscribe', createRes);
                if (!isNil(createRes?.revealTxIds[0])) {
                    message.success('comment successfully');
                    setContent('');
                    onClose({
                        CreateMetaid: user.metaid,
                        chainName: 'btc',
                        commentNum: 0,
                        content: finalBody.content,
                        createAddress: user.address,
                        likeNum: 0,
                        pinId: createRes?.revealTxIds[0] + 'i0',
                        timestamp: Math.floor(Date.now() / 1000),
                        donateNum: 0,
                        forwardNum: 0,
                        likeAddress: [],
                    });
                }

            } else {

                const Comment = await mvcConnector!.load(getCommentEntitySchemaWithCustomHost(showConf?.host ?? ''))
                const createRes = await Comment.create({
                    data: { body: JSON.stringify(finalBody) },
                    options: {
                        network: curNetwork,
                        signMessage: 'create comment',
                        service: fetchServiceFee('comment_service_fee_amount', 'MVC'),
                        feeRate: Number(mvcFeeRate),
                    },
                })
                if (!isNil(createRes?.txid)) {
                    message.success('comment successfully')
                    setContent('')
                    onClose({
                        CreateMetaid: user.metaid,
                        chainName: 'mvc',
                        commentNum: 0,
                        content: finalBody.content,
                        createAddress: user.address,
                        likeNum: 0,
                        pinId: createRes?.txid + 'i0',
                        timestamp: Math.floor(Date.now() / 1000),
                        donateNum: 0,
                        forwardNum: 0,
                        likeAddress: [],
                    });
                }
            }

        } catch (error) {
            const errorMessage = (error as any)?.message ?? error;
            const toastMessage = errorMessage?.includes(
                'Cannot read properties of undefined'
            )
                ? 'User Canceled'
                : errorMessage;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message.error(toastMessage);
            setIsAdding(false);
        }
        setIsAdding(false);
    };
    return <>
        <Popup onClose={() => onClose()} show={show} modalWidth={600} closable >
            <div>
                <UserInfo user={user} />
                <TextArea rows={6} placeholder={formatMessage('Post your reply')} style={{ marginTop: 24 }} value={content} onChange={(e) => {
                    setContent(e.target.value)
                }} />
                <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Space>
                        <Button disabled icon={<FileImageOutlined style={{ color: showConf?.brandColor }} />} type='text'></Button>
                        {window.innerWidth > 768 && <Button onClick={() => {
                            setShowEmojiPicker(true);
                        }} icon={<SmileOutlined style={{ color: showConf?.brandColor }} />} type='text'></Button>}

                    </Space>

                    <Button type='primary' shape='round' loading={isAdding} onClick={handleAddComment}>
                        <Trans wrapper>Comment</Trans>
                    </Button>
                </div>
            </div>
        </Popup>
        <Popup onClose={() => {
            setShowEmojiPicker(false);
        }} show={
            showEmojiPicker
        } closable title={<Trans>Select Emoji</Trans>}>
            <EmojiPicker
                onEmojiClick={(emoji) => {
                    setContent((prev: string) => prev + emoji.emoji);
                }}
            />
        </Popup>
    </>
}