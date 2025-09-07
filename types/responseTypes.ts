import { UserInterface } from "./misc";

export interface Message {
    _id: string;
    sender: UserInterface;
    content: string;
    chat: string;
    createdAt: string;
    updatedAt: string;
}

export interface MessagesResponse {
    messages: Message[];
    lastRead: string | null;
    page: number;
    limit: number;
    hasMore: boolean;
}

export interface UserChat {
    _id: string;
    lastRead: string;
    unreadCount: number;
}

export interface Chat {
    _id: string;
    name: string;
    isGroupChat: boolean;
    participants: UserInterface[];
    admin: string;
    createdAt: Date;
    updatedAt: Date;
    lastMessage: Message;
    userChat: UserChat;
}
