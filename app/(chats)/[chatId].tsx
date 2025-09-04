// app/chat/[id].tsx (or wherever you route it)
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
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

type Message = {
    id: string;
    text: string;
    timestamp: string;
    isMe: boolean;
    unread?: boolean;
};

type MenuOption = {
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    action: () => void;
};

const ChatPage: React.FC = () => {
    const { chatId } = useLocalSearchParams<{ chatId: string }>();
    const [input, setInput] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "m1",
            text: "Link established. Welcome to the grid.",
            timestamp: "10:24",
            isMe: false,
        },
        { id: "m2", text: "Reading your signal loud and clear.", timestamp: "10:25", isMe: true },
        {
            id: "m3",
            text: "Patching you into the collective node.",
            timestamp: "10:26",
            isMe: false,
            unread: true,
        },
        {
            id: "m4",
            text: "Send the payload when ready.",
            timestamp: "10:27",
            isMe: false,
            unread: true,
        },
    ]);

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
        const trimmed = input.trim();
        if (!trimmed) return;
        const newMsg: Message = {
            id: `${Date.now()}`,
            text: trimmed,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isMe: true,
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
        const showUnreadDivider = item.unread && (index === 0 || !messages[index - 1]?.unread);

        const isMe = item.isMe;

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
                                : item.unread
                                  ? ["rgba(255,215,0,0.08)", "rgba(255,200,0,0.14)"] // unread yellow glass
                                  : ["rgba(148,163,184,0.08)", "rgba(71,85,105,0.12)"] // neutral slate glass
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            isMe
                                ? "border border-cyan-400/30 shadow-cyan-500/20 shadow-md"
                                : item.unread
                                  ? "border border-yellow-400/40 shadow-yellow-400/20 shadow-md"
                                  : "border border-slate-400/20"
                        }`}
                    >
                        <Text className="text-white">{item.text}</Text>
                        <View className={`mt-1 ${isMe ? "items-end" : "items-start"}`}>
                            <Text
                                className={`${isMe ? "text-cyan-300/80" : item.unread ? "text-yellow-300/80" : "text-slate-300/70"} text-xxs`}
                            >
                                {item.timestamp}
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
                    <View>{/* ... header code ... */}</View>

                    {/* Messages */}
                    <FlatList
                        data={messages}
                        keyExtractor={(m) => m.id}
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
