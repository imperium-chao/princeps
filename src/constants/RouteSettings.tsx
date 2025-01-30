import { StackNavigationOptions } from "@react-navigation/stack"
import { ViewStyle } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import Ionicons from "react-native-vector-icons/Ionicons"
import theme from "../theme"

export const tabBarStyle: ViewStyle = {
    backgroundColor: theme.colors.transparent,
    borderTopColor: theme.colors.transparent,
    paddingBottom: 15,
    height: 70,
    elevation: 0,
}

export const stackOptions: StackNavigationOptions = {
    headerTitle: "",
    headerShown: false,
    headerTransparent: true,
    headerStyle: { backgroundColor: theme.colors.transparent },
    headerLeft: (props: any) => {
        return (
            <TouchableOpacity onPress={() => props?.onPress()} 
                style={{ marginLeft: 10, borderRadius: 50, padding: 8, backgroundColor: theme.colors.semitransparent }} 
                activeOpacity={.7}
            >
                <Ionicons name="arrow-back" size={20} color={theme.colors.white} />
            </TouchableOpacity>
        )
    },
    cardStyle: { backgroundColor: theme.colors.transparent },
    headerShadowVisible: false,
}

