import { GlassButton, InputField } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from "react-native";

interface LoginData {
    username: string;
    password: string;
}

const SignInPage: React.FC = () => {
    const [formData, setFormData] = useState<LoginData>({
        username: "",
        password: "",
    });
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { login } = useAuth();

    const handleInputChange = (field: string, value: string): void => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSignIn = async (): Promise<void> => {
        if (!formData.username || !formData.password) {
            Alert.alert("Error", "Please enter your credentials");
            Vibration.vibrate(100);
            return;
        }

        try {
            setIsLoading(true);
            await login(formData);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBiometricLogin = (): void => {
        Alert.alert("Biometric Access", "Scanning neural patterns...");
        // Add biometric authentication logic here
    };

    const handleQRLogin = (): void => {
        Alert.alert("QR Scanner", "Scanning quantum code...");
        // Add QR code scanning logic here
    };

    const navigateToSignUp = (): void => {
        router.push("/sign-up");
    };

    const handleForgotPassword = (): void => {
        Alert.alert(
            "Reset Key",
            "Recovery protocol initiated. Check your neural implant for instructions."
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <LinearGradient
                colors={["#0a0a0a", "#1a0a2e", "#16213e", "#0f3460"]}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1 px-6"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* Header */}
                    <View className="mt-20 mb-12">
                        <View className="items-center mb-6">
                            <View className="w-20 h-20 bg-cyan-400/20 rounded-full items-center justify-center border border-cyan-400/30 shadow-lg shadow-cyan-400/25">
                                <Ionicons name="chatbubbles-outline" size={32} color="#00d4ff" />
                                {/* Pulsing ring effect */}
                                <View className="absolute w-24 h-24 border border-cyan-400/10 rounded-full animate-ping" />
                            </View>
                        </View>
                        <Text className="text-4xl font-bold text-white text-center mb-3">
                            Access Grid
                        </Text>
                        <Text className="text-cyan-300 text-center opacity-80 text-lg">
                            Enter the neural network
                        </Text>
                        <View className="flex-row items-center justify-center mt-3">
                            <View className="w-12 h-0.5 bg-cyan-400/60 rounded-full" />
                            <View className="w-3 h-3 bg-cyan-400 rounded-full mx-3 shadow-lg shadow-cyan-400/50" />
                            <View className="w-12 h-0.5 bg-cyan-400/60 rounded-full" />
                        </View>
                    </View>

                    {/* Form Container */}
                    <View className="bg-gray-900/40 rounded-2xl p-6 border border-cyan-500/20 backdrop-blur-sm shadow-2xl shadow-cyan-500/10">
                        {/* Email Input */}
                        <InputField
                            title="Access ID"
                            icon="mail-outline"
                            keyId="username"
                            value={formData.username}
                            placeholder="neural"
                            keyboardType="email-address"
                            autoComplete="username"
                            secured={false}
                            bottomMargin="mb-5"
                            handleInputChange={handleInputChange}
                        />

                        {/* Password Input */}
                        <InputField
                            title="Security Key"
                            icon="lock-closed-outline"
                            keyId="password"
                            value={formData.password}
                            placeholder="Enter your passkey"
                            keyboardType="default"
                            autoComplete="password"
                            secured={true}
                            bottomMargin="mb-6"
                            handleInputChange={handleInputChange}
                        />

                        {/* Remember Me & Forgot Password */}
                        <View className="flex-row justify-between items-center mb-8">
                            <TouchableOpacity
                                className="flex-row items-center"
                                onPress={() => setRememberMe(!rememberMe)}
                            >
                                <View
                                    className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center transition-all duration-200 ${
                                        rememberMe
                                            ? "bg-cyan-500 border-cyan-500 shadow-lg shadow-cyan-500/30"
                                            : "border-gray-600 bg-gray-800/30"
                                    }`}
                                >
                                    {rememberMe && (
                                        <Ionicons name="checkmark" size={14} color="white" />
                                    )}
                                </View>
                                <Text className="text-gray-300 text-sm">Stay connected</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleForgotPassword}>
                                <Text className="text-cyan-400 text-sm font-medium underline">
                                    Reset Key?
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Sign In Button */}
                        <GlassButton
                            title="Connect to Grid"
                            onPress={handleSignIn}
                            isLoading={isLoading}
                        />

                        {/* Quick Access */}
                        <TouchableOpacity className="mb-6 bg-gray-800/30 rounded-xl py-3 px-4 border border-gray-700/30">
                            <View className="flex-row items-center justify-center">
                                <Ionicons name="flash-outline" size={18} color="#fbbf24" />
                                <Text className="ml-2 text-yellow-400 font-medium text-sm">
                                    Quick Neural Sync
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View className="flex-row items-center my-6">
                            <View className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
                            <Text className="mx-4 text-gray-400 text-sm">alternative access</Text>
                            <View className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
                        </View>

                        {/* Alternative Access Methods */}
                        <View className="space-y-3 mb-4">
                            <TouchableOpacity
                                className="bg-gray-800/50 rounded-xl py-3 px-4 border border-gray-700/50 flex-row items-center justify-center shadow-inner"
                                onPress={handleBiometricLogin}
                            >
                                <Ionicons name="finger-print-outline" size={22} color="#00d4ff" />
                                <Text className="ml-3 text-white font-medium">Biometric Scan</Text>
                                <View className="ml-auto">
                                    <View className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="bg-gray-800/50 rounded-xl py-3 px-4 border border-gray-700/50 flex-row items-center justify-center shadow-inner"
                                onPress={handleQRLogin}
                            >
                                <Ionicons name="qr-code-outline" size={22} color="#00d4ff" />
                                <Text className="ml-3 text-white font-medium">Neural QR Code</Text>
                                <View className="ml-auto">
                                    <Ionicons name="camera-outline" size={16} color="#64748b" />
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Emergency Access */}
                        <TouchableOpacity className="bg-red-900/20 border border-red-500/30 rounded-xl py-2 px-4">
                            <View className="flex-row items-center justify-center">
                                <Ionicons name="warning-outline" size={16} color="#ef4444" />
                                <Text className="ml-2 text-red-400 font-medium text-xs">
                                    Emergency Override
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up Link */}
                    <View className="flex-row justify-center mt-8 mb-8">
                        <Text className="text-gray-400">New to the Grid? </Text>
                        <TouchableOpacity onPress={navigateToSignUp}>
                            <Text className="text-cyan-400 font-medium underline">
                                Initialize Connection
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View className="items-center pb-6">
                        <Text className="text-gray-500 text-xs text-center mb-2">
                            Secured by quantum encryption • Neural Protocol v2.1
                        </Text>
                        <View className="flex-row items-center space-x-2">
                            <View className="flex-row items-center">
                                <View className="w-1 h-1 bg-green-400 rounded-full" />
                                <Text className="ml-1 text-green-400 text-xs">Grid Online</Text>
                            </View>
                            <Text className="text-gray-600 text-xs">•</Text>
                            <View className="flex-row items-center">
                                <View className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                                <Text className="ml-1 text-cyan-400 text-xs">Neural Active</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

export default SignInPage;
