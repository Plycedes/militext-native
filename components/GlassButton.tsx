import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type GlassButtonProps = {
    title: string;
    onPress: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    size?: "sm" | "md" | "lg"; // for flexibility (like Add FAB vs normal buttons)
    icon?: React.ReactNode; // for Ionicons or others
    position?: string;
};

const GlassButton: React.FC<GlassButtonProps> = ({
    title,
    onPress,
    isLoading = false,
    disabled = false,
    size = "md",
    icon,
    position,
}) => {
    const sizeClasses =
        size === "sm"
            ? "py-2 px-4 rounded-lg"
            : size === "lg"
              ? "w-16 h-16 rounded-full items-center justify-center"
              : "py-4 px-6 rounded-xl";

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || isLoading}
            activeOpacity={0.8}
            className={position ? position : "mb-4"}
        >
            <View
                className={`bg-white/10 border border-cyan-400/30 backdrop-blur-md ${sizeClasses}`}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color="#22d3ee" />
                ) : icon ? (
                    icon
                ) : (
                    <Text className="text-cyan-300 text-center font-semibold text-lg">{title}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default GlassButton;
