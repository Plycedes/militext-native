import { Header } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import useAxios from "@/hooks/useAxios";
import { useImagePicker } from "@/hooks/useImagePicker";
import { DropdownOption } from "@/types/misc";
import { Message, MessagesResponse } from "@/types/responseTypes";
import { MessageAPI } from "@/utils/apiMethods";
import { ChatEventEnum } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { RelativePathString, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const ChatPage: React.FC = () => {
    const { chatId, chatName, senderImg, isGroupChat } = useLocalSearchParams<{
        chatId: string;
        chatName: string;
        senderImg: string;
        isGroupChat: string;
    }>();
    const { user } = useAuth();
    const { socket } = useSocket();
    const { pickMultipleImages } = useImagePicker();
    const { data } = useAxios<MessagesResponse>(MessageAPI.getChatMessages, chatId);

    const [input, setInput] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const [initialLoad, setInitialLoad] = useState<boolean>(true);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
    const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

    const [hasMore, setHasMore] = useState(true);

    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const flatListRef = useRef<FlatList<Message>>(null);

    const menuOptions: DropdownOption[] = useMemo(
        () => [
            {
                id: "search",
                label: "Neural Search",
                icon: "search-outline",
                action: () => Alert.alert("Neural Search", "Scanning knowledge lattice…"),
            },
            // {
            //     id: "media",
            //     label: "Media Vault",
            //     icon: "images-outline",
            //     action: () => Alert.alert("Media Vault", "Opening archive…"),
            // },
            {
                id: "mute",
                label: "Silence Node",
                icon: "volume-mute-outline",
                action: () => Alert.alert("Silenced", "Notifications muted for this channel."),
            },
            // {
            //     id: "secure",
            //     label: "Secure Link",
            //     icon: "shield-checkmark-outline",
            //     action: () => Alert.alert("Secure Link", "Quantum handshake complete."),
            // },
            {
                id: "details",
                label: "Channel Details",
                icon: "information-circle-outline",
                action: () => handleChatDetails(),
            },
        ],
        [chatId]
    );

    // Keyboard event listeners
    useEffect(() => {
        const keyboardWillShowListener = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
                setIsKeyboardVisible(true);
                // Scroll to bottom when keyboard opens
                setTimeout(
                    () => {
                        flatListRef.current?.scrollToEnd({ animated: true });
                    },
                    Platform.OS === "ios" ? 0 : 100
                );
            }
        );

        const keyboardWillHideListener = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
            () => {
                setKeyboardHeight(0);
                setIsKeyboardVisible(false);
            }
        );

        return () => {
            keyboardWillShowListener?.remove();
            keyboardWillHideListener?.remove();
        };
    }, []);

    useEffect(() => {
        if (data) {
            console.log(data);
            setMessages(data.messages);
            // Scroll to bottom after messages load
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
            }, 100);
        }
        if (!socket) return;
        socket.emit(ChatEventEnum.JOIN_CHAT_EVENT, chatId);
        socket.on(ChatEventEnum.NEW_MESSAGE_EVENT, onNewMessage);
        socket.on(ChatEventEnum.TYPING_EVENT, onTyping);
        socket.on(ChatEventEnum.STOP_TYPING_EVENT, onStopTyping);

        return () => {
            socket.off(ChatEventEnum.NEW_MESSAGE_EVENT, onNewMessage);
            socket.off(ChatEventEnum.TYPING_EVENT, onTyping);
            socket.off(ChatEventEnum.STOP_TYPING_EVENT, onStopTyping);
            socket.emit(ChatEventEnum.LEAVE_CHAT_EVENT, chatId);
        };
    }, [data, chatId, socket]);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    // Scroll to bottom when messages change and it's initial load
    useEffect(() => {
        if (initialLoad && messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
                setInitialLoad(false);
            }, 150);
        }
    }, [messages, initialLoad]);

    const handleTyping = (text: string) => {
        setInput(text);

        if (!socket) return;

        if (!isTyping) {
            setIsTyping(true);
            socket.emit(ChatEventEnum.TYPING_EVENT, chatId);
        }

        // Clear old timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Start new timeout — if no typing for 2s, stop typing
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket.emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
        }, 2000);
    };

    const onSend = (): void => {
        const content: string = input.trim();
        if (!content || !socket) return;
        setInput("");
        socket.emit(ChatEventEnum.NEW_MESSAGE_EVENT, { chatId, content });

        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 50);
    };

    const onAttach = async () => {
        // Alert.alert("Attachments", "Select source", [
        //     { text: "Camera", onPress: () => {} },
        //     { text: "Library", onPress: () => {} },
        //     { text: "Cancel", style: "cancel" },
        // ]);

        const picks = await pickMultipleImages();
        if (picks) {
            setImages(picks);
            const response = await MessageAPI.uploadAttachments(picks);
            console.log(response.data.data);
        }
    };

    const onNewMessage = (message: Message) => {
        setMessages((prev) => [...prev, message]);
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 50);
    };

    const onTyping = (data: { username: string }) => {
        const { username } = data;
        if (user?.username !== username) {
            setTypingUser(username);
        }
    };

    const onStopTyping = () => {
        setTypingUser(null);
    };

    const handleTextInputFocus = () => {
        // Scroll to bottom when text input is focused
        setTimeout(
            () => {
                flatListRef.current?.scrollToEnd({ animated: true });
            },
            Platform.OS === "ios" ? 300 : 100
        );
    };

    const fetchMessages = async () => {
        const response = await MessageAPI.getChatMessages(chatId, messages[0]._id);
        const res = response.data.data as MessagesResponse;
        if (res.messages.length > 0) {
            setMessages((prev) => [...res.messages, ...prev]);
            setHasMore(res.hasMore);
        }
        console.log(`Last message: ${messages[0].content}`);
    };

    const handleTopScroll = ({ nativeEvent }: any) => {
        if (nativeEvent.contentOffset.y <= 0 && hasMore) {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(() => {
                fetchMessages();
            }, 300);
        }
    };

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const showUnreadDivider = false;
        const isMe = item.sender._id === user?._id;

        const attachments = item.attachments || [];
        const hasAttachments = attachments.length > 0;

        return (
            <View className="px-4">
                {showUnreadDivider && (
                    <View className="flex-row items-center my-3">
                        <View className="flex-1 h-[1px] bg-yellow-400/30" />
                        <Text className="mx-2 text-yellow-300/90 text-xs">Unread</Text>
                        <View className="flex-1 h-[1px] bg-yellow-400/30" />
                    </View>
                )}

                <View className={`flex-row mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
                    <View
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            isMe
                                ? "border border-slate-400/30 shadow-slate-400/20 shadow-md bg-slate-400/10"
                                : false
                                  ? "border border-yellow-400/40 shadow-yellow-400/20 shadow-md bg-yellow-400/10"
                                  : "border border-cyan-400/30 shadow-cyan-400/20 shadow-md bg-cyan-400/10"
                        }`}
                    >
                        {/* Text message */}
                        {item.content ? <Text className="text-white">{item.content}</Text> : null}

                        {/* First image preview */}
                        {hasAttachments && (
                            <View className="mt-2 relative">
                                <Image
                                    source={{ uri: attachments[0].url }}
                                    className="w-48 h-48 rounded-lg"
                                    resizeMode="cover"
                                />
                                {attachments.length > 1 && (
                                    <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded-full">
                                        <Text className="text-white text-xs font-semibold">
                                            +{attachments.length - 1}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Timestamp */}
                        <View className={`mt-1 ${isMe ? "items-end" : "items-start"}`}>
                            <Text
                                className={`${
                                    isMe
                                        ? "text-slate-300/70"
                                        : false
                                          ? "text-yellow-300/80"
                                          : "text-cyan-300/80"
                                } text-xs`}
                            >
                                {new Date(item.updatedAt).toLocaleString()}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    // Calculate proper content container padding based on keyboard state
    const getContentContainerPadding = () => {
        const baseInputHeight = 80; // Approximate height of input area
        const additionalPadding = 20;

        if (isKeyboardVisible) {
            // When keyboard is visible, add extra padding to account for input area
            return {
                paddingBottom: baseInputHeight + additionalPadding,
                paddingTop: 6,
            };
        } else {
            // When keyboard is hidden, use standard padding
            return {
                paddingBottom: baseInputHeight + additionalPadding,
                paddingTop: 6,
            };
        }
    };

    const handleChatDetails = () => {
        if (isGroupChat === "true") {
            router.push({
                pathname: `/groupinfo` as RelativePathString,
                params: { chatId },
            });
        } else {
            router.push({
                pathname: `/chatinfo` as RelativePathString,
                params: { chatId },
            });
        }
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
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                    style={{ flex: 1 }}
                >
                    {/* Header */}
                    <View className="px-4 pt-10 pb-2">
                        <Header
                            dropdownOptions={menuOptions}
                            title={chatName}
                            subtitle={typingUser ? `${typingUser} is typing...` : ""}
                            showBack={true}
                            handleBack={() => router.back()}
                            imageUri={senderImg}
                            isGroupChat={isGroupChat === "true" ? true : false}
                        />
                    </View>

                    {/* Messages */}
                    <View style={{ flex: 1 }}>
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={(m) => m._id}
                            renderItem={renderMessage}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={getContentContainerPadding()}
                            onScroll={handleTopScroll}
                            scrollEventThrottle={16}
                        />
                    </View>

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
                                        onChangeText={handleTyping}
                                        onFocus={handleTextInputFocus}
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
                </KeyboardAvoidingView>
            </LinearGradient>
        </SafeAreaView>
    );
};

export default ChatPage;
