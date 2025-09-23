import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Animated, Easing, Image, Text, TouchableOpacity, View } from "react-native";

export type DropdownOption = {
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    action: () => void;
};

interface HeaderProps {
    title: string;
    subtitle?: string;
    dropdownOptions: DropdownOption[];
    showBack?: boolean;
    handleBack?: () => void;
    imageUri?: string;
    isGroupChat?: boolean;
}

const Header: React.FC<HeaderProps> = ({
    title,
    subtitle,
    dropdownOptions,
    showBack,
    handleBack,
    imageUri,
    isGroupChat,
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownHeight = useRef(new Animated.Value(0)).current;

    const toggleDropdown = () => {
        const toValue = isDropdownOpen ? 0 : dropdownOptions.length * 50;
        setIsDropdownOpen(!isDropdownOpen);

        if (toValue === 0) {
            Animated.timing(dropdownHeight, {
                toValue,
                duration: 250,
                useNativeDriver: false,
                easing: Easing.inOut(Easing.ease),
            }).start();
        } else {
            Animated.spring(dropdownHeight, {
                toValue,
                useNativeDriver: false,
                tension: 100,
                friction: 8,
            }).start();
        }
    };

    return (
        <View className="">
            {/* Title + Menu */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row gap-1 items-center">
                    {showBack && (
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color="#00d4ff"
                            onPress={handleBack}
                        />
                    )}
                    <View
                        className={`w-12 h-12 rounded-full items-center justify-center border-2 overflow-hidden`}
                    >
                        {imageUri ? (
                            <Image
                                source={{
                                    uri: imageUri,
                                }}
                                className="w-12 h-12"
                            />
                        ) : (
                            <Ionicons
                                name={isGroupChat ? "people-outline" : "person-outline"}
                                size={24}
                                color="#00f6ff"
                            />
                        )}
                    </View>
                    <View>
                        <Text className="text-2xl font-pbold text-white">{title}</Text>
                        {subtitle && (
                            <Text className="text-cyan-300 text-sm font-pregular opacity-80">
                                {subtitle}
                            </Text>
                        )}
                    </View>
                </View>

                <TouchableOpacity
                    onPress={toggleDropdown}
                    className="w-10 h-10 bg-cyan-400/20 rounded-full items-center justify-center border border-cyan-400/30"
                >
                    <Ionicons name={isDropdownOpen ? "close" : "menu"} size={20} color="#00d4ff" />
                </TouchableOpacity>
            </View>

            {/* Dropdown Menu */}
            <Animated.View
                style={{ height: dropdownHeight, overflow: "hidden" }}
                className="bg-gray-900/60 rounded-xl border border-cyan-500/20 backdrop-blur-sm"
            >
                {dropdownOptions.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        onPress={() => {
                            option.action();
                            toggleDropdown();
                        }}
                        className="flex-row items-center px-4 py-3 border-b border-gray-700/30 last:border-b-0"
                    >
                        <Ionicons name={option.icon} size={20} color="#00d4ff" className="pb-1" />
                        <Text className="ml-3 text-white font-pmedium">{option.label}</Text>
                    </TouchableOpacity>
                ))}
            </Animated.View>
        </View>
    );
};

export default Header;
