export const isAuthenticated = () => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        return !!token
    } 
    return false
}