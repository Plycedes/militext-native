import React, { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

type PasswordModalProps = {
    visible: boolean;
    onCancel: () => void;
    onConfirm: (password: string) => void;
};

const PasswordModal: React.FC<PasswordModalProps> = ({ visible, onCancel, onConfirm }) => {
    const [password, setPassword] = useState("");

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/70 items-center justify-center px-6">
                <View className="bg-black/80 border border-cyan-400/40 rounded-2xl p-6 w-full">
                    <Text className="text-cyan-400 text-xl font-bold mb-4 text-center">
                        Confirm Identity
                    </Text>
                    <Text className="text-cyan-300/80 text-center mb-6">
                        Enter your password to save changes
                    </Text>

                    <TextInput
                        secureTextEntry
                        placeholder="Enter password"
                        placeholderTextColor="#22d3ee55"
                        value={password}
                        onChangeText={setPassword}
                        autoCapitalize="none"
                        className="text-white font-pmedium text-lg border-b border-cyan-400 focus:border-cyan-300 mb-8 pb-1"
                    />

                    <View className="flex-row justify-between">
                        <TouchableOpacity
                            onPress={onCancel}
                            className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-400/40"
                        >
                            <Text className="text-red-400 font-bold">Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                onConfirm(password);
                                setPassword("");
                            }}
                            className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40"
                        >
                            <Text className="text-cyan-400 font-bold">Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default PasswordModal;
