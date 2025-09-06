// app/chat/[id].tsx (or wherever you route it)
import { useAuth } from "@/context/AuthContext";
import useAxios from "@/hooks/useAxios";
import { UserInterface } from "@/types/misc";
import { Message, MessagesResponse } from "@/types/responseTypes";
import { getChatMessages } from "@/utils/apiMethods";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Easing,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type MenuOption = {
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    action: () => void;
};

const ChatPage: React.FC = () => {
    const { chatId, chatName } = useLocalSearchParams<{ chatId: string; chatName: string }>();
    const { user } = useAuth();
    const { data } = useAxios<MessagesResponse>(getChatMessages, chatId);

    const [input, setInput] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    // Animated dropdown (height + opacity for buttery open/close)
    const dropdownH = useRef(new Animated.Value(0)).current;
    const dropdownOpacity = useRef(new Animated.Value(0)).current;

    const menuOptions: MenuOption[] = useMemo(
        () => [
            {
                id: "search",
                label: "Neural Search",
                icon: "search-outline",
                action: () => Alert.alert("Neural Search", "Scanning knowledge lattice…"),
            },
            {
                id: "media",
                label: "Media Vault",
                icon: "images-outline",
                action: () => Alert.alert("Media Vault", "Opening archive…"),
            },
            {
                id: "mute",
                label: "Silence Node",
                icon: "volume-mute-outline",
                action: () => Alert.alert("Silenced", "Notifications muted for this channel."),
            },
            {
                id: "secure",
                label: "Secure Link",
                icon: "shield-checkmark-outline",
                action: () => Alert.alert("Secure Link", "Quantum handshake complete."),
            },
            {
                id: "details",
                label: "Channel Details",
                icon: "information-circle-outline",
                action: () => Alert.alert("Channel", `Channel ID: ${chatId ?? "N/A"}`),
            },
        ],
        [chatId]
    );

    useEffect(() => {
        if (data) {
            setMessages(data.messages);
            //console.log(data.messages);
        }
    }, [data, chatId]);

    const toggleMenu = (): void => {
        const toOpen = !menuOpen;
        setMenuOpen(toOpen);

        if (toOpen) {
            Animated.parallel([
                Animated.spring(dropdownH, {
                    toValue: menuOptions.length * 52,
                    useNativeDriver: false,
                    friction: 10,
                    tension: 120,
                }),
                Animated.timing(dropdownOpacity, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.ease),
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(dropdownH, {
                    toValue: 0,
                    duration: 220,
                    useNativeDriver: false,
                    easing: Easing.inOut(Easing.ease),
                }),
                Animated.timing(dropdownOpacity, {
                    toValue: 0,
                    duration: 120,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    };

    const onSend = (): void => {
        const trimmed: string = input.trim();
        if (!trimmed) return;
        const sender: UserInterface = {
            _id: user!._id,
            username: user!.username,
        };
        const newMsg: Message = {
            _id: `${Date.now()}`,
            content: trimmed,
            updatedAt: `${Date.now()}`,
            createdAt: `${Date.now()}`,
            sender: sender,
            chat: chatId,
        };
        setMessages((prev) => [...prev, newMsg]);
        setInput("");
    };

    const onAttach = (): void => {
        Alert.alert("Attachments", "Select source", [
            { text: "Camera", onPress: () => {} },
            { text: "Library", onPress: () => {} },
            { text: "Cancel", style: "cancel" },
        ]);
    };

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        // Unread divider (first unread message)
        // const showUnreadDivider = item.unread && (index === 0 || !messages[index - 1]?.unread);
        const showUnreadDivider = false;

        const isMe = item.sender._id === user?._id;
        //console.log(item.sender._id, user);

        return (
            <View className="px-4">
                {showUnreadDivider && (
                    <View className="flex-row items-center my-3">
                        <View className="flex-1 h-[1px] bg-yellow-400/30" />
                        <Text className="mx-2 text-yellow-300/90 text-xxs">Unread</Text>
                        <View className="flex-1 h-[1px] bg-yellow-400/30" />
                    </View>
                )}

                <View className={`flex-row mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
                    <LinearGradient
                        colors={
                            isMe
                                ? ["rgba(0,212,255,0.08)", "rgba(14,165,233,0.12)"] // my bubble cyan glass
                                : false
                                  ? ["rgba(255,215,0,0.08)", "rgba(255,200,0,0.14)"] // unread yellow glass
                                  : ["rgba(148,163,184,0.08)", "rgba(71,85,105,0.12)"] // neutral slate glass
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            isMe
                                ? "border border-cyan-400/30 shadow-cyan-500/20 shadow-md"
                                : false
                                  ? "border border-yellow-400/40 shadow-yellow-400/20 shadow-md"
                                  : "border border-slate-400/20"
                        }`}
                    >
                        <Text className="text-white">{item.content}</Text>
                        <View className={`mt-1 ${isMe ? "items-end" : "items-start"}`}>
                            <Text
                                className={`${isMe ? "text-cyan-300/80" : false ? "text-yellow-300/80" : "text-slate-300/70"} text-xxs`}
                            >
                                {item.updatedAt}
                            </Text>
                        </View>
                    </LinearGradient>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <LinearGradient
                colors={["#0a0a0a", "#1a0a2e", "#16213e", "#0f3460"]}
                className="flex-1"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                    style={{ flex: 1 }}
                >
                    {/* Header */}
                    <View className="px-6 pt-10 pb-3">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <TouchableOpacity
                                    onPress={() => router.back()}
                                    className="w-10 h-10 bg-white/10 border border-cyan-400/30 backdrop-blur-md rounded-full items-center justify-center mr-3"
                                >
                                    <Ionicons name="arrow-back" size={18} color="#00d4ff" />
                                </TouchableOpacity>
                                <View>
                                    <Text className="text-white text-xl font-semibold">
                                        {chatName}
                                    </Text>
                                    <Text className="text-cyan-300 text-xxs opacity-80">
                                        Secure link active
                                    </Text>
                                </View>
                            </View>

                            {/* Menu */}
                            <View>
                                <TouchableOpacity
                                    onPress={toggleMenu}
                                    className="w-10 h-10 bg-white/10 border border-cyan-400/30 backdrop-blur-md rounded-full items-center justify-center"
                                    activeOpacity={0.85}
                                >
                                    <Ionicons
                                        name={menuOpen ? "close" : "ellipsis-vertical"}
                                        size={18}
                                        color="#00d4ff"
                                    />
                                </TouchableOpacity>

                                {/* Animated Dropdown */}
                                <Animated.View
                                    style={{
                                        height: dropdownH,
                                        opacity: dropdownOpacity,
                                        overflow: "hidden",
                                    }}
                                    className="absolute right-0 mt-2 w-48 bg-gray-900/60 border border-cyan-500/20 rounded-xl backdrop-blur-md"
                                >
                                    {menuOptions.map((opt, idx) => (
                                        <TouchableOpacity
                                            key={opt.id}
                                            onPress={() => {
                                                opt.action();
                                                toggleMenu();
                                            }}
                                            className={`flex-row items-center px-3 py-3 ${idx < menuOptions.length - 1 ? "border-b border-gray-700/30" : ""}`}
                                            activeOpacity={0.85}
                                        >
                                            <Ionicons name={opt.icon} size={18} color="#00d4ff" />
                                            <Text className="ml-3 text-white text-sm">
                                                {opt.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </Animated.View>
                            </View>
                        </View>

                        {/* Neon header line */}
                        <View className="mt-4 h-[1px] bg-cyan-500/30" />
                    </View>

                    {/* Messages */}
                    <FlatList
                        data={messages}
                        keyExtractor={(m) => m._id}
                        renderItem={renderMessage}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 96, paddingTop: 6 }}
                        onScrollBeginDrag={() => menuOpen && toggleMenu()}
                    />

                    {/* Input Dock */}
                    <View className="px-4 pb-4">
                        <View className="bg-white/10 backdrop-blur-md border border-cyan-400/30 rounded-2xl px-3 py-2">
                            <View className="flex-row items-end">
                                {/* Attach */}
                                <TouchableOpacity
                                    onPress={onAttach}
                                    className="w-10 h-10 rounded-xl items-center justify-center bg-white/5 border border-cyan-400/20 mr-2"
                                    activeOpacity={0.85}
                                >
                                    <Ionicons name="attach-outline" size={20} color="#00d4ff" />
                                </TouchableOpacity>

                                {/* Input */}
                                <View className="flex-1">
                                    <TextInput
                                        className="text-white text-base px-3 py-2"
                                        placeholder="Transmit message…"
                                        placeholderTextColor="#7dd3fc99"
                                        value={input}
                                        onChangeText={setInput}
                                        multiline
                                        maxLength={4000}
                                    />
                                </View>

                                {/* Send */}
                                <TouchableOpacity
                                    onPress={onSend}
                                    disabled={!input.trim()}
                                    className={`w-10 h-10 rounded-xl items-center justify-center ml-2 border ${
                                        input.trim()
                                            ? "bg-white/10 border-cyan-400/40"
                                            : "bg-white/5 border-cyan-400/10"
                                    }`}
                                    activeOpacity={0.85}
                                >
                                    <Ionicons
                                        name="send"
                                        size={18}
                                        color={input.trim() ? "#00f6ff" : "#6b7280"}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Bottom holo strip */}
                    <View className="px-6 pb-3">
                        <View className="h-[1px] bg-cyan-500/20" />
                        <View className="flex-row justify-between mt-2">
                            <Text className="text-cyan-300/70 text-xxs">
                                Quantum Tunnel: Stable
                            </Text>
                            <Text className="text-cyan-300/50 text-xxs">Protocol v2.1</Text>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </LinearGradient>
        </SafeAreaView>
    );
};

export default ChatPage;
