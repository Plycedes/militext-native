import { UserAPI } from "@/utils/apiMethods";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";

type ProfileImageProps = {
    image: string; // current avatar uri
    setShow: React.Dispatch<React.SetStateAction<boolean>>; // to hide/show the overlay
    refetch: () => Promise<any>;
};

const ProfileImage: React.FC<ProfileImageProps> = ({ image, setShow, refetch }) => {
    const [uploading, setUploading] = useState(false);

    const openPicker = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            return result.assets[0];
        }
        return null;
    };

    const handlePfpUpdate = async () => {
        setUploading(true);

        try {
            const selectedImage = await openPicker();

            if (!selectedImage) {
                console.log("Select an image");
                return;
            }

            const formData = new FormData();
            formData.append("avatar", {
                uri: selectedImage.uri,
                name: selectedImage.fileName || "avatar.jpg",
                type: selectedImage.type || "image/jpeg",
            } as any);
            console.log("Formdata", formData.get("avatar"));
            await UserAPI.updateUserPfp(formData);
            console.log("Done1");
            await refetch();
            console.log("Done2");
        } catch (error: any) {
            console.error("Error updating pfp:", error.response.data);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View className="absolute top-0 left-0 w-full h-full bg-black/80 backdrop-blur-sm z-50 mt-10 p-5">
            {/* Header */}
            <View className="flex flex-row justify-between items-center">
                {/* Back */}
                <TouchableOpacity onPress={() => setShow(false)}>
                    <Ionicons name="arrow-back" size={28} color="#00d4ff" />
                </TouchableOpacity>

                {/* Edit / Loader */}
                {uploading ? (
                    <Ionicons name="sync" size={28} color="#00d4ff" />
                ) : (
                    <TouchableOpacity onPress={handlePfpUpdate}>
                        <Ionicons name="create-outline" size={28} color="#00d4ff" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Avatar */}
            <View className="p-2 flex items-center justify-center">
                <Image
                    source={{ uri: image }}
                    className="w-[60%] h-[60%] rounded-lg mt-20"
                    resizeMode="cover"
                />
            </View>
        </View>
    );
};

export default ProfileImage;
