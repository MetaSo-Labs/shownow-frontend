import { useCallback, useEffect, useState } from "react";
import {
  IMvcConnector,
  MetaletWalletForBtc,
  MetaletWalletForMvc,
  mvcConnect,
  IBtcConnector,
  btcConnect,
} from "@metaid/metaid";

import { curNetwork, DASHBOARD_TOKEN, getHostByNet } from "@/config";
import {
  fetchFeeRate,
  fetchFollowingList,
  getFollowList,
  getUserInfo,
} from "@/request/api";
import useIntervalAsync from "@/hooks/useIntervalAsync";
import { isEmpty, set } from "ramda";
import { useModel } from "umi";
const checkExtension = () => {
  if (!window.metaidwallet) {
    window.open(
      "https://chromewebstore.google.com/detail/metalet/lbjapbcmmceacocpimbpbidpgmlmoaao"
    );
    return false;
  }
  return true;
};

const checkWallet = async () => {
  try {
    const isConnected: any = await window.metaidwallet.isConnected();
    if (isConnected.status === "no-wallets") {
      throw new Error("please init wallet");
    }
    if (isConnected.status === "locked") {
      throw new Error("please unlock your wallet");
    }
    if (isConnected.status === "not-connected") {
      throw new Error("not-connected");
    }
    return [isConnected, ""];
  } catch (e: any) {
    return [false, e.message];
  }
};
export default () => {
  const { setLogined } = useModel("dashboard");
  const [isLogin, setIsLogin] = useState(false);
  const [chain, setChain] = useState<API.Chain>(
    (localStorage.getItem("show_chain") as API.Chain) || "mvc"
  );
  const [showConnect, setShowConnect] = useState(false);
  const [user, setUser] = useState({
    avater: "",
    name: "",
    metaid: "",
    notice: 1,
    address: "",
    background: "",
  });

  const [btcConnector, setBtcConnector] = useState<IBtcConnector>();
  const [mvcConnector, setMvcConnector] = useState<IMvcConnector>();
  const [network, setNetwork] = useState<API.Network>(curNetwork);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [feeRate, setFeeRate] = useState<number>(1);
  const [showSetting, setShowSetting] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [followList, setFollowList] = useState<API.FollowingItem[]>([]);
  const connectWallet = useCallback(async () => {
    const [isConnected, errMsg] = await checkWallet();
    if (!isConnected && !isEmpty(errMsg)) {
      throw new Error(errMsg);
    }
    if (!isConnected) {
      const ret = await window.metaidwallet.connect();
      if (ret.status) {
        throw new Error(ret.status);
      }
    }
    let { network: _net } = await window.metaidwallet.getNetwork();
    if (_net !== curNetwork) {
      const ret = await window.metaidwallet.switchNetwork(
        curNetwork === "testnet" ? "testnet" : "livenet"
      );
      if (ret.status === "canceled") return;
      const { network } = await window.metaidwallet.getNetwork();
      if (network !== curNetwork) {
        return;
      }
    }
    const btcAddress = await window.metaidwallet.btc.getAddress();
    const btcPub = await window.metaidwallet.btc.getPublicKey();
    const mvcAddress = await window.metaidwallet.getAddress();
    const mvcPub = await window.metaidwallet.getPublicKey();
    const btcWallet = MetaletWalletForBtc.restore({
      address: btcAddress,
      pub: btcPub,
      internal: window.metaidwallet,
    });
    const mvcWallet = MetaletWalletForMvc.restore({
      address: mvcAddress,
      xpub: mvcPub,
    });
    const btcConnector = await btcConnect({
      wallet: btcWallet,
      network: curNetwork,
    });
    setBtcConnector(btcConnector);
    const mvcConnector = await mvcConnect({
      wallet: mvcWallet,
      network: curNetwork,
    });
    setMvcConnector(mvcConnector);
    const connector = chain === "btc" ? btcConnector : mvcConnector;
    setUser({
      avater: connector.user.avatar
        ? `${getHostByNet(network)}${connector.user.avatar}`
        : "",
      background: connector.user.background
        ? `${getHostByNet(network)}${connector.user.background}`
        : "",
      name: connector.user.name,
      metaid: connector.user.metaid,
      notice: 0,
      address: connector.wallet.address,
    });
    setIsLogin(true);
  }, [chain]);

  const disConnect = async () => {
    const ret = await window.metaidwallet.disconnect();
    if (ret.status === "canceled") return;
    setIsLogin(false);
    setBtcConnector(undefined);
    setMvcConnector(undefined);
    localStorage.removeItem(DASHBOARD_TOKEN);
    setLogined(false);
    setUser({
      avater: "",
      name: "",
      metaid: "",
      notice: 1,
      address: "",
      background: "",
    });
  };
  useEffect(() => {
    const handleAccountChange = (newAccount: any) => {
      disConnect();
    };
    const handleNetChange = (network: string) => {
      disConnect();
    };
    if (window.metaidwallet && isLogin) {
      window.metaidwallet.on("accountsChanged", handleAccountChange);
      window.metaidwallet.on("networkChanged", handleNetChange);
    }

    return () => {
      if (window.metaidwallet && isLogin) {
        window.metaidwallet.removeListener(
          "accountsChanged",
          handleAccountChange
        );
        window.metaidwallet.removeListener("networkChanged", handleNetChange);
      }
    };
  }, [isLogin]);

  const init = useCallback(async () => {
    if (window.metaidwallet) {
      const [isConnected, errMsg] = await checkWallet();
      if (!isConnected) {
        setInitializing(false);
        return;
      }
      const _network = (await window.metaidwallet.getNetwork()).network;
      if (_network !== curNetwork) {
        setInitializing(false);
        return;
      }
      const btcAddress = await window.metaidwallet.btc.getAddress();
      const btcPub = await window.metaidwallet.btc.getPublicKey();
      const mvcAddress = await window.metaidwallet.getAddress();
      const mvcPub = await window.metaidwallet.getPublicKey();
      const btcWallet = MetaletWalletForBtc.restore({
        address: btcAddress,
        pub: btcPub,
        internal: window.metaidwallet,
      });
      const mvcWallet = MetaletWalletForMvc.restore({
        address: mvcAddress,
        xpub: mvcPub,
      });
      const btcConnector = await btcConnect({
        wallet: btcWallet,
        network: curNetwork,
      });
      setBtcConnector(btcConnector);
      const mvcConnector = await mvcConnect({
        wallet: mvcWallet,
        network: curNetwork,
      });
      setMvcConnector(mvcConnector);
      const connector = chain === "btc" ? btcConnector : mvcConnector;
      if(connector.user){
        setUser({
          avater: connector.user.avatar
            ? `${getHostByNet(network)}${connector.user.avatar}`
            : "",
          background: connector.user.background
            ? `${getHostByNet(network)}${connector.user.background}`
            : "",
          name: connector.user.name,
          metaid: connector.user.metaid,
          notice: 0,
          address: connector.wallet.address,
        });
      }
      
      setIsLogin(true);
    }
    setInitializing(false);
  }, [chain]);

  const fetchUserInfo = useCallback(async () => {
    const userInfo = await getUserInfo({ address: user.address });
    setUser({
      avater: userInfo.avatar
        ? `${getHostByNet(network)}${userInfo.avatar}`
        : "",
      background: userInfo.background
        ? `${getHostByNet(network)}${userInfo.background}`
        : "",
      name: userInfo.name,
      metaid: userInfo.metaid,
      notice: 0,
      address: userInfo.address,
    });
  }, [user]);
  useEffect(() => {
    setTimeout(() => {
      init();
    }, 500);
  }, [init]);

  const fetchFeeRateData = useCallback(async () => {
    try {
      const feeRateData = await fetchFeeRate({ netWork: curNetwork });
      setFeeRate(feeRateData?.fastestFee || 1);
    } catch (e) {
      console.log(e);
    }
  }, []);
  const updateFeeRate = useIntervalAsync(fetchFeeRateData, 60000);

  const fetchUserFollowingList = useCallback(async () => {
    if (user.metaid) {
      const res = await getFollowList({
        metaid: user.metaid ?? "",
      });
      setFollowList(res && res.data?.list ? res.data.list : []);
    }
  }, [user.metaid]);

  const switchChain = async (chain: API.Chain) => {
    if (!btcConnector || !mvcConnector) return;
    const connector = chain === "btc" ? btcConnector : mvcConnector;
    setUser({
      avater: connector.user.avatar
        ? `${getHostByNet(network)}${connector.user.avatar}`
        : "",
      background: connector.user.background
        ? `${getHostByNet(network)}${connector.user.background}`
        : "",
      name: connector.user.name,
      metaid: connector.user.metaid,
      notice: 0,
      address: connector.wallet.address,
    });
    localStorage.setItem("show_chain", chain);
    setChain(chain);
  };

  const checkUserSetting = useCallback(() => {
    if (!isLogin) return true;
    if (!user.metaid) return true;
    if (!user.name) {
      setShowSetting(true);
      return false;
    }
    return true;
  }, [isLogin, chain, user]);

  useEffect(() => {
    fetchUserFollowingList();
  }, [fetchUserFollowingList]);

  return {
    isLogin,
    setIsLogin,
    user,
    connect: connectWallet,
    disConnect,
    initializing,
    btcConnector,
    chain,
    feeRate,
    setFeeRate,
    showConnect,
    setShowConnect,
    mvcConnector,
    followList,
    setFollowList,
    fetchUserInfo,
    switchChain,
    fetchUserFollowingList,
    showSetting,
    setShowSetting,
    checkUserSetting,
    showProfileEdit,
    setShowProfileEdit,
  };
};
