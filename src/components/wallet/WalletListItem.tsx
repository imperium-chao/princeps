import { walletService } from "@src/core/walletManager"
import { formatSats, toBitcoin } from "@services/converter"
import { Wallet, WalletType } from "@services/memory/types"
import { useTranslate } from "@services/translate"
import { Network } from "@services/bitcoin/types"
import { useEffect, useState } from "react"
import { TouchableOpacity, View, Text, StyleSheet, Image } from "react-native"
import { ActivityIndicator } from "react-native-paper"
import { getDescriptionTypeWallet } from "@src/utils"
import theme from "@src/theme"

type Props = {
    wallet: Wallet,
    reload: boolean,
    handleOpen: (wallet: Wallet) => void
}

const WalletListItem = ({ wallet, reload, handleOpen }: Props) => {
    
    const [loading, setLoading] = useState<boolean>()
    const [labelOpen, setLabelOpen] = useState<string>("")
    const [typeWallet, setTypeWallet] = useState<string>("")

    useEffect(() => { 
        loadData() 
        useTranslate("commons.open").then(setLabelOpen)
        getDescriptionTypeWallet(wallet.type ?? "bitcoin").then(setTypeWallet)
    }, [reload])

    const loadData = async () => {

        setLoading(true)

        const network: Network = wallet.type == "bitcoin" ? "mainnet" : "testnet"
        walletService.listTransactions(wallet.address ?? "", network).then(walletInfo => {
            if(wallet.lastBalance != walletInfo.balance)
            {
                wallet.lastBalance = walletInfo.balance
                wallet.lastSended = walletInfo.sended
                wallet.lastReceived = walletInfo.received

                // await walletService.update(wallet)
                walletService.update(wallet)
            }
            setLoading(false)
        }).catch(() => setLoading(false))

    }

    let balanceBTC = toBitcoin(wallet.lastBalance)
    let balanceSats = formatSats(wallet.lastBalance)
    let formatName = (!!wallet.name && wallet.name?.length >= 18) ? `${wallet.name?.substring(0, 17)}..` : wallet?.name

    return (
        <TouchableOpacity style={[styles.wallet, { paddingHorizontal: 5 }]} key={wallet.key} activeOpacity={1}>
            {wallet!.type === "bitcoin" && <Image source={require("@assets/images/bitcoin-wallet-header3.jpg")} style={{ position: "absolute", borderRadius: 18, width: "100%", height: "100%" }} />}
            {wallet!.type === "testnet" && <Image source={require("@assets/images/bitcoin-wallet-header.jpg")} style={{ position: "absolute", borderRadius: 18, width: "100%", height: "100%" }} />}
            {wallet!.type === "lightning" && <Image source={require("@assets/images/lightning-wallet-header.png")} style={{ position: "absolute", borderRadius: 18, width: "100%", height: "100%" }} />}
            <View style={{ position: "absolute", width: "100%", height: "100%", borderRadius: 18, backgroundColor: "rgba(0,55,55,.7)" }}></View>

            <Text style={styles.title}>{formatName}</Text>
            <View style={{ flexDirection: "row", width: "100%" }}>
                <Text style={{ marginHorizontal: 10, marginVertical: 6, color: theme.colors.white, fontSize: 18, fontWeight: "bold" }}>
                    {balanceSats} Sats
                </Text>
                { loading &&
                    <ActivityIndicator size={18} color={theme.colors.white} />    
                }
            </View>
            <View style={{ flexDirection: "row", width: "100%" }}>
                <Text style={[styles.description, { color: theme.colors.white }]}>
                        {balanceBTC} BTC
                </Text>
            </View> 
            <TouchableOpacity activeOpacity={.7} 
                style={[styles.button, { 
                    backgroundColor: wallet.type == "bitcoin" ? theme.colors.orange : theme.colors.blue 
                }]} onPress={() => handleOpen(wallet)}>
                <Text style={styles.buttonText}> {labelOpen} </Text>
            </TouchableOpacity>

            <Text style={{
                backgroundColor:  wallet.type == "bitcoin" ? theme.colors.orange : theme.colors.blue,
                color: theme.colors.white, margin: 10, borderRadius: 10,
                fontSize: 10, fontWeight: "bold", paddingHorizontal: 10, paddingVertical: 4, position: "absolute", top: -18, right: 14,
            }}>
                {typeWallet}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    wallet: { width: 360, marginVertical: 10, marginHorizontal: 6, borderRadius: 18 },
    title: { color: theme.colors.white, fontSize: 24, fontWeight: "bold", marginTop: 20, marginHorizontal: 10 },
    description: { fontSize: 12, marginHorizontal: 10, marginVertical: 6 },
    button: { margin: 10, maxWidth: 150, paddingVertical: 14, borderRadius: 15, },
    buttonText: { color: theme.colors.white, fontSize: 13, fontWeight: "bold", textAlign: 'center', marginHorizontal: 28 },
})

export default WalletListItem
