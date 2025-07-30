const BACKEND_HOST_URL = "http://localhost:8080";
const API = "/lms/api";
export const getBaseurl = (url: string) => `${BACKEND_HOST_URL}${API}${url}`;
