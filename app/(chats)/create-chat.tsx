import { GlassButton } from "@/components";
import { createGroupChat, createUserChat } from "@/utils/apiMethods";
import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { JSX, useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View,
} from "react-native";

interface Participant {
    id: string;
    number: string;
    name?: string;
    isValid: boolean;
}

type ChatMode = "individual" | "group";

const CreateChatPage: React.FC = () => {
    const [chatMode, setChatMode] = useState<ChatMode>("individual");
    const [chatName, setChatName] = useState<string>("");
    const [participants, setParticipants] = useState<Participant[]>([
        { id: "1", number: "", isValid: false },
    ]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<{ [key: string]: Contacts.Contact[] }>(
        {}
    );

    const slideAnimation = useRef(new Animated.Value(0)).current;

    const validatePhoneNumber = (number: string): boolean => {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
        return phoneRegex.test(number.trim());
    };

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

    const handleModeChange = (mode: ChatMode): void => {
        setChatMode(mode);
        setParticipants([{ id: "1", number: "", isValid: false }]);
        setChatName("");
        setErrors({});
        Animated.spring(slideAnimation, {
            toValue: mode === "individual" ? 0 : 1,
            useNativeDriver: false,
        }).start();
    };

    const updateParticipant = (id: string, value: string): void => {
        setParticipants((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, number: value, isValid: validatePhoneNumber(value) } : p
            )
        );

        // Reset errors if needed
        if (errors[id]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[id];
                return newErrors;
            });
        }

        // Filter contacts by name or number
        if (value.trim()) {
            const results = contacts.filter((c) => {
                const nameMatch = c.name?.toLowerCase().includes(value.toLowerCase());
                const phoneMatch = c.phoneNumbers?.some((ph: any) =>
                    ph.number.replace(/\s+/g, "").includes(value.replace(/\s+/g, ""))
                );
                return nameMatch || phoneMatch;
            });
            setFilteredContacts((prev) => ({ ...prev, [id]: results }));
        } else {
            setFilteredContacts((prev) => ({ ...prev, [id]: [] }));
        }
    };

    const addParticipant = (): void => {
        if (participants.length >= 50) {
            Alert.alert("Limit Reached", "Maximum 50 participants allowed in a neural collective");
            return;
        }
        const newId = Date.now().toString();
        setParticipants((prev) => [...prev, { id: newId, number: "", isValid: false }]);
    };

    const removeParticipant = (id: string): void => {
        if (participants.length <= 1) return;
        setParticipants((prev) => prev.filter((p) => p.id !== id));
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[id];
            return newErrors;
        });
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (chatMode === "group" && !chatName.trim()) {
            newErrors.chatName = "Neural collective name is required";
        }
        const validParticipants = participants.filter((p) => p.number.trim());
        if (validParticipants.length === 0) {
            newErrors.general = "At least one neural ID is required";
        }
        validParticipants.forEach((p) => {
            if (!p.isValid) newErrors[p.id] = "Invalid neural ID format";
        });
        if (chatMode === "group" && validParticipants.length < 2) {
            newErrors.general = "Neural collective requires at least 2 participants";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateChat = async (): Promise<void> => {
        if (!validateForm()) {
            Vibration.vibrate(100);
            return;
        }
        try {
            setIsLoading(true);
            if (chatMode === "individual") {
                await createUserChat(participants[0].number);
            } else {
                const numbers = participants.map((p) => p.number);
                await createGroupChat({ name: chatName, numbers });
            }
            setParticipants([{ id: "1", number: "", isValid: false }]);
            Alert.alert("Chat created");
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleScanQR = (id: string): void => {
        Alert.alert("QR Scanner", "Scanning for neural signatures...", [
            { text: "Cancel", style: "cancel" },
            { text: "Mock Scan", onPress: () => updateParticipant(id, "+1234567890") },
        ]);
    };

    const renderParticipantInput = (p: Participant, index: number): JSX.Element => (
        <View key={p.id} className="mb-4">
            <View className="flex-row items-center mb-2">
                <Text className="text-cyan-300 text-sm font-medium flex-1">
                    {chatMode === "individual" ? "Target Neural ID" : `Participant ${index + 1}`}
                </Text>
                {chatMode === "group" && participants.length > 1 && (
                    <TouchableOpacity
                        onPress={() => removeParticipant(p.id)}
                        className="w-6 h-6 bg-cyan-400/10 border border-cyan-400/40 rounded-full items-center justify-center"
                    >
                        <Ionicons name="close" size={14} color="#0ef" />
                    </TouchableOpacity>
                )}
            </View>
            <LinearGradient
                colors={["rgba(0,255,255,0.1)", "rgba(0,200,255,0.05)"]}
                className={`rounded-xl border px-4 py-3 flex-row items-center ${
                    errors[p.id] ? "border-red-500/60" : "border-cyan-400/30"
                }`}
            >
                <Ionicons name="call-outline" size={20} color={p.isValid ? "#0f0" : "#0ef"} />
                <TextInput
                    className="flex-1 ml-3 text-cyan-100 text-base"
                    placeholder="+1234567890"
                    placeholderTextColor="#38bdf8"
                    value={p.number}
                    onChangeText={(v) => updateParticipant(p.id, v)}
                    keyboardType="default"
                />
                <TouchableOpacity onPress={() => handleScanQR(p.id)} className="ml-2 p-1">
                    <Ionicons name="qr-code-outline" size={20} color="#0ef" />
                </TouchableOpacity>
                {p.number.trim() && (
                    <View
                        className={`w-2 h-2 rounded-full ml-2 ${
                            p.isValid ? "bg-green-400" : "bg-red-400"
                        }`}
                    />
                )}
            </LinearGradient>
            {filteredContacts[p.id]?.length > 0 && (
                <View className="bg-gray-900 border border-cyan-500/40 rounded-lg mt-1">
                    {filteredContacts[p.id].slice(0, 5).map((c) => (
                        <TouchableOpacity
                            key={c.id}
                            onPress={() => {
                                const number = c.phoneNumbers?.[0]?.number || "";
                                updateParticipant(p.id, number);
                                setFilteredContacts((prev) => ({ ...prev, [p.id]: [] })); // close dropdown
                            }}
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
                </View>
            )}

            {errors[p.id] && <Text className="text-red-400 text-xs mt-1 ml-1">{errors[p.id]}</Text>}
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <LinearGradient
                colors={["#000000", "#020617", "#041527", "#0a1a33"]}
                className="flex-1"
            >
                {/* Header */}
                <View className="flex-row items-center px-6 pt-10 pb-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-cyan-400/10 border border-cyan-500/40 rounded-full items-center justify-center mr-4"
                    >
                        <Ionicons name="arrow-back" size={20} color="#0ef" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-cyan-100 tracking-wide">
                            Neural Bridge
                        </Text>
                        <Text className="text-cyan-400 text-sm opacity-70">
                            Establish new connection
                        </Text>
                    </View>
                </View>

                <ScrollView
                    className="flex-1 px-6"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                    {/* Mode Selection */}
                    <View className="mb-8">
                        <Text className="text-cyan-300 text-sm font-medium mb-3">
                            Connection Type
                        </Text>
                        <LinearGradient
                            colors={["rgba(0,255,255,0.05)", "rgba(0,200,255,0.05)"]}
                            className="rounded-xl p-1 flex-row border border-cyan-400/30"
                        >
                            {["individual", "group"].map((mode) => (
                                <TouchableOpacity
                                    key={mode}
                                    onPress={() => handleModeChange(mode as ChatMode)}
                                    className={`flex-1 py-3 rounded-lg ${
                                        chatMode === mode ? "bg-cyan-400/20" : ""
                                    }`}
                                >
                                    <View className="items-center">
                                        <Ionicons
                                            name={
                                                mode === "individual"
                                                    ? "person-outline"
                                                    : "people-outline"
                                            }
                                            size={22}
                                            color={chatMode === mode ? "#0ef" : "#475569"}
                                        />
                                        <Text
                                            className={`text-xs font-medium mt-1 ${
                                                chatMode === mode
                                                    ? "text-cyan-300"
                                                    : "text-slate-500"
                                            }`}
                                        >
                                            {mode === "individual" ? "Direct Link" : "Collective"}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </LinearGradient>
                    </View>

                    {/* Form */}
                    <LinearGradient
                        colors={["rgba(0,255,255,0.08)", "rgba(0,200,255,0.04)", "rgba(0,0,0,0.1)"]}
                        className="rounded-2xl p-6 border border-cyan-500/30 shadow-lg shadow-cyan-400/20"
                    >
                        {chatMode === "group" && (
                            <View className="mb-6">
                                <Text className="text-cyan-300 text-sm font-medium mb-2">
                                    Neural Collective Name
                                </Text>
                                <LinearGradient
                                    colors={["rgba(0,255,255,0.1)", "rgba(0,200,255,0.05)"]}
                                    className={`rounded-xl border flex-row items-center px-4 py-3 ${
                                        errors.chatName ? "border-red-500/60" : "border-cyan-400/30"
                                    }`}
                                >
                                    <Ionicons name="people-outline" size={20} color="#0ef" />
                                    <TextInput
                                        className="flex-1 ml-3 text-cyan-100 text-base"
                                        placeholder="e.g., Cyber Resistance Network"
                                        placeholderTextColor="#38bdf8"
                                        value={chatName}
                                        onChangeText={setChatName}
                                        keyboardType="default"
                                    />
                                </LinearGradient>
                                {errors.chatName && (
                                    <Text className="text-red-400 text-xs mt-1 ml-1">
                                        {errors.chatName}
                                    </Text>
                                )}
                            </View>
                        )}

                        {/* Participants */}
                        <View className="mb-6">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-cyan-300 text-sm font-medium">
                                    {chatMode === "individual"
                                        ? "Target Connection"
                                        : `Participants (${participants.length})`}
                                </Text>
                                {chatMode === "group" && (
                                    <TouchableOpacity
                                        onPress={addParticipant}
                                        className="bg-cyan-400/10 border border-cyan-400/40 rounded-full w-8 h-8 items-center justify-center"
                                    >
                                        <Ionicons name="add" size={16} color="#0ef" />
                                    </TouchableOpacity>
                                )}
                            </View>
                            {participants.map((p, i) => renderParticipantInput(p, i))}
                        </View>

                        {/* Errors */}
                        {errors.general && (
                            <View className="bg-red-500/10 border border-red-500/40 rounded-xl p-3 mb-4">
                                <View className="flex-row items-center">
                                    <Ionicons name="warning-outline" size={16} color="#f87171" />
                                    <Text className="ml-2 text-red-400 text-sm">
                                        {errors.general}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Button */}
                        <GlassButton
                            title="Establish Connection"
                            onPress={handleCreateChat}
                            isLoading={isLoading}
                        />
                    </LinearGradient>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

export default CreateChatPage;
