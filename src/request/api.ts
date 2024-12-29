import { BASE_IDCOIN_URL, BASE_MAN_URL } from "@/config";
import { IBtcConnector } from "@metaid/metaid";
import axios from "axios";
import { UserInfo } from "node_modules/@metaid/metaid/dist/types";
import { request } from "umi";
export type BtcNetwork = "mainnet" | "testnet" | "regtest";

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
      .get(`${BASE_MAN_URL}/api/metaid/followingList/${metaid}`, {
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
    `https://mempool.space/${
      netWork === "mainnet" ? "" : "testnet/"
    }api/v1/fees/recommended`,
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
  });
};

export const getUserInfo = async (params: { address: string }) => {
  const ret = await request<{
    code: number;
    data: UserInfo;
  }>(`${BASE_MAN_URL}/api/info/address/${params.address}`, {
    method: "GET",
  });
  return ret.data ?? undefined;
};

export const getMRC20Info = async (params: { id?: string; tick?: string }) => {
  return request<{
    code: number;
    data: API.MRC20TickInfo;
  }>(`${BASE_MAN_URL}/api/mrc20/tick/info`, {
    method: "GET",
    params,
  });
};

export const getIDCoinInfo = async (params: {
  issuerAddress?: string;
  tick?: string;
}) => {
  return request<{
    code: number;
    data: API.IdCoin;
    message: string;
  }>(`${BASE_IDCOIN_URL}/api/v1/id-coins/coins-info`, {
    method: "GET",
    params,
  });
};

export const getDeployList = async (params: {
  address?: string;
  tickType: string;
}) => {
  return request<{
    code: number;
    data: API.IdCoin[];
    message: string;
  }>(`${BASE_MAN_URL}/ft/mrc20/address/deploy-list`, {
    method: "GET",
    params,
  });
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
