import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

const useAxios = (fn: () => any, page = 1, limit = 5) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fn();
            //console.log(response.data);
            if (response.data.data.data) {
                setData(response.data.data.data);
            } else {
                //console.log(response.data.data);
                setData(response.data.data);
            }
        } catch (error: any) {
            Alert.alert(error || "Something went wrong");
            if (error.response.status === 401 || error.response.status === 403) {
                router.replace("/sign-in");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const refetch = () => fetchData();

    return { data, isLoading, refetch };
};

export default useAxios;
