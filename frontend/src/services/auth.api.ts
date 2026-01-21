import { api } from "./axios";
import { tokenStore } from "./token";

export const authApi = {
  async login(email: string, password: string) {
    // BE: { success: true, data: { accessToken, user } }
    const res = await api.post("/auth/login", { email, password });
    const accessToken = res?.data?.data?.accessToken as string | undefined;
    if (accessToken) tokenStore.setAccessToken(accessToken);
    return res.data;
  },

  async me() {
    // skeleton BE: /users/me
    const res = await api.get("/users/me");
    return res.data;
  },

  async refresh() {
    // gọi explicit refresh để restore session khi F5
    const res = await api.post("/auth/refresh");
    const accessToken = res?.data?.data?.accessToken as string | undefined;
    if (accessToken) tokenStore.setAccessToken(accessToken);
    return res.data;
  },

  async logout() {
    const res = await api.post("/auth/logout");
    tokenStore.clear();
    return res.data;
  },
};
