export const setAuth = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
  };
  
  export const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };
  
  export const getRole = () => {
    return localStorage.getItem("role");
  };
  
  export const isAuthenticated = () => {
    return !!localStorage.getItem("token");
  };
  export const getUserRole = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
  
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role;
    } catch {
      return null;
    }
  };
  