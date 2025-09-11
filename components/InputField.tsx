import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { KeyboardTypeOptions, Text, TextInput, TouchableOpacity, View } from "react-native";

interface InputFieldTypes {
    title: string;
    icon:
        | "lock-closed-outline"
        | "person-outline"
        | "mail-outline"
        | "phone-portrait-outline"
        | "key-outline";
    keyId: string;
    value: string;
    placeholder: string;
    keyboardType: KeyboardTypeOptions;
    autoComplete: "password" | "email" | "username" | "tel" | "sms-otp";
    secured: boolean;
    bottomMargin: string;
    handleInputChange: (key: string, value: string) => void;
}

const InputField: React.FC<InputFieldTypes> = ({
    title,
    icon,
    keyId,
    value,
    placeholder,
    keyboardType,
    autoComplete,
    secured,
    bottomMargin,
    handleInputChange,
}) => {
    const [showValue, setShowValue] = useState<boolean>(false);
    return (
        <View className={bottomMargin}>
            <Text className="text-cyan-300 text-sm font-pmedium mb-2">{title}</Text>
            <View className="bg-gray-800/50 rounded-xl border border-gray-700/50 flex-row items-center px-4 py-3 shadow-inner">
                <Ionicons name={icon} size={20} color="#00d4ff" />
                <TextInput
                    className="flex-1 ml-3 text-white font-pregular text-base"
                    placeholder={placeholder}
                    placeholderTextColor="#64748b"
                    value={value}
                    onChangeText={(value) => handleInputChange(keyId, value)}
                    secureTextEntry={!showValue}
                    keyboardType={keyboardType}
                    autoComplete={autoComplete}
                    autoCapitalize="none"
                />
                {secured && (
                    <TouchableOpacity onPress={() => setShowValue(!showValue)} className="ml-2 p-1">
                        <Ionicons
                            name={showValue ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color="#64748b"
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default InputField;
