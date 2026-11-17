import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  path: "/socket.io",
  autoConnect: false,
  auth: (callback) => {
    callback({ token: localStorage.getItem("token") });
  },
});

export default socket;
