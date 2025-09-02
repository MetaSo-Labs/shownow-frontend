import { DASHBOARD_TOKEN, DefaultLogo } from "@/config";
import useIntervalAsync from "@/hooks/useIntervalAsync";
import { getMetaidByAddress, getPubKey } from "@/request/api";
import { fetchAdmin, fetchFees, fetchShowConf } from "@/request/dashboard";
import { fetchDomianList, fetchIDCoins } from "@/request/metaso";
import idCoinStore from "@/utils/IDCoinStore";
import { useCallback, useEffect, useState } from "react";
export const showNowConf = {
  alias: "default",
  brandColor: "rgba(0, 0, 0, 0.8)",
  gradientColor: "linear-gradient(90deg, #002E33 0%, #002E33 100%)",
  logo: DefaultLogo,
  theme: "light",
  showSliderMenu: true,
  showRecommend: true,
  colorBgLayout: "#C9F8FD",
  colorBorderSecondary: "",
  colorHeaderBg: "",
  contentSize: 1400,
  colorButton: "#ffffff",
  tabs: ["recommend", "new", "hot", "following"],
};

export const bitBuzzConf = {
  alias: "default",
  brandColor: "rgb(212,246,107)",
  gradientColor:
    "linear-gradient(90deg, rgb(212,246,107) 0%, rgb(212,246,107) 100%)",
  logo: "data:image/png;base64,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",
  theme: "dark",
  showSliderMenu: false,
  showRecommend: false,
  colorBgLayout: "",
  colorBorderSecondary: "#ffffff",
  colorHeaderBg: "rgb(218, 247, 115)",
  contentSize: 900,
  colorButton: "#000000",
};
export default () => {
  const [loading, setLoading] = useState(true);
  const [showConf, setShowConf] = useState<DB.ShowConfDto>();
  const [manPubKey, setManPubKey] = useState<string>();
  const [fees, setFees] = useState<DB.FeeDto[]>([]);
  const [admin, setAdmin] = useState<DB.LoginWithWallerDto>();
  const [idCoins, setIdCoins] = useState<string[]>([]);
  const [idCoinsAddress, setIdCoinsAddress] = useState<string[]>([]); // idCoin tick -> address

  const [domainMap, setDomainMap] = useState<Record<string, string>>({}); // host -> domain
  const [logined, setLogined] = useState(
    Boolean(window.localStorage.getItem(DASHBOARD_TOKEN))
  );
  const fetchConfig = useCallback(async () => {
    const ret = await fetchShowConf();
    const admin = await fetchAdmin();
    setAdmin(admin);
    ret.host = admin.host ? admin.host + ":" : "";
    if (ret?.brandIntroMainTitle) {
      document.title = ret.brandIntroMainTitle;
    }
    setShowConf({
      ...showNowConf,
      ...ret,
    });
    setLoading(false);
  }, []);

  const _fetchFees = useCallback(async () => {
    const ret = await fetchFees();
    setFees(ret);
  }, []);

  const _fetchDomainList = useCallback(async () => {
    const _domainMap: Record<string, string> = {};
    for (let i = 0; i < 10; i++) {
      const ret = await fetchDomianList({
        cursor: i * 50,
        size: 50,
      });
      if (ret.data && ret.data.list) {
        ret.data.list.forEach((item) => {
          _domainMap[item.host.toLowerCase()] = item.domain;
        });
      } else {
        break;
      }
      if (ret.data && ret.data.list && ret.data.list.length === 50) {
        continue;
      } else {
        break;
      }
    }
    setDomainMap(_domainMap);
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);
  const fetchManPubKey = useCallback(async () => {
    const ret = await getPubKey();
    setManPubKey(ret);
  }, []);
  useEffect(() => {
    fetchManPubKey();
  }, [fetchManPubKey]);

  const fetchServiceFee = (
    feeType: keyof DB.FeeDto,
    chain: "BTC" | "MVC" = "BTC"
  ) => {
    return undefined;
    const _fee = fees.find((item) => item.chain === chain);
    if (_fee && _fee[feeType]) {
      return {
        address: _fee["service_fee_address"] as string,
        satoshis: String(_fee[feeType]) as string,
      };
    } else {
      return undefined;
    }
  };

  const _fetchIdCoins = useCallback(async () => {
    fetchIDCoins({
      cursor: 0,
      size: 1000,
    }).then((res) => {
      if (res.data && res.data.list) {
        idCoinStore.save(res.data.list);
        setIdCoins(res.data.list.map((item) => item.tick.toUpperCase()));
        setIdCoinsAddress(res.data.list.map((item) => item.deployerAddress));
      }
    });
  }, []);

  const updateIDCoins = useIntervalAsync(_fetchIdCoins, 600000);
  const updateFees = useIntervalAsync(_fetchFees, 600000);
  const updateDomainInfo = useIntervalAsync(_fetchDomainList, 600000);
  return {
    loading,
    fetchConfig,
    showConf,
    setLoading,
    fetchServiceFee,
    manPubKey,
    setShowConf,
    updateFees,
    fees,
    logined,
    setLogined,
    admin,
    domainMap,
    idCoins,
    idCoinsAddress
  };
};
