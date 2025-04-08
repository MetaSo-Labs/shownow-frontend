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

export async function fetchShowConfList(options?: { [key: string]: any }) {
  return request<DB.ShowConfDto[]>(`${DASHBOARD_API}/show-conf/styles`, {
    method: "GET",
    ...(options || {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem(DASHBOARD_TOKEN),
      },
    }),
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
    method: "PATCH",
    data: params,
    ...(options || {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem(DASHBOARD_TOKEN),
      },
    }),
  });
}

export async function saveDomain(
  params: Pick<DB.LoginWithWallerDto, "domainName">,
  options?: { [key: string]: any }
) {
  return request<{
    success: boolean;
  }>(`${DASHBOARD_API}/users/admin`, {
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

export async function saveIntro(
  params: Pick<DB.LoginWithWallerDto, "introduction">,
  options?: { [key: string]: any }
) {
  return request<{
    success: boolean;
  }>(`${DASHBOARD_API}/users/admin`, {
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

export async function saveConf(
  params: DB.ShowConfDto,
  options?: { [key: string]: any }
) {
  return request<any>(`${DASHBOARD_API}/show-conf/save`, {
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

export async function saveAndApply(
  params: DB.ShowConfDto,
  options?: { [key: string]: any }
) {
  return request<any>(`${DASHBOARD_API}/show-conf/saveAndApply`, {
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

export async function uploadIcon(
  params: FormData,
  options?: { [key: string]: any }
) {
  return request<any>(`${DASHBOARD_API}/users/ico`, {
    method: "POST",
    data: params,
    ...(options || {
      headers: {
        Authorization: "Bearer " + localStorage.getItem(DASHBOARD_TOKEN),
      },
    }),
  });
}

export async function setDistributionEnable(
  params: Pick<DB.LoginWithWallerDto, 'distribution'>,
  options?: { [key: string]: any }
) {
  return request<{
    success: boolean;
  }>(`${DASHBOARD_API}/users/admin-distribution`, {
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
export async function setAssistEnable(
  params: Pick<DB.LoginWithWallerDto, 'assist'>,
  options?: { [key: string]: any }
) {
  return request<{
    success: boolean;
  }>(`${DASHBOARD_API}/users/admin-assist`, {
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