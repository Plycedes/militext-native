import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, Animated, Modal, Text, TouchableOpacity, View } from "react-native";

type ConfirmDialogProps = {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
    loading,
}) => {
    const scale = React.useRef(new Animated.Value(0.8)).current;
    const opacity = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(scale, { toValue: 0.8, duration: 200, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start();
        }
    }, [visible]);

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View className="flex-1 bg-black/70 items-center justify-center">
                <Animated.View
                    style={{ transform: [{ scale }], opacity }}
                    className="w-80 rounded-2xl overflow-hidden"
                >
                    <LinearGradient
                        colors={["#0ea5e9", "#3b82f6", "#3b84f8ff"]}
                        className="p-[1.5px] rounded-2xl"
                    >
                        <View className="bg-gray-900/95 rounded-2xl p-6">
                            <Text className="text-xl font-bold text-white mb-2">{title}</Text>
                            <Text className="text-gray-300 mb-6">{message}</Text>

                            <View className="flex-row justify-end gap-4">
                                <TouchableOpacity onPress={onCancel} activeOpacity={0.8}>
                                    <Text className="text-gray-400 font-semibold">Cancel</Text>
                                </TouchableOpacity>
                                {loading ? (
                                    <ActivityIndicator size="small" color="#22d3ee" />
                                ) : (
                                    <TouchableOpacity onPress={onConfirm} activeOpacity={0.8}>
                                        <Text className="text-cyan-400 font-semibold">Confirm</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default ConfirmDialog;
