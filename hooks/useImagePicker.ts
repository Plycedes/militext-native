import * as ImagePicker from "expo-image-picker";
import { useCallback } from "react";

export const useImagePicker = () => {
    const pickImage = useCallback(
        async (
            options: Partial<ImagePicker.ImagePickerOptions> = {}
        ): Promise<ImagePicker.ImagePickerAsset | null> => {
            try {
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ["images"],
                    aspect: [4, 3],
                    quality: 1,
                    ...options,
                });

                if (!result.canceled) {
                    return result.assets[0];
                }
                return null;
            } catch (err) {
                console.log("Image picker error:", err);
                return null;
            }
        },
        []
    );

    const pickMultipleImages = useCallback(
        async (
            options: Partial<ImagePicker.ImagePickerOptions> = {}
        ): Promise<ImagePicker.ImagePickerAsset[] | null> => {
            try {
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ["images"],
                    allowsMultipleSelection: true,
                    aspect: [4, 3],
                    quality: 1,
                    ...options,
                });

                if (!result.canceled) {
                    return result.assets;
                }
                return null;
            } catch (err) {
                console.log("Image picker error:", err);
                return null;
            }
        },
        []
    );

    return { pickImage, pickMultipleImages };
};
