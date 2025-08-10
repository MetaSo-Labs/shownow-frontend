import { useCallback, useEffect, useState } from "react";
import {
  IMvcConnector,
  MetaletWalletForBtc,
  MetaletWalletForMvc,
  mvcConnect,
  IBtcConnector,
  btcConnect,
} from "@feiyangl1020/metaid";

import {
  AVATAR_BASE_URL,
  BASE_MAN_URL,
  curNetwork,
  DASHBOARD_ADMIN_PUBKEY,
  DASHBOARD_SIGNATURE,
  DASHBOARD_TOKEN,
  getHostByNet,
} from "@/config";
import {
  fetchFeeRate,
  fetchFollowingList,
  fetchMVCFeeRate,
  getFollowList,
  getUserInfo,
  getUserNotify,
} from "@/request/api";
import useIntervalAsync from "@/hooks/useIntervalAsync";
import { add, isEmpty, set } from "ramda";
import { useModel } from "umi";
import { NotificationStore } from "@/utils/NotificationStore";
import { UserInfo } from "node_modules/@metaid/metaid/dist/types";
const checkExtension = () => {
  if (!window.metaidwallet) {
    window.open("https://www.metalet.space/");
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
    (localStorage.getItem("show_chain_v2") as API.Chain) || "btc"
  );
  const [showConnect, setShowConnect] = useState(false);
  const [user, setUser] = useState({
    avatar: "",
    name: "",
    metaid: "",
    address: "",
    background: "",
    bio: "",
  });

  const [btcConnector, setBtcConnector] = useState<IBtcConnector>();
  const [mvcConnector, setMvcConnector] = useState<IMvcConnector>();
  const [network, setNetwork] = useState<API.Network>(curNetwork);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [feeRate, setFeeRate] = useState<number>(1);
  const [mvcFeeRate, setMvcFeeRate] = useState<number>(5);
  const [btcFeerateLocked, setBtcFeerateLocked] = useState<boolean>(false);
  const [mvcFeerateLocked, setMvcFeerateLocked] = useState<boolean>(false);
  const { showConf } = useModel("dashboard");
  const [showSetting, setShowSetting] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showRecommendFollow, setShowRecommendFollow] = useState(false);
  const [showFirstPost, setShowFirstPost] = useState(false);
  const [followList, setFollowList] = useState<API.FollowingItem[]>([]);
  const [searchWord, setSearchWord] = useState("");
  const [mockBuzz, setMockBuzz] = useState<API.Buzz>();
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
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
      host: getHostByNet(curNetwork),
    });
    setBtcConnector(btcConnector);
    const mvcConnector = await mvcConnect({
      wallet: mvcWallet,
      network: curNetwork,
      host: getHostByNet(curNetwork),
    });
    setMvcConnector(mvcConnector);
    const connector = chain === "btc" ? btcConnector : mvcConnector;
    const localStorageProfile = sessionStorage.getItem(
      `${connector.wallet.address}_profile`
    );
    let profile: Record<string, string> = {};
    if (localStorageProfile) {
      try {
        profile = JSON.parse(localStorageProfile);
      } catch (e) {
        console.log(e);
      }
    }
    setUser({
      avatar: connector.user.avatar
        ? `${AVATAR_BASE_URL}${connector.user.avatar}`
        : "",
      background: connector.user.background
        ? `${AVATAR_BASE_URL}${connector.user.background}`
        : "",
      name: connector.user.name || profile.name,
      metaid: connector.user.metaid,
      bio: connector.user.bio || profile.bio || "",
      address: connector.wallet.address,
    });
    const publicKey = await window.metaidwallet.btc.getPublicKey();
    const signature: any =
      await window.metaidwallet.btc.signMessage("metaso.network");
    localStorage.setItem(DASHBOARD_SIGNATURE, signature);
    localStorage.setItem(DASHBOARD_ADMIN_PUBKEY, publicKey);
    setIsLogin(true);
  }, [chain]);

  const disConnect = async () => {
    const ret = await window.metaidwallet.disconnect();
    if (ret.status === "canceled") return;
    setIsLogin(false);
    setBtcConnector(undefined);
    setMvcConnector(undefined);
    localStorage.removeItem(DASHBOARD_TOKEN);
    localStorage.removeItem(DASHBOARD_SIGNATURE);
    localStorage.removeItem(DASHBOARD_ADMIN_PUBKEY);
    setLogined(false);
    setUser({
      avatar: "",
      name: "",
      metaid: "",
      bio: "",
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
      if (!localStorage.getItem(DASHBOARD_SIGNATURE)) {
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
        host: getHostByNet(curNetwork),
      });
      setBtcConnector(btcConnector);
      const mvcConnector = await mvcConnect({
        wallet: mvcWallet,
        network: curNetwork,
        host: getHostByNet(curNetwork),
      });
      setMvcConnector(mvcConnector);
      const connector = chain === "btc" ? btcConnector : mvcConnector;
      if (connector.user) {
        const localStorageProfile = sessionStorage.getItem(
          `${connector.wallet.address}_profile`
        );
        let profile: Record<string, string> = {};
        if (localStorageProfile) {
          try {
            profile = JSON.parse(localStorageProfile);
          } catch (e) {
            console.log(e);
          }
        }
        setUser({
          avatar: connector.user.avatar
            ? `${AVATAR_BASE_URL}${connector.user.avatar}`
            : "",
          background:
             connector.user.background
              ? `${AVATAR_BASE_URL}${connector.user.background}`
              : "",
          name: connector.user.name || profile.name,
          metaid: connector.user.metaid,
          bio: connector.user.bio || profile.bio || "",
          address: connector.wallet.address,
        });
      }

      setIsLogin(true);
    }
    setInitializing(false);
  }, [chain]);

  const fetchUserInfo = useCallback(async () => {
    const localStorageProfile = sessionStorage.getItem(
      `${user.address}_profile`
    );
    let profile: Record<string, string> = {};
    if (localStorageProfile) {
      try {
        profile = JSON.parse(localStorageProfile);
      } catch (e) {
        console.log(e);
      }
    }
    if (!user.address) {
      return;
    }
    const userInfo = (await getUserInfo({ address: user.address })) as UserInfo;
    setUser({
      avatar: userInfo.avatar ? `${AVATAR_BASE_URL}${userInfo.avatar}` : "",
      background: userInfo.background
        ? `${AVATAR_BASE_URL}${userInfo.background}`
        : "",
      name: userInfo.name || profile.name,
      metaid: userInfo.metaid,
      bio: userInfo.bio || profile.bio || "",

      address: userInfo.address,
    });
  }, [user]);

  const _fetchNotification = useCallback(async () => {
    if (!user.address) {
      setUnreadNotificationCount(0);
      return;
    }
    try {
      const userAddress = user.address;
      const store = new NotificationStore();
      const lastId = await store.getLastNotificationId(userAddress);
      const newNotis = await getUserNotify({
        address: userAddress,
        lastId: lastId || "0",
        size: 100,
      });
      const _newNotis = (newNotis.data ?? []).map((item) => {
        item.notifcationId = item.notifcationId.toString();
        return item;
      });
      await store.save(_newNotis, userAddress);
      const unreadCount = await store.getUnreadCount(userAddress);
      setUnreadNotificationCount(unreadCount);
    } catch (e) {
      console.log(e);
    }
  }, [user.address]);
  useEffect(() => {
    setTimeout(() => {
      init();
    }, 500);
  }, [init]);

  const fetchFeeRateData = useCallback(async () => {
    try {
      if (!btcFeerateLocked) {
        fetchFeeRate({ netWork: curNetwork })
          .then((feeRateData) => {
            setFeeRate(feeRateData?.fastestFee || 1);
          })
          .catch((e) => {
            console.log(e);
          });
      }
    } catch (e) {
      console.log(e);
    }
    try {
      if (!mvcFeerateLocked) {
        const mvcfeeRateData = await fetchMVCFeeRate({ netWork: curNetwork });
        setMvcFeeRate(mvcfeeRateData?.fastestFee || 5);
      }
    } catch (e) {
      console.log(e);
    }
  }, [btcFeerateLocked, mvcFeerateLocked]);
  const updateFeeRate = useIntervalAsync(fetchFeeRateData, 1000 * 60 * 5);

  const updateNotify = useIntervalAsync(_fetchNotification, 1000 * 60 * 5);

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
    const localStorageProfile = sessionStorage.getItem(
      `${connector.wallet.address}_profile`
    );
    let profile: Record<string, string> = {};
    if (localStorageProfile) {
      try {
        profile = JSON.parse(localStorageProfile);
      } catch (e) {
        console.log(e);
      }
    }
    setUser({
      avatar: connector.user.avatar
        ? `${AVATAR_BASE_URL}${connector.user.avatar}`
        : "",
      background: connector.user.background
        ? `${AVATAR_BASE_URL}${connector.user.background}`
        : "",
      name: connector.user.name || profile.name,
      metaid: connector.user.metaid,
      bio: connector.user.bio || profile.bio || "",
      address: connector.wallet.address,
    });
    localStorage.setItem("show_chain_v2", chain);
    setChain(chain);
  };

  const checkUserSetting = useCallback(() => {
    if (!isLogin) return true;
    if (!user.metaid) return true;
    if (!user.name) {
      const localStorageProfile = sessionStorage.getItem(
        `${user.address}_profile`
      );
      let profile: Record<string, string> = {};
      if (localStorageProfile) {
        try {
          profile = JSON.parse(localStorageProfile);
        } catch (e) {
          console.log(e);
        }
      }
      if (!profile.name) {
        setShowSetting(true);
        localStorage.setItem("show_chain_v2", "mvc");
        setChain("mvc");
        return false;
      }
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
    mvcFeeRate,
    setMvcFeeRate,
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
    searchWord,
    setSearchWord,
    setMockBuzz,
    mockBuzz,
    btcFeerateLocked,
    setBtcFeerateLocked,
    mvcFeerateLocked,
    setMvcFeerateLocked,
    unreadNotificationCount,
    updateNotify,
    showRecommendFollow,
    setShowRecommendFollow,
    showFirstPost,
    setShowFirstPost,
  };
};
