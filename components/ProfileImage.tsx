import { useImagePicker } from "@/hooks/useImagePicker";
import { GroupChatAPI, UserAPI } from "@/utils/apiMethods";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Image, TouchableOpacity, View } from "react-native";

type ProfileImageProps = {
    image: string; // current avatar uri
    setShow: React.Dispatch<React.SetStateAction<boolean>>; // to hide/show the overlay
    refetch: () => Promise<any>;
    permission: boolean;
    chatId?: string;
};

const ProfileImage: React.FC<ProfileImageProps> = ({
    image,
    setShow,
    refetch,
    permission,
    chatId,
}) => {
    const [uploading, setUploading] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const { pickImage } = useImagePicker();

    const handlePfpUpdate = async () => {
        setUploading(true);

        try {
            const selectedImage = await pickImage();

            if (!selectedImage) {
                console.log("Select an image");
                setUploading(false);
                return;
            }

            setLoading(true);
            if (chatId) {
                await GroupChatAPI.updateGroupAvatar(chatId, { avatar: selectedImage });
            } else {
                await UserAPI.updateUserPfp({ avatar: selectedImage });
            }

            await refetch();
        } catch (error: any) {
            console.log("Error updating pfp:", error?.response.data.message);
        } finally {
            setUploading(false);
            setLoading(false);
        }
    };

    return (
        <View className="w-full h-full bg-transparent z-100 mt-10 p-5">
            {/* Header */}
            <View className="flex flex-row justify-between items-center">
                {/* Back */}
                <TouchableOpacity onPress={() => setShow(false)}>
                    <Ionicons name="arrow-back" size={28} color="#00d4ff" />
                </TouchableOpacity>

                {/* Edit / Loader */}
                {permission && (
                    <View>
                        {uploading ? (
                            <Ionicons name="sync" size={28} color="#00d4ff" />
                        ) : (
                            <TouchableOpacity onPress={handlePfpUpdate}>
                                <Ionicons name="create-outline" size={28} color="#00d4ff" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            {/* Avatar */}
            <View className="p-2 flex items-center justify-center">
                {loading ? (
                    <ActivityIndicator size="large" color="cyan" />
                ) : (
                    <Image
                        source={{ uri: image }}
                        className="w-[60%] h-[60%] rounded-lg mt-20"
                        resizeMode="cover"
                    />
                )}
            </View>
        </View>
    );
};

export default ProfileImage;
