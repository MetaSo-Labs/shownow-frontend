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

export async function loginWithWallet(
  params: DB.LoginWithWallerDto,
  options?: { [key: string]: any }
) {
  return request<any>(`${DASHBOARD_API}/auth/loginWithWallet`, {
    method: "POST",
    data: params,
    ...(options || {}),
  });
}

export async function fetchAdmin() {
  return request<DB.LoginWithWallerDto>(`${DASHBOARD_API}/users/admin`, {
    method: "GET",
  });
}

export async function fetchShowConf() {
  return request<DB.ShowConfDto>(`${DASHBOARD_API}/show-conf`, {
    method: "GET",
  });
}

export async function fetchFees() {
  return request<DB.FeeDto[]>(`${DASHBOARD_API}/fees`, {
    method: "GET",
  });
}

export async function saveFees(
  id: number,
  params: DB.FeeDto,
  options?: { [key: string]: any }
) {
  return request<DB.FeeDto[]>(`${DASHBOARD_API}/fees/${id}`, {
    method: 'PATCH',
    data: params,
    ...(options || {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem(DASHBOARD_TOKEN),
      },
    }),
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
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem(DASHBOARD_TOKEN),
      },
    }),
  });
}
