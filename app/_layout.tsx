import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Toast, { ToastConfig, ToastConfigParams } from "react-native-toast-message";
import "../global.css";

SplashScreen.preventAutoHideAsync();

const customToastConfig: ToastConfig = {
    success: ({ text1, text2 }: ToastConfigParams<any>) => (
        <View className="flex-row bg-gray-600 p-3 rounded-full z-[9999] max-w-[80%] justify-center items-center">
            <View>
                <Text className="text-white font-semibold">{text1}</Text>
                {text2 ? <Text className="text-gray-300">{text2}</Text> : null}
            </View>
        </View>
    ),
};

export default function RootLayout() {
    const [fontsLoaded, error] = useFonts({
        "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
        "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
        "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
        "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
        "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
        "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
        "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
        "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
        "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    });

    useEffect(() => {
        if (error) throw error;
        if (fontsLoaded) SplashScreen.hideAsync();
    }, [fontsLoaded, error]);

    if (!fontsLoaded && !error) return null;

    return (
        <>
            <AuthProvider>
                <SocketProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        <Stack.Screen name="(chats)" options={{ headerShown: false }} />
                        <Stack.Screen name="(user)" options={{ headerShown: false }} />

                        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    </Stack>
                    <StatusBar style="dark" />
                    <Toast config={customToastConfig} position="bottom" />
                </SocketProvider>
            </AuthProvider>
        </>
    );
}
