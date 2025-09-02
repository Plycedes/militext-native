import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Chat = () => {
    const { chatId } = useLocalSearchParams();
    return (
        <SafeAreaView className="flex h-screen justify-center items-center">
            <Text>Chat: {chatId}</Text>
        </SafeAreaView>
    );
};

export default Chat;
