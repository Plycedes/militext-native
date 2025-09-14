import React from "react";
import { Text, TextInput, View } from "react-native";

type UnderlinedInputProps = {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    checkAvailability?: () => void;
    secure?: boolean;
    placeholder?: string;
    error?: string;
};

const UnderlinedInput: React.FC<UnderlinedInputProps> = ({
    label,
    value,
    onChangeText,
    checkAvailability,
    secure = false,
    placeholder = "",
    error,
}) => {
    return (
        <View className="mb-6">
            <Text className="text-cyan-500 font-pmedium text-lg mb-2">{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secure}
                placeholder={placeholder}
                placeholderTextColor="#22d3ee55"
                className="text-white font-pmedium text-lg border-b border-cyan-400 focus:border-cyan-300 pb-1"
                autoCapitalize="none"
                onEndEditing={checkAvailability}
            />
            {error && (
                <Text className="mt-1 ml-2 text-red-500 font-pregular text-sm">Error: {error}</Text>
            )}
        </View>
    );
};

export default UnderlinedInput;
