import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import theme from "@/src/theme"

type Props = {
    label?: string,
    onPress?: () => void
}

const SearchButton = ({ label, onPress }: Props) => {

    return (
        <TouchableOpacity onPress={onPress} style={styles.sarchArea}>
            <View style={styles.content}>
                <Ionicons name="search" color={theme.COLORS.GRAY} size={20} style={styles.icon} />
                <Text style={styles.text}>{label}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    sarchArea: {
        minWidth: 200,
        padding: 5,
        borderRadius: 15,
        backgroundColor: theme.COLORS.DEFAULT
    },
    content: {
        flexDirection: "row"
    },
    text: {
        fontSize: 18, 
        color: theme.COLORS.GRAY
    },
    icon: {
        margin: 4
    }
})

export default SearchButton