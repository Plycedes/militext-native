import { apiClient } from "./apiClient";

const loginUser = (data: { username: string; password: string }) => {
    return apiClient.post("/users/login", data);
};

const registerUser = (data: { email: string; password: string; username: string }) => {
    return apiClient.post("/users/register", data);
};

const logoutUser = () => {
    return apiClient.post("/users/logout");
};

const getCurrentUser = () => {
    return apiClient.get("/users/current-user");
};

const getAvailableUsers = () => {
    return apiClient.get("/chats/users");
};

const getUserChats = () => {
    return apiClient.get(`/chats`);
};

const createUserChat = (receiverId: string) => {
    return apiClient.post(`/chats/c/${receiverId}`);
};

const createGroupChat = (data: { name: string; participants: string[] }) => {
    return apiClient.post(`/chats/group`, data);
};

const getGroupInfo = (chatId: string) => {
    return apiClient.get(`/chats/group/${chatId}`);
};

const updateGroupName = (chatId: string, name: string) => {
    return apiClient.patch(`/chats/group/${chatId}`, { name });
};

const deleteGroup = (chatId: string) => {
    return apiClient.delete(`/chats/group/${chatId}`);
};

const deleteOneOnOneChat = (chatId: string) => {
    return apiClient.delete(`/chats/remove/${chatId}`);
};

const addParticipantToGroup = (chatId: string, participantId: string) => {
    return apiClient.post(`/chats/group/${chatId}/${participantId}`);
};

const removeParticipantFromGroup = (chatId: string, participantId: string) => {
    return apiClient.delete(`/chats/group/${chatId}/${participantId}`);
};

const getChatMessages = (chatId?: string, page: number = 1, limit: number = 20) => {
    return apiClient.get(`/messages/${chatId}?page=${page}&limit=${limit}`);
};

const sendMessage = (chatId: string, content: string, attachments: File[]) => {
    const formData = new FormData();
    if (content) {
        formData.append("content", content);
    }
    attachments?.map((file) => {
        formData.append("attachments", file);
    });
    return apiClient.post(`/messages/${chatId}`, formData);
};

const deleteMessage = (chatId: string, messageId: string) => {
    return apiClient.delete(`/messages/${chatId}/${messageId}`);
};

export {
    addParticipantToGroup,
    createGroupChat,
    createUserChat,
    deleteGroup,
    deleteMessage,
    deleteOneOnOneChat,
    getAvailableUsers,
    getChatMessages,
    getCurrentUser,
    getGroupInfo,
    getUserChats,
    loginUser,
    logoutUser,
    registerUser,
    removeParticipantFromGroup,
    sendMessage,
    updateGroupName,
};
