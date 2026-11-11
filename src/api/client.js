import axios from "axios";

// 백엔드 주소 — 환경변수가 없으면 배포 서버를 기본으로 쓴다
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://k1min.site";

const client = axios.create({
  baseURL: API_BASE_URL,
});

export default client;
