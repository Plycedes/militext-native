import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
    return (
        <SafeAreaView className="flex h-screen items-center justify-center">
            <Text className="text-5xl font-pbold">Test</Text>
        </SafeAreaView>
    );
}

