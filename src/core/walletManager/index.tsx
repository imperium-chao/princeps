import { getUtxos } from "@/src/services/bitcoin/mempool"
import { useTranslate } from "@/src/services/translate"
import { Tx } from "@mempool/mempool.js/lib/interfaces/bitcoin/transactions"
import { generateAddress, createTransaction, createWallet, ValidateAddress, sendTransaction, importWallet, getSeedPhrase } from "@src/services/bitcoin"
import { getRandomKey } from "@src/services/bitcoin/signature"
import { deletePairKey, getPairKey, insertPairKey } from "@src/services/memory/pairkeys"
import { PairKey, Transaction, Wallet, WalletInfo } from "@src/services/memory/types"
import { deleteWallet, getWallet, insertWallet } from "@src/services/memory/wallets"
import { Response, trackException } from "@src/services/telemetry"

type Props = {
    name: string,
    type: "bitcoin" | "lightning"
}

const create = async ({ name, type }: Props): Promise<Response<Wallet>> => {
    try {
        const pairKey: PairKey = createWallet()

        const bitcoinAddress = generateAddress(pairKey.publicKey)

        const wallet: Wallet = {
            name: name,
            type: type,
            lastBalance: 0,
            lastReceived: 0,
            lastSended: 0,
            pairkey: pairKey.key,
            key: getRandomKey(10),
            address: bitcoinAddress
        }

        await insertPairKey(pairKey)

        await insertWallet(wallet)

        return { success: true, message: "success", data: wallet }
    }
    catch (ex) { return trackException(ex) }
}

type ImportProps = {
    name: string,
    seedphrase: string,
    passphrase?: string,
    type?: "bitcoin" | "lightning"
}

const require = async ({ name, type = "bitcoin", seedphrase, passphrase }: ImportProps): Promise<Response<Wallet>> => {

    try {
        const pairKey = await importWallet(seedphrase, passphrase)

        const bitcoinAddress = generateAddress(pairKey.publicKey)

        const wallet: Wallet = {
            name: name,
            type: type,
            lastBalance: 0,
            lastReceived: 0,
            lastSended: 0,
            pairkey: pairKey.key,
            key: getRandomKey(10),
            address: bitcoinAddress
        }

        await insertPairKey(pairKey)

        await insertWallet(wallet)

        return { success: true, message: "", data: wallet }
    }
    catch (ex) {
        return trackException(ex)
    }
}

const seedphrase = async (pairkey: string): Promise<Response<string>> => {

    try 
    {
        const pairKey = await getPairKey(pairkey)

        const seedphrase = getSeedPhrase(pairKey.privateKey)

        return { success: true, message: "", data: seedphrase }
    } catch (ex) {
        return trackException(ex)
    }
}

const exclude = async (wallet: Wallet): Promise<Response<any>> => {

    try {
        await deletePairKey(wallet.pairkey ?? "")

        await deleteWallet(wallet.key ?? "")

        return { success: true, message: "" }
    }
    catch (ex) {
        return trackException(ex)
    }
}

const update = async (wallet: Wallet) => {

}

const listTransactions = async (address: string): Promise<WalletInfo> => {
    const response: WalletInfo = { balance: 0, sended: 0, received: 0, transactions: [] }

    const utxos: Tx[] = await getUtxos(address)

    utxos.forEach(utxo => {
        let received = utxo.vout.reduce((acumulator, tx) => {
            if (tx.scriptpubkey_address == address)
                return acumulator + tx.value
            else
                return acumulator
        }, 0)

        let sended = utxo.vin.reduce((acumulator, tx) => {
            if (tx.prevout.scriptpubkey_address == address)
                return acumulator + tx.prevout.value
            else
                return acumulator
        }, 0)

        const transaction: Transaction = {
            txid: utxo.txid,
            confirmed: utxo.status.confirmed,
            description: utxo.status.confirmed ? useTranslate("message.transaction.confirmed") : useTranslate("message.transaction.notconfirmed"),
            type: received > sended ? "received" : "sended",
            amount: received > sended ? received : sended,
            date: utxo.status.confirmed ? new Date(utxo.status.block_time * 1000).toLocaleString() : useTranslate("message.transaction.notconfirmed"),
            timestamp: utxo.status.block_time
        }

        response.transactions.push(transaction)
        response.received += received
        response.sended += sended
    })

    response.balance = response.received - response.sended
    response.transactions.sort((a, b) => (b.timestamp ?? 1) - (a.timestamp ?? 1));

    return response
}

type TransactionProps = { amount: number, destination: string, walletKey: string }

const transaction = {
    get: async ({ amount, destination, walletKey }: TransactionProps): Promise<Response<any>> => {

        const wallet = await getWallet(walletKey)

        const pairkey = await getPairKey(wallet.pairkey ?? "")

        const transaction = await createTransaction({
            amount,
            destination,
            wallet,
            pairkey
        })

        return transaction
    },
    send: async (txHex: string): Promise<Response<any>> => sendTransaction(txHex)
}

const address = {
    validate: (address: string) => ValidateAddress(address)
}


export const walletService = {
    create,
    update,
    import: require,
    delete: exclude,
    seed: seedphrase,
    listTransactions,
    address,
    transaction
}
