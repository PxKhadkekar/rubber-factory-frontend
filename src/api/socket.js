import { io } from "socket.io-client";

// Remove /api from the base URL to connect to the root domain where Socket.IO server lives
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, "");

export const socket = io(SOCKET_URL, {
  withCredentials: true,
});
