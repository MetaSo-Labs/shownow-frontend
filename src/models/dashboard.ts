import useIntervalAsync from "@/hooks/useIntervalAsync";
import { getMetaidByAddress, getPubKey } from "@/request/api";
import { fetchFees, fetchShowConf } from "@/request/dashboard";
import { useCallback, useEffect, useState } from "react";
export const showNowConf = {
  alias: "default",
  brandColor: "#fc457b",
  gradientColor:
    "linear-gradient(90deg, rgb(220,99,204) 0%, rgb(196,94,54) 100%)",
  logo: "data:image/png;base64,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",
  theme: "light",
  showSliderMenu: true,
  showRecommend: true,
  colorBgLayout: "#F6F9FC",
  colorBorderSecondary: "",
  colorHeaderBg: "",
  contentSize: 1200,
  colorButton: "#ffffff",
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
  const fetchConfig = useCallback(async () => {
    const ret = await fetchShowConf();
    // if (true) {
    //   const userInfo = await getMetaidByAddress({
    //     address: "n18EnQDAEh47fYQbLJdzt6xdw8TvUs7haL", //ret.service_fee_address,
    //   });
    //   console.log(userInfo, "n18EnQDAEh47fYQbLJdzt6xdw8TvUs7haL");
    //   ret.host = userInfo!.metaid.slice(0, 16) + ":";
    //   console.log(ret.host, "ret.host");
    // }

    ret.host = "";
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
    const _fee = fees.find((item) => item.chain === chain);
    if (_fee) {
      return {
        address: _fee["service_fee_address"] as string,
        satoshis: String(_fee[feeType]) as string,
      };
    } else {
      return undefined;
    }
  };
  const updateFees = useIntervalAsync(_fetchFees, 600000);
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
  };
};
