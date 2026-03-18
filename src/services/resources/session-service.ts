import axios from "axios";

export const sessionService = {
  async setToken(token: string): Promise<void> {
    await axios.post("/api/session", { token });
  },

  async clearToken(): Promise<void> {
    await axios.delete("/api/session");
  }
};
