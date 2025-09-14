import { ConfirmDialog, GlassButton } from "@/components";
import ProfileImage from "@/components/ProfileImage";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    Animated,
    Image,
    SafeAreaView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const ProfilePage: React.FC = () => {
    const [dialogVisible, setDialogVisible] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [showImg, setShowImg] = useState<boolean>(false);

    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    //const { data: user } = useAxios<UserInterface>(getCurrentUser);
    const { logout, user, current } = useAuth();

    useEffect(() => {
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
        } catch (error: any) {
            console.log(error.response.data.message);
        } finally {
            setLoading(false);
            setDialogVisible(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            {showImg && user?.avatar && (
                <ProfileImage image={user.avatar} setShow={setShowImg} refetch={current} />
            )}
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <LinearGradient
                colors={["#0a0a0a", "#1a0a2e", "#16213e", "#0a203bff"]}
                className="flex-1"
            >
                <Animated.ScrollView
                    style={{ opacity: fadeAnim }}
                    contentContainerStyle={{ padding: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Avatar Section */}
                    <View className="items-center mt-12 mb-8">
                        {/* Pulsing Glow Ring */}

                        <TouchableOpacity onPress={() => setShowImg(true)}>
                            <View className="w-40 h-40 rounded-full items-center justify-center shadow-lg shadow-cyan-400/80 overflow-hidden">
                                {user?.avatar ? (
                                    <Image
                                        source={{ uri: user.avatar }}
                                        className="w-36 h-36 rounded-full border-2 border-cyan-400/30 backdrop-blur-md"
                                    />
                                ) : (
                                    <Ionicons name="person-outline" size={36} color="#00f6ff" />
                                )}
                            </View>
                        </TouchableOpacity>

                        {/* Username */}
                        <Text className="text-white text-3xl font-extrabold mt-6">
                            {user?.username}
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

                    {/* Edit button */}
                    <View className="mt-8">
                        <GlassButton
                            title="Edit Profile"
                            onPress={() => console.log("Edit")}
                            isLoading={false}
                            icon={<Ionicons name="clipboard-outline" size={18} color="#fbbf24" />}
                            borderColor="border-yellow-400/30"
                            textColor="text-yellow-400"
                            bgColor="bg-yellow-400/10"
                        />
                    </View>

                    {/* Logout Button */}
                    <View className="">
                        <GlassButton
                            title="Log Out"
                            onPress={handleLogoutClick}
                            isLoading={false}
                            icon={<Ionicons name="power-outline" size={20} color="#52cbf7ff" />}
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
