import { GlassButton } from "@/components";
import PasswordModal from "@/components/PasswordModal";
import ProfileImage from "@/components/ProfileImage";
import UnderlinedInput from "@/components/UnderlinedInput";
import { useAuth } from "@/context/AuthContext";
import { UserAPI } from "@/utils/apiMethods";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
    Animated,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    View,
} from "react-native";

const ProfilePage: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [showImg, setShowImg] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState(false);

    const [usernameErr, setUsernameErr] = useState<string | undefined>(undefined);
    const [numberErr, setNumberErr] = useState<string | undefined>(undefined);
    const [emailErr, setEmailErr] = useState<string | undefined>(undefined);

    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    const { user, current } = useAuth();

    const [formData, setFormData] = useState({
        username: user?.username || "",
        bio: user?.bio || "",
        email: user?.email || "",
        number: user?.number || "",
    });

    // detect changes between formData and initial user values
    const hasChanges = useMemo(() => {
        if (!user) return false;
        return (
            formData.username !== (user.username || "") ||
            formData.bio !== (user.bio || "") ||
            formData.email !== (user.email || "") ||
            formData.number !== (user.number || "")
        );
    }, [formData, user]);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

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

    const handleSave = async (password: string) => {
        if (!user) return;

        setLoading(true);
        try {
            // Build only changed fields
            const updates: Record<string, string> = {};
            (["username", "bio", "email", "number"] as const).forEach((key) => {
                if (formData[key] !== (user[key] || "")) {
                    updates[key] = formData[key];
                }
            });

            const payload = { ...updates, password };

            console.log("Saving:", payload);
            await UserAPI.updateUser(payload);
            await current();
        } catch (error: any) {
            console.log(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
            setModalVisible(false);
        }
    };

    const handleUsernameChange = async (): Promise<void> => {
        try {
            const response = await UserAPI.checkUsername(formData.username, true);
            const available = response.data.data.available;
            if (available) {
                setUsernameErr(undefined);
            } else {
                setUsernameErr("Username not available");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleNumberChange = async (): Promise<void> => {
        try {
            const response = await UserAPI.checkNumber(formData.number, true);
            const available = response.data.data.available;
            if (available) {
                console.log(available);
                setNumberErr(undefined);
            } else {
                setNumberErr("Number not available");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleEmailChange = async (): Promise<void> => {
        try {
            const response = await UserAPI.checkEmail(formData.email, true);
            const available = response.data.data.available;
            if (available) {
                setEmailErr(undefined);
            } else {
                setEmailErr("Email not available");
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            {showImg && user?.avatar && (
                <ProfileImage
                    image={user.avatar}
                    setShow={setShowImg}
                    refetch={current}
                    permission={true}
                />
            )}
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <LinearGradient
                    colors={["#0a0a0a", "#1a0a2e", "#16213e", "#0a203bff"]}
                    className="flex-1"
                >
                    <Animated.ScrollView
                        style={{ opacity: fadeAnim }}
                        contentContainerStyle={{ padding: 20 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Avatar Section */}
                        <View className="items-center mt-12 mb-8">
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

                        {/* Editable Inputs */}
                        <UnderlinedInput
                            label="Username"
                            value={formData.username}
                            onChangeText={(text) => setFormData((p) => ({ ...p, username: text }))}
                            error={usernameErr}
                            checkAvailability={handleUsernameChange}
                        />
                        <UnderlinedInput
                            label="Bio"
                            value={formData.bio}
                            onChangeText={(text) => setFormData((p) => ({ ...p, bio: text }))}
                            placeholder="Say something cool..."
                        />
                        <UnderlinedInput
                            label="Email"
                            value={formData.email}
                            onChangeText={(text) => setFormData((p) => ({ ...p, email: text }))}
                            error={emailErr}
                            checkAvailability={handleEmailChange}
                        />
                        <UnderlinedInput
                            label="Number"
                            value={formData.number}
                            onChangeText={(text) => setFormData((p) => ({ ...p, number: text }))}
                            placeholder="Add phone number"
                            error={numberErr}
                            checkAvailability={handleNumberChange}
                        />

                        {/* Save button */}
                        <View className="mt-8">
                            <GlassButton
                                title="Save Changes"
                                onPress={() => setModalVisible(true)}
                                isLoading={loading}
                                disabled={!hasChanges}
                                icon={
                                    <Ionicons
                                        name="clipboard-outline"
                                        size={18}
                                        color={hasChanges ? "#24fb52ff" : "#767676ff"}
                                    />
                                }
                                borderColor={
                                    hasChanges ? "border-green-400/30" : "border-gray-600/30"
                                }
                                textColor={hasChanges ? "text-green-400" : "text-gray-500"}
                                bgColor={hasChanges ? "bg-green-400/10" : "bg-gray-800/40"}
                            />
                        </View>
                    </Animated.ScrollView>

                    {/* Password Confirmation Modal */}
                    <PasswordModal
                        visible={modalVisible}
                        onCancel={() => setModalVisible(false)}
                        onConfirm={handleSave}
                    />
                </LinearGradient>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ProfilePage;
