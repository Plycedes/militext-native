// @ts-ignore
import reactlogo from "../assets/images/react-logo.png";

// const BASE_API_URL = "https://militext-backend.onrender.com/api/v1";
// const BASE_SOCKET_URL = "https://militext-backend.onrender.com";

const BASE_API_URL = "https://43adf98edd61.ngrok-free.app/api/v1";
const BASE_SOCKET_URL = "https://43adf98edd61.ngrok-free.app";

export const ChatEventEnum = {
    CONNECTED_EVENT: "connected",
    DISCONNECT_EVENT: "disconnect",
    JOIN_CHAT_EVENT: "joinChat",
    LEAVE_CHAT_EVENT: "leaveChat",
    UPDATE_GROUP_NAME_EVENT: "updateGroupName",
    MESSAGE_RECEIVED_EVENT: "messageReceived",
    NEW_CHAT_EVENT: "newChat",
    SOCKET_ERROR_EVENT: "socketError",
    STOP_TYPING_EVENT: "stopTyping",
    TYPING_EVENT: "typing",
    MESSAGE_DELETE_EVENT: "messageDeleted",
    NEW_MESSAGE_EVENT: "newMessage",
} as const;

export { BASE_API_URL, BASE_SOCKET_URL, reactlogo };
