import { apiClient } from "./apiClient";

const loginUser = (data: { username: string; password: string }) => {
    return apiClient.post("/users/login", data);
};

const registerUser = (data: { email: string; password: string; username: string }) => {
    return apiClient.post("/users/register", data);
};

const currentUser = () => {
    return apiClient.get("/users/current-user");
};

const logoutUser = () => {
    return apiClient.post("/users/logout");
};

const updateUserPfp = (data: any) => {
    return apiClient.post("/users/update-avatar", data);
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

const getChatMessages = (chatId?: string, before: string = "", limit: number = 20) => {
    return apiClient.get(`/messages/${chatId}?before=${before}&limit=${limit}`);
};

const deleteMessage = (chatId: string, messageId: string) => {
    return apiClient.delete(`/messages/${chatId}/${messageId}`);
};

const sendEmail = (email: string) => {
    return apiClient.post("/emails/send-email", { email });
};

const verifyEmail = (email: string, code: string) => {
    return apiClient.post("/emails/verify-email", { email, code });
};

const resetPassword = (newPassword: string) => {
    return apiClient.post("/users/reset-password", { newPassword });
};

const checkUsername = (username: string) => {
    return apiClient.get(`/users/check-username/${username}`);
};

const checkNumber = (number: string) => {
    return apiClient.get(`/users/check-number/${number}`);
};

const checkEmail = (email: string) => {
    return apiClient.get(`/users/check-email/${email}`);
};

export {
    addParticipantToGroup,
    checkEmail,
    checkNumber,
    checkUsername,
    createGroupChat,
    createUserChat,
    currentUser,
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
    resetPassword,
    sendEmail,
    updateGroupName,
    updateUserPfp,
    verifyEmail,
};
