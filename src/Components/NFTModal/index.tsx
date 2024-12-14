import { useIntl, useModel } from "umi"
import Popup from "../ResponPopup"
import Trans from "../Trans"
import { useState } from "react"
import { Button, Collapse, ConfigProvider, Empty, message, Segmented, Space, Spin, theme, Typography } from "antd"
import { getUserNFTCollectionItems, getUserNFTCollections } from "@/request/api"
import { useQuery } from "@tanstack/react-query"
import { BASE_MAN_URL } from "@/config"
import { CheckCircleOutlined, CheckOutlined } from "@ant-design/icons"
type Props = {
    show: boolean,
    onClose: () => void
    nfts: API.NFT[];
    setNFTs: (nfts: API.NFT[]) => void
}
export default ({ onClose, show, nfts, setNFTs }: Props) => {
    const { formatMessage } = useIntl()
    const { token: {
        colorBorderSecondary, colorPrimary
    } } = theme.useToken()
    const { chain, btcConnector, mvcConnector } = useModel('user')
    const [chainNetwork, setChainNetwork] = useState<API.Chain>(chain);
    const { isLoading, isFetching, data } = useQuery({
        queryKey: ['nfts', chainNetwork],
        queryFn: async () => {
            const address = chainNetwork === 'btc' ? btcConnector!.address : mvcConnector!.address;
            const collections = await getUserNFTCollections({ address: address, cousor: 0, size: 100 });
            const userNFTs: API.UserNFTs[] = [];
            if (collections.data?.list) {
                for (const collection of collections.data.list) {
                    const _nfts = await getUserNFTCollectionItems({ address: address, cousor: 0, size: 100, pinId: collection.pinid });
                    userNFTs.push({
                        ...collection,
                        items: _nfts.data.list.map(nft => {
                            try {
                                const img = JSON.parse(atob(nft.content)).attachment[0].content;
                                return {
                                    ...nft,
                                    previewImage: `${BASE_MAN_URL}/content/${img.replace('metafile://', '')}`
                                }
                            } catch (e) {
                                return nft;
                            }

                        })
                    })
                }
            }
            return userNFTs;
        }
    })


    return <Popup onClose={onClose} show={show} modalWidth={640} closable title={<Trans>My NFT</Trans>}>
        <Segmented<API.Chain>
            options={[{
                label: <Trans>Bitcoin</Trans>,
                value: 'btc'
            }, {
                label: <Trans>MVC</Trans>,
                value: 'mvc'
            }]}
            value={chainNetwork}
            onChange={(value: API.Chain) => {
                setChainNetwork(value)
            }}
        />
        <ConfigProvider
            theme={{
                components: {
                    Collapse: {
                        headerBg: 'transparent',
                        colorBorder: colorBorderSecondary
                    },
                },
            }}
        >
            <Spin spinning={isLoading || isFetching}>
                {!isLoading && (data ?? []).length === 0 && <Empty />}
                <Space direction="vertical" style={{ width: '100%', marginTop: 20 }}>

                    {(data ?? []).map(item => (
                        <Collapse style={{ width: '100%' }} defaultActiveKey={['1']} key={item.pinid} expandIconPosition='end' items={[{
                            key: '1',
                            label: <Typography.Text>{item.name}</Typography.Text>,
                            styles: { body: { borderTop: '0px solid transparent' } },
                            children: <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                                {
                                    item.items.map(nft => {
                                        const _find = nfts.find(_nft => _nft.itemPinId === nft.itemPinId);
                                        return <div key={nft.itemPinId} style={{
                                            position: 'relative',
                                            cursor: 'pointer',
                                            borderRadius: 8,
                                            border: _find ? `1px solid ${colorPrimary}` : 'none',
                                            overflow: 'hidden'
                                        }} onClick={(item) => {
                                            if (!_find && nfts.length >= 2) {
                                                message.error(formatMessage({ id: 'You can only select 2 NFTs' }))
                                                return;

                                            }

                                            setNFTs(!_find ? [...nfts, nft] : nfts.filter(_nft => _nft.itemPinId !== nft.itemPinId))
                                        }}>
                                            <Button

                                                size="small"
                                                style={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                }}
                                                variant='filled'
                                                color='primary'
                                                shape='circle'
                                                icon={_find ? <CheckOutlined /> : ''}
                                            >
                                            </Button>
                                            <img src={nft.previewImage} alt={nft.name} style={{ width: '100%', height: '100%', objectFit: 'cover', }} />
                                        </div>
                                    })
                                }
                            </div>
                        }]} />
                    ))}

                </Space>

            </Spin>
        </ConfigProvider>

    </Popup>
}