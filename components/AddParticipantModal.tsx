import { GroupChatAPI } from "@/utils/apiMethods";
import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import GlassButton from "./GlassButton";

interface Participant {
    number: string;
    display: string;
    name?: string;
    isValid: boolean;
}

interface AddParticipantModalProps {
    chatId: string;
    visible: boolean;
    onClose: () => void;
    refetch: () => Promise<void>;
}

const validatePhoneNumber = (number: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
    return phoneRegex.test(number.trim());
};

const AddParticipantModal: React.FC<AddParticipantModalProps> = ({
    visible,
    chatId,
    onClose,
    refetch,
}) => {
    const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<Contacts.Contact[]>([]);
    const [input, setInput] = useState("");
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === "granted") {
                const { data } = await Contacts.getContactsAsync({
                    fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
                });
                setContacts(data);
            }
        })();
    }, []);

    const handleInput = (val: string) => {
        setInput(val);
        setIsValid(validatePhoneNumber(val));

        if (val.trim()) {
            const results = contacts.filter((c) => {
                const nameMatch = c.name?.toLowerCase().includes(val.toLowerCase());
                const phoneMatch = c.phoneNumbers?.some((ph: any) =>
                    ph.number.replace(/\s+/g, "").includes(val.replace(/\s+/g, ""))
                );
                return nameMatch || phoneMatch;
            });
            setFilteredContacts(results.slice(0, 5));
        } else {
            setFilteredContacts([]);
        }
    };

    const handleSelectContact = (c: Contacts.Contact) => {
        const number = c.phoneNumbers?.[0]?.number || "";
        setInput(number);
        setIsValid(validatePhoneNumber(number));
        setFilteredContacts([]);
    };

    const handleApiCall = async () => {
        if (!input.trim() || !isValid) {
            Alert.alert("Invalid Input", "Please enter a valid phone number.");
            return;
        }

        const participant: Participant = {
            number: input.trim(),
            display: input.trim(),
            isValid: true,
        };

        try {
            setLoading(true);
            // Call your API here
            await GroupChatAPI.addParticipantToGroup(chatId, participant.number);
            await refetch();
            Alert.alert("Success", `Participant added successfully!`);
            setInput("");
            setFilteredContacts([]);
        } catch (err: any) {
            console.error(err.response.data.message);
            Alert.alert("Error", "Failed to invite participant.");
        } finally {
            onClose();
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 bg-black/60 justify-center items-center">
                <View className="bg-gray-900 w-11/12 rounded-2xl p-6">
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-cyan-300 text-lg font-bold">Add Participant</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={22} color="#22d3ee" />
                        </TouchableOpacity>
                    </View>

                    {/* Input */}
                    <LinearGradient
                        colors={["rgba(0,255,255,0.1)", "rgba(0,200,255,0.05)"]}
                        className={`rounded-xl border px-4 py-3 flex-row items-center mb-3 ${
                            input && !isValid ? "border-red-500/60" : "border-cyan-400/30"
                        }`}
                    >
                        <Ionicons name="call-outline" size={20} color={isValid ? "#0f0" : "#0ef"} />
                        <TextInput
                            className="flex-1 ml-3 text-cyan-100 text-base"
                            placeholder="Enter number or name"
                            placeholderTextColor="#38bdf8"
                            value={input}
                            onChangeText={handleInput}
                            keyboardType="default"
                            autoComplete="tel"
                        />
                    </LinearGradient>

                    {/* Contacts suggestions */}
                    {filteredContacts.length > 0 && (
                        <ScrollView className="max-h-40 mb-3">
                            {filteredContacts.map((c) => (
                                <TouchableOpacity
                                    key={c.id}
                                    onPress={() => handleSelectContact(c)}
                                    className="px-3 py-2 border-b border-cyan-500/20"
                                >
                                    <Text className="text-cyan-100">{c.name}</Text>
                                    {c.phoneNumbers?.[0] && (
                                        <Text className="text-cyan-400 text-xs">
                                            {c.phoneNumbers[0].number}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {/* API button */}
                    <GlassButton title="Add Member" onPress={handleApiCall} isLoading={loading} />
                </View>
            </View>
        </Modal>
    );
};

export default AddParticipantModal;
