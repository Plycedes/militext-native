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
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface FormData {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
}

const SignUpPage: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleInputChange = (field: keyof FormData, value: string): void => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSignUp = async (): Promise<void> => {
        if (
            !formData.email ||
            !formData.username ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setIsLoading(true);
        // Add your sign-up logic here
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert("Success", "Account created successfully!");
        }, 2000);
    };

    const navigateToSignIn = (): void => {
        router.push("/sign-in");
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
                    <View className="mt-16 mb-8">
                        <View className="items-center mb-4">
                            <View className="w-16 h-16 bg-cyan-400/20 rounded-full items-center justify-center border border-cyan-400/30 shadow-lg shadow-cyan-400/20">
                                <Ionicons name="chatbubbles-outline" size={28} color="#00d4ff" />
                            </View>
                        </View>
                        <Text className="text-3xl font-bold text-white text-center mb-2">
                            Join the Grid
                        </Text>
                        <Text className="text-cyan-300 text-center opacity-80 text-base">
                            Connect to the neural network
                        </Text>
                        <View className="flex-row items-center justify-center mt-2">
                            <View className="w-8 h-0.5 bg-cyan-400/50 rounded-full" />
                            <View className="w-2 h-2 bg-cyan-400 rounded-full mx-2" />
                            <View className="w-8 h-0.5 bg-cyan-400/50 rounded-full" />
                        </View>
                    </View>

                    {/* Form Container */}
                    <View className="bg-gray-900/40 rounded-2xl p-6 border border-cyan-500/20 backdrop-blur-sm shadow-2xl shadow-cyan-500/10">
                        {/* Email Input */}
                        <View className="mb-4">
                            <Text className="text-cyan-300 text-sm font-medium mb-2">
                                Email Address
                            </Text>
                            <View className="bg-gray-800/50 rounded-xl border border-gray-700/50 flex-row items-center px-4 py-3 shadow-inner">
                                <Ionicons name="mail-outline" size={20} color="#00d4ff" />
                                <TextInput
                                    className="flex-1 ml-3 text-white text-base"
                                    placeholder="neural@grid.com"
                                    placeholderTextColor="#64748b"
                                    value={formData.email}
                                    onChangeText={(value) => handleInputChange("email", value)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                />
                            </View>
                        </View>

                        {/* Username Input */}
                        <View className="mb-4">
                            <Text className="text-cyan-300 text-sm font-medium mb-2">Username</Text>
                            <View className="bg-gray-800/50 rounded-xl border border-gray-700/50 flex-row items-center px-4 py-3 shadow-inner">
                                <Ionicons name="person-outline" size={20} color="#00d4ff" />
                                <TextInput
                                    className="flex-1 ml-3 text-white text-base"
                                    placeholder="cypher_user"
                                    placeholderTextColor="#64748b"
                                    value={formData.username}
                                    onChangeText={(value) => handleInputChange("username", value)}
                                    autoCapitalize="none"
                                    autoComplete="username"
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View className="mb-4">
                            <Text className="text-cyan-300 text-sm font-medium mb-2">Password</Text>
                            <View className="bg-gray-800/50 rounded-xl border border-gray-700/50 flex-row items-center px-4 py-3 shadow-inner">
                                <Ionicons name="lock-closed-outline" size={20} color="#00d4ff" />
                                <TextInput
                                    className="flex-1 ml-3 text-white text-base"
                                    placeholder="Enter secure passkey"
                                    placeholderTextColor="#64748b"
                                    value={formData.password}
                                    onChangeText={(value) => handleInputChange("password", value)}
                                    secureTextEntry={!showPassword}
                                    autoComplete="password"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    className="ml-2 p-1"
                                >
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#64748b"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password Input */}
                        <View className="mb-6">
                            <Text className="text-cyan-300 text-sm font-medium mb-2">
                                Confirm Password
                            </Text>
                            <View className="bg-gray-800/50 rounded-xl border border-gray-700/50 flex-row items-center px-4 py-3 shadow-inner">
                                <Ionicons name="lock-closed-outline" size={20} color="#00d4ff" />
                                <TextInput
                                    className="flex-1 ml-3 text-white text-base"
                                    placeholder="Confirm passkey"
                                    placeholderTextColor="#64748b"
                                    value={formData.confirmPassword}
                                    onChangeText={(value) =>
                                        handleInputChange("confirmPassword", value)
                                    }
                                    secureTextEntry={!showConfirmPassword}
                                    autoComplete="password"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="ml-2 p-1"
                                >
                                    <Ionicons
                                        name={
                                            showConfirmPassword ? "eye-off-outline" : "eye-outline"
                                        }
                                        size={20}
                                        color="#64748b"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Sign Up Button */}
                        <TouchableOpacity
                            className="mb-4"
                            onPress={handleSignUp}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={["#00d4ff", "#0ea5e9", "#3b82f6"]}
                                className="rounded-xl py-4 px-6 shadow-lg shadow-cyan-500/30"
                            >
                                <Text className="text-white text-center font-bold text-lg">
                                    {isLoading ? "Initializing..." : "Initialize Connection"}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Terms */}
                        <Text className="text-xs text-gray-400 text-center mb-4">
                            By connecting, you agree to the{" "}
                            <Text className="text-cyan-400">Neural Protocol Terms</Text> and{" "}
                            <Text className="text-cyan-400">Privacy Matrix</Text>
                        </Text>

                        {/* Divider */}
                        <View className="flex-row items-center my-6">
                            <View className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
                            <Text className="mx-4 text-gray-400 text-sm">or connect via</Text>
                            <View className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
                        </View>

                        {/* Social Buttons */}
                        <View className="flex-row space-x-4 mb-4">
                            <TouchableOpacity className="flex-1 bg-gray-800/50 rounded-xl py-3 px-4 border border-gray-700/50 flex-row items-center justify-center shadow-inner">
                                <Ionicons name="logo-google" size={20} color="#00d4ff" />
                                <Text className="ml-2 text-white font-medium">Neural Link</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-gray-800/50 rounded-xl py-3 px-4 border border-gray-700/50 flex-row items-center justify-center shadow-inner">
                                <Ionicons name="finger-print-outline" size={20} color="#00d4ff" />
                                <Text className="ml-2 text-white font-medium">Bio Scan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Sign In Link */}
                    <View className="flex-row justify-center mt-6 mb-8">
                        <Text className="text-gray-400">Already connected? </Text>
                        <TouchableOpacity onPress={navigateToSignIn}>
                            <Text className="text-cyan-400 font-medium underline">Access Grid</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View className="items-center mt-4">
                        <Text className="text-gray-500 text-xs text-center">
                            Secured by quantum encryption • Neural Protocol v2.1
                        </Text>
                        <View className="flex-row items-center mt-2">
                            <View className="w-1 h-1 bg-cyan-400 rounded-full" />
                            <View className="w-1 h-1 bg-cyan-400/50 rounded-full mx-1" />
                            <View className="w-1 h-1 bg-cyan-400/25 rounded-full" />
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

export default SignUpPage;
