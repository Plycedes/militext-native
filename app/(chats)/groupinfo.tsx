import { AddParticipantModal, GlassButton, ProfileImage, UnderlinedInput } from "@/components";
import { useAuth } from "@/context/AuthContext";
import useAxios from "@/hooks/useAxios";
import { UserInterface } from "@/types/misc";
import { Chat } from "@/types/responseTypes";
import { GroupChatAPI } from "@/utils/apiMethods";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

const GroupChatInfo = () => {
    const { chatId } = useLocalSearchParams<{ chatId: string }>();
    const { data: chat, refetch } = useAxios<Chat>(GroupChatAPI.getGroupInfo, chatId);
    const { user } = useAuth();
    const [groupName, setGroupName] = useState<string>("");
    const [connectedSince, setConnectedSince] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserInterface | null>(null);

    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [editingName, setEditingName] = useState<boolean>(false);
    const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
    const [showAllParticipants, setShowAllParticipants] = useState<boolean>(false);
    const [addParticipantVisible, setAddParticipantVisible] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showImg, setShowImg] = useState<boolean>(false);

    useEffect(() => {
        if (chat) {
            setIsAdmin(chat.admin.includes(user?._id || ""));
            setGroupName(chat.name);
            const connected = chat.createdAt ? dayjs(chat.createdAt).format("MMMM D, YYYY") : null;
            setConnectedSince(connected);
        }
    }, [chat]);

    const handleUpdateName = async () => {
        await GroupChatAPI.updateGroupName(chat!._id, groupName);
        setEditingName(false);
    };

    const handleOptionSelect = async (option: string) => {
        if (!chat || !selectedUser) return;

        try {
            setIsLoading(true);
            if (option === "makeAdmin") {
                await GroupChatAPI.promotToAdmin(chat._id, selectedUser._id);
            } else if (option === "remove") {
                await GroupChatAPI.removeParticipantFromGroup(chat._id, selectedUser._id);
            } else if (option === "removeAdmin") {
                await GroupChatAPI.demoteFromAdmin(chat._id, selectedUser._id);
            }
            await refetch();
            Toast.show({
                type: "success",
                text1: "Successful",
            });
            console.log("Success ");
        } catch (error: any) {
            Toast.show({
                type: "success",
                text1: error.response.data.message,
            });
        } finally {
            setIsLoading(false);
        }

        setDropdownVisible(false);
        setSelectedUser(null);
    };

    const renderFriendshipLabel = (label: string) => {
        switch (label.toLowerCase()) {
            case "family vibes":
                return (
                    <View className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-1 rounded-full border border-purple-400/30 ml-2">
                        <Text className="text-purple-300 text-xs font-bold">
                            {label.toUpperCase()}
                        </Text>
                    </View>
                );

            case "inner circle":
                return (
                    <View className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-3 py-1 rounded-full border border-green-400/30 ml-2">
                        <Text className="text-green-300 text-xs font-bold">
                            {label.toUpperCase()}
                        </Text>
                    </View>
                );

            case "casual crew":
                return (
                    <View className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-3 py-1 rounded-full border border-blue-400/30 ml-2">
                        <Text className="text-blue-300 text-xs font-bold">
                            {label.toUpperCase()}
                        </Text>
                    </View>
                );

            case "friend":
                return (
                    <View className="bg-gradient-to-r from-red-500/20 to-orange-500/20 px-3 py-1 rounded-full border border-red-400/30 ml-2">
                        <Text className="text-red-300 text-xs font-bold">
                            {label.toUpperCase()}
                        </Text>
                    </View>
                );

            case "generational":
                return (
                    <View className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 px-3 py-1 rounded-full border border-cyan-400/30 ml-2">
                        <Text className="text-cyan-300 text-xs font-bold">
                            {label.toUpperCase()}
                        </Text>
                    </View>
                );

            case "synonyms":
                return (
                    <View className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 px-3 py-1 rounded-full border border-yellow-400/30 ml-2">
                        <Text className="text-yellow-300 text-xs font-bold">
                            {label.toUpperCase()}
                        </Text>
                    </View>
                );

            default:
                return (
                    <View className="bg-gradient-to-r from-gray-500/20 to-gray-600/20 px-3 py-1 rounded-full border border-gray-400/30 ml-2">
                        <Text className="text-gray-300 text-xs font-bold">
                            {label.toUpperCase()}
                        </Text>
                    </View>
                );
        }
    };

    const renderParticipant = ({ item }: { item: UserInterface }) => {
        const isItemAdmin = chat!.admin.includes(item._id);
        const isItemSuperAdmin = chat!.superAdmin === item._id;

        return (
            <View className="flex-row justify-between items-center py-3 border-b border-cyan-400/20">
                <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-full items-center justify-center border-2 border-cyan-400/20 overflow-hidden">
                        {item.avatar ? (
                            <Image
                                source={{
                                    uri: item.avatar,
                                }}
                                className="w-12 h-12"
                            />
                        ) : (
                            <Ionicons name="person-outline" size={24} color="#00f6ff" />
                        )}
                    </View>
                    <Text className="ml-2 text-white text-lg font-semibold">{item.username}</Text>
                    {isItemAdmin && (
                        <View
                            className={`flex items-center justify-center h-6 px-2 ml-2 rounded-full ${
                                isItemSuperAdmin ? "bg-purple-400/20" : "bg-cyan-500/20"
                            }`}
                        >
                            <Text
                                className={`text-xs font-pmedium ${
                                    isItemSuperAdmin ? "text-purple-400" : "text-cyan-400"
                                }`}
                            >
                                {isItemSuperAdmin ? "Super Admin" : "Admin"}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Options for admins */}
                {isAdmin && item._id !== user?._id && (
                    <TouchableOpacity
                        onPress={() => {
                            setSelectedUser(item);
                            setDropdownVisible(true);
                        }}
                    >
                        <Ionicons name="ellipsis-vertical" size={20} color="#22d3ee" />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const leaveGroup = async (chatId: string) => {
        try {
            await GroupChatAPI.leaveGroup(chatId);
        } catch (error: any) {
            Toast.show({
                type: "success",
                text1: error.response.data.message,
            });
        }
    };

    const formatNumber = (num: number | null | undefined): string => {
        if (num === null || num === undefined || isNaN(num)) return "0";

        const absNum = Math.abs(num);

        if (absNum >= 1.0e9) {
            return (num / 1.0e9).toFixed(1).replace(/\.0$/, "") + "B";
        } else if (absNum >= 1.0e6) {
            return (num / 1.0e6).toFixed(1).replace(/\.0$/, "") + "M";
        } else if (absNum >= 1.0e3) {
            return (num / 1.0e3).toFixed(1).replace(/\.0$/, "") + "K";
        } else {
            return num.toString();
        }
    };

    if (!chat)
        return (
            <LinearGradient
                colors={["#0a0a0a", "#1a0a2e", "#16213e", "#0a203bff"]}
                className="flex-1 px-6 py-4"
            />
        );

    const displayedParticipants = showAllParticipants
        ? chat.participants
        : chat.participants.slice(0, 5);

    return (
        <SafeAreaView className="flex-1 bg-black">
            {showImg && chat?.avatar && (
                <ProfileImage
                    image={chat.avatar}
                    refetch={refetch}
                    setShow={setShowImg}
                    permission={chat.admin.includes(user!._id)}
                    chatId={chat._id}
                />
            )}
            <LinearGradient
                colors={["#0a0a0a", "#1a0a2e", "#16213e", "#0a203bff"]}
                className="flex-1 px-6 pt-8 pb-4"
            >
                <ScrollView>
                    {/* Header */}
                    <View className="flex-row items-center mb-6">
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={28} color="#22d3ee" />
                        </TouchableOpacity>
                        <Text className="text-white text-2xl font-bold ml-4">Group Info</Text>
                    </View>

                    {/* Group Avatar */}
                    <View className="items-center mb-6">
                        <View className="relative mb-6">
                            {/* Outer Glow Ring */}
                            <View className="absolute inset-[-8px] rounded-full border border-cyan-400/30 animate-pulse" />

                            {/* Main Avatar */}
                            <TouchableOpacity onPress={() => setShowImg(true)}>
                                <View className="relative">
                                    {chat.avatar ? (
                                        <Image
                                            source={{
                                                uri: chat.avatar,
                                            }}
                                            className="w-36 h-36 rounded-full border-4 border-cyan-400/60"
                                        />
                                    ) : (
                                        <Ionicons
                                            name="people-outline"
                                            size={120}
                                            color="#22d3ee"
                                        />
                                    )}

                                    {/* Scanning Effect */}
                                    <View className="absolute inset-0 rounded-full overflow-hidden">
                                        <View
                                            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent animate-pulse"
                                            style={{ transform: [{ translateY: 70 }] }}
                                        />
                                    </View>

                                    {/* Corner Brackets */}
                                    <View className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-cyan-300" />
                                    <View className="absolute -top-2 -right-2 w-4 h-4 border-r-2 border-t-2 border-cyan-300" />
                                    <View className="absolute -bottom-2 -left-2 w-4 h-4 border-l-2 border-b-2 border-cyan-300" />
                                    <View className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-cyan-300" />
                                </View>
                            </TouchableOpacity>

                            {/* Verification Badge */}
                            {/* <View className="absolute -bottom-2 -right-2 bg-cyan-500 rounded-full p-1">
                                                <Ionicons name="checkmark" size={12} color="white" />
                                            </View> */}
                        </View>

                        <View className="relative">
                            <Text className="text-cyan-300 text-3xl font-extrabold tracking-wide">
                                {chat.name}
                            </Text>
                            {/* Glitch Shadow */}
                            <Text
                                className="absolute top-0 left-0 text-red-400/20 text-3xl font-extrabold tracking-wide"
                                style={{ transform: [{ translateX: 1 }, { translateY: 1 }] }}
                            >
                                {chat.name}
                            </Text>
                        </View>

                        {/* User Level/Rank */}
                        <View className="flex-row items-center mt-2 mb-3">
                            <View className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-3 py-1 rounded-full border border-cyan-400/30">
                                <Text className="text-cyan-300 text-xs font-bold">
                                    LVL {chat?.friendshipLevel}
                                </Text>
                            </View>
                            {renderFriendshipLabel(chat?.friendshipLabel)}
                        </View>

                        <View className="flex-row space-x-4 mt-6 mb-6">
                            <View className="bg-gray-800/60 border border-cyan-400/30 rounded-lg p-3 items-center min-w-[60px]">
                                <Text className="text-cyan-300 text-lg font-bold">
                                    {formatNumber(chat?.messageCount)}
                                </Text>
                                <Text className="text-gray-400 text-xs">MESSAGES</Text>
                            </View>
                            <View className="bg-gray-800/60 border border-cyan-400/30 rounded-lg p-3 items-center min-w-[60px]">
                                <Text className="text-cyan-300 text-lg font-bold">
                                    {formatNumber(chat?.participants.length)}
                                </Text>
                                <Text className="text-gray-400 text-xs">MEMBERS</Text>
                            </View>
                            <View className="bg-gray-800/60 border border-cyan-400/30 rounded-lg p-3 items-center min-w-[60px]">
                                <Text className="text-cyan-300 text-lg font-bold">0</Text>
                                <Text className="text-gray-400 text-xs">CALLS</Text>
                            </View>
                        </View>

                        {/* Connection Info with Enhanced Design */}
                        {connectedSince && (
                            <View className="bg-gray-900/60 border border-gray-600/40 rounded-lg px-4 py-2 mb-4">
                                <View className="flex-row items-center justify-center">
                                    <Ionicons name="time-outline" size={14} color="#6b7280" />
                                    <Text className="text-gray-400 text-xs ml-2">
                                        Connected since {connectedSince}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Group Name */}
                    <View className="flex-row items-center mb-6">
                        {editingName ? (
                            <UnderlinedInput
                                label="Group Name"
                                value={groupName}
                                onChangeText={(text) => setGroupName(text)}
                            />
                        ) : (
                            <Text className="text-white text-2xl font-bold">{groupName}</Text>
                        )}

                        <TouchableOpacity
                            className="ml-4"
                            onPress={editingName ? handleUpdateName : () => setEditingName(true)}
                        >
                            <Ionicons
                                name={editingName ? "checkmark" : "pencil"}
                                size={24}
                                color="#22d3ee"
                                className={editingName ? "mt-4" : ""}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Participants */}
                    <Text className="text-cyan-400 text-lg font-bold mb-2">Participants</Text>
                    {displayedParticipants.map((item) => (
                        <View key={item._id}>{renderParticipant({ item })}</View>
                    ))}

                    {!showAllParticipants && chat.participants.length > 5 && (
                        <TouchableOpacity
                            onPress={() => setShowAllParticipants(true)}
                            className="mt-3 py-2"
                        >
                            <Text className="text-cyan-400 text-center">
                                Load all {chat.participants.length} participants
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Action buttons - Now outside and below FlatList */}
                    <View className="mt-8">
                        {isAdmin && (
                            <GlassButton
                                title="Add Members"
                                onPress={() => setAddParticipantVisible(true)}
                            />
                        )}
                        <GlassButton
                            title="Leave Group"
                            onPress={() => leaveGroup(chat._id)}
                            bgColor="bg-red-400/10"
                            borderColor="border-red-400/30"
                            textColor="text-red-400"
                        />
                    </View>
                </ScrollView>
                {/* Dropdown Modal */}
                {dropdownVisible && selectedUser && (
                    <Modal
                        transparent
                        animationType="fade"
                        visible={dropdownVisible}
                        onRequestClose={() => setDropdownVisible(false)}
                    >
                        <TouchableOpacity
                            className="flex-1 bg-black/50 justify-center items-center"
                            onPress={() => setDropdownVisible(false)}
                            activeOpacity={1}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#22d3ee" />
                            ) : (
                                <View className="bg-gray-900 rounded-xl w-64 p-4">
                                    <TouchableOpacity onPress={() => handleOptionSelect("remove")}>
                                        <Text className="text-red-400 text-lg mb-3">
                                            Remove Participant
                                        </Text>
                                    </TouchableOpacity>

                                    {!chat.admin.includes(selectedUser._id) && (
                                        <TouchableOpacity
                                            onPress={() => handleOptionSelect("makeAdmin")}
                                        >
                                            <Text className="text-cyan-400 text-lg">
                                                Make Admin
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                    {chat.admin.includes(selectedUser._id) &&
                                        chat.superAdmin !== selectedUser._id && (
                                            <TouchableOpacity
                                                onPress={() => handleOptionSelect("removeAdmin")}
                                            >
                                                <Text className="text-yellow-400 text-lg">
                                                    Remove Admin
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                </View>
                            )}
                        </TouchableOpacity>
                    </Modal>
                )}
                <AddParticipantModal
                    chatId={chat._id}
                    visible={addParticipantVisible}
                    onClose={() => setAddParticipantVisible(false)}
                    refetch={refetch}
                />
            </LinearGradient>
        </SafeAreaView>
    );
};

export default GroupChatInfo;
