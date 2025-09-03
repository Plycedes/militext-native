import { Ionicons } from "@expo/vector-icons";

export interface UserInterface {
    _id: string;
    avatar: {
        url: string;
        _id: string;
    };
    username: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthContextType {
    user: UserInterface | null;
    token: string | null;
    login: (data: { username: string; password: string }) => Promise<void>;
    register: (data: {
        email: string;
        username: string;
        number: string;
        password: string;
    }) => Promise<void>;
    logout: () => Promise<void>;
}

export interface Chat {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    isOnline: boolean;
    isGroup: boolean;
    avatar?: string;
    participants?: number;
}

export interface DropdownOption {
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    action: () => void;
}
