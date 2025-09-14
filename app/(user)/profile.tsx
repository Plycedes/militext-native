import { GlassButton } from "@/components";
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
    const [loading, setLoading] = useState<boolean>(false);
    const [showImg, setShowImg] = useState<boolean>(false);

    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    const { user, current } = useAuth();

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
                    </View>

                    <View className="mt-6">
                        <View className="mb-6">
                            <Text className="text-cyan-500 font-pmedium text-lg">Username</Text>
                            <Text className="text-white font-pmedium text-lg mt-1">
                                {user?.username}
                            </Text>
                        </View>
                        <View className="mb-6">
                            <Text className="text-cyan-500 font-pmedium text-lg">Bio</Text>
                            <Text className="text-white font-pmedium text-lg mt-1">
                                {user?.bio}
                            </Text>
                        </View>
                        <View className="mb-6">
                            <Text className="text-cyan-500 font-pmedium text-lg">Email</Text>
                            <Text className="text-white font-pmedium text-lg mt-1">
                                {user?.email}
                            </Text>
                        </View>
                        <View className="mb-6">
                            <Text className="text-cyan-500 font-pmedium text-lg">Number</Text>
                            <Text className="text-white font-pmedium text-lg mt-1">
                                {user?.number}
                            </Text>
                        </View>
                    </View>

                    {/* Save button */}
                    <View className="mt-8">
                        <GlassButton
                            title="Save Changes"
                            onPress={() => console.log("Edit")}
                            isLoading={loading}
                            icon={<Ionicons name="clipboard-outline" size={18} color="#24fb52ff" />}
                            borderColor="border-green-400/30"
                            textColor="text-green-400"
                            bgColor="bg-green-400/10"
                        />
                    </View>
                </Animated.ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

export default ProfilePage;
