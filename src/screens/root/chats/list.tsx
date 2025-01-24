import { User } from "@/src/services/memory/types"
import { FlatList } from "react-native-gesture-handler"
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native"
import { useTranslateService } from "@/src/providers/translateProvider"
import { ChatUser } from "@/src/services/zustand/chats"
import { useCallback, useEffect, useState } from "react"
import { NDKEvent } from "@nostr-dev-kit/ndk"
import theme from "@/src/theme"
import { userService } from "@/src/core/userManager"
import { memo } from "react"
import { messageService } from "@/src/core/messageManager"

type Props = {
    user: User, 
    chats?: ChatUser[],
    handleOpenChat: (chat_id: string, user: User) => void
}

const ChatList = ({ user, chats, handleOpenChat }: Props) => {
  
    const { useTranslate } = useTranslateService()

    const EmptyComponent = () => {
        return (
            <Text style={{ color: theme.colors.gray, marginTop: 200, textAlign: "center" }}>
                {useTranslate("chat.empty")}
            </Text>
        )
    }

    const ListItem = memo(({ item }: { item: ChatUser }) => {

        const [follow, setFollow] = useState<User>({})
        const [event, setEvent] = useState<NDKEvent>(item.lastMessage)

        useEffect(() => {             
            userService.getProfile(item.lastMessage.pubkey).then(setFollow)
            messageService.decryptMessage(user, item.lastMessage).then(setEvent)
        }, [])

        return (
            <View style={{ width: "100%", paddingVertical: 3 }}>
                <TouchableOpacity
                    activeOpacity={.7}
                    style={styles.chatRow}
                    onPress={() => handleOpenChat(item.chat_id, follow)}
                >
                    <View style={{ width: "15%" }}>
                        <View style={styles.profile}>
                            {follow?.picture && <Image onError={() => { follow.picture = "" }} source={{ uri: follow.picture }} style={{ flex: 1 }} />}
                            {!follow?.picture && <Image source={require("assets/images/defaultProfile.png")} style={{ width: 50, height: 50 }} />}
                        </View>
                    </View>
                    <View style={{ width: "60%", overflow: "hidden" }}>
                        {(follow.display_name || follow.name) &&
                            <Text style={styles.profileName}>
                                { (follow?.display_name ?? follow?.name ?? "").substring(0, 20) }
                            </Text>
                        }
                        
                        <Text style={styles.message}>
                            {event.content.substring(0, 30)}..
                        </Text>
                    </View>                    
                    <View style={{ width: "25%", overflow: "hidden", flexDirection: "row-reverse" }}>
                        <Text style={styles.dateMessage}>
                            {new Date((event.created_at ?? 1) * 1000).toDateString()}
                        </Text>
                    </View>
                    { !!item.unreadCount && 
                        <View style={styles.notify}>
                            <Text style={{ fontSize: 10, color: theme.colors.white }}>
                                {item.unreadCount}
                            </Text>
                        </View>
                    } 
                </TouchableOpacity>
            </View>
        )
    })

    const renderItem = useCallback(({ item }: { item: ChatUser }) => {
        return <ListItem item={item}/>
    }, [])

    return (
        <FlatList
            data={chats}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.chat_id}-${item?.unreadCount??0}`}
            style={styles.chatsScroll}
            ListEmptyComponent={EmptyComponent}
        />
    )
}

const styles = StyleSheet.create({
    chatsScroll: { flex: 1, padding: 10 },
    chatRow: { minHeight: 75, flexDirection: "row" },
    profile: { width: 50, height: 50, borderRadius: 50, overflow: "hidden" },
    profileName: { fontSize: 16, fontWeight: "500", color: theme.colors.white, paddingHorizontal: 5 },
    message: { color: theme.colors.gray, padding: 2 },
    dateMessage: { color: theme.colors.white, fontSize: 11, fontWeight: "500" },
    notify: { position: "absolute", bottom: 32, right: 14, borderRadius: 4, 
        backgroundColor: theme.colors.red, padding: 2, minWidth: 18, alignItems: "center" }
})

export default ChatList
