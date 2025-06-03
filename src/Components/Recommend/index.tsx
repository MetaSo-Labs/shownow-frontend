import { Carousel } from "antd"
import banner1 from '@/assets/banner.png'
import banner2 from '@/assets/banner2.png'
import './index.less'
import { openWindowTarget } from "@/utils/utils"
import { curNetwork } from "@/config"
import { useModel } from "umi"
export default () => {
    const { showConf, loading } = useModel('dashboard');
    // console.log('showConf', showConf?.banners)

    return <div className="recommend">
        {
            (showConf?.banners ?? []).map((item, index) => {
                return <img key={index} src={item.img} alt="" onClick={() => {
                    window.open(item.link, openWindowTarget())
                }} />
            }
            )
        }
        {!loading && (showConf?.banners ?? []).length === 0 && <>
            <img src={banner1} alt="" onClick={() => {
                window.open("https://www.metaso.network", openWindowTarget())
            }} />
            <img src={banner2} alt="" onClick={() => {
                window.open(curNetwork === 'testnet' ? 'https://testnet.metaid.market/launch' : 'https://metaid.market/launch', openWindowTarget())
            }} />
        </>}



    </div>
}