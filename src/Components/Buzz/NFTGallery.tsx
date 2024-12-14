import { BASE_MAN_URL, FallbackImage } from "@/config"
import { FlagFilled } from "@ant-design/icons"
import { Image, Space, Tag, theme, Typography } from "antd"

type Props = {
    nfts: API.NFT[]
}
export default ({ nfts }: Props) => {
    const { token: { colorBgLayout, borderRadiusLG, padding, colorPrimary, colorPrimaryBg } } = theme.useToken()
    if (!nfts.length) {
        return <></>
    }

    return <div className="nft-gallery" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {
            nfts.map((nft, index) => {
                return <div key={index} className="nft-item" style={{ background: colorBgLayout, borderRadius: borderRadiusLG, padding, display: 'flex', width: 378, gap: 10, maxWidth: '100%' }}>
                    <Image
                        style={{ objectFit: 'cover', height: 80, width: 80, display: index > 8 ? 'none' : 'block', borderRadius: borderRadiusLG }}
                        src={`${BASE_MAN_URL}/content/${(nft.previewImage ?? '').replace('metafile://', '')}`}
                        fallback={FallbackImage}
                        className="image-item"
                        preview={false}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Typography.Title level={4} style={{ margin: 0 }}>{nft.collectionName}</Typography.Title>
                        <Typography.Text type='secondary'>{nft.name}</Typography.Text>
                    </div>
                </div>
            })
        }
        <div>
            <Tag bordered={false} color={colorPrimaryBg} style={{ color: colorPrimary }}><Space><FlagFilled />NFT Market</Space> </Tag>
        </div>

    </div>

}