
import { useIntl, useModel } from "umi"
import Popup from "../ResponPopup"
import UserInfo from "../UserInfo"
import { Button, Input, message, Space } from "antd";
import { FileImageOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { useState } from "react";
import { curNetwork, FLAG } from "@/config";
import { isNil } from "ramda";
import { useQueryClient } from "@tanstack/react-query";
import commentEntitySchema, { getCommentEntitySchemaWithCustomHost } from "@/entities/comment";
import { formatMessage, getEffectiveBTCFeerate, sleep } from "@/utils/utils";
import Trans from "../Trans";
const { TextArea } = Input;
type Props = {
    show: boolean,
    onClose: () => void
    tweetId: string
    refetch?: () => Promise<any>
}
export default ({ show, onClose, tweetId, refetch }: Props) => {

    const { user, btcConnector, feeRate, mvcFeeRate, chain, mvcConnector, checkUserSetting, isLogin } = useModel('user')
    const { showConf, fetchServiceFee } = useModel('dashboard');
    const [content, setContent] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const queryClient = useQueryClient();
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
                    await sleep(500);
                    refetch && refetch();
                    message.success('comment successfully');
                    setContent('');
                    onClose();
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
                console.log('create res for inscribe', createRes)

                if (!isNil(createRes?.txid)) {
                    await sleep(500);
                    refetch && refetch();
                    message.success('comment successfully')
                    setContent('')
                    onClose();
                }
            }

        } catch (error) {
            console.log('error', error);
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
    return <Popup onClose={onClose} show={show} modalWidth={600} closable >
        <div>
            <UserInfo user={user} />
            <TextArea rows={6} placeholder={formatMessage('Post your reply')} style={{ marginTop: 24 }} value={content} onChange={(e) => {
                setContent(e.target.value)
            }} />
            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Space>
                    <Button disabled icon={<FileImageOutlined style={{ color: showConf?.brandColor }} />} type='text'></Button>
                </Space>
                <Button type='primary' shape='round' loading={isAdding} onClick={handleAddComment}>
                    <Trans wrapper>Comment</Trans>
                </Button>
            </div>
        </div>
    </Popup>
}