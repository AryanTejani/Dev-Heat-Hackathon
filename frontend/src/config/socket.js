import { io } from "socket.io-client";

let socketInstance = null;

export const initializeSocket = (projectId) => {
  socketInstance = io(import.meta.env.VITE_API_URL, {
    auth: {
      token: localStorage.getItem("token"),
    },
    query: {
      projectId,
    },
  });

  return socketInstance;
};

export const receiveMessage = (eventName, cb) => {
  if (!socketInstance) return;
  socketInstance.on(eventName, cb);
};

export const sendMessage = (eventName, data) => {
  if (!socketInstance) return;
  socketInstance.emit(eventName, data);
};

export const emitMessageDeleted = (messageId) => {
  if (!socketInstance) return;
  socketInstance.emit("message-deleted", { messageId });
};

export const emitHistoryCleared = (projectId) => {
  if (!socketInstance) return;
  socketInstance.emit("history-cleared", { projectId });
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const getSocket = () => socketInstance;
