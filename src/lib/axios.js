import axios from "axios";


const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json"
    }
})

axiosInstance.interceptors.request.use(config => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    }
})

export default axiosInstance