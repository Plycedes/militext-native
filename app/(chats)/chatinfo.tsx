import useAxios from "@/hooks/useAxios";
import { UserInterface } from "@/types/misc";
import { Chat } from "@/types/responseTypes"; // your Chat interface
import { getSingleInfo } from "@/utils/apiMethods";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, SafeAreaView, Text, TouchableOpacity, View } from "react-native";

type Props = {
    chat: Chat;
    onBack: () => void;
};

const OneOnOneChatInfo: React.FC<Props> = () => {
    const { chatId } = useLocalSearchParams<{ chatId: string }>();
    const { data: chat } = useAxios<Chat>(getSingleInfo, chatId);
    const [participant, setParticipant] = useState<UserInterface | null>(null);
    const [connectedSince, setConnectedSince] = useState<string | null>(null);

    useEffect(() => {
        if (chat?.participants[0]) {
            setParticipant(chat?.participants[0]);
            const connected = chat.createdAt ? dayjs(chat.createdAt).format("MMMM D, YYYY") : null;
            setConnectedSince(connected);
        }
    }, [chat]);

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

    function renderFriendshipLabel(label: string) {
        switch (label.toLowerCase()) {
            case "best friend":
                return (
                    <View className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-1 rounded-full border border-purple-400/30 ml-2">
                        <Text className="text-purple-300 text-xs font-bold">
                            {label.toUpperCase()}
                        </Text>
                    </View>
                );

            case "close friend":
                return (
                    <View className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-3 py-1 rounded-full border border-green-400/30 ml-2">
                        <Text className="text-green-300 text-xs font-bold">
                            {label.toUpperCase()}
                        </Text>
                    </View>
                );

            case "acquaintance":
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

            case "soulmate":
                return (
                    <View className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 px-3 py-1 rounded-full border border-cyan-400/30 ml-2">
                        <Text className="text-cyan-300 text-xs font-bold">
                            {label.toUpperCase()}
                        </Text>
                    </View>
                );

            case "inseparable":
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
    }

    if (!chat)
        return (
            <SafeAreaView className="flex-1 bg-black">
                <LinearGradient
                    colors={["#0a0a0a", "#1a0a2e", "#16213e", "#0a203bff"]}
                    className="flex-1 px-6 py-8"
                ></LinearGradient>
            </SafeAreaView>
        );

    return (
        <SafeAreaView className="flex-1 bg-black">
            <LinearGradient
                colors={["#0a0a0a", "#1a0a2e", "#16213e", "#0a203bff"]}
                className="flex-1 px-6 py-8"
            >
                {/* Header */}
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color="#22d3ee" />
                    </TouchableOpacity>
                    <Text className="text-white text-2xl font-bold ml-4">Chat Info</Text>
                </View>

                {/* Participant Info */}
                {participant && (
                    <View className="items-center mt-10 px-6">
                        {/* Status Indicator */}
                        {/* <View className="absolute top-2 right-6 flex-row items-center">
                            <View className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2" />
                            <Text className="text-green-400 text-xs font-medium">ONLINE</Text>
                        </View> */}

                        {/* Avatar Section with Enhanced Effects */}
                        <View className="relative mb-6">
                            {/* Outer Glow Ring */}
                            <View className="absolute inset-[-8px] rounded-full border border-cyan-400/30 animate-pulse" />

                            {/* Main Avatar */}
                            <View className="relative">
                                <Image
                                    source={{
                                        uri: participant.avatar || "https://i.pravatar.cc/300",
                                    }}
                                    className="w-36 h-36 rounded-full border-4 border-cyan-400/60"
                                />

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

                            {/* Verification Badge */}
                            {/* <View className="absolute -bottom-2 -right-2 bg-cyan-500 rounded-full p-1">
                                <Ionicons name="checkmark" size={12} color="white" />
                            </View> */}
                        </View>

                        {/* Username with Glitch Effect */}
                        <View className="relative">
                            <Text className="text-cyan-300 text-3xl font-extrabold tracking-wide">
                                {participant.username}
                            </Text>
                            {/* Glitch Shadow */}
                            <Text
                                className="absolute top-0 left-0 text-red-400/20 text-3xl font-extrabold tracking-wide"
                                style={{ transform: [{ translateX: 1 }, { translateY: 1 }] }}
                            >
                                {participant.username}
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

                        {/* Bio with Enhanced Styling */}
                        {participant.bio && (
                            <Text className="text-cyan-200/80 text-center italic mt-3 px-4">
                                "{participant.bio}"
                            </Text>
                        )}

                        {/* Stats Grid */}
                        <View className="flex-row space-x-4 mt-6 mb-6">
                            <View className="bg-gray-800/60 border border-cyan-400/30 rounded-lg p-3 items-center min-w-[60px]">
                                <Text className="text-cyan-300 text-lg font-bold">
                                    {formatNumber(chat?.messageCount)}
                                </Text>
                                <Text className="text-gray-400 text-xs">MESSAGES</Text>
                            </View>
                            <View className="bg-gray-800/60 border border-cyan-400/30 rounded-lg p-3 items-center min-w-[60px]">
                                <Text className="text-cyan-300 text-lg font-bold">
                                    {formatNumber(chat?.commonGroupCount)}
                                </Text>
                                <Text className="text-gray-400 text-xs">GROUPS</Text>
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

                        {/* Enhanced Contact Section */}
                        <View className="w-full space-y-3">
                            {participant.email && (
                                <View className="bg-gray-800/40 border border-cyan-400/20 rounded-lg p-3">
                                    <View className="flex-row items-center">
                                        <View className="bg-cyan-500/20 p-2 rounded-full mr-3">
                                            <Ionicons
                                                name="mail-outline"
                                                size={18}
                                                color="#22d3ee"
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-xs uppercase tracking-wide">
                                                EMAIL
                                            </Text>
                                            <Text className="text-gray-200 text-sm font-medium">
                                                {participant.email}
                                            </Text>
                                        </View>
                                        <Ionicons name="copy-outline" size={16} color="#6b7280" />
                                    </View>
                                </View>
                            )}

                            {participant.number && (
                                <View className="bg-gray-800/40 border border-cyan-400/20 rounded-lg p-3">
                                    <View className="flex-row items-center">
                                        <View className="bg-cyan-500/20 p-2 rounded-full mr-3">
                                            <Ionicons
                                                name="call-outline"
                                                size={18}
                                                color="#22d3ee"
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-xs uppercase tracking-wide">
                                                PHONE
                                            </Text>
                                            <Text className="text-gray-200 text-sm font-medium">
                                                {participant.number}
                                            </Text>
                                        </View>
                                        <Ionicons name="copy-outline" size={16} color="#6b7280" />
                                    </View>
                                </View>
                            )}

                            {/* Additional Contact Options */}
                            {/* <View className="bg-gray-800/40 border border-cyan-400/20 rounded-lg p-3">
                                <View className="flex-row items-center">
                                    <View className="bg-cyan-500/20 p-2 rounded-full mr-3">
                                        <Ionicons
                                            name="location-outline"
                                            size={18}
                                            color="#22d3ee"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-xs uppercase tracking-wide">
                                            LOCATION
                                        </Text>
                                        <Text className="text-gray-200 text-sm font-medium">
                                            Neo Tokyo, Sector 7
                                        </Text>
                                    </View>
                                    <Ionicons name="navigate-outline" size={16} color="#6b7280" />
                                </View>
                            </View> */}

                            <View className="bg-gray-800/40 border border-cyan-400/20 rounded-lg p-3">
                                <View className="flex-row items-center">
                                    <View className="bg-cyan-500/20 p-2 rounded-full mr-3">
                                        <Ionicons
                                            name="calendar-outline"
                                            size={18}
                                            color="#22d3ee"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-xs uppercase tracking-wide">
                                            JOINED
                                        </Text>
                                        <Text className="text-gray-200 text-sm font-medium">
                                            {dayjs(participant.createdAt).format("MMMM D, YYYY")}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        {/* `<View className="flex-row space-x-3 mt-6 w-full">
                            <TouchableOpacity className="flex-1 bg-cyan-500/20 border border-cyan-400/50 rounded-lg py-3">
                                <Text className="text-cyan-300 text-center font-bold">MESSAGE</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-gray-800/60 border border-gray-600/50 rounded-lg py-3">
                                <Text className="text-gray-300 text-center font-bold">CALL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="bg-gray-800/60 border border-gray-600/50 rounded-lg py-3 px-4">
                                <Ionicons name="ellipsis-horizontal" size={20} color="#d1d5db" />
                            </TouchableOpacity>
                        </View>` */}

                        {/* Data Visualization */}
                        {/* <View className="w-full mt-6 bg-gray-900/40 border border-cyan-400/20 rounded-lg p-4">
                            <Text className="text-cyan-300 text-sm font-bold mb-3">
                                NEURAL ACTIVITY
                            </Text>
                            <View className="flex-row items-end space-x-1 h-16">
                                {[...Array(12)].map((_, i) => (
                                    <View
                                        key={i}
                                        className="flex-1 bg-gradient-to-t from-cyan-500/60 to-cyan-300/30 rounded-t"
                                        style={{ height: `${Math.random() * 100}%` }}
                                    />
                                ))}
                            </View>
                            <View className="flex-row justify-between mt-2">
                                <Text className="text-gray-500 text-xs">00:00</Text>
                                <Text className="text-gray-500 text-xs">12:00</Text>
                            </View>
                        </View> */}
                    </View>
                )}
            </LinearGradient>
        </SafeAreaView>
    );
};

export default OneOnOneChatInfo;
