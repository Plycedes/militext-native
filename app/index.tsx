import { GlassButton } from "@/components";
import useAxios from "@/hooks/useAxios";
import { DropdownOption } from "@/types/misc";
import { Chat } from "@/types/responseTypes";
import { getUserChats } from "@/utils/apiMethods";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { JSX, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    FlatList,
    SafeAreaView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const AllChatsPage: React.FC = () => {
    const { data } = useAxios<Chat[]>(getUserChats);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
    const [selectedFilter, setSelectedFilter] = useState<"all" | "individual" | "groups">("all");

    const dropdownHeight = useRef(new Animated.Value(0)).current;
    const searchOpacity = useRef(new Animated.Value(0)).current;

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
            id: "settings",
            label: "Grid Settings",
            icon: "settings-outline",
            action: () => console.log("Settings opened"),
        },
        {
            id: "archived",
            label: "Data Vault",
            icon: "archive-outline",
            action: () => console.log("Archived chats"),
        },
        {
            id: "security",
            label: "Security Protocols",
            icon: "shield-outline",
            action: () => console.log("Security settings"),
        },
    ];

    useEffect(() => {
        if (data) {
            console.log(data);
            setChats(data);
        }
    }, [data]);

    const toggleDropdown = (): void => {
        const toValue = isDropdownOpen ? 0 : dropdownOptions.length * 50;
        setIsDropdownOpen(!isDropdownOpen);

        if (toValue === 0) {
            Animated.timing(dropdownHeight, {
                toValue,
                duration: 250,
                useNativeDriver: false,
                easing: Easing.inOut(Easing.ease),
            }).start();
        } else {
            Animated.spring(dropdownHeight, {
                toValue,
                useNativeDriver: false,
                tension: 100,
                friction: 8,
            }).start();
        }
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

    const filteredChats = chats.filter((chat) => {
        const matchesSearch =
            chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase());

        if (selectedFilter === "individual") return matchesSearch && !chat.isGroupChat;
        if (selectedFilter === "groups") return matchesSearch && chat.isGroupChat;
        return matchesSearch;
    });

    const navigateToCreateChat = (): void => {
        router.push("/create-chat");
    };

    const navigateToChat = (chatId: string): void => {
        console.log(`Navigate to chat: ${chatId}`);
        router.push(`/${chatId}`);
    };

    const renderChatItem = ({ item }: { item: Chat }): JSX.Element => {
        const isUnread = item.userChat.unreadCount > 0;

        return (
            <TouchableOpacity onPress={() => navigateToChat(item._id)} className="mx-4 mb-3">
                <LinearGradient
                    colors={
                        isUnread
                            ? ["rgba(255, 215, 0, 0.08)", "rgba(255, 200, 0, 0.12)"] // Yellow glossy
                            : ["rgba(0,212,255,0.05)", "rgba(14,165,233,0.08)"] // Cyan glossy
                    }
                    className={`rounded-2xl p-4 backdrop-blur-md ${
                        isUnread ? "border border-yellow-400/40" : "border border-cyan-500/30"
                    }`}
                >
                    <View className="flex-row items-center">
                        <View
                            className={`w-12 h-12 rounded-full items-center justify-center border-2 ${
                                isUnread
                                    ? "border-yellow-400/70 bg-yellow-400/10"
                                    : "border-cyan-400/70 bg-cyan-400/10"
                            }`}
                        >
                            <Ionicons
                                name={item.isGroupChat ? "people-outline" : "person-outline"}
                                size={24}
                                color={
                                    isUnread
                                        ? "#FFD700" // Gold for unread
                                        : "#00f6ff"
                                }
                            />
                        </View>

                        {/* Chat Info */}
                        <View className="flex-1 ml-4">
                            <View className="flex-row items-center justify-between mb-1">
                                <View className="flex-row items-center">
                                    <Text className="text-white font-semibold text-base">
                                        {item.isGroupChat
                                            ? item.name
                                            : item.participants[0].username}
                                    </Text>
                                    {item.isGroupChat && (
                                        <View
                                            className={`ml-2 rounded-full px-2 py-0.5 ${
                                                isUnread ? "bg-yellow-400/20" : "bg-cyan-500/20"
                                            }`}
                                        >
                                            <Text
                                                className={`text-xs ${
                                                    isUnread ? "text-yellow-400" : "text-cyan-400"
                                                }`}
                                            >
                                                {item.participants[0].username}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <Text className="text-gray-400 text-xs">
                                    {new Date(item.updatedAt).toLocaleString()}
                                </Text>
                            </View>

                            <Text className="text-gray-300 text-sm" numberOfLines={1}>
                                {item.lastMessage.content}
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
                </LinearGradient>
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
                <View className="px-6 pt-10 pb-2">
                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <Text className="text-2xl font-bold text-white">Neural Channels</Text>
                            <Text className="text-cyan-300 text-sm opacity-80">
                                {filteredChats.length} active connections
                            </Text>
                        </View>

                        {/* Menu Button */}
                        <TouchableOpacity
                            onPress={toggleDropdown}
                            className="w-10 h-10 bg-cyan-400/20 rounded-full items-center justify-center border border-cyan-400/30"
                        >
                            <Ionicons
                                name={isDropdownOpen ? "close" : "menu"}
                                size={20}
                                color="#00d4ff"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Dropdown Menu */}
                    <Animated.View
                        style={{ height: dropdownHeight, overflow: "hidden" }}
                        className="bg-gray-900/60 rounded-xl border border-cyan-500/20 backdrop-blur-sm"
                    >
                        {dropdownOptions.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                onPress={() => {
                                    option.action();
                                    toggleDropdown();
                                }}
                                className="flex-row items-center px-4 py-3 border-b border-gray-700/30 last:border-b-0"
                            >
                                <Ionicons name={option.icon} size={20} color="#00d4ff" />
                                <Text className="ml-3 text-white font-medium">{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </Animated.View>

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
                                    className={`text-center text-sm font-medium ${
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

                {/* Bottom Status Bar */}
                <View className="absolute bottom-0 left-0 right-0 bg-gray-900/30 backdrop-blur-md border-t border-cyan-500/20">
                    <View className="flex-row items-center justify-between px-6 py-2">
                        <View className="flex-row items-center">
                            <View className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                            <Text className="ml-2 text-cyan-300 text-xs">Grid Status: Online</Text>
                        </View>
                        <Text className="text-cyan-500/70 text-xs">Neural Protocol v2.1</Text>
                    </View>
                    <View className="h-0.5 bg-gradient-to-r from-transparent via-cyan-500/70 to-transparent animate-pulse" />
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};

export default AllChatsPage;

