import SearchButton from "@components/form/SearchButton"
import { useAuth } from "@src/providers/userProvider"
import { TouchableOpacity, View, Image, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import theme from "@src/theme"
import { useTranslateService } from "@/src/providers/translateProvider"

export const HeaderFeed = ({ navigation }: any) => {

    const { user } = useAuth()
    const { useTranslate } = useTranslateService()
    
    return (
        <View style={styles.header}>
            <View style={{ width: "15%", alignItems: "center", justifyContent: "center" }}>
                <TouchableOpacity onPress={() => navigation.navigate("user-menu-stack")}>
                    {user?.picture && <Image source={{ uri: user?.picture }} style={styles.userMenu} />}
                    {!user?.picture && <Image source={require("assets/images/defaultProfile.png")} style={styles.userMenu} />}
                </TouchableOpacity>
            </View>
            <View style={{ width: "70%", alignItems: "center", justifyContent: "center" }}>
                <SearchButton label={useTranslate("commons.search")} onPress={() => navigation.navigate("search-feed-stack")} />
            </View>
            <View style={{ width: "15%", alignItems: "center", justifyContent: "center" }}>
                <TouchableOpacity onPress={() => navigation.navigate("user-menu-stack")}>
                    <Ionicons name="documents" color={theme.colors.gray} size={theme.icons.extra} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        width: "100%",
        flexDirection: "row",
        paddingVertical: 5,
        backgroundColor: theme.colors.black
    },
    userMenu: {
        width: theme.icons.extra,
        height: theme.icons.extra,
        borderRadius: 20,
        borderColor: theme.colors.gray,
        borderWidth: 1
    }
})
