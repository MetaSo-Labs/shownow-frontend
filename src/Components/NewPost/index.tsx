
import { useIntl, useModel, history } from "umi"
import Popup from "../ResponPopup"
import UserInfo from "../UserInfo"
import { Avatar, Button, Card, Checkbox, Col, Divider, GetProp, Input, InputNumber, message, Radio, Result, Row, Segmented, Select, Space, Tag, Typography, Upload, UploadFile, UploadProps } from "antd";
import { CheckCircleOutlined, CloseOutlined, ExclamationCircleOutlined, FileImageOutlined, LoadingOutlined, LockOutlined, UnlockOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { AttachmentItem, convertToFileList, image2Attach, processFile } from "@/utils/file";
import { CreateOptions, IBtcEntity, IMvcEntity, MvcTransaction } from "@feiyangl1020/metaid";
import { isEmpty, isNil, set } from "ramda";
import { ASSIST_ENDPOINT, BASE_MAN_URL, curNetwork, FLAG } from "@/config";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BuzzCard from "../Cards/BuzzCard";
import Buzz from "../Buzz";
import _btc from '@/assets/btc.png'
import _mvc from '@/assets/mvc.png'
import { InscribeData } from "node_modules/@metaid/metaid/dist/core/entity/btc";
import * as crypto from 'crypto'
import { checkImageSize, encryptPayloadAES, formatMessage, generateAESKey, getEffectiveBTCFeerate, openWindowTarget, sleep } from "@/utils/utils";
import { postPayBuzz, postVideo } from "@/utils/buzz";
import { getDeployList, getMRC20Info, getUserInfo } from "@/request/api";
import UserAvatar from "../UserAvatar";
import Trans from "../Trans";
import NFTModal from "../NFTModal";
import SelectChain from "./SelectChain";
import { getBuzzSchemaWithCustomHost } from "@/entities/buzz";
import { v4 as uuidv4 } from 'uuid';
import { clearDraftFiles, deleteDraftFile, getUploadDraftList, saveUploadItemsToDraft } from "@/utils/idb";
import MRC20Icon from "../MRC20Icon";
const { TextArea } = Input;
type Props = {
    show: boolean,
    onClose: () => void
    quotePin?: API.Pin;
}
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
const getBase64 = (img: FileType, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
};
export default ({ show, onClose, quotePin }: Props) => {

    const isQuoted = !isNil(quotePin);

    const { user, btcConnector, feeRate, mvcFeeRate, chain, mvcConnector, checkUserSetting, isLogin, setMockBuzz } = useModel('user')
    const [chainNet, setChainNet] = useState<API.Chain>(chain)
    const { showConf, fetchServiceFee, manPubKey, admin } = useModel('dashboard')
    const [images, setImages] = useState<any[]>([]);
    const [video, _setVideo] = useState<any>();
    const [content, _setContent] = useState(localStorage.getItem('tmp_content') || '');
    const [encryptContent, setEncryptContent] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const queryClient = useQueryClient();
    const [lock, setLock] = useState(false);
    const [payType, setPayType] = useState<string>('mrc20');
    const [payAmount, setPayAmount] = useState(0.00001);
    const [payMrc20Amount, setPayMrc20Amount] = useState(1);
    const [holdTokenID, setHoldTokenID] = useState<string>('');
    const [mrc20, setMrc20] = useState<API.MRC20TickInfo>();
    const [checkTokenID, setCheckTokenID] = useState<string>('');
    const [encryptFiles, setEncryptFiles] = useState<string[]>([]);
    const [showNFTModal, setShowNFTModal] = useState(false);
    const [nfts, setNFTs] = useState<API.NFT[]>([]);

    // const setImages = (images: any[]) => {
    //     images ? localStorage.setItem('tmp_images', JSON.stringify(images)) : localStorage.removeItem('tmp_images');
    //     _setImages(images);
    // }

    const setContent = (content: string) => {
        localStorage.setItem('tmp_content', content);
        _setContent(content);
    }

    const setVideo = (video: any) => {
        // video ? localStorage.setItem('tmp_video', JSON.stringify(video)) : localStorage.removeItem('tmp_video');
        _setVideo(video);
    }

    const handleBeforeUpload = (file: any) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('You can only upload image file!');
            return Upload.LIST_IGNORE;
        }
        const [check, msg] = checkImageSize(file)
        if (!check) {
            message.error(msg)
            return Upload.LIST_IGNORE
        }
        const previewUrl = URL.createObjectURL(file);
        setImages((prevImages) => [...prevImages, { file, previewUrl }]);
        saveUploadItemsToDraft([...images, { file, previewUrl }].map(item => ({
            uid: item.file.uid,
            file: item.file,
            previewUrl: item.previewUrl
        })));
        return false;
    };

    const reset = () => {
        setContent('')
        setImages([])
        setVideo(undefined)
        setEncryptContent('')
        setEncryptFiles([])
        setNFTs([])
        setLock(false)
        clearDraftFiles()
    }

    const handleVideoBeforeUpload = (file: any) => {
        const isVideo = file.type.startsWith('video/');
        if (!isVideo) {
            message.error('You can only upload video file!');
            return Upload.LIST_IGNORE;
        }
        if (file.size > 1024 * 1024 * 3) {
            message.error('The video size must be less than 3MB');
            return Upload.LIST_IGNORE;
        }
        const previewUrl = URL.createObjectURL(file);
        setVideo({ file, previewUrl });
        return false;
    }
    const handleRemoveImage = (index: number) => {
        const image = images[index];
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
        deleteDraftFile(image.uid || image.file?.uid)
    };
    const handleRemoveVideo = () => {
        setVideo(undefined);
    }
    const onCreateSubmit = async () => {
        if (!isLogin) {
            message.error(formatMessage('Please connect your wallet first'))
            return
        }
        const isPass = checkUserSetting();
        if (!isPass) {
            return;
        }
        setIsAdding(true);
        const _images =
            images.length !== 0 ? await image2Attach(convertToFileList(images)) : [];
        if (lock) {
            handleAddBuzzWhthLock()
        } else {
            await handleAddBuzz({
                content: content,
                images: _images,
            });
        }

    };
    const { isLoading, data: IdCoin } = useQuery({
        queryKey: ['idCoin', user],
        enabled: Boolean(user && show),
        queryFn: async () => {
            const address = await window.metaidwallet.btc.getAddress()
            const ret = await getDeployList({ address, tickType: 'idcoins' });
            if (ret.data.length > 0) {
                const userInfo = await getUserInfo({ address });
                return {
                    ...ret.data[0],
                    deployerUserInfo: userInfo
                }
            }
            return undefined
        }
    })
    const handleAddBuzz = async (buzz: {
        content: string;
        images: AttachmentItem[];
    }) => {
        setIsAdding(true);
        const buzzEntity: IBtcEntity = await btcConnector!.use('buzz');
        let fileTransactions: MvcTransaction[] = [];

        let TxMap: Map<string, MvcTransaction | string> = new Map()

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const finalBody: any = {
                content: buzz.content,
                contentType: 'text/plain',
            };

            if (video && chainNet === 'mvc') {
                const { metafile, transactions } = await postVideo(video.file, showConf?.host || '', chainNet, btcConnector, mvcConnector, mvcFeeRate);
                fileTransactions = transactions as MvcTransaction[];
                finalBody.attachments = [metafile]
                // let chunkTransactions: MvcTransaction[] = [];

                // const chunkSize = 1024 * 1024 * 0.2
                // const { chunks, chunkNumber, sha256, fileSize, dataType, name } = await processFile(video.file, chunkSize);
                // let chunkPids: string[] = [];
                // const chunkList = []
                // for (let i = 0; i < chunks.length; i++) {
                //     const { chunk, hash } = chunks[i];
                //     const metaidData: InscribeData = {
                //         operation: "create",
                //         body: chunk,
                //         path: `${showConf?.host || ''}/file/chunk/${hash}`,
                //         contentType: "metafile/chunk;binary",
                //         encoding: "base64",
                //         flag: "metaid",
                //     };
                //     if (chain === 'btc') {
                //         // todo
                //     } else {
                //         const serialAction = (i + 1) % 2 === 0 ? 'finish' : "combo";
                //         const { transactions, txid } = await mvcConnector!.createPin(
                //             metaidData,
                //             {
                //                 network: curNetwork,
                //                 signMessage: "file chunk",
                //                 serialAction: serialAction,
                //                 transactions: chunkTransactions,
                //             }
                //         );
                //         if (txid) {
                //             TxMap.set(hash, txid)
                //         }
                //         if (transactions) {
                //             transactions.forEach(tx => {
                //                 if (!TxMap.has(hash)) {
                //                     TxMap.set(hash, tx)
                //                 }
                //             })
                //         }


                //         // chunkList.push({
                //         //     sha256: hash,
                //         //     pinId: txid ? `${txid}i0` : transactions![transactions!.length - 1].txComposer.getTxId() + 'i0'
                //         // })
                //         chunkTransactions = transactions as MvcTransaction[];
                //     }
                // }
                // console.log('chunkPids', chunkPids);
                // const metaidData: InscribeData = {
                //     operation: "create",
                //     body: JSON.stringify({
                //         chunkList:chunks.map(({hash, chunk}) => ({
                //             sha256: hash,
                //             pinId: typeof TxMap.get(hash) === 'string' ? TxMap.get(hash)+'i0' : (TxMap.get(hash) as MvcTransaction).txComposer.getTxId() + 'i0'
                //         })),
                //         fileSize,
                //         chunkSize,
                //         dataType,
                //         name,
                //         chunkNumber,
                //         sha256,
                //     }),
                //     path: `${showConf?.host || ''}/file/index/${uuidv4()}`,
                //     contentType: "metafile/index;utf-8",
                //     flag: "metaid",
                // };

                // console.log('metaidData', metaidData);
                // const { transactions: pinTransations } = await mvcConnector!.createPin(
                //     metaidData,
                //     {
                //         network: curNetwork,
                //         signMessage: "file index",
                //         serialAction: "combo",
                //         transactions: [...chunkTransactions],
                //     }
                // );
                // fileTransactions = pinTransations as MvcTransaction[];
                // finalBody.attachments = [...finalBody.attachments || [], 'metafile://video/' + fileTransactions[fileTransactions.length - 1].txComposer.getTxId() + 'i0']
            }
            if (!isEmpty(buzz.images)) {

                const fileOptions: CreateOptions[] = [];
                for (const image of buzz.images) {
                    fileOptions.push({
                        body: Buffer.from(image.data, 'hex').toString('base64'),
                        contentType: `${image.fileType};binary`,
                        encoding: 'base64',
                        flag: FLAG,
                        path: `${showConf?.host || ''}/file`
                    });
                }
                if (chainNet === 'btc') {
                    const fileEntity = await btcConnector!.use('file');
                    const imageRes = await fileEntity.create({
                        dataArray: fileOptions,
                        options: {
                            noBroadcast: 'no',
                            feeRate: getEffectiveBTCFeerate(Number(feeRate)),
                        },
                    });

                    console.log('imageRes', imageRes);
                    finalBody.attachments = [...finalBody.attachments || [], ...imageRes.revealTxIds.map(
                        (rid) => 'metafile://' + rid + 'i0'
                    )];
                } else {
                    const fileEntity = (await mvcConnector!.use('file')) as IMvcEntity
                    const finalAttachMetafileUri: string[] = []

                    for (let i = 0; i < fileOptions.length; i++) {
                        const fileOption = fileOptions[i]
                        const { transactions } = await fileEntity.create({
                            data: fileOption,
                            options: {
                                network: curNetwork,
                                signMessage: 'upload image file',
                                serialAction: 'combo',
                                transactions: fileTransactions,
                                feeRate: mvcFeeRate
                            },
                        })

                        if (!transactions) {
                            throw new Error('upload image file failed')
                        }

                        finalAttachMetafileUri.push(
                            'metafile://' +
                            transactions[transactions.length - 1].txComposer.getTxId() +
                            'i0',
                        )
                        fileTransactions = transactions
                    }

                    finalBody.attachments = [...finalBody.attachments || [], ...finalAttachMetafileUri]
                }

            }


            //   await sleep(5000);


            if (!isNil(quotePin)) {
                finalBody.quotePin = quotePin.id;
            }
            if (nfts.length > 0) {
                finalBody.attachments = [...nfts.map(nft => `metafile://nft/mrc721/${nft.itemPinId}`), ...finalBody.attachments || []]
            }
            if (chainNet === 'btc') {
                console.log('finalBody', {
                    body: JSON.stringify(finalBody),
                    contentType: 'text/plain;utf-8',
                    flag: FLAG,
                    path: `${showConf?.host || ''}/protocols/simplebuzz`
                });
                const createRes = await buzzEntity!.create({
                    dataArray: [
                        {
                            body: JSON.stringify(finalBody),
                            contentType: 'text/plain;utf-8',
                            flag: FLAG,
                            path: `${showConf?.host || ''}/protocols/simplebuzz`
                        },
                    ],
                    options: {
                        noBroadcast: 'no',
                        feeRate: getEffectiveBTCFeerate(Number(feeRate)),
                        service: fetchServiceFee('post_service_fee_amount'),
                        // service: {
                        //     address: environment.service_address,
                        //     satoshis: environment.service_staoshi,
                        // },
                        // network: environment.network,
                    },
                });
                console.log('create res for inscribe', createRes);
                if (!isNil(createRes?.revealTxIds[0])) {
                    // await sleep(5000);
                    queryClient.invalidateQueries({ queryKey: ['homebuzzesnew'] });
                    message.success(`${isQuoted ? 'repost' : 'create'} buzz successfully`);
                    reset()
                    onClose();
                    setMockBuzz({
                        chainName: chainNet,
                        commentCount: 0,
                        content: JSON.stringify(finalBody),
                        creator: user.address,
                        blocked: false,
                        id: createRes?.revealTxIds[0] + 'i0',
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
                        genesisTransaction: createRes?.revealTxIds[0],
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
                    history.push('/home/new', { buzzId: new Date().getTime() })
                }
            } else {
                const buzzEntity = await mvcConnector!.load(getBuzzSchemaWithCustomHost(showConf?.host ?? '')) as IMvcEntity;
                let createRes: any;
                if (admin?.assist && isEmpty(buzz.images) && !video) {
                    createRes = await buzzEntity!.create({
                        data: { body: JSON.stringify({ ...finalBody }) },
                        options: {
                            assistDomian: ASSIST_ENDPOINT,
                            network: curNetwork,
                            signMessage: 'create buzz',
                            serialAction: 'finish',
                            transactions: fileTransactions,
                            service: fetchServiceFee('post_service_fee_amount', 'MVC'),
                            feeRate: mvcFeeRate

                        },
                    })
                } else {
                    createRes = await buzzEntity!.create({
                        data: { body: JSON.stringify({ ...finalBody }) },
                        options: {
                            network: curNetwork,
                            signMessage: 'create buzz',
                            serialAction: 'finish',
                            transactions: fileTransactions,
                            service: fetchServiceFee('post_service_fee_amount', 'MVC'),
                            feeRate: mvcFeeRate
                        },
                    })
                }



                console.log(fileTransactions.map(tx => tx.txComposer.getTxId()));
                if (!isNil(createRes?.txid)) {
                    // await sleep(5000);
                    queryClient.invalidateQueries({ queryKey: ['homebuzzesnew'] })
                    message.success(`${isQuoted ? 'repost' : 'create'} buzz successfully`)
                    reset()
                    onClose();
                    setNFTs([])
                    setMockBuzz({
                        chainName: chainNet,
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
                    history.push('/home/new', { buzzId: new Date().getTime() })
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
    const handleAddBuzzWhthLock = async () => {
        setIsAdding(true);
        try {
            if (!admin?.domainName) {
                throw new Error('The administrator has not set a domain. Please ask the administrator to configure a domain to proceed.')
            }
            const encryptImages = images.filter((image) => encryptFiles.includes(image.previewUrl));
            const publicImages = images.filter((image) => !encryptFiles.includes(image.previewUrl));
            if (encryptImages.length === 0 && !encryptContent) {
                throw new Error('Please input encrypt content or encrypt images')
            }
            if (!payType) {
                throw new Error('Please select pay type')
            }
            if (payType === 'mrc20' && !IdCoin) {
                throw new Error('Please Launch Your Unique ID-COIN')
            }
            if (payType === 'btc' && payAmount <= 0) {
                throw new Error('Please input valid pay amount')
            }
            if (payType === 'paymrc20' && !mrc20) {
                throw new Error('Please input valid MRC20 token ID or tick')
            }
            if (payType === 'paymrc20' && checkTokenID !== 'success') {
                throw new Error('Please input valid MRC20 token ID or tick')
            }
            if (payType === 'paymrc20' && payMrc20Amount <= 0) {
                throw new Error('Please input valid MRC20 token amount')
            }
            if (payType === 'holdmrc20' && !mrc20) {
                throw new Error('Please input valid MRC20 token ID or tick')
            }

            const { payload, pid } = await postPayBuzz({
                content: content,
                encryptImages: await image2Attach(convertToFileList(encryptImages)),
                publicImages: await image2Attach(convertToFileList(publicImages)),
                encryptContent: encryptContent,
                nfts: nfts.map(nft => `metafile://nft/mrc721/${nft.itemPinId}`),
                manDomain: admin?.domainName || '',
            },
                String(payAmount),
                user.address,
                chainNet === 'btc' ? feeRate : mvcFeeRate,
                showConf?.host || '',
                chainNet,
                btcConnector,
                mvcConnector!,
                manPubKey || '',
                fetchServiceFee('post_service_fee_amount', chainNet === 'btc' ? 'BTC' : "MVC"),
                String(payType),
                IdCoin,
                mrc20,
                String(payMrc20Amount),

            )
            reset()
            onClose()
            queryClient.invalidateQueries({ queryKey: ['homebuzzesnew'] });
            // setMockBuzz({
            //     chainName: chainNet,
            //     commentCount: 0,
            //     content: JSON.stringify(payload),
            //     creator: user.address,
            //     blocked: false,
            //     id: pid,
            //     likeCount: 0,
            //     host: (showConf?.host || '').toLowerCase(),
            //     number: 0,
            //     donate: [],
            //     MogoID: '',
            //     address: user.address,
            //     contentBody: null,
            //     contentLength: 0,
            //     contentType: 'text/plain;utf-8',
            //     createMetaId: user.metaid,
            //     dataValue: 0,
            //     donateCount: 0,
            //     encryption: '0',
            //     genesisFee: 0,
            //     genesisHeight: 0,
            //     genesisTransaction: pid.substring(0, pid.length - 2),
            //     hot: 0,
            //     initialOwner: user.address,
            //     isTransfered: false,
            //     status: 0,
            //     timestamp: Math.floor(new Date().getTime() / 1000),
            //     operation: 'create',
            //     path: `/protocols/paybuzz`,
            //     output: '',
            //     outputValue: 1,
            //     parentPath: '',
            //     pop: '',
            //     popLv: -1,
            //     preview: "",
            //     shareCount: 0,
            //     metaid: user.metaid,
            //     txIndex: 0,
            //     txInIndex: 0,
            //     offset: 0,
            //     location: '',
            //     originalPath: '',
            //     version: '1.0.0',
            //     contentTypeDetect: 'text/plain;utf-8',
            //     contentSummary: JSON.stringify(payload),
            //     originalId: '',
            //     mrc20MintId: [],
            //     like: []



            // })

            history.push('/home/new', { buzzId: new Date().getTime() })

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


        }
        setIsAdding(false);
    }
    useEffect(() => {
        let didCancel = false;
        const fetchMrc20Info = async () => {
            if (!holdTokenID) return;
            setCheckTokenID('validating')
            const params: {
                id?: string,
                tick?: string
            } = {};
            if (holdTokenID.length > 24) {
                params.id = holdTokenID
            } else {
                params.tick = holdTokenID.toUpperCase()
            }
            console.log('params', params);
            const { code, message, data } = await getMRC20Info(params);
            if (didCancel) return;
            if (data && data.mrc20Id) {
                setMrc20(data)
                setCheckTokenID('success')
                return
            } else {
                setMrc20(undefined)
                setCheckTokenID('error')
            }
        }
        fetchMrc20Info()
        return () => {
            didCancel = true
        }
    }, [holdTokenID])

    useEffect(() => {
        if (show) {
            getUploadDraftList().then((drafts) => {
                console.log('drafts', drafts);
                setImages(drafts || []);
            })
        }

    }, [show])





    return <Popup onClose={onClose} show={show} modalWidth={640} closable title={!isQuoted ? <Trans>New Buzz</Trans> : <Trans>Repost</Trans>}>
        {
            isQuoted && <Card style={{ margin: 24 }} styles={{
                body: {
                    padding: 0
                }
            }}><Buzz buzzItem={quotePin} showActions={false} /></Card>
        }
        <div>
            <Row gutter={[12, 12]} >
                <SelectChain chainNet={chainNet} setChainNet={setChainNet} />
                <Col span={24}><Typography.Text strong><Trans>Public</Trans></Typography.Text></Col>
                <Col span={24}>
                    <TextArea autoSize={{ minRows: 4, maxRows: 16 }} placeholder={isQuoted ? formatMessage("Add a comment") : formatMessage("post_placeholder")} value={content} onChange={(e) => setContent(e.target.value)} />
                </Col>

                {
                    !isQuoted && <>
                        <Col span={24} style={{ justifyContent: 'space-between', display: 'flex', alignItems: "center" }}>
                            <Typography.Text strong><Trans>Encrypt</Trans></Typography.Text>
                            <Button type='text' icon={
                                !lock ? <UnlockOutlined style={{ color: showConf?.brandColor }} /> : <LockOutlined style={{ color: showConf?.brandColor }} />
                            } onClick={() => setLock(!lock)} />
                        </Col>
                        {
                            lock && <Col span={24}><TextArea autoSize={{ minRows: 4, maxRows: 16 }} placeholder={formatMessage("encrypt content")} value={encryptContent} onChange={(e) => setEncryptContent(e.target.value)} /></Col>
                        }
                    </>
                }
                <Col span={24}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 16 }}>
                        {
                            nfts.map((nft, index) => (
                                <div
                                    key={`nft` + index}
                                    style={{
                                        position: 'relative',
                                        marginRight: 8,
                                        marginBottom: 8,
                                        width: 100,
                                        height: 100,
                                    }}
                                >
                                    <img
                                        src={nft.previewImage}
                                        alt={`preview-${index}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <Button
                                        onClick={() => setNFTs(nfts.filter((_nft, i) => nft.itemPinId !== _nft.itemPinId))}
                                        size="small"
                                        style={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 4,
                                        }}
                                        icon={<CloseOutlined />}
                                    >
                                    </Button>
                                </div>
                            ))
                        }
                        {images.map((image, index) => (
                            <div
                                key={index}
                                style={{
                                    position: 'relative',
                                    marginRight: 8,
                                    marginBottom: 8,
                                    width: 100,
                                    height: 100,
                                }}
                            >
                                <img
                                    src={image.previewUrl}
                                    alt={`preview-${index}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <Button
                                    onClick={() => handleRemoveImage(index)}
                                    size="small"
                                    style={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                    }}
                                    icon={<CloseOutlined />}
                                >
                                </Button>
                                {
                                    lock && <Button
                                        onClick={() => {
                                            console.log('encryptFiles', encryptFiles);
                                            if (encryptFiles.includes(image.previewUrl)) {
                                                setEncryptFiles(encryptFiles.filter(item => item !== image.previewUrl))
                                            } else {
                                                setEncryptFiles([...encryptFiles, image.previewUrl])
                                            }
                                        }}
                                        size="small"
                                        style={{
                                            position: 'absolute',
                                            bottom: 4,
                                            right: 4,
                                        }}
                                        icon={
                                            !encryptFiles.includes(image.previewUrl) ?
                                                <UnlockOutlined style={{ color: showConf?.brandColor }} /> :
                                                <LockOutlined style={{ color: showConf?.brandColor }} />}
                                    >
                                    </Button>
                                }


                            </div>
                        ))}

                        {
                            (video && chainNet === 'mvc' && !lock) && (
                                <div
                                    style={{
                                        position: 'relative',
                                        marginRight: 8,
                                        marginBottom: 8,
                                        width: 100,
                                        height: 100,
                                    }}
                                >
                                    <video
                                        src={video.previewUrl}
                                        // controls
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <Button
                                        onClick={() => handleRemoveVideo()}
                                        size="small"
                                        style={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 4,
                                        }}
                                        icon={<CloseOutlined />}
                                    >
                                    </Button>
                                </div>
                            )
                        }
                    </div>
                </Col>
                {
                    !isQuoted && lock && <>
                        <Col span={24} style={{ justifyContent: 'space-between', display: 'flex', alignItems: "center", flexWrap: 'wrap', gap: 20 }}>
                            <Typography.Text strong><Trans>Payment method</Trans></Typography.Text>
                            <Segmented<string>
                                options={[{
                                    label: <Trans>Pay With BTC</Trans>,
                                    value: 'btc'
                                }, {
                                    label: <Trans>Pay With MRC20</Trans>,
                                    value: 'paymrc20'
                                }, {
                                    label: <Trans>Hold ID Coin</Trans>,
                                    value: 'mrc20'
                                }, {
                                    label: <Trans>Hold MRC20</Trans>,
                                    value: 'holdmrc20'
                                }]}
                                value={payType}
                                onChange={(value) => {
                                    setPayType(value)
                                }}
                            />
                        </Col>
                        <Col span={24}>
                            <div style={{ display: 'flex', marginTop: 20, flexDirection: 'column' }}>
                                {
                                    lock && payType === 'btc' && <InputNumber variant='filled' value={payAmount} onChange={(value) => {
                                        setPayAmount(value)
                                    }} style={{ flexGrow: 1, width: '100%' }} suffix={<img src={_btc} style={{ height: 20, width: 20 }}></img>} />
                                }
                                {
                                    lock && payType === 'paymrc20' && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <Input prefix={mrc20 ? <MRC20Icon size={20} tick={mrc20.tick} metadata={mrc20.metadata} /> : <></>} value={holdTokenID} style={{ flexGrow: 1, }} onChange={(e) => {
                                            setHoldTokenID(e.target.value)
                                        }} status={!mrc20 ? 'warning' : ''} suffix={
                                            checkTokenID === 'validating' ? <LoadingOutlined /> :
                                                checkTokenID === 'error' ? <ExclamationCircleOutlined style={{ color: 'red' }} /> :
                                                    checkTokenID === 'success' ? <CheckCircleOutlined style={{ color: 'green' }} /> : <></>
                                        }
                                            placeholder={formatMessage("please input mrc20 id or tick")}
                                        >

                                        </Input>
                                        <InputNumber controls={false} variant='filled' value={payMrc20Amount} onChange={(value) => {
                                            setPayMrc20Amount(value)
                                        }} style={{ flexGrow: 1, width: '100%' }} suffix={mrc20 ? <MRC20Icon size={20} tick={mrc20.tick} metadata={mrc20.metadata} /> : <></>} />
                                    </div>
                                }
                                {
                                    lock && payType === 'mrc20' && <>
                                        {
                                            isLoading ?
                                                <span><Trans>loading</Trans></span> :
                                                <>
                                                    {
                                                        IdCoin ?
                                                            <Checkbox defaultChecked disabled >
                                                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: "center", justifyContent: 'flex-end', flexGrow: 1 }}>
                                                                    <UserAvatar src={IdCoin.deployerUserInfo?.avatar} size={32} />
                                                                    <div className="right" style={{ flexGrow: 1 }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                                                            <div>
                                                                                <Typography.Title level={4} style={{ margin: 0 }}>
                                                                                    {IdCoin.tick}
                                                                                </Typography.Title>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div></Checkbox> :
                                                            <Result
                                                                icon={<></>}
                                                                title={<Trans>Launch Your Unique ID-COIN Now!</Trans>}
                                                                subTitle={<Trans>It seems you haven't issued your personal ID-COIN yet. Head over to MetaID.market to create your ID-COIN and unlock new possibilities in the decentralized ecosystem. Start building your on-chain identity today!</Trans>}
                                                                extra={
                                                                    <Button onClick={() => {
                                                                        window.open(curNetwork === 'testnet' ? 'https://testnet.metaid.market/launch' : 'https://metaid.market/launch', openWindowTarget())
                                                                    }} type="primary" key="console">

                                                                        <Trans wrapper>Launch Me</Trans>
                                                                    </Button>
                                                                }
                                                            />
                                                    }
                                                </>
                                        }
                                    </>
                                }

                                {
                                    lock && payType === 'holdmrc20' && <>
                                        {


                                            <Input prefix={mrc20 ? <MRC20Icon size={20} tick={mrc20.tick} metadata={mrc20.metadata} /> : <></>} value={holdTokenID} style={{ flexGrow: 1, }} onChange={(e) => {
                                                setHoldTokenID(e.target.value)
                                            }} status={!mrc20 ? 'warning' : ''} suffix={
                                                checkTokenID === 'validating' ? <LoadingOutlined /> :
                                                    checkTokenID === 'error' ? <ExclamationCircleOutlined style={{ color: 'red' }} /> :
                                                        checkTokenID === 'success' ? <CheckCircleOutlined style={{ color: 'green' }} /> : <></>
                                            }
                                                placeholder={formatMessage("please input mrc20 id or tick")}
                                            >

                                            </Input>

                                        }
                                    </>
                                }
                            </div>
                        </Col>
                    </>
                }
                <Col>


                </Col>



            </Row>




            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Space>
                    <Upload beforeUpload={handleBeforeUpload}
                        showUploadList={false}  >
                        <Button icon={<FileImageOutlined />} variant='text' color='primary'></Button>
                    </Upload>
                    <Button type='text' onClick={() => setShowNFTModal(true)} variant='text' color='primary'>NFT</Button>
                    <Upload beforeUpload={handleVideoBeforeUpload}
                        showUploadList={false}
                        accept='video/mp4'  >
                        <Button disabled={chainNet === 'btc' || lock} icon={<VideoCameraOutlined />} variant='text' color='primary'></Button>
                    </Upload>


                </Space>
                <Space>
                    <Button shape='round' type='text' onClick={reset}>
                        <Trans wrapper>Reset</Trans>
                    </Button>
                    <Button shape='round' style={{ background: showConf?.gradientColor, color: showConf?.colorButton }} loading={isAdding} onClick={onCreateSubmit}>
                        <Trans>Post</Trans>
                    </Button>
                </Space>

            </div>
        </div>
        <NFTModal show={showNFTModal} onClose={() => { setShowNFTModal(false) }} nfts={nfts} setNFTs={setNFTs} />
    </Popup>
}
