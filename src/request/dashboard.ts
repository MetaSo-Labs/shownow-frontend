import { DASHBOARD_API, DASHBOARD_TOKEN } from "@/config";
import { request } from "umi";
export async function login(
  params: {
    username: string;
    password: string;
  },
  options?: { [key: string]: any }
) {
  return request<any>(`${DASHBOARD_API}/auth/login`, {
    method: "POST",
    data: params,
    ...(options || {}),
  });
}

export async function fetchShowConf() {
  return request<DB.ShowConfDto>(`${DASHBOARD_API}/show-conf`, {
    method: "GET",
  });
}

export async function saveConf(
    params: DB.ShowConfDto,
    options?: { [key: string]: any }
  ) {
    return request<any>(`${DASHBOARD_API}/show-conf`, {
      method: "POST",
      data: params,
      ...(options || {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem(DASHBOARD_TOKEN)
        }
      }),
    });
  }
