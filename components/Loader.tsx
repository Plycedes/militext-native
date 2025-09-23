import React from "react";
import { ActivityIndicator, Modal, Text, View } from "react-native";

type LoaderProps = {
    visible: boolean;
    message?: string;
};

const Loader: React.FC<LoaderProps> = ({ visible, message = "Loading..." }) => {
    return (
        <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
            <View className="flex-1 bg-black/50 justify-center items-center">
                <View className="bg-gray-800 px-6 py-4 rounded-xl flex-row items-center">
                    <ActivityIndicator size="large" color="white" />
                    <Text className="text-white text-lg ml-4">{message}</Text>
                </View>
            </View>
        </Modal>
    );
};

export default Loader;
