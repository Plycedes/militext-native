// useFCM.ts
import { apiClient } from "@/utils/apiClient";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";
import messaging from "@react-native-firebase/messaging";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

export function useFCM() {
    const [fcmToken, setFcmToken] = useState<string | null>(null);

    // Ask for notification permission + get token
    const requestUserPermission = async () => {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
            Alert.alert("Permission denied", "You will not receive notifications");
            return null;
        }

        const token = await messaging().getToken();
        setFcmToken(token);
        console.log("✅ FCM Token:", token);

        await sendTokenToBackend(token);
        return token;
    };

    const sendTokenToBackend = async (token: string) => {
        try {
            await apiClient.post("/user/fcm-token", { fcmToken: token });
            console.log("✅ FCM token saved to backend");
        } catch (err) {
            console.error("❌ Failed to send FCM token to backend:", err);
        }
    };

    // Display a notification with Notifee
    const displayNotification = async (remoteMessage: any) => {
        const { senderName, messageText, chatId } = remoteMessage.data || {};
        await notifee.displayNotification({
            title: senderName || "New message",
            body: messageText || "You have a new message",
            android: {
                channelId: "messages",
                importance: AndroidImportance.HIGH,
                pressAction: {
                    id: "default",
                    launchActivity: "default", // makes it open app if killed
                },
            },
            data: { chatId },
        });
    };

    // Foreground notifications
    const handleForegroundMessages = () =>
        messaging().onMessage(async (remoteMessage) => {
            console.log("📩 Foreground notification:", remoteMessage);
            await displayNotification(remoteMessage);
        });

    // Background + killed state notifications
    const handleBackgroundMessages = () => {
        messaging().setBackgroundMessageHandler(async (remoteMessage) => {
            console.log("📩 Background notification:", remoteMessage);
            await displayNotification(remoteMessage);
        });

        notifee.onBackgroundEvent(async ({ type, detail }) => {
            if (type === EventType.PRESS) {
                const chatId = detail.notification?.data?.chatId;
                if (chatId) {
                    console.log("➡️ Opening chat from background:", chatId);
                    router.push(`/chat/${chatId}`);
                }
            }
        });
    };

    // Foreground notification clicks
    const handleNotificationClicks = () =>
        notifee.onForegroundEvent(async ({ type, detail }) => {
            if (type === EventType.PRESS) {
                const chatId = detail.notification?.data?.chatId;
                if (chatId) {
                    console.log("➡️ Opening chat from foreground:", chatId);
                    router.push(`/chat/${chatId}`);
                }
            }
        });

    // Handle app opened from killed state
    const checkInitialNotification = async () => {
        const initialNotification = await notifee.getInitialNotification();
        if (initialNotification?.notification) {
            const chatId = initialNotification.notification.data?.chatId;
            if (chatId) {
                console.log("➡️ Opening chat from killed state:", chatId);
                router.push(`/chat/${chatId}`);
            }
        }
    };

    useEffect(() => {
        // Create Android channel
        if (Platform.OS === "android") {
            notifee.createChannel({
                id: "messages",
                name: "Messages",
                importance: AndroidImportance.HIGH,
            });
        }

        requestUserPermission();
        handleBackgroundMessages();
        checkInitialNotification();

        const unsubscribeForeground = handleForegroundMessages();
        const unsubscribeClicks = handleNotificationClicks();

        return () => {
            unsubscribeForeground();
            unsubscribeClicks();
        };
    }, []);

    return { fcmToken };
}
