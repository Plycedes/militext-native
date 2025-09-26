import {
    ConfirmDialog,
    DropdownOption,
    Header,
    ImageViewer,
    Loader,
    MessageBubble,
} from "@/components";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import useAxios from "@/hooks/useAxios";
import { useImagePicker } from "@/hooks/useImagePicker";
import { Attachment, Message, MessagesResponse } from "@/types/responseTypes";
import { MessageAPI } from "@/utils/apiMethods";
import { ChatEventEnum } from "@/utils/constants";
import { formatDateLabel } from "@/utils/date-time";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { RelativePathString, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    BackHandler,
    FlatList,
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
    const { data, refetch } = useAxios<MessagesResponse>(MessageAPI.getChatMessages, chatId);

    const [input, setInput] = useState<string>("");
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState<string | null>(null);

    const [messages, setMessages] = useState<Message[]>([]);

    const [initialLoad, setInitialLoad] = useState<boolean>(true);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);

    const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [openImageViewer, setOpenImageViewer] = useState<boolean>(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>("");
    const [hasMore, setHasMore] = useState(true);

    const [selected, setSelected] = useState<string[]>([]);
    const [editing, setEditing] = useState<boolean>(false);

    const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);

    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const flatListRef = useRef<FlatList<Message>>(null);
    const isEnabled = input.trim() !== "" || images.length > 0;

    const defaultMenuOptions: DropdownOption[] = useMemo(
        () => [
            {
                id: "search",
                label: "Neural Search",
                icon: "search-outline",
                action: () => Alert.alert("Neural Search", "Scanning knowledge lattice…"),
                visible: true,
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
                visible: true,
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
                visible: true,
            },
        ],
        [chatId]
    );

    const messageMenuOptions: DropdownOption[] = [
        {
            id: "Edit",
            label: "Edit",
            icon: "pencil-outline",
            action: () => {
                setEditing(true);
                setInput(messages.filter((msg) => msg._id === selected[0])[0].content);
            },
            visible: selected.length === 1,
        },
        {
            id: "delete",
            label: "Delete",
            icon: "trash-bin-outline",
            action: () => setDeleteDialogVisible(true),
            visible: true,
        },
    ];

    const [menuOptions, setMenuOptions] = useState<DropdownOption[]>(defaultMenuOptions);

    const [floatingDate, setFloatingDate] = useState<string>("");

    const handleViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
        if (viewableItems.length > 0) {
            const firstVisibleDate = new Date(viewableItems[0].item.createdAt);
            setFloatingDate(formatDateLabel(firstVisibleDate));
        }
    }).current;

    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

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
        socket.on(ChatEventEnum.MESSAGE_DELETE_EVENT, refetch);
        socket.on(ChatEventEnum.MESSAGE_EDITED_EVENT, refetch);

        return () => {
            socket.off(ChatEventEnum.NEW_MESSAGE_EVENT, onNewMessage);
            socket.off(ChatEventEnum.TYPING_EVENT, onTyping);
            socket.off(ChatEventEnum.STOP_TYPING_EVENT, onStopTyping);
            socket.off(ChatEventEnum.MESSAGE_DELETE_EVENT, refetch);
            socket.off(ChatEventEnum.MESSAGE_EDITED_EVENT, refetch);
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

    useEffect(() => {
        const backAction = () => {
            if (selected.length > 0) {
                setEditing(false);
                setSelected([]);
            } else {
                router.back();
            }
            return true; // prevent default behavior (going back)
        };

        if (selected.length > 0) {
            setMenuOptions(messageMenuOptions);
        } else {
            setMenuOptions(defaultMenuOptions);
        }

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => backHandler.remove(); // cleanup on unmount
    }, [selected]);

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

    const onSend = async () => {
        const content: string = input.trim();
        setInput("");

        if (editing) {
            await MessageAPI.editMessage(selected[0], content);
            await refetch();
            setEditing(false);
            setSelected([]);
            return;
        }

        if (!socket) return;

        let attachments: Attachment[] = [];

        if (images.length > 0) {
            try {
                setLoading(true);
                setLoadingMessage("Uploading Attachments");
                const response = await MessageAPI.uploadAttachments(images);
                attachments = response.data.data;
            } catch (error: any) {
                console.log(error);
                console.log(error.response.data.message);
            } finally {
                setLoading(false);
                setLoadingMessage("");
                setImages([]);
            }
        }

        setInput("");
        socket.emit(ChatEventEnum.NEW_MESSAGE_EVENT, { chatId, content, attachments });

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
        }
    };

    const onNewMessage = (message: Message) => {
        console.log("New message");
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

    const handleImageTap = (message: Message) => {
        if (message.attachments.length > 0) {
            setAttachments(message.attachments);
            setOpenImageViewer(true);
        }
    };

    // const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    //     const isMe = item.sender._id === user?._id;
    //     const attachments = item.attachments || [];
    //     const hasAttachments = attachments.length > 0;

    //     // --- Date divider logic ---
    //     const currentDate = new Date(item.createdAt);
    //     const prevDate = index > 0 ? new Date(messages[index - 1].createdAt) : null;
    //     const showDateDivider = !prevDate || currentDate.toDateString() !== prevDate.toDateString();

    //     // --- Swiping Gesture Handler ---
    //     const translateX = useSharedValue(0);

    //     const animatedStyle = useAnimatedStyle(() => ({
    //         transform: [{ translateX: translateX.value }],
    //     }));

    //     // Configure the pan gesture
    //     const panGesture = Gesture.Pan()
    //         .onUpdate((event) => {
    //             translateX.value = event.translationX;
    //         })
    //         .onEnd((event) => {
    //             const direction = isMe ? 1 : -1; // right for me, left for others
    //             if (event.translationX * direction > 50) {
    //                 handleSwipeToReply(item); // call your method
    //             }
    //             translateX.value = withSpring(0); // reset animation
    //         });

    //     return (
    //         <View>
    //             {/* Inline date divider (scrolls with messages) */}
    //             {showDateDivider && (
    //                 <View className="items-center my-2">
    //                     <View className="bg-slate-700/70 px-3 py-1 rounded-full">
    //                         <Text className="text-white text-xs font-semibold">
    //                             {formatDateLabel(currentDate)}
    //                         </Text>
    //                     </View>
    //                 </View>
    //             )}

    //             <View className="px-4 mb-2">
    //                 <View
    //                     className={`flex-row ${
    //                         isMe ? "justify-end" : "justify-start"
    //                     } ${selected.includes(item._id) ? "bg-cyan-300/20" : ""}`}
    //                 >
    //                     <GestureDetector gesture={panGesture}>
    //                         <Animated.View style={animatedStyle}>
    //                             <TouchableOpacity
    //                                 className={`max-w-[80%] rounded-2xl px-4 py-3 ${
    //                                     isMe
    //                                         ? "border border-slate-400/30 shadow-slate-400/20 shadow-md bg-slate-400/10"
    //                                         : "border border-cyan-400/30 shadow-cyan-400/20 shadow-md bg-cyan-400/10"
    //                                 }`}
    //                                 onPress={() => {
    //                                     if (isMe && selected.length > 0) {
    //                                         setSelected((prev) =>
    //                                             prev.includes(item._id)
    //                                                 ? prev.filter((id) => id !== item._id)
    //                                                 : [...prev, item._id]
    //                                         );
    //                                     } else {
    //                                         handleImageTap(item);
    //                                     }
    //                                 }}
    //                                 onLongPress={() => {
    //                                     if (isMe) {
    //                                         setSelected((prev) => [...prev, item._id]);
    //                                     }
    //                                 }}
    //                             >
    //                                 {/* Reply preview (if replyingTo exists) */}
    //                                 {item.replyingTo && (
    //                                     <View className="mb-2 border-l-4 border-cyan-400/60 pl-2">
    //                                         <Text className="text-cyan-300 text-xs font-semibold">
    //                                             {item.replyingTo.sender?.username || "Unknown"}
    //                                         </Text>
    //                                         <Text
    //                                             className="text-slate-200 text-sm"
    //                                             numberOfLines={1}
    //                                         >
    //                                             {item.replyingTo.content}
    //                                         </Text>
    //                                     </View>
    //                                 )}

    //                                 {/* Attachments */}
    //                                 {hasAttachments && (
    //                                     <View className="mt-2 relative">
    //                                         <Image
    //                                             source={{ uri: attachments[0].url }}
    //                                             className="w-48 h-48 rounded-lg"
    //                                             resizeMode="cover"
    //                                         />
    //                                         {attachments.length > 1 && (
    //                                             <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded-full">
    //                                                 <Text className="text-white text-xs font-semibold">
    //                                                     +{attachments.length - 1}
    //                                                 </Text>
    //                                             </View>
    //                                         )}
    //                                     </View>
    //                                 )}

    //                                 {/* Text message */}
    //                                 {item.content ? (
    //                                     <Text className="text-white mt-1">{item.content}</Text>
    //                                 ) : null}

    //                                 {/* Timestamp (time only) & Edited tag */}
    //                                 <View
    //                                     className={`flex-row gap-1 mt-1 ${
    //                                         isMe ? "items-end" : "items-start"
    //                                     }`}
    //                                 >
    //                                     <Text
    //                                         className={`${
    //                                             isMe ? "text-slate-300/70" : "text-cyan-300/80"
    //                                         } text-xs`}
    //                                     >
    //                                         {formatTimeOnly(currentDate)}
    //                                     </Text>
    //                                     {item.createdAt !== item.updatedAt && (
    //                                         <Text
    //                                             className={`${
    //                                                 isMe ? "text-slate-300/70" : "text-cyan-300/80"
    //                                             } text-xs italic`}
    //                                         >
    //                                             Edited
    //                                         </Text>
    //                                     )}
    //                                 </View>
    //                             </TouchableOpacity>
    //                         </Animated.View>
    //                     </GestureDetector>
    //                 </View>
    //             </View>
    //         </View>
    //     );
    // };

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isMe = item.sender._id === user?._id;
        // --- Date divider logic ---
        const currentDate = new Date(item.createdAt);
        const prevDate = index > 0 ? new Date(messages[index - 1].createdAt) : null;
        const showDateDivider = !prevDate || currentDate.toDateString() !== prevDate.toDateString();

        return (
            <View>
                {/* Inline date divider (scrolls with messages) */}
                {showDateDivider && (
                    <View className="items-center my-2">
                        <View className="bg-slate-700/70 px-3 py-1 rounded-full">
                            <Text className="text-white text-xs font-semibold">
                                {formatDateLabel(currentDate)}
                            </Text>
                        </View>
                    </View>
                )}
                <View className="px-4 mb-2">
                    <MessageBubble
                        item={item}
                        isMe={isMe}
                        selected={selected}
                        currentDate={currentDate}
                        setSelected={setSelected}
                        handleImageTap={handleImageTap}
                        handleSwipeToReply={handleSwipeToReply}
                    />
                </View>
            </View>
        );
    };

    const handleSwipeToReply = (item: Message) => {
        console.log("Replied");
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

    const deleteMessages = async () => {
        try {
            setLoadingMessage("Deleting messages");
            setLoading(true);
            await MessageAPI.deleteMessages(chatId, selected);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setLoadingMessage("");
            setDeleteDialogVisible(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <Loader message={loadingMessage} visible={loading} />
            <ConfirmDialog
                visible={deleteDialogVisible}
                onConfirm={deleteMessages}
                onCancel={() => setDeleteDialogVisible(false)}
                title="Are you sure?"
                message="Delete the selected messages permanently"
            />
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
                            isGroupChat={isGroupChat === "true"}
                        />
                    </View>

                    {/* Messages + Floating Tag */}
                    <View className="flex-1 relative">
                        {/* Messages */}
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={(m) => m._id}
                            renderItem={renderMessage}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={getContentContainerPadding()}
                            onScroll={handleTopScroll}
                            scrollEventThrottle={16}
                            onViewableItemsChanged={handleViewableItemsChanged}
                            viewabilityConfig={viewConfigRef.current}
                        />

                        {/* Floating date tag (absolute inside list container) */}
                        {floatingDate ? (
                            <View className="absolute left-0 right-0 items-center top-0 z-10">
                                <View className="bg-slate-700/80 px-4 py-1 rounded-full">
                                    <Text className="text-white font-semibold text-sm">
                                        {floatingDate}
                                    </Text>
                                </View>
                            </View>
                        ) : null}
                    </View>

                    {/* Input Dock */}
                    <View className="px-4 pb-4">
                        <View className="bg-white/10 rounded-2xl">
                            {images.length > 0 && (
                                <View className="flex-row px-4 py-2 justify-between">
                                    <Text className="text-cyan-400">Attachments selected</Text>
                                    <TouchableOpacity onPress={() => setImages([])}>
                                        <Ionicons name="close-sharp" size={16} color="#00d4ff" />
                                    </TouchableOpacity>
                                </View>
                            )}

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
                                        disabled={!isEnabled}
                                        className={`w-10 h-10 rounded-xl items-center justify-center ml-2 border ${
                                            isEnabled
                                                ? "bg-white/10 border-cyan-400/40"
                                                : "bg-white/5 border-cyan-400/10"
                                        }`}
                                        activeOpacity={0.85}
                                    >
                                        <Ionicons
                                            name="send"
                                            size={18}
                                            color={isEnabled ? "#00f6ff" : "#6b7280"}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
                <ImageViewer
                    visible={openImageViewer}
                    attachments={attachments}
                    onClose={() => setOpenImageViewer(false)}
                />
            </LinearGradient>
        </SafeAreaView>
    );
};

export default ChatPage;
