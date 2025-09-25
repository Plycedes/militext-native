// @ts-ignore
import reactlogo from "../assets/images/react-logo.png";

// const BASE_API_URL = "https://militext-backend.onrender.com/api/v1";
// const BASE_SOCKET_URL = "https://militext-backend.onrender.com";

const BASE_API_URL = "https://undecreed-unspaciously-alaine.ngrok-free.dev/api/v1";
const BASE_SOCKET_URL = "https://undecreed-unspaciously-alaine.ngrok-free.dev";

// const BASE_API_URL = "http://localhost:8000/api/v1";
// const BASE_SOCKET_URL = "http://localhost:8000";

export const ChatEventEnum = {
    CONNECTED_EVENT: "connected",
    DISCONNECT_EVENT: "disconnect",
    JOIN_CHAT_EVENT: "joinChat",
    LEAVE_CHAT_EVENT: "leaveChat",
    UPDATE_GROUP_NAME_EVENT: "updateGroupName",
    MESSAGE_RECEIVED_EVENT: "messageReceived",
    MESSAGE_EDITED_EVENT: "messageEdited",
    MESSAGE_DELETE_EVENT: "messageDeleted",
    NEW_CHAT_EVENT: "newChat",
    SOCKET_ERROR_EVENT: "socketError",
    STOP_TYPING_EVENT: "stopTyping",
    TYPING_EVENT: "typing",
    NEW_MESSAGE_EVENT: "newMessage",
    SOCEKT_CONNECT_ERROR: "connectError",
    CHAT_DELETE_EVENT: "chatDeleted",
} as const;

export { BASE_API_URL, BASE_SOCKET_URL, reactlogo };
