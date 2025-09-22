import { apiClient } from "./apiClient";

class AuthAPI {
    static loginUser = (data: { username: string; password: string }) => {
        return apiClient.post("/users/login", data);
    };

    static registerUser = (data: { email: string; password: string; username: string }) => {
        return apiClient.post("/users/register", data);
    };

    static resetPassword = (newPassword: string) => {
        return apiClient.post("/users/reset-password", { newPassword });
    };

    static logoutUser = () => {
        return apiClient.post("/users/logout");
    };

    static sendEmail = (email: string) => {
        return apiClient.post("/emails/send-email", { email });
    };

    static verifyEmail = (email: string, code: string) => {
        return apiClient.post("/emails/verify-email", { email, code });
    };
}

class UserAPI {
    static checkUsername = (username: string, verified: boolean = false) => {
        return apiClient.get(`/users${verified ? "/v" : ""}/check-username/${username}`);
    };

    static checkNumber = (number: string, verified: boolean = false) => {
        return apiClient.get(`/users${verified ? "/v" : ""}/check-number/${number}`);
    };

    static checkEmail = (email: string, verified: boolean = false) => {
        return apiClient.get(`/users${verified ? "/v" : ""}/check-email/${email}`);
    };

    static currentUser = () => {
        return apiClient.get("/users/current-user");
    };

    static updateUserPfp = (data: any) => {
        return apiClient.post("/users/update-avatar", data);
    };

    static updateUser = (data: any) => {
        return apiClient.post("/users/update", data);
    };
}

class MessageAPI {
    static getChatMessages = (chatId?: string, before: string = "", limit: number = 20) => {
        return apiClient.get(`/messages/${chatId}?before=${before}&limit=${limit}`);
    };

    static deleteMessage = (chatId: string, messageId: string) => {
        return apiClient.delete(`/messages/${chatId}/${messageId}`);
    };
}

class CommonChatAPI {
    static getUserChats = () => {
        return apiClient.get(`/chats`);
    };
}

class SingleChatAPI {
    static createUserChat = (receiverId: string) => {
        return apiClient.post(`/chats/c/${receiverId}`);
    };

    static getSingleInfo = (id?: string) => {
        return apiClient.get(`chats/c/${id}`);
    };

    static deleteOneOnOneChat = (chatId: string) => {
        return apiClient.delete(`/chats/remove/${chatId}`);
    };
}

class GroupChatAPI {
    static createGroupChat = (data: { name: string; numbers: string[] }) => {
        return apiClient.post(`/chats/group`, data);
    };

    static addParticipantToGroup = (chatId: string, participantId: string) => {
        return apiClient.post(`/chats/group/${chatId}/${participantId}`);
    };

    static removeParticipantFromGroup = (chatId: string, participantId: string) => {
        return apiClient.delete(`/chats/group/${chatId}/${participantId}`);
    };

    static promotToAdmin = (chatId: string, userId: string) => {
        return apiClient.post("/chats/group/promote", { chatId, userId });
    };

    static demoteFromAdmin = (chatId: string, userId: string) => {
        return apiClient.post("/chats/group/demote", { chatId, userId });
    };

    static updateGroupName = (chatId: string, name: string) => {
        return apiClient.patch(`/chats/group/${chatId}`, { name });
    };

    static deleteGroup = (chatId: string) => {
        return apiClient.delete(`/chats/group/${chatId}`);
    };

    static leaveGroup = (chatId: string) => {
        return apiClient.delete(`/leave/group/${chatId}`);
    };

    static getGroupInfo = (id?: string) => {
        return apiClient.get(`/chats/group/${id}`);
    };
}

export { AuthAPI, CommonChatAPI, GroupChatAPI, MessageAPI, SingleChatAPI, UserAPI };
