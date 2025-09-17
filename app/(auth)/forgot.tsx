import GlassButton from "@/components/GlassButton";
import InputField from "@/components/InputField";
import { resetPassword, sendEmail, verifyEmail } from "@/utils/apiMethods";
import { LocalStorageAsync } from "@/utils/localstorage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Easing,
    KeyboardAvoidingView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Step = "email" | "code" | "reset";

const ForgotPasswordScreen = () => {
    const [step, setStep] = useState<Step>("email");
    const [formData, setFormData] = useState({
        email: "",
        code: "",
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    // neon pulse animation
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
            ])
        ).start();
    }, []);

    const glow = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["#22d3ee33", "#22d3eeaa"], // subtle pulsing glow
    });

    const handleInputChange = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSendCode = async () => {
        if (!formData.email) return Alert.alert("Error", "Enter your email first.");
        setIsLoading(true);
        try {
            await sendEmail(formData.email);
            setStep("code");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!formData.code) return Alert.alert("Error", "Enter the code.");
        setIsLoading(true);
        try {
            const res = await verifyEmail(formData.email, formData.code);
            await LocalStorageAsync.set("access", res.data.data.reset_token);
            setStep("reset");
        } catch (error: any) {
            console.log(error.response.data);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!formData.password || !formData.confirmPassword) {
            return Alert.alert("Error", "Fill in both password fields.");
        }
        if (formData.password !== formData.confirmPassword) {
            return Alert.alert("Error", "Passwords do not match.");
        }
        setIsLoading(true);
        try {
            await resetPassword(formData.password);
            Alert.alert("Success", "Password has been reset!");
            router.replace("/sign-in");
        } catch (error: any) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-black justify-center">
            <LinearGradient
                colors={["#0a0a0a", "#1a0a2e", "#16213e", "#0f3460"]}
                className="flex-1 justify-center px-6"
            >
                <View className="mt-20 mb-12">
                    <View className="items-center mb-6">
                        <View className="w-20 h-20 bg-cyan-400/20 rounded-full items-center justify-center border border-cyan-400/30 shadow-lg shadow-cyan-400/25">
                            <Ionicons name="chatbubbles-outline" size={32} color="#00d4ff" />
                            {/* Pulsing ring effect */}
                            <View className="absolute w-24 h-24 border border-cyan-400/10 rounded-full animate-ping" />
                        </View>
                    </View>
                    <Text className="text-4xl font-pbold text-white text-center mb-3">
                        Reset Access
                    </Text>
                    <Text className="text-cyan-300 text-center font-pmedium opacity-80 text-lg">
                        Regenerate your Passkey
                    </Text>
                    <View className="flex-row items-center justify-center mt-3">
                        <View className="w-12 h-0.5 bg-cyan-400/60 rounded-full" />
                        <View className="w-3 h-3 bg-cyan-400 rounded-full mx-3 shadow-lg shadow-cyan-400/50" />
                        <View className="w-12 h-0.5 bg-cyan-400/60 rounded-full" />
                    </View>
                </View>

                <KeyboardAvoidingView>
                    <Animated.View
                        style={{
                            borderWidth: 2,
                            borderColor: glow,
                            borderRadius: 20,
                            padding: 20,
                            shadowColor: "#22d3ee",
                            shadowOpacity: 0.8,
                            shadowRadius: 20,
                        }}
                    >
                        {step === "email" && (
                            <View className="w-full">
                                <InputField
                                    title="Access ID"
                                    icon="mail-outline"
                                    keyId="email"
                                    value={formData.email}
                                    placeholder="neural@matrix.io"
                                    keyboardType="email-address"
                                    autoComplete="username"
                                    secured={false}
                                    bottomMargin="mb-6"
                                    handleInputChange={handleInputChange}
                                />
                                <GlassButton
                                    title="Get Code"
                                    onPress={handleSendCode}
                                    isLoading={isLoading}
                                />
                            </View>
                        )}

                        {step === "code" && (
                            <View className="w-full">
                                <InputField
                                    title="Verification Code"
                                    icon="key-outline"
                                    keyId="code"
                                    value={formData.code}
                                    placeholder="Enter code"
                                    keyboardType="number-pad"
                                    autoComplete="sms-otp"
                                    secured={false}
                                    bottomMargin="mb-6"
                                    handleInputChange={handleInputChange}
                                />
                                <GlassButton
                                    title="Verify"
                                    onPress={handleVerifyCode}
                                    isLoading={isLoading}
                                />
                                <Text className="text-cyan-300/80 text-base mb-6 text-left">
                                    A verification code has been sent to{"\n"}
                                    <Text className="text-cyan-400 font-bold">
                                        {formData.email}
                                    </Text>
                                </Text>
                                <View className="flex-row justify-between w-full mt-6">
                                    <TouchableOpacity onPress={handleSendCode}>
                                        <Text className="text-cyan-400 underline">Resend Code</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setStep("email")}>
                                        <Text className="text-cyan-400 underline">
                                            Try Different Email
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {step === "reset" && (
                            <View className="w-full">
                                <InputField
                                    title="New Passkey"
                                    icon="lock-closed-outline"
                                    keyId="password"
                                    value={formData.password}
                                    placeholder="Enter new passkey"
                                    keyboardType="default"
                                    autoComplete="password"
                                    secured={true}
                                    bottomMargin="mb-5"
                                    handleInputChange={handleInputChange}
                                />
                                <InputField
                                    title="Confirm Passkey"
                                    icon="lock-closed-outline"
                                    keyId="confirmPassword"
                                    value={formData.confirmPassword}
                                    placeholder="Confirm new passkey"
                                    keyboardType="default"
                                    autoComplete="password"
                                    secured={true}
                                    bottomMargin="mb-6"
                                    handleInputChange={handleInputChange}
                                />
                                <GlassButton
                                    title="Set New Passkey"
                                    onPress={handleResetPassword}
                                    isLoading={isLoading}
                                />
                            </View>
                        )}
                    </Animated.View>
                </KeyboardAvoidingView>

                <View className="flex-row justify-center mt-8 mb-8">
                    <Text className="text-gray-400 font-pregular">Remember Password? </Text>
                    <TouchableOpacity onPress={() => router.replace("/sign-in")}>
                        <Text className="text-cyan-400 font-pmedium underline">Access Grid</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
};

export default ForgotPasswordScreen;
