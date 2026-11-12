import axios from "axios";
import { getClientId } from "@/utils/storage";

// 백엔드 주소 — 환경변수가 없으면 배포 서버를 기본으로 쓴다
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://k1min.site";

const client = axios.create({
  baseURL: API_BASE_URL,
});

// 게스트 구분용 — 모든 요청에 X-Client-Id 헤더 부착 (요청 본문은 그대로 둠)
client.interceptors.request.use((config) => {
  config.headers["X-Client-Id"] = getClientId();
  return config;
});

export default client;
