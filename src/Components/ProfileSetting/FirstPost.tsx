import { history, useModel } from "umi";
import Popup from "../ResponPopup";
import Trans from "../Trans";
import { Button, Card, Divider, Input, message, Typography } from "antd";
import PendingUser from "../UserInfo/PendingUser";
import { getBuzzSchemaWithCustomHost } from "@/entities/buzz";
import { IMvcEntity } from "@feiyangl1020/metaid";
import { ASSIST_ENDPOINT, curNetwork } from "@/config";
import { useState } from "react";
import { isNil } from "lodash";
import { getMVCRewards } from "@/request/metaso";

export default () => {
    const { setShowFirstPost, showFirstPost, chain, btcConnector, mvcConnector, feeRate, mvcFeeRate, setMockBuzz, isLogin, user } = useModel('user');
    const { showConf, admin, fetchServiceFee } = useModel('dashboard');
    const [content, setContent] = useState('Hello Web3 World!');
    const [submitting, setSubmitting] = useState(false);
    const postSimpleBuzz = async () => {
        if (!user.address) return;
        const connector = mvcConnector;
        if (!connector) return;
        if (!content) {
            message.error('Content cannot be empty');
            return;
        }
        setSubmitting(true);
        try{

       
        const finalBody: any = {
            content: content,
            contentType: 'application/json;utf-8',
        };
        const buzzEntity = await mvcConnector!.load(getBuzzSchemaWithCustomHost(showConf?.host ?? '')) as IMvcEntity;
        let createRes: any;

        createRes = await buzzEntity!.create({
            data: { body: JSON.stringify({ ...finalBody }) },
            options: {
                assistDomian: ASSIST_ENDPOINT,
                network: curNetwork,
                signMessage: 'create buzz',
                serialAction: 'finish',
                transactions: [],
                service: fetchServiceFee('post_service_fee_amount', 'MVC'),
                feeRate: mvcFeeRate
            },
        })
        getMVCRewards({
            address: mvcConnector!.user.address,
            gasChain: 'mvc'
        })

        if (!isNil(createRes?.txid)) {
            // await sleep(5000);

            message.success('Your first post has been created successfully!');

            setMockBuzz({
                chainName: 'mvc',
                commentCount: 0,
                content: JSON.stringify(finalBody),
                creator: user.address,
                blocked: false,
                id: createRes.txid + 'i0',
                likeCount: 0,
                host: (showConf?.host || '').toLowerCase(),
                number: 0,
                donate: [],
                MogoID: '',
                address: user.address,
                contentBody: null,
                contentLength: 0,
                contentType: 'text/plain;utf-8',
                createMetaId: user.metaid,
                dataValue: 0,
                donateCount: 0,
                encryption: '0',
                genesisFee: 0,
                genesisHeight: 0,
                genesisTransaction: createRes.txid,
                hot: 0,
                initialOwner: user.address,
                isTransfered: false,
                status: 0,
                timestamp: Math.floor(new Date().getTime() / 1000),
                operation: 'create',
                path: `/protocols/simplebuzz`,
                output: '',
                outputValue: 1,
                parentPath: '',
                pop: '',
                popLv: -1,
                preview: "",
                shareCount: 0,
                metaid: user.metaid,
                txIndex: 0,
                txInIndex: 0,
                offset: 0,
                location: '',
                originalPath: '',
                version: '1.0.0',
                contentTypeDetect: 'text/plain;utf-8',
                contentSummary: JSON.stringify(finalBody),
                originalId: '',
                mrc20MintId: [],
                like: []



            })
            setShowFirstPost(false);
            history.push('/home/new', { buzzId: new Date().getTime() })
        }
         }catch (e: any) {
            console.log(e, 'error');
            message.error(e.message)
        }
        setSubmitting(false);

    }
    if (!isLogin) return null
    return <Popup onClose={() => {
        setShowFirstPost(false);
    }} modalWidth={740} style={{
        borderRadius: 24,
    }} bodyStyle={{
        padding: "8px 36px 24px 36px"
    }} show={showFirstPost} title={<><Typography.Title level={4}><Trans>Everything’s ready </Trans></Typography.Title>
        <Typography.Title level={4} style={{ marginTop: 8 }}><Trans>Say hello to the Web3 world! </Trans></Typography.Title>
    </>}>
        <Typography.Text type='secondary' style={{ textAlign: 'center', display: 'block', marginBottom: 16 }}>
            <Trans>Click ‘Post’ to permanently store your first message on the chain for free!</Trans>
        </Typography.Text>
        <Card>
            <PendingUser address={user.address} isOwner />
            <Divider />
            <Input.TextArea style={{ textAlign: 'left', paddingBottom: 180, height: 120, fontSize: 18, fontWeight: 'bolder' }} value={content} variant='borderless' onChange={(e) => setContent(e.target.value)} />
        </Card>

        <div style={{ marginTop: 20, display: 'flex', gap: 10, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
            <Button onClick={() => {
                setShowFirstPost(false)
            }} block size='large' shape='round' variant='filled' color='primary'>
                <Trans wrapper>Close</Trans>
            </Button>

            <Button size='large' block type='primary' shape='round' loading={submitting}
                onClick={postSimpleBuzz}
            >
                <span>
                    <Trans>Post</Trans>
                </span>
            </Button>
        </div>
    </Popup>

}