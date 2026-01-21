import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { tokenStore } from "./token";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function processQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // gửi cookie refreshToken
  headers: { "Content-Type": "application/json" },
});

// attach access token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// gọi refresh (KHÔNG dùng api để tránh loop)
async function callRefresh(): Promise<string | null> {
  try {
    const res = await axios.post(
      `${API_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    const accessToken = res?.data?.data?.accessToken as string | undefined;
    if (!accessToken) return null;
    tokenStore.setAccessToken(accessToken);
    return accessToken;
  } catch {
    return null;
  }
}

// auto refresh on 401 then retry once
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (!token) return reject(error);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
      const newToken = await callRefresh();
      isRefreshing = false;

      if (!newToken) {
        tokenStore.clear();
        processQueue(null);
        return Promise.reject(error);
      }

      processQueue(newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);
