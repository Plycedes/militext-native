import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const ChatsLayout = () => {
    return (
        <GestureHandlerRootView>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="[chatId]" />
                <Stack.Screen name="create-chat" />
                <Stack.Screen name="chatinfo" />
                <Stack.Screen name="groupinfo" />
            </Stack>
        </GestureHandlerRootView>
    );
};

export default ChatsLayout;
