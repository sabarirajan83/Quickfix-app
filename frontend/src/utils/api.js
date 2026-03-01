import axios from "axios";

const api = axios.create({
  baseURL:
    "https://quickfix-eshnafcudrbdfch8.eastasia-01.azurewebsites.net/api",
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("quickfix_user"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
