import AsyncStorage from "@react-native-async-storage/async-storage";

export class LocalStorageAsync {
    static async get(key: string) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
            try {
                return JSON.parse(value);
            } catch (error) {
                return null;
            }
        }
        return null;
    }

    static async set(key: string, value: any) {
        await AsyncStorage.setItem(key, value);
    }

    static async remove(key: string) {
        await AsyncStorage.removeItem(key);
    }

    static async clear() {
        await AsyncStorage.clear();
    }
}
