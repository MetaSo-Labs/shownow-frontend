import { METASO_BASE_API } from "@/config";
import { request } from "umi";

export async function fetchCoinSummary() {
  return request<MS.IRet<MS.CoinSummary>>(
    `${METASO_BASE_API}/v1/metaso/coin/summary`,
    {
      method: "GET",
    }
  );
}

export async function fetchAreaInfo(params: { host: string }) {
  return request<MS.IRet<MS.AreaInfo>>(
    `${METASO_BASE_API}/v1/metaso/coin/area-info`,
    {
      method: "GET",
      params,
    }
  );
}

export async function fetchMetaBlockList(params: {
  cursor: number;
  size: number;
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
    }
  );
}
