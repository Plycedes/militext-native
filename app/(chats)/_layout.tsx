import { Stack } from "expo-router";

const ChatsLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="[chatId]" />
            <Stack.Screen name="create-chat" />
            <Stack.Screen name="chatinfo" />
            <Stack.Screen name="groupinfo" />
        </Stack>
    );
};

export default ChatsLayout;
