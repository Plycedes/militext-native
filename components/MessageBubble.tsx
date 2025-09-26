import { Message } from "@/types/responseTypes";
import { formatTimeOnly } from "@/utils/date-time";
import { useRef } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

const MessageBubble = ({
    item,
    isMe,
    selected,
    currentDate,
    setSelected,
    handleImageTap,
    handleSwipeToReply,
}: {
    item: Message;
    isMe: boolean;
    selected: string[];
    currentDate: Date;
    handleImageTap: (item: Message) => void;
    handleSwipeToReply: (item: Message) => void;
    setSelected: (itemId: string) => void;
}) => {
    const touchableRef = useRef(null);

    const attachments = item.attachments || [];
    const hasAttachments = attachments.length > 0;

    // --- Animated swipe value ---
    const translateX = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    // --- Pan gesture ---
    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if ((isMe && event.translationX < 0) || (!isMe && event.translationX > 0)) {
                translateX.value = event.translationX;
            }
        })
        .onEnd((event) => {
            const direction = isMe ? -1 : 1;
            if (event.translationX * direction > 50) {
                runOnJS(handleSwipeToReply)(item);
            }
            translateX.value = withSpring(0, { damping: 15, stiffness: 120 });
        });

    return (
        <View
            style={{ width: "100%", paddingHorizontal: 16, marginBottom: 8 }}
            className={`${selected.includes(item._id) ? "bg-cyan-300/20" : ""}`}
        >
            <GestureDetector gesture={panGesture}>
                <Animated.View
                    style={[animatedStyle, { alignSelf: isMe ? "flex-end" : "flex-start" }]}
                >
                    <TouchableOpacity
                        ref={touchableRef}
                        activeOpacity={0.8}
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            isMe
                                ? "border border-slate-400/30 shadow-slate-400/20 shadow-md bg-slate-400/10"
                                : "border border-cyan-400/30 shadow-cyan-400/20 shadow-md bg-cyan-400/10"
                        }`}
                        onPress={() => {
                            if (isMe && selected.length > 0) {
                                setSelected(item._id);
                            } else {
                                console.log("Buble");
                                handleImageTap(item);
                            }
                        }}
                        onLongPress={() => {
                            if (isMe) {
                                console.log(item._id);
                                setSelected(item._id);
                            }
                        }}
                    >
                        {/* Reply preview */}
                        {item.replyingTo && (
                            <View className="mb-2 border-l-4 border-cyan-400/60 pl-2">
                                <Text className="text-cyan-300 text-xs font-semibold">
                                    {item.replyingTo.sender?.username || "Unknown"}
                                </Text>
                                <Text className="text-slate-200 text-sm" numberOfLines={1}>
                                    {item.replyingTo.content}
                                </Text>
                            </View>
                        )}

                        {/* Attachments */}
                        {hasAttachments && (
                            <View className="mt-2 relative">
                                <Image
                                    source={{ uri: attachments[0].url }}
                                    className="w-48 h-48 rounded-lg"
                                    resizeMode="cover"
                                />
                                {attachments.length > 1 && (
                                    <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded-full">
                                        <Text className="text-white text-xs font-semibold">
                                            +{attachments.length - 1}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Text message */}
                        {item.content && <Text className="text-white mt-1">{item.content}</Text>}

                        {/* Timestamp & Edited */}
                        <View
                            className={`flex-row gap-1 mt-1 ${
                                isMe ? "justify-end" : "justify-start"
                            }`}
                        >
                            <Text
                                className={`${
                                    isMe ? "text-slate-300/70" : "text-cyan-300/80"
                                } text-xs`}
                            >
                                {formatTimeOnly(currentDate)}
                            </Text>
                            {item.createdAt !== item.updatedAt && (
                                <Text
                                    className={`${
                                        isMe ? "text-slate-300/70" : "text-cyan-300/80"
                                    } text-xs italic`}
                                >
                                    Edited
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

export default MessageBubble;
