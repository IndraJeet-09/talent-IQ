import axios from "axios"

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
})

let tokenGetter = null;

export const setTokenGetter = (getter) => {
    tokenGetter = getter;
};

axiosInstance.interceptors.request.use(async (config) => {
    if (tokenGetter) {
        const token = await tokenGetter();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default axiosInstance;