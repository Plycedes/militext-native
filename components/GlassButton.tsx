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
    borderColor?: string;
    textColor?: string;
    bgColor?: string;
};

const GlassButton: React.FC<GlassButtonProps> = ({
    title,
    onPress,
    isLoading = false,
    disabled = false,
    size = "md",
    icon,
    position,
    borderColor = "cyan-400/30",
    textColor = "cyan-400",
    bgColor = "cyan-400/10",
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
                className={`bg-${bgColor} border border-${borderColor} backdrop-blur-md ${sizeClasses}`}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color="#22d3ee" />
                ) : (
                    <View className="flex flex-row gap-2 items-center justify-center">
                        {icon && title ? (
                            // Both icon + title
                            <>
                                <View>{icon}</View>
                                <Text
                                    className={`text-${textColor} text-center font-psemibold text-lg`}
                                >
                                    {title}
                                </Text>
                            </>
                        ) : icon ? (
                            // Only icon
                            <View>{icon}</View>
                        ) : title ? (
                            // Only title
                            <Text
                                className={`text-${textColor} text-center font-psemibold text-lg`}
                            >
                                {title}
                            </Text>
                        ) : null}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default GlassButton;
