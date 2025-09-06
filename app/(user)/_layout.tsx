import { Stack } from "expo-router";

const UserLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="profile" />
        </Stack>
    );
};

export default UserLayout;
