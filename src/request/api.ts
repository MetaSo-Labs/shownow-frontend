import {
  AVATAR_BASE_URL,
  BASE_MAN_URL,
  curNetwork,
  DASHBOARD_ADMIN_PUBKEY,
  DASHBOARD_SIGNATURE,
  getHostByNet,
  MAINNET_MAN_HOST_V1,
  MARKET_ENDPOINT,
  METASO_BASE_API,
} from "@/config";
import { PayBuzz, SimpleBuzz } from "@/utils/buzz";
import { Notification } from "@/utils/NotificationStore";
import { IBtcConnector } from "@metaid/metaid";
import axios from "axios";
import { number } from "bitcoinjs-lib/src/script";
import { UserInfo } from "node_modules/@metaid/metaid/dist/types";
import { request } from "umi";
export type BtcNetwork = "mainnet" | "testnet" | "regtest";

const TMP_BASE_URL = "https://man.metaid.io";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const getIndexTweet = async () => {
  await sleep(1000);
  return {
    code: 0,
    data: {
      list: [
        {
          id: 1,
          content:
            "Loneliness is the norm, so you don't have to talk about it when you meet people!",
          images: [],
          user: {
            name: "zhangsan",
            avatar:
              "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
            metaid: "001",
          },
        },
        {
          id: 2,
          content:
            "Loneliness is the norm, so you don't have to talk about it when you meet people!",
          user: {
            name: "zhangsan",
            avatar:
              "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
            metaid: "001",
          },
        },
        {
          id: 3,
          content:
            "Loneliness is the norm, so you don't have to talk about it when you meet people!",
          user: {
            name: "zhangsan",
            avatar:
              "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
            metaid: "001",
          },
        },
      ],
    },
  };
};

export async function fetchBuzzs({
  btcConnector,
  page,
  limit,
  network,
  path,
  address,
}: {
  btcConnector: IBtcConnector;
  page: number;
  limit: number;
  network: BtcNetwork;
  path?: string[];
  address?: string;
}): Promise<API.Pin[] | null> {
  const response = await btcConnector.getAllpin({
    page,
    limit,
    network,
    path,
    address,
  });
  console.log(response, "response");
  return response;
}

export async function fetchCurrentBuzzComments({
  pinId,
}: {
  pinId: string;
}): Promise<API.CommentRes[] | null> {
  const body = {
    collection: "paycomment",
    action: "get",
    filterRelation: "and",
    field: [],
    filter: [
      {
        operator: "=",
        key: "commentTo",
        value: pinId,
      },
    ],
    cursor: 0,
    limit: 99999,
    sort: ["number", "desc"],
  };

  try {
    const data = await axios
      .post(`${BASE_MAN_URL}/api/generalQuery`, body)
      .then((res) => res.data);
    return data.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
export async function fetchCurrentBuzzLikes({
  pinId,
}: {
  pinId: string;
}): Promise<API.LikeRes[] | null> {
  const body = {
    collection: "paylike",
    action: "get",
    filterRelation: "and",
    field: [],
    filter: [
      {
        operator: "=",
        key: "likeTo",
        value: pinId,
      },
    ],
    cursor: 0,
    limit: 99999,
    sort: [],
  };

  try {
    const data = await axios
      .post(`${BASE_MAN_URL}/api/generalQuery`, body)
      .then((res) => res.data);
    return data.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchFollowDetailPin(params: {
  metaId: string;
  followerMetaId: string;
}): Promise<{
  metaId: string;
  followMetaId: string;
  followTime: number;
  followPinId: string;
  unFollowPinId: string;
  status: boolean;
}> {
  try {
    const data = await axios
      .get(`${BASE_MAN_URL}/api/follow/record`, { params })
      .then((res) => res.data);
    return data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function fetchFollowingList({
  metaid,
  params,
}: {
  metaid: string;
  params: {
    cursor: string;
    size: string;
    followDetail: boolean;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<{ list: any; total: number }> {
  try {
    const data = await axios
      .get(`${AVATAR_BASE_URL}/api/metaid/followingList/${metaid}`, {
        params,
      })
      .then((res) => res.data);
    return data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function fetchFollowerList({
  metaid,
  params,
}: {
  metaid: string;
  params: {
    cursor: string;
    size: string;
    followDetail: boolean;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<{ list: any; total: number }> {
  try {
    const data = await axios
      .get(`${BASE_MAN_URL}/api/metaid/followerList/${metaid}`, {
        params,
      })
      .then((res) => res.data);
    return data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getPinDetailByPid({
  pid,
}: {
  pid: string;
}): Promise<API.Pin | undefined> {
  const url = `${BASE_MAN_URL}/api/pin/${pid}`;

  try {
    const data = await axios.get(url).then((res) => res.data);
    return data.data;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function fetchMyFollowingTotal(params: {
  page: number;
  size: number;
  path: string;
  metaidList: string[];
}): Promise<number | null> {
  const url = `${BASE_MAN_URL}/api/getAllPinByPathAndMetaId`;

  try {
    const data = await axios.post(url, params).then((res) => res.data);
    return data.data.total;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchMyFollowingBuzzsWithTotal(params: {
  page: number;
  size: number;
  path: string;
  metaidList: string[];
}): Promise<{ total: number; currentPage: API.Pin[] } | null> {
  const url = `${BASE_MAN_URL}/api/getAllPinByPathAndMetaId`;

  try {
    const data = await axios.post(url, params).then((res) => res.data);
    return { total: data.data.total, currentPage: data.data.list };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchMyFollowingBuzzs(params: {
  page: number;
  size: number;
  path: string;
  metaidList: string[];
}): Promise<API.Pin[] | null> {
  const url = `${BASE_MAN_URL}/api/getAllPinByPathAndMetaId`;

  try {
    const data = await axios.post(url, params).then((res) => res.data);
    return data.data.list;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchFeeRate({
  netWork,
}: {
  netWork?: BtcNetwork;
}): Promise<API.FeeRateApi> {
  const response = await fetch(
    `https://api.mvcscan.com/browser/v1/fees/recommended?chain=btc`,
    {
      method: "get",
    }
  );
  return response.json();
}

export async function fetchMVCFeeRate({
  netWork,
}: {
  netWork?: BtcNetwork;
}): Promise<API.FeeRateApi> {
  const response = await fetch(
    `https://api.mvcscan.com/browser/v1/fees/recommended?net=${
      netWork === "mainnet" ? "livenet" : "testnet"
    }`,
    {
      method: "get",
    }
  );
  return response.json();
}

export async function getMetaidByAddress({
  address,
}: {
  address: string;
}): Promise<{ metaid: string } | undefined> {
  const url = `${BASE_MAN_URL}/api/info/address/${address}`;

  try {
    const data = await axios.get(url).then((res) => res.data);
    return data.data;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function getPubKey(): Promise<string> {
  const url = `${BASE_MAN_URL}/api/access/getPubKey`;

  try {
    const data = await axios.get(url).then((res) => res.data);
    return data.data;
  } catch (error) {
    console.error(error);
    return "";
  }
}

export const fetchAllBuzzs = async (params: {
  size: number;
  lastId?: string;
  metaid?: string;
  followed?: string;
}) => {
  return request<API.BuzzListRet>(`${BASE_MAN_URL}/social/buzz/newest`, {
    method: "GET",
    params,
  });
};
export const fetchAllHotBuzzs = async (params: {
  size: number;
  lastId?: string;
}) => {
  return request<API.BuzzListRet>(`${BASE_MAN_URL}/social/buzz/hot`, {
    method: "GET",
    params,
  });
};

export const fetchAllRecommendBuzzs = async (params: {
  size: number;
  lastId?: string;
  userAddress?: string;
}) => {
  return request<API.BuzzListRet>(`${BASE_MAN_URL}/social/buzz/recommended`, {
    method: "GET",
    params,
  });
};

export const searchBuzzs = async (params: {
  size: number;
  lastId?: string;
  key: string;
}) => {
  return request<API.BuzzListRet>(`${BASE_MAN_URL}/social/buzz/search`, {
    method: "GET",
    params,
  });
};

export const fetchBuzzDetail = async (params: { pinId: string }) => {
  return request<API.BuzzDetailRet>(`${BASE_MAN_URL}/social/buzz/info`, {
    method: "GET",
    params,
  });
};

export const getControlByContentPin = async (params: { pinId: string }) => {
  return request<API.ControlByContentPinRet>(
    `${BASE_MAN_URL + "/api/access/getControlByContentPin"}`,
    {
      method: "GET",
      params,
    }
  );
};

export const getDecryptContent = async (
  params: {
    publickey: string;
    address: string;
    sign: string;
    timestamp: number;
    pinId: string;
    controlPath: string;
    controlPinId: string;
  },
  manDomain: string
) => {
  manDomain = manDomain === "show.now" ? "www.show.now" : manDomain;
  const Host = manDomain ? `https://${manDomain}/man` : BASE_MAN_URL;
  return request<{
    code: number;
    data: {
      contentResult: string;
      filesResult: string[];
      status: API.PayStatus;
    };
  }>(`${Host + "/api/access/decrypt"}`, {
    method: "POST",
    data: params,
    headers:{
      "content-type": "text/plain",
    }
  });
};

export const getUserInfo = async (params: { address: string }) => {
  const ret = await request<{
    code: number;
    data: UserInfo;
  }>(`${getHostByNet(curNetwork)}/api/info/address/${params.address}`, {
    method: "GET",
  });
  return ret.data ?? undefined;
};

export const getMRC20Info = async (params: { id?: string; tick?: string }) => {
  return request<{
    code: number;
    data: API.MRC20TickInfo;
  }>(
    `${curNetwork === "testnet" ? BASE_MAN_URL : MAINNET_MAN_HOST_V1}/api/mrc20/tick/info`,
    {
      method: "GET",
      params,
    }
  );
};

// export const getIDCoinInfo = async (params: {
//   issuerAddress?: string;
//   tick?: string;
// }) => {
//   return request<{
//     code: number;
//     data: API.IdCoin;
//     message: string;
//   }>(`${BASE_IDCOIN_URL}/api/v1/id-coins/coins-info`, {
//     method: "GET",
//     params,
//   });
// };

export const getDeployList = async (params: {
  address?: string;
  tickType: string;
}) => {
  return request<{
    code: number;
    data: API.IdCoin[];
    message: string;
  }>(
    `${curNetwork === "testnet" ? BASE_MAN_URL : MAINNET_MAN_HOST_V1}/ft/mrc20/address/deploy-list`,
    {
      method: "GET",
      params,
    }
  );
};

export const getFollowList = async (params: { metaid: string }) => {
  return request<{
    code: number;
    data: {
      list: API.FollowingItem[];
    };
    message: string;
  }>(`${BASE_MAN_URL}/social/buzz/follow`, {
    method: "GET",
    params,
  });
};

export const getUserNFTCollections = async (params: {
  address: string;
  cousor: number;
  size: number;
}) => {
  return request<{
    code: number;
    data: {
      list: API.NFTCollection[];
    };
    message: string;
  }>(`${BASE_MAN_URL}/api/mrc721/address/collection`, {
    method: "GET",
    params,
  });
};

export const getUserNFTCollectionItems = async (params: {
  address: string;
  cousor: number;
  size: number;
  pinId: string;
}) => {
  return request<{
    code: number;
    data: {
      list: API.NFT[];
    };
    message: string;
  }>(`${BASE_MAN_URL}/api/mrc721/address/item`, {
    method: "GET",
    params,
  });
};

export const getNFTItem = async (params: { pinId: string }) => {
  return request<{
    code: number;
    data: API.NFT;
    message: string;
  }>(`${BASE_MAN_URL}/api/mrc721/item/info`, {
    method: "GET",
    params,
  });
};

export const getMetaBlockHostValue = async (params: {
  size: number;
  cursor: number;
  host: string;
  timeBegin?: number;
  timeEnd?: number;
  heightBegin?: number;
  heightEnd?: number;
}) => {
  return request<{
    code: number;
    data: {
      list: API.MetaBlockValueItem[];
      total: number;
    };
    message: string;
  }>(`${TMP_BASE_URL}/statistics/metablock/host/value`, {
    method: "GET",
    params,
  });
};

export const getMetaBlockHostUserValue = async (params: {
  size: number;
  cursor: number;
  host: string;
  address: string;
  timeBegin?: number;
  timeEnd?: number;
  heightBegin?: number;
  heightEnd?: number;
}) => {
  return request<{
    code: number;
    data: {
      list: API.MetaBlockUserValueItem[];
      total: number;
    };
    message: string;
  }>(`${TMP_BASE_URL}/statistics/metablock/host/address/value`, {
    method: "GET",
    params,
  });
};
export const getMetaBlockHostUserList = async (params: {
  size: number;
  cursor: number;
  host: string;
  timeBegin?: number;
  timeEnd?: number;
  heightBegin?: number;
  heightEnd?: number;
}) => {
  return request<{
    code: number;
    data: {
      list: API.MetaBlockValueListItem[];
      total: number;
    };
    message: string;
  }>(`${TMP_BASE_URL}/statistics/metablock/host/address/list`, {
    method: "GET",
    params,
  });
};

export const getMetaBlockNewest = async () => {
  return request<{
    code: number;
    data: API.MetaBlockNewest;
    message: string;
  }>(`${TMP_BASE_URL}/statistics/host/metablock/sync-newest`, {
    method: "GET",
  });
};

export const getHostNDV = async (params: {
  host: string;
  size: number;
  cursor: number;
}) => {
  return request<{
    code: number;
    data: API.MetaBlockValueListItem[];
    message: string;
  }>(`${TMP_BASE_URL}/statistics/ndv`, {
    method: "GET",
    params,
  });
};

export const getBlockedList = async (params: {
  blockType: string;
  size: number;
  cursor: number;
}) => {
  return request<{
    code: number;
    data: { list: API.BlockedItem[]; total: number };
    message: string;
  }>(`${BASE_MAN_URL}/metaso/settings/blocked/list`, {
    method: "GET",
    params,
    headers: {
      "X-Signature": localStorage.getItem(DASHBOARD_SIGNATURE) || "",
      "X-Public-Key": localStorage.getItem(DASHBOARD_ADMIN_PUBKEY) || "",
    },
  });
};

export const getRecommendedList = async (params: {
  size: number;
  cursor: number;
}) => {
  return request<{
    code: number;
    data: { list: API.BlockedItem[]; total: number };
    message: string;
  }>(`${BASE_MAN_URL}/metaso/settings/recommended/list`, {
    method: "GET",
    params,
    headers: {
      "X-Signature": localStorage.getItem(DASHBOARD_SIGNATURE) || "",
      "X-Public-Key": localStorage.getItem(DASHBOARD_ADMIN_PUBKEY) || "",
    },
  });
};

export const addBlockedItem = async (params: {
  blockType: string;
  blockContent: string;
}) => {
  return request<{
    code: number;
    message: string;
  }>(`${BASE_MAN_URL}/metaso/settings/blocked/add`, {
    method: "GET",
    params,
    headers: {
      "X-Signature": localStorage.getItem(DASHBOARD_SIGNATURE) || "",
      "X-Public-Key": localStorage.getItem(DASHBOARD_ADMIN_PUBKEY) || "",
    },
  });
};

export const addRecommendedItem = async (params: {
  authorAddress: string;
  authorName: string;
}) => {
  return request<{
    code: number;
    message: string;
  }>(`${BASE_MAN_URL}/metaso/settings/recommended/add`, {
    method: "GET",
    params,
    headers: {
      "X-Signature": localStorage.getItem(DASHBOARD_SIGNATURE) || "",
      "X-Public-Key": localStorage.getItem(DASHBOARD_ADMIN_PUBKEY) || "",
    },
  });
};

export const deleteBlockedItem = async (params: {
  blockType: string;
  blockContent: string;
}) => {
  return request<{
    code: number;
    message: string;
  }>(`${BASE_MAN_URL}/metaso/settings/blocked/delete`, {
    method: "GET",
    params,
    headers: {
      "X-Signature": localStorage.getItem(DASHBOARD_SIGNATURE) || "",
      "X-Public-Key": localStorage.getItem(DASHBOARD_ADMIN_PUBKEY) || "",
    },
  });
};

export const deleteRecommendedItem = async (params: {
  authorAddress: string;
}) => {
  return request<{
    code: number;
    message: string;
  }>(`${BASE_MAN_URL}/metaso/settings/recommended/delete`, {
    method: "GET",
    params,
    headers: {
      "X-Signature": localStorage.getItem(DASHBOARD_SIGNATURE) || "",
      "X-Public-Key": localStorage.getItem(DASHBOARD_ADMIN_PUBKEY) || "",
    },
  });
};

export const getVersionInfo = async () => {
  return request<{
    code: number;
    message: string;
    data: {
      curNo: number;
      curVer: string;
      lastNo: number;
      lastVer: string;
      serverUrl: string;
      mandatory: boolean;
    };
  }>(`${BASE_MAN_URL}/social/buzz/updater`, {
    method: "GET",
  });
};

export async function getUserMrc20List(
  params: {
    address: string;
    cursor: number;
    size: number;
  },
  options?: { [key: string]: any }
) {
  if (!params.address)
    return Promise.resolve({ code: 0, data: { list: [], total: 0 } });
  return request<{
    code: number;
    data: {
      list: API.UserMrc20Asset[];
    };
    message: string;
  }>(`${BASE_MAN_URL}/api/mrc20/address/balance/${params.address}`, {
    method: "GET",
    params: {
      cursor: params.cursor,
      size: params.size,
    },
    ...(options || {}),
  });
}

export async function getMrc20AddressUtxo(
  params: {
    address: string;
    tickId: string;
    cursor: number;
    size: number;
  },
  options?: { [key: string]: any }
) {
  return request<API.ListRet<API.Mrc20AddressUtxo>>(
    `${MARKET_ENDPOINT}/api/v1/common/mrc20/address/utxo`,
    {
      method: "GET",
      params,
      ...(options || {}),
    }
  );
}

export async function transfertMrc20Pre(
  params: API.TransferMRC20PreReq,
  options?: { [key: string]: any }
) {
  return request<API.Ret<API.TransferMRC20PreRes>>(
    `${METASO_BASE_API}/v1/inscribe/mrc20/transfer/pre`,
    {
      method: "POST",
      data: params,
      ...(options || {}),
    }
  );
}

export async function transferMrc20Commit(
  params: {
    orderId: string;
    commitTxRaw: string;
    commitTxOutIndex: number; //commit交易中RevealAddress的output索引
    revealPrePsbtRaw: string;
  },
  options?: { [key: string]: any }
) {
  return request<
    API.Ret<{
      orderId: string;
      commitTxId: string;
      revealTxId: string;
    }>
  >(`${METASO_BASE_API}/v1/inscribe/mrc20/transfer/commit`, {
    method: "POST",
    data: params,
    ...(options || {}),
  });
}

export async function getMetasoConf(options?: { [key: string]: any }) {
  return request<{
    code: number;
    data: {
      blockedHost: string[] | null;
      chain: string;
      initialHeight: {
        btc: number;
        mvc: number;
      };
      syncHost: string[] | null;
    };
    message: string;
  }>(`${BASE_MAN_URL}/api/config/get`, {
    method: "GET",
    headers: {
      "X-Signature": localStorage.getItem(DASHBOARD_SIGNATURE) || "",
      "X-Public-Key": localStorage.getItem(DASHBOARD_ADMIN_PUBKEY) || "",
    },
    ...(options || {}),
  });
}

export async function setMetasoConfChain(
  params: {
    chain: string;
  },
  options?: { [key: string]: any }
) {
  return request<{
    code: number;
    message: string;
  }>(`${BASE_MAN_URL}/api/config/chain`, {
    method: "GET",
    params,
    headers: {
      "X-Signature": localStorage.getItem(DASHBOARD_SIGNATURE) || "",
      "X-Public-Key": localStorage.getItem(DASHBOARD_ADMIN_PUBKEY) || "",
    },
    ...(options || {}),
  });
}

export async function setMetasoConfSyncHost(
  params: {
    host: string;
  },
  options?: { [key: string]: any }
) {
  return request<{
    code: number;
    message: string;
  }>(`${BASE_MAN_URL}/api/config/syncHost`, {
    method: "GET",
    params,
    headers: {
      "X-Signature": localStorage.getItem(DASHBOARD_SIGNATURE) || "",
      "X-Public-Key": localStorage.getItem(DASHBOARD_ADMIN_PUBKEY) || "",
    },
    ...(options || {}),
  });
}

export async function setMetasoConfBlockedHost(
  params: {
    host: string;
  },
  options?: { [key: string]: any }
) {
  return request<{
    code: number;
    message: string;
  }>(`${BASE_MAN_URL}/api/config/blockedHost`, {
    method: "GET",
    params,
    headers: {
      "X-Signature": localStorage.getItem(DASHBOARD_SIGNATURE) || "",
      "X-Public-Key": localStorage.getItem(DASHBOARD_ADMIN_PUBKEY) || "",
    },
    ...(options || {}),
  });
}

export async function setMetasoConfInitialHeight(
  params: {
    chain: string;
    height: string;
  },
  options?: { [key: string]: any }
) {
  return request<{
    code: number;
    message: string;
  }>(`${BASE_MAN_URL}/api/config/initialHeight`, {
    method: "GET",
    params,
    headers: {
      "X-Signature": localStorage.getItem(DASHBOARD_SIGNATURE) || "",
      "X-Public-Key": localStorage.getItem(DASHBOARD_ADMIN_PUBKEY) || "",
    },
    ...(options || {}),
  });
}

export async function setMetasoConfPubkey(
  params: {
    key: string;
  },
  options?: { [key: string]: any }
) {
  return request<{
    code: number;
    message: string;
  }>(`${BASE_MAN_URL}/api/config/pubkey`, {
    method: "GET",
    params,
    headers: {
      "X-Signature": localStorage.getItem(DASHBOARD_SIGNATURE) || "",
      "X-Public-Key": localStorage.getItem(DASHBOARD_ADMIN_PUBKEY) || "",
    },
    ...(options || {}),
  });
}

export const getUserNotify = async (params: {
  address: string;
  lastId: string;
  size?: number;
}) => {
  const ret = await request<{
    code: number;
    data: Notification[];
  }>(`${getHostByNet(curNetwork)}/api/notifcation/list`, {
    method: "GET",
    params,
  });
  return ret;
};

export const getReplyContent = async (params: { pinId: string }) => {
  const ret = await request<{
    code: number;
    data: Notification[];
  }>(`${getHostByNet(curNetwork)}/content/${params.pinId}`, {
    method: "GET",
  });
  return ret;
};

export const getRewardContent = async (params: { pinId: string }) => {
  const ret = await request<{
    coinType: "mvc" | "btc";
    amount: number;
    message: string;
  }>(`${getHostByNet(curNetwork)}/content/${params.pinId}`, {
    method: "GET",
  });
  return ret;
};

export async function broadcast(
  tx: string,
  chain?: string,
  net?: string
): Promise<any> {
  const network = curNetwork;

  const body = JSON.stringify({ rawTx: tx, net: network, chain: chain });
  return await fetch(`https://www.metalet.space/wallet-api/v3/tx/broadcast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  })
    .then((res) => res.json())
    .then((res) => {
      console.log({ res });
      return res;
    })
    .then((result) => {
      if (result.code == 0) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    })
    .catch((e) => {
      throw new Error(e);
    });
}

export const fetchBuzzContent = async (params: { pinId: string }) => {
  return request<SimpleBuzz | PayBuzz>(
    `${getHostByNet(curNetwork)}/content/${params.pinId}`,
    {
      method: "GET",
    }
  );
};
