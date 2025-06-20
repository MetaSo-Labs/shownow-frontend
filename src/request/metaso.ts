import {
  DASHBOARD_ADMIN_PUBKEY,
  DASHBOARD_SIGNATURE,
  METASO_BASE_API,
} from "@/config";
import { request } from "umi";

export async function fetchCoinSummary() {
  return request<MS.IRet<MS.CoinSummary>>(
    `${METASO_BASE_API}/v1/metaso/coin/summary`,
    {
      method: "GET",
    }
  );
}

export async function fetchDomianList(params: {
  cursor: number;
  size: number;
}) {
  return request<
    MS.IRet<{
      list: {
        domain: string;
        host: string;
      }[];
      total: number;
    }>
  >(`${METASO_BASE_API}/v1/metaso/host/domain-list`, {
    method: "GET",
    params,
  });
}

export async function fetchAreaInfo(params: { host: string }) {
  return request<MS.IRet<MS.AreaInfo>>(
    `${METASO_BASE_API}/v1/metaso/coin/area-info`,
    {
      method: "GET",
      params,
      headers: {
        "X-Signature": localStorage.getItem(DASHBOARD_SIGNATURE) || "",
        "X-Public-Key": localStorage.getItem(DASHBOARD_ADMIN_PUBKEY) || "",
      },
    }
  );
}

export async function fetchMetaBlockList(params: {
  cursor: number;
  size: number;
  host?: string;
}) {
  return request<
    MS.IRet<{
      list: MS.MetaBlock[];
      total: number;
    }>
  >(`${METASO_BASE_API}/v1/metaso/metablock-list`, {
    method: "GET",
    params,
  });
}

export async function fetchMetaBlockAreaInfo(params: { host: string }) {
  return request<MS.IRet<MS.MetaBlockAreaInfo>>(
    `${METASO_BASE_API}/v1/metaso/metablock/area-info`,
    {
      method: "GET",
      params,
      headers: {
        "X-Signature": localStorage.getItem(DASHBOARD_SIGNATURE) || "",
        "X-Public-Key": localStorage.getItem(DASHBOARD_ADMIN_PUBKEY) || "",
      },
    }
  );
}

export async function claimPre(
  params: {
    claimAmount: string;
    networkFeeRate: number;
    receiveAddress: string;
  },
  options?: { [key: string]: any }
) {
  return request<MS.IRet<MS.ClaimPreRes>>(
    `${METASO_BASE_API}/v1/metaso/coin/claim/pre`,
    {
      method: "POST",
      data: params,
      ...(options || {}),
      headers: {
        "X-Signature": localStorage.getItem(DASHBOARD_SIGNATURE) || "",
        "X-Public-Key": localStorage.getItem(DASHBOARD_ADMIN_PUBKEY) || "",
      },
    }
  );
}

export async function claimPreUser(
  params: {
    claimAmount: string;
    host: string;
    networkFeeRate: number;
    receiveAddress: string;
  },
  options?: { [key: string]: any }
) {
  return request<MS.IRet<MS.ClaimPreRes>>(
    `${METASO_BASE_API}/v1/metaso/coin/user/claim/pre`,
    {
      method: "POST",
      data: params,
      ...(options || {}),
    }
  );
}

export async function claimCommit(
  params: {
    commitTxOutIndex: number;
    commitTxRaw: string;
    orderId: string;
  },
  options?: { [key: string]: any }
) {
  return request<MS.IRet<MS.ClaimCommitRes>>(
    `${METASO_BASE_API}/v1/metaso/coin/claim/commit`,
    {
      method: "POST",
      data: params,
      ...(options || {}),
      headers: {
        "X-Signature": localStorage.getItem(DASHBOARD_SIGNATURE) || "",
        "X-Public-Key": localStorage.getItem(DASHBOARD_ADMIN_PUBKEY) || "",
      },
    }
  );
}

export async function claimCommitUser(
  params: {
    commitTxOutIndex: number;
    commitTxRaw: string;
    orderId: string;
  },
  options?: { [key: string]: any }
) {
  return request<MS.IRet<MS.ClaimCommitRes>>(
    `${METASO_BASE_API}/v1/metaso/coin/user/claim/commit`,
    {
      method: "POST",
      data: params,
      ...(options || {}),
    }
  );
}

export async function getClaimRecords(
  params: {
    cursor: number;
    size: number;
    host: string;
  },
  options?: { [key: string]: any }
) {
  return request<
    MS.IRet<{
      list: MS.ClaimRecord[];
      total: number;
    }>
  >(`${METASO_BASE_API}/v1/metaso/coin/claim/records`, {
    method: "GET",
    params,
    ...(options || {}),
    headers: {
      "X-Signature": localStorage.getItem(DASHBOARD_SIGNATURE) || "",
      "X-Public-Key": localStorage.getItem(DASHBOARD_ADMIN_PUBKEY) || "",
    },
  });
}

export async function getUserClaimRecords(
  params: {
    cursor: number;
    size: number;
    address: string;
  },
  options?: { [key: string]: any }
) {
  return request<
    MS.IRet<{
      list: MS.UserClaimRecord[];
      total: number;
    }>
  >(`${METASO_BASE_API}/v1/metaso/coin/user/claim/records`, {
    method: "GET",
    params,
    ...(options || {}),
  });
}

export async function setDistribution(params: {
  host: string;
  distributionRate: number;
}) {
  return request<MS.IRet<{}>>(
    `${METASO_BASE_API}/v1/metaso/coin/distribution/config-set`,
    {
      method: "POST",
      data: params,
      headers: {
        "X-Signature": localStorage.getItem(DASHBOARD_SIGNATURE) || "",
        "X-Public-Key": localStorage.getItem(DASHBOARD_ADMIN_PUBKEY) || "",
      },
    }
  );
}

export async function getDistribution(params: { host: string }) {
  return request<
    MS.IRet<{
      distributionRate: number;
      host: string;
    }>
  >(`${METASO_BASE_API}/v1/metaso/coin/distribution/config-info`, {
    method: "GET",
    params,
    headers: {
      "X-Signature": localStorage.getItem(DASHBOARD_SIGNATURE) || "",
      "X-Public-Key": localStorage.getItem(DASHBOARD_ADMIN_PUBKEY) || "",
    },
  });
}

export async function fetchUserCoinInfo(params: {
  address: string;
  host: string;
}) {
  return request<
    MS.IRet<{
      claimedReward: string;
      currentExpectedMetaBlockReward: string;
      currentMetaBlockPerReward: string;
      lastMetaBlockReward: string;
      lastMetaBlockShare: string;
      pendingReward: string;
      totalReward: string;
      currentUserExpectedPendingReward: string;
      claimableReward: string;
      newlyAddedMetaBlockReward: string;
      newlyAddedMetaBlockShare: string;
      progressRemainBlockCount: number;
    }>
  >(`${METASO_BASE_API}/v1/metaso/coin/user/info`, {
    method: "GET",
    params,
    headers: {
      "X-Signature": localStorage.getItem(DASHBOARD_SIGNATURE) || "",
      "X-Public-Key": localStorage.getItem(DASHBOARD_ADMIN_PUBKEY) || "",
    },
  });
}

export async function fetchUserMetablockList(params: {
  address: string;
  host: string;
}) {
  return request<
    MS.IRet<{
      list: MS.MetaBlockListItem[];
      total: 0;
    }>
  >(`${METASO_BASE_API}/v1/metaso/coin/user/metablock-list`, {
    method: "GET",
    params,
    headers: {
      "X-Signature": localStorage.getItem(DASHBOARD_SIGNATURE) || "",
      "X-Public-Key": localStorage.getItem(DASHBOARD_ADMIN_PUBKEY) || "",
    },
  });
}
