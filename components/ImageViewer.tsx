import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import React, { useRef, useState } from "react";
import { Dimensions, FlatList, Image, Modal, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

type Attachment = {
    url: string;
    publicId: string;
};

type Props = {
    visible: boolean;
    attachments: Attachment[];
    onClose: () => void;
};

const { width, height } = Dimensions.get("window");

const ImageViewer: React.FC<Props> = ({ visible, attachments, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList<any>>(null);

    const handleScroll = (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    const downloadImage = async () => {
        try {
            const uri = attachments[currentIndex].url;
            const fileUri = FileSystem.documentDirectory + `image_${Date.now()}.jpg`;

            const { uri: localUri } = await FileSystem.downloadAsync(uri, fileUri);

            const perm = await MediaLibrary.requestPermissionsAsync();
            if (perm.status !== "granted") {
                alert("Permission required to save images");
                return;
            }

            await MediaLibrary.createAssetAsync(localUri);
            alert("Image downloaded");
            Toast.show({ type: "success", text1: "Image downloaded" });
        } catch (err) {
            console.error("Download error:", err);
            alert("Failed to download image");
        }
    };

    return (
        <Modal visible={visible} transparent={true} animationType="fade">
            <View className="flex-1 bg-black">
                {/* Header */}
                <View className="absolute top-6 left-4 right-4 z-10 flex-row justify-between items-center">
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="arrow-back" size={28} color="cyan" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={downloadImage}>
                        <Ionicons name="download" size={28} color="cyan" />
                    </TouchableOpacity>
                </View>

                {/* Image Carousel */}
                <FlatList
                    ref={flatListRef}
                    data={attachments}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => item.publicId || index.toString()}
                    renderItem={({ item }) => (
                        <View style={{ width, height }}>
                            <Image
                                source={{ uri: item.url }}
                                className="w-full h-full"
                                resizeMode="contain"
                            />
                        </View>
                    )}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                />

                {/* Pagination dots */}
                {attachments.length > 1 && (
                    <View className="absolute bottom-10 w-full flex-row justify-center gap-1">
                        {attachments.map((_, index) => (
                            <View
                                key={index}
                                className={`w-2 h-2 rounded-full ${
                                    currentIndex === index ? "bg-white" : "bg-gray-500"
                                }`}
                            />
                        ))}
                    </View>
                )}
            </View>
        </Modal>
    );
};

export default ImageViewer;
