import { SearchBox } from "@components/form/SearchBox"
import { HeaderScreen } from "@components/general/HeaderScreen"
import { ActivityIndicator, View, Text } from "react-native"
import { User } from "@services/memory/types"
import { useAuth } from "@src/providers/userProvider"
import { useTranslateService } from "@src/providers/translateProvider"
import { userService } from "@src/core/userManager"
import { UserList } from "@components/nostr/user/UserList"
import FollowModal, { showFollowModal } from "@components/nostr/follow/FollowModal"
import { useState } from "react"
import theme from "@src/theme"

const AddFolowScreen = ({ navigation }: any) => {

    const { user, follows, setFollows } = useAuth()
    const { useTranslate } = useTranslateService()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
   
    const handleSearch = async (searchTerm: string) => {

        if(searchTerm?.length <= 1) return setUsers([])
            
        setLoading(true)

        userService.searchUsers(user, searchTerm, 30).then(users => {
            users.sort((a, b) => (b.similarity ?? 1) - (a.similarity ?? 1))

            const friends = follows?.tags?.filter(t => t[0] == "p").map(t => t[1]) ?? []
            
            users.forEach(user => {
                user.friend = friends.includes(user.pubkey ?? "")
            })

            setUsers(users)

            setLoading(false)
        })
        .catch(() => setLoading(false))
    }

    const AddUserOnFollowList = async (friend: User) => {

        setUsers(users.map((user: User) => {
            if(user.pubkey == friend.pubkey) user.friend = !user.friend
            return user
        }))

        if(friend.friend)    
            follows?.tags?.push(["p", friend.pubkey ?? ""])
        else
            follows!.tags = follows?.tags?.filter(t => t[0] == "p" && t[1] != friend.pubkey) ?? []

        if(setFollows && follows) setFollows(follows)

        await userService.updateFollows({ user, follows })
    }

    const handleAddFollow = async (follow: User) => {
        showFollowModal({ user: follow })
    }

    return (
        <View style={theme.styles.container}>

            <HeaderScreen title={useTranslate("screen.title.addfriend")} onClose={() => navigation.navigate("core-stack")} />

            <SearchBox seachOnLenth={1} label={useTranslate("commons.search")} onSearch={handleSearch} />

            {loading && <ActivityIndicator color={theme.colors.gray} size={50} />}

            {!users.length && !loading &&
                <View style={{ width: "100%", alignItems: "center", paddingHorizontal: 42, marginTop: 120 }}>
                    {/* <Icon name="search" color={theme.colors.gray} size={120}/> */}
                    <Text style={{ color: theme.colors.gray, fontSize: 16, fontWeight: "400", textAlign: "center", marginVertical: 20 }}>
                        {useTranslate("friends.search.subtitle")}
                    </Text>
                </View>
            } 

            <UserList toFollow users={users} setUsers={setUsers} onPressUser={handleAddFollow} />

            <View style={{ height: 38 }}></View>

            <FollowModal handleAddFollow={AddUserOnFollowList} />
        </View>
    )
}

export default AddFolowScreen



