import { ConfirmDialog, GlassButton, Header } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import useAxios from "@/hooks/useAxios";
import { DropdownOption } from "@/types/misc";
import { Chat } from "@/types/responseTypes";
import { CommonChatAPI } from "@/utils/apiMethods";
import { ChatEventEnum } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { RelativePathString, router, useFocusEffect } from "expo-router";
import React, { JSX, useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    FlatList,
    Image,
    SafeAreaView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const AllChatsPage: React.FC = () => {
    const { data, refetch } = useAxios<Chat[]>(CommonChatAPI.getUserChats);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
    const [selectedFilter, setSelectedFilter] = useState<"all" | "individual" | "groups">("all");
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const searchOpacity = useRef(new Animated.Value(0)).current;

    const { socket } = useSocket();
    const { user, logout } = useAuth();

    const [chats, setChats] = useState<Chat[]>([]);

    const dropdownOptions: DropdownOption[] = [
        {
            id: "search",
            label: "Neural Search",
            icon: "search-outline",
            action: () => {
                setIsSearchVisible(true);
                Animated.timing(searchOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.ease),
                }).start();
            },
        },
        {
            id: "profile",
            label: "Profile Matrix",
            icon: "person-outline",
            action: () => router.push("/profile"),
        },
        {
            id: "logout",
            label: "Logout",
            icon: "settings-outline",
            action: () => handleLogoutClick(),
        },
        // {
        //     id: "archived",
        //     label: "Data Vault",
        //     icon: "archive-outline",
        //     action: () => console.log("Archived chats"),
        // },
        // {
        //     id: "security",
        //     label: "Security Protocols",
        //     icon: "shield-outline",
        //     action: () => console.log("Security settings"),
        // },
    ];

    useEffect(() => {
        if (data) {
            setChats(data);
        }

        if (!socket) return;

        // Log all socket events
        const logEvent = (event: string, ...args: unknown[]) => {
            console.log("[SOCKET EVENT]", event, args);
        };

        socket.onAny(logEvent);
        socket.on(ChatEventEnum.NEW_MESSAGE_EVENT, onNewMessage);

        return () => {
            socket.offAny(logEvent);
            socket.off(ChatEventEnum.NEW_MESSAGE_EVENT, onNewMessage);
        };
    }, [data, socket]);

    useFocusEffect(
        useCallback(() => {
            refetch();
            console.log("Refetching");
        }, [socket])
    );

    const onNewMessage = async () => {
        console.log("New Message");
        await refetch();
    };

    const closeSearch = () => {
        Animated.timing(searchOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setIsSearchVisible(false);
            setSearchQuery("");
        });
    };

    const handleLogoutClick = () => {
        setDialogVisible(true);
    };

    const handleLogout = async () => {
        try {
            setLoading(true);
            await logout();
        } catch (error: any) {
            console.log(error.response.data.message);
        } finally {
            setLoading(false);
            setDialogVisible(false);
        }
    };

    const filteredChats = chats.filter((chat) => {
        const sender = !chat.isGroupChat
            ? chat.participants[0].username === user?.username
                ? chat.participants[1]
                : chat.participants[0]
            : null;
        const matchesSearch =
            chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sender?.username.toLowerCase().includes(searchQuery.toLowerCase());

        if (selectedFilter === "individual") return matchesSearch && !chat.isGroupChat;
        if (selectedFilter === "groups") return matchesSearch && chat.isGroupChat;
        return matchesSearch;
    });

    const navigateToCreateChat = (): void => {
        router.push("/create-chat");
    };

    const navigateToChat = (chat: Chat): void => {
        const chatId = chat._id;
        const sender =
            chat.participants[0]._id === user?._id ? chat.participants[1] : chat.participants[0];

        console.log(`Navigate to chat: ${chatId}`);
        router.push({
            pathname: `/${chatId}` as RelativePathString,
            params: {
                chatName: chat.isGroupChat ? chat.name : sender.username,
                senderImg: sender.avatar,
                isGroupChat: chat.isGroupChat ? "true" : "false",
            },
        });
    };

    const renderChatItem = ({ item }: { item: Chat }): JSX.Element => {
        const isUnread = item.userChat.unreadCount > 0;
        const sender =
            item.participants[0].username === user?.username
                ? item.participants[1]
                : item.participants[0];

        return (
            <TouchableOpacity onPress={() => navigateToChat(item)} className="mx-4 mb-3">
                <View
                    className={`rounded-2xl p-4 backdrop-blur-md ${
                        isUnread
                            ? "border border-yellow-400/40 bg-yellow-400/10"
                            : "border border-cyan-500/30 bg-cyan-400/10"
                    }`}
                >
                    <View className="flex-row items-center">
                        <View
                            className={`w-12 h-12 rounded-full items-center justify-center border-2 overflow-hidden ${
                                isUnread
                                    ? "border-yellow-400/70 bg-yellow-400/10"
                                    : "border-cyan-400/70 bg-cyan-400/10"
                            }`}
                        >
                            {sender.avatar ? (
                                <Image source={{ uri: sender.avatar }} className="w-12 h-12" />
                            ) : (
                                <Ionicons
                                    name={item.isGroupChat ? "people-outline" : "person-outline"}
                                    size={24}
                                    color={
                                        isUnread
                                            ? "#FFD700" // Gold for unread
                                            : "#00f6ff"
                                    }
                                />
                            )}
                        </View>

                        {/* Chat Info */}
                        <View className="flex-1 ml-4">
                            <View className="flex-row items-center justify-between mb-1">
                                <View className="flex-row items-center">
                                    <Text className="text-white font-psemibold text-base">
                                        {item.isGroupChat ? item.name : sender.username}
                                    </Text>
                                    {/* {item.isGroupChat && (
                                        <View
                                            className={`ml-2 rounded-full px-2 py-0.5 ${
                                                isUnread ? "bg-yellow-400/20" : "bg-cyan-500/20"
                                            }`}
                                        >
                                            <Text
                                                className={`text-xs font-pmedium ${
                                                    isUnread ? "text-yellow-400" : "text-cyan-400"
                                                }`}
                                            >
                                                {item.participants[0].username}
                                            </Text>
                                        </View>
                                    )} */}
                                </View>
                                <Text className="text-gray-400 font-pregular text-xs">
                                    {new Date(item.updatedAt).toLocaleString()}
                                </Text>
                            </View>

                            <Text className="text-gray-300 font-pregular text-sm" numberOfLines={1}>
                                {item.lastMessage?.content}
                            </Text>
                        </View>

                        {/* Unread Badge */}
                        {item.userChat.unreadCount > 0 && (
                            <View className="bg-yellow-400 rounded-full min-w-[20px] h-5 items-center justify-center ml-2 shadow-md shadow-yellow-400/40">
                                <Text className="text-black text-xs font-bold">
                                    {item.userChat.unreadCount > 99
                                        ? "99+"
                                        : item.userChat.unreadCount}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <LinearGradient
                colors={["#0a0a0a", "#1a0a2e", "#16213e", "#0f3460"]}
                className="flex-1"
            >
                {/* Header */}
                <View className="px-4 pt-10 pb-2">
                    <Header
                        title="Neural Channels"
                        subtitle={`${chats.length} active connections`}
                        dropdownOptions={dropdownOptions}
                    />

                    {/* Search Bar (hidden until opened via menu) */}
                    {isSearchVisible && (
                        <Animated.View
                            style={{ opacity: searchOpacity }}
                            className="mt-4 bg-gray-800/50 rounded-xl border border-gray-700/50 flex-row items-center px-4 py-3"
                        >
                            <Ionicons name="search-outline" size={20} color="#00d4ff" />
                            <TextInput
                                className="flex-1 ml-3 text-white text-base"
                                placeholder="Search neural network..."
                                placeholderTextColor="#64748b"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            <TouchableOpacity onPress={closeSearch}>
                                <Ionicons name="close-circle" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {/* Filter Tabs */}
                    <View className="flex-row mt-4 bg-gray-800/30 rounded-xl p-1">
                        {(["all", "individual", "groups"] as const).map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                onPress={() => setSelectedFilter(filter)}
                                className={`flex-1 py-2 rounded-lg ${
                                    selectedFilter === filter ? "bg-cyan-500/20" : ""
                                }`}
                            >
                                <Text
                                    className={`text-center text-sm font-pmedium ${
                                        selectedFilter === filter
                                            ? "text-cyan-400"
                                            : "text-gray-400"
                                    }`}
                                >
                                    {filter === "all"
                                        ? "All Channels"
                                        : filter === "individual"
                                          ? "Direct Links"
                                          : "Collectives"}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Chat List */}
                <FlatList
                    data={filteredChats}
                    renderItem={renderChatItem}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={() => (
                        <View className="items-center justify-center mt-20">
                            <View className="w-20 h-20 bg-gray-800/50 rounded-full items-center justify-center mb-4">
                                <Ionicons name="chatbubbles-outline" size={32} color="#64748b" />
                            </View>
                            <Text className="text-gray-400 text-lg font-medium">
                                No connections found
                            </Text>
                            <Text className="text-gray-500 text-sm mt-1">
                                Try adjusting your search or filters
                            </Text>
                        </View>
                    )}
                />
                {/* Floating Action Button */}
                <GlassButton
                    onPress={navigateToCreateChat}
                    size="lg"
                    icon={<Ionicons name="add" size={28} color="white" />}
                    title=""
                    position="absolute bottom-12 right-6"
                />

                <ConfirmDialog
                    visible={dialogVisible}
                    title="Confirm Logout"
                    message="Are you sure you want to disconnect from the Grid?"
                    onCancel={() => setDialogVisible(false)}
                    onConfirm={handleLogout}
                />
            </LinearGradient>
        </SafeAreaView>
    );
};

export default AllChatsPage;

