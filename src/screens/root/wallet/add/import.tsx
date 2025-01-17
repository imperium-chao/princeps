import { HeaderScreen } from "@components/general/HeaderScreen"
import { StyleSheet, View, Text } from "react-native"
import { FormControl } from "@components/form/FormControl"
import { ButtonPrimary } from "@components/form/Buttons"
import { useState } from "react"
import theme from "@src/theme"
import SplashScreen from "@components/general/SplashScreen"
import { walletService } from "@/src/core/walletManager"
import { pushMessage } from "@/src/services/notification"
import { useTranslateService } from "@/src/providers/translateProvider"
import { useAuth } from "@/src/providers/userProvider"

const ImportWalletScreen = ({ navigation }: any) => {

    const { setWallets } = useAuth()
    const [loading, setLoading] = useState(false)
    const [walletName, setWalletName] = useState<string>("")
    const [seedPhrase, setSeedPhrase] = useState<string>("")
    const [passPhrase, setPassPhrase] = useState<string>()
    const { useTranslate } = useTranslateService()

    const handleImport = async () => {

        var words = seedPhrase?.trim().split(" ")

        if (!walletName)
            return pushMessage(useTranslate("message.wallet.nameempty"))

        // if (words && words?.length < 12)
        //     return pushMessage(`${useTranslate("message.wallet.invalidseed")} ${words.length}.`)

        if (words && words?.length < 24 || words?.length > 24)
            return pushMessage(`${useTranslate("message.wallet.invalidseed")} ${words.length}.`)

        setLoading(true)

        const response = await walletService.import({ name: walletName, seedphrase: seedPhrase, passphrase: passPhrase })

        if(setWallets) setWallets(await walletService.list())

        setLoading(false)

        if (response.success)
            navigation.reset({ index: 0, routes: [{ name: "core-stack" }] })
        else
            pushMessage(response.message)
    }

    if (loading)
        return <SplashScreen />

    return (
        <>
            {/* Header */}
            <HeaderScreen
                title={useTranslate("screen.title.importwallet")}
                onClose={() => navigation.navigate("add-wallet-stack")}
            />

            {/* Body */}
            <Text style={styles.title}>{useTranslate("wallet.title.import")}</Text>

            <FormControl  
                value={walletName} 
                onChangeText={setWalletName}                 
                label={useTranslate("labels.wallet.name")}
            />

            <FormControl label="Seed Phrase" value={seedPhrase} onChangeText={value => setSeedPhrase(value.toLowerCase())} isTextArea />

            {/* <FormControl label="PassPhrase" value={passPhrase} onChangeText={setPassPhrase} type="password" /> */}

            {/* Footer */}
            <View style={styles.buttonArea}>
                <ButtonPrimary label={useTranslate("commons.import")} onPress={() => handleImport()} />
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    title: { fontSize: 25, fontWeight: "bold", textAlign: "center", color: theme.colors.white, marginVertical: 20 },
    buttonArea: { width: '100%', justifyContent: 'center', marginVertical: 10, flexDirection: "row", marginTop: 50 }
})

export default ImportWalletScreen
