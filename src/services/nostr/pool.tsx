import { HexPairKeys, User } from "../memory/types"
import { getEvent, publishUser } from "./events"

export const getUserData = async (publicKey: string): Promise<User> => {

    const response: User = {}

    const event = await getEvent({ authors: [publicKey], kinds: [0] })

    const content = JSON.parse(event.content)

    if (content?.name)
        response.name = content.name
    if (content?.displayName)
        response.displayName = content.displayName
    if (content?.picture)
        response.picture = content.picture
    if (content?.image)
        response.image = content.image
    if (content?.about)
        response.about = content.about
    if (content?.lud16)
        response.lud16 = content.lud16
    if (content?.banner)
        response.banner = content.banner

    return response;
}

export const pushUserData = async (user: User) => {

    const pairKeys: HexPairKeys = { 
        publicKey: user.publicKey ? user.publicKey : "", 
        privateKey: user.privateKey ? user.privateKey : "" 
    }

    const profile = {
        name: user.name,
        displayName: user.displayName,
        picture: user.picture,
        image: user.image,
        about: user.about,
        bio: user.bio,
        nip05: user.nip05,
        lud06: user.lud06,
        lud16: user.lud16,
        banner: user.banner,
        zapService: user.zapService,
        website: user.website
    }

    await publishUser(profile, pairKeys)
}