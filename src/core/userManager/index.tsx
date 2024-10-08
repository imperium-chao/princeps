import { clearStorage } from "../../services/memory"
import { createPairKeys, getHexKeys } from "../../services/nostr"
import { getUserData, pushUserData } from "../../services/nostr/pool"
import { PairKey, User } from "../../services/memory/types"
import { getEvent, publishEvent } from "../../services/nostr/events"
import { Response, trackException } from "../../services/telemetry"
import { getUser, insertUpdateUser } from "../../services/memory/user"
import { getPairKey, insertPairKey } from "../../services/memory/pairkeys"
import { NostrEventKinds } from "@/src/constants/Events"
import { nip19 } from "nostr-tools"
import env from "@/env"

type SignUpProps = {
    userName: string,
    setUser?: (user: User) => void
}

const signUp = async ({ userName, setUser }: SignUpProps): Promise<Response<any>> => {
    try {

        const pairKey: PairKey = createPairKeys()

        const userData: User = {
            name: userName.trim(),
            display_name: userName.trim(),
            keychanges: pairKey.key,
        }

        await pushUserData(userData, pairKey)

        userData.keychanges = pairKey.key

        await insertUpdateUser(userData)

        if (setUser)
            setUser(userData)

        return { success: true, message: "" }
    }
    catch (ex) {
        return trackException(ex)
    }
}

type SignProps = {
    secretKey: string,
    setUser?: (user: User) => void
}

const signIn = async ({ secretKey, setUser }: SignProps) => {

    try {
        const pairKey: PairKey = getHexKeys(secretKey)

        const userData = await getUserData(pairKey.publicKey)

        userData.keychanges = pairKey.key

        await insertUpdateUser(userData)

        await insertPairKey(pairKey)

        if (setUser)
            setUser(userData)

        return { success: true }
    }
    catch (ex) {
        return trackException(ex)
    }
}

type UpdateProfileProps = {
    user: User,
    setUser?: (user: User) => void,
    upNostr?: boolean
}

const updateProfile = async ({ user, setUser, upNostr = false }: UpdateProfileProps) => {

    if (!upNostr) {
        const event = await getEvent({ kinds: [NostrEventKinds.metadata], authors: [user.pubkey ?? ""] })

        if (event) {
            user.picture = event.content?.picture
            user.image = event.content?.image
            user.banner = event.content?.banner
            user.lud06 = event.content?.lud06
            user.lud16 = event.content?.lud16
            user.nip05 = event.content?.nip05
            user.bio = event.content?.bio
            user.name = event.content?.name
            user.website = event.content?.website
            user.about = event.content?.about
            user.zapService = event.content?.zapService
            user.bitcoin_address = event.content?.bitcoin_address
        }
    } else {
        const pairkey = await getPairKey(user.keychanges ?? "")
        
        await publishEvent({ 
            kind: NostrEventKinds.metadata,
            content: JSON.stringify(user)
        }, pairkey)
    }

    await insertUpdateUser(user)

    if (setUser)
        setUser(user)
}

const signOut = async (): Promise<Response<any>> => {

    try {
        await clearStorage()

        return { success: true, message: "" }
    }
    catch (ex) {
        return trackException(ex)
    }
}

type loggedProps = {
    setUser?: (user: User) => void
}

const isLogged = async ({ setUser }: loggedProps) => {

    const user: User = await getUser()

    const { publicKey, privateKey } = await getPairKey(user.keychanges ?? "")

    user.pubkey = publicKey

    if (setUser && !!privateKey)
        setUser(user)

    return !!privateKey
}

const listFollows = async (user: User, iNot: boolean = true): Promise<User[]> => {

    var follows: User[] = []

    try {
        const response = await fetch(`${env.nosbook.api}/user/friends/${user.pubkey}`)

        const result = await response.json();

        follows = result.map((user: any): User => {
            return {
                name: user.name,
                pubkey: user.pubkey,
                picture: user.profile,
                display_name: user.displayName,
            }
        })
    } catch (fail) {
        //console.log("error when loading folows", fail)
        return []
    }

    if (iNot) 
        return follows.filter(follow => follow.pubkey != user.pubkey) 

    return follows
}

const convertPubkey = (pubkey: string) => nip19.npubEncode(pubkey)

export const userService = {
    signUp,
    signIn,
    signOut,
    isLogged,
    updateProfile,
    convertPubkey,
    listFollows
}
