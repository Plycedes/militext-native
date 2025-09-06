import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

type AsyncFn<T> = (id?: string) => Promise<any>;

function useAxios<T>(fn: AsyncFn<T>, id?: string, page = 1, limit = 5) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            let response;
            if (id) {
                response = await fn(id);
            } else {
                response = await fn();
            }
            const innerData = response?.data?.data?.data ?? response?.data?.data ?? response?.data;
            setData(innerData as T);
        } catch (error: any) {
            Alert.alert(error?.message || "Something went wrong");
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                router.replace("/sign-in");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refetch = () => fetchData();

    return { data, isLoading, refetch };
}

export default useAxios;
