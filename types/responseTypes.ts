import { UserInterface } from "./misc";

export interface Message {
    _id: string;
    sender: UserInterface;
    content: string;
    chat: string;
    createdAt: string;
    updatedAt: string;
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

const temp = {
    _id: "68bc7cba5178b598bbdd43a5",
    name: "One on one chat",
    isGroupChat: false,
    participants: [
        {
            _id: "68b945f8b23715abd0c0a65e",
            username: "steel",
            email: "blacksteelemperor@gmail.com",
            number: "1234567890",
            avatar: "https://res.cloudinary.com/dxsffcg6l/image/upload/v1756972536/rekfjjsbwiuvrnc7ruh8.png",
            avatarId: "rekfjjsbwiuvrnc7ruh8",
            createdAt: "2025-09-04T07:55:36.893Z",
            updatedAt: "2025-09-06T18:31:41.902Z",
            __v: 0,
        },
        {
            _id: "68bc22050bb49603c8ee97f2",
            username: "netwatch",
            email: "yabhay380@gmail.com",
            number: "975181378469",
            avatar: "https://res.cloudinary.com/dxsffcg6l/image/upload/v1757159942/vk8wfjjyd4gklhd1tqyx.png",
            avatarId: "vk8wfjjyd4gklhd1tqyx",
            createdAt: "2025-09-06T11:59:01.028Z",
            updatedAt: "2025-09-06T18:38:42.590Z",
            __v: 0,
        },
    ],
    admin: "68bc22050bb49603c8ee97f2",
    createdAt: "2025-09-06T18:26:02.974Z",
    updatedAt: "2025-09-06T18:40:37.314Z",
    __v: 0,
    lastMessage: {
        _id: "68bc8024686273cefbfc3829",
        sender: {
            _id: "68bc22050bb49603c8ee97f2",
            username: "netwatch",
            email: "yabhay380@gmail.com",
            avatar: "https://res.cloudinary.com/dxsffcg6l/image/upload/v1757159942/vk8wfjjyd4gklhd1tqyx.png",
        },
        content: "Hi there",
        chat: "68bc7cba5178b598bbdd43a5",
        attachments: [],
        createdAt: "2025-09-06T18:40:36.939Z",
        updatedAt: "2025-09-06T18:40:36.939Z",
        __v: 0,
    },
    userChat: {
        _id: "68bc7cbb5178b598bbdd43a7",
        lastRead: "2025-09-06T18:26:03.073Z",
        unreadCount: 0,
    },
};
