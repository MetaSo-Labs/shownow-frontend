import { fetchIDCoinInfoByAddress } from "@/request/metaso";
import { useQuery } from "@tanstack/react-query";
import { Button } from "antd"
import { useMemo } from "react";
import PendingUserAvatar from "../UserInfo/PendingUserAvatar";
import NumberFormat from "../NumberFormat";
import { openWindowTarget } from "@/utils/utils";
import { useModel } from "umi";
type Props = {
    address?: string;
    IDCoin?: API.IdCoin;
}
export default ({ address, IDCoin }: Props) => {
    const { idCoinsAddress } = useModel('dashboard');
    const { data: coinData2, isFetching: isFetching2 } = useQuery({
        queryKey: ['coinData2', address],
        queryFn: () => fetchIDCoinInfoByAddress({ address }),
        enabled: Boolean(address) && !IDCoin && idCoinsAddress.includes(address as string),
    });
    const IdCoin = useMemo(() => {
        if (IDCoin) return IDCoin;
        if (coinData2?.data && coinData2.data.tag === 'id-coins') return coinData2.data;
        return undefined;
    }, [coinData2, IDCoin])

    return <>{IdCoin && <Button color="default" variant="solid" shape='round' size='small' style={{
        padding: '0 4px 0 0',
        marginTop: 12,
        fontWeight: 500,

    }}
        onClick={() => {
            IdCoin.totalMinted === IdCoin.mintCount ? window.open(`https://www.metaid.market/idCoin/${IdCoin.tick}`, openWindowTarget()) : window.open(`https://www.metaid.market/inscribe/MRC-20/${IdCoin.tick}`, openWindowTarget())
        }}
    >

        <PendingUserAvatar address={IdCoin.address} size={20} /> ${IdCoin.tick.toUpperCase()}  <span style={{ color: '#4EED2A', fontSize: 12 }}>
            {
                IdCoin.totalMinted === IdCoin.mintCount ? <NumberFormat value={IdCoin.floorPrice} suffix='BTC' isBig decimal={8} tiny /> : <Button type="link" size="small" onClick={() => {

                }} >
                    Mint
                </Button>
            }

        </span>
    </Button >
    }
    </>
}