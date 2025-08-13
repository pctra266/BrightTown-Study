import axios from "axios";

const api = axios.create({
  baseURL: "https://group-03-learning-social-media-json.vercel.app",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
