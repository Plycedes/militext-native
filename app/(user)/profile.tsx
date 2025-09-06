import { ConfirmDialog, GlassButton } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Animated, Image, SafeAreaView, StatusBar, Text, View } from "react-native";

const ProfilePage: React.FC = () => {
    const [dialogVisible, setDialogVisible] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    const { logout } = useAuth();

    React.useEffect(() => {
        // fade-in page
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        // looping avatar glow pulse
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handleLogoutClick = () => {
        setDialogVisible(true);
    };

    const handleLogout = async () => {
        try {
            setLoading(true);
            await logout();
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setDialogVisible(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <LinearGradient
                colors={["#0a0a0a", "#1a0a2e", "#16213e", "#0f3460"]}
                className="flex-1"
            >
                <Animated.ScrollView
                    style={{ opacity: fadeAnim }}
                    contentContainerStyle={{ padding: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Avatar Section */}
                    <View className="items-center mt-12 mb-8">
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <LinearGradient
                                colors={["#00d4ff", "#0ea5e9", "#3b82f6"]}
                                className="p-[3px] rounded-full"
                            >
                                <Image
                                    source={{ uri: "https://i.pravatar.cc/300" }}
                                    className="w-36 h-36 rounded-full"
                                />
                            </LinearGradient>
                        </Animated.View>
                        <Text className="text-white text-3xl font-extrabold mt-6">
                            Cyber Wanderer
                        </Text>
                        <Text className="text-cyan-300/80 text-sm mt-1">Connected to the Grid</Text>
                    </View>

                    {/* Glass Card */}
                    <LinearGradient
                        colors={["rgba(0,212,255,0.08)", "rgba(14,165,233,0.1)"]}
                        className="rounded-2xl border border-cyan-400/30 shadow-cyan-500/20 shadow-lg p-6"
                    >
                        {/* Stats */}
                        <View className="flex-row justify-around mb-8">
                            {[
                                { label: "Connections", value: "128", icon: "people-outline" },
                                { label: "Signals Sent", value: "532", icon: "radio-outline" },
                                { label: "Payloads", value: "47", icon: "cube-outline" },
                            ].map((stat, idx) => (
                                <View key={idx} className="items-center">
                                    <Ionicons name={stat.icon as any} size={20} color="#00d4ff" />
                                    <Text className="text-cyan-400 text-xl font-bold mt-2">
                                        {stat.value}
                                    </Text>
                                    <Text className="text-gray-400 text-xs">{stat.label}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Bio */}
                        <View className="items-center">
                            <Text className="text-gray-300 text-center text-base leading-6">
                                Adventurer across the neon realms.{"\n"}
                                Sharing signals. Syncing frequencies.{"\n"}
                                Always online in the collective consciousness.
                            </Text>
                        </View>
                    </LinearGradient>

                    {/* Logout Button */}
                    <View className="mt-16">
                        <GlassButton
                            title="Log Out"
                            onPress={handleLogoutClick}
                            isLoading={false}
                            icon={<Ionicons name="power-outline" size={20} color="white" />}
                        />
                    </View>
                </Animated.ScrollView>

                {/* Confirm Dialog */}
                <ConfirmDialog
                    visible={dialogVisible}
                    title="Confirm Logout"
                    message="Are you sure you want to disconnect from the Grid?"
                    onCancel={() => setDialogVisible(false)}
                    onConfirm={handleLogout}
                />
            </LinearGradient>
        </SafeAreaView>
    );
};

export default ProfilePage;
