import { Stack } from "expo-router";

const ChatsLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="[chatId]" />
            <Stack.Screen name="create-chat" />
        </Stack>
    );
};

export default ChatsLayout;
