import { ActivityIndicator, FlatList } from "react-native"
import { userService } from "@/src/core/userManager"
import { useAuth } from "@src/providers/userProvider"
import { User } from "@src/services/memory/types"
import { useCallback, useEffect, useState } from "react"
import { walletService } from "@src/core/walletManager"
import { FollowItem } from "./FollowItem"
import theme from "@src/theme"

type FriendListProps = {
    iNot?: boolean,
    searchTerm?: string,
    itemsPerPage?: number,
    toPayment?: boolean,
    searchable?: boolean,
    onPressFollow?: (user: User) => void,
}

export const FollowList = ({ searchTerm, onPressFollow, itemsPerPage = 50, toPayment = false, searchable, iNot = false }: FriendListProps) => {

    const { user } = useAuth()
    const [listCounter, setListCounter] = useState(itemsPerPage)
    const [refreshing, setRefreshing] = useState(true)
    const [followList, setFollowList] = useState<User[]>([])
    const [followListData, setFollowListData] = useState<User[]>([])

    useEffect(() => { handleListFollows() }, [])

    if (searchable) {
        useEffect(() => {
            // search and filter
            if (searchTerm && !walletService.address.validate(searchTerm)) {
                const searchResult = followListData.filter(follow => {
                    let filterLower = searchTerm.toLowerCase()
                    let filterNameLower = `${follow.name}${follow.display_name}`.toLowerCase()
                    return filterNameLower.includes(filterLower)
                })

                setFollowList(searchResult)
            }
            else if (followListData.length < followList.length)
                setFollowList(followListData)

        }, [searchTerm])
    }

    const handleListFollows = async () => {
        setRefreshing(true)

        var follows = await userService.listFollows(user, iNot)

        setFollowList(follows.slice(0, itemsPerPage))

        setFollowListData(follows)

        setRefreshing(false)
    }

    const handleClickFollow = useCallback((follow: User) => {
        if (onPressFollow)
            onPressFollow(follow)
    }, [onPressFollow])

    const handleLoadScroll = () => {
        setRefreshing(true)
        if (followListData.length > listCounter) {
            setFollowList([...followList, ...followListData.slice(listCounter, listCounter + itemsPerPage)])
            setListCounter(listCounter + itemsPerPage)
        }
        setRefreshing(false)        
    }

    const handleRenderItem = ({ item }: { item: User }) => <FollowItem follow={item} handleClickFollow={handleClickFollow} />

    const handleLoaderEnd = () => {
        if (refreshing)
            // Show loader at the end of list when fetching next page data.
            return <ActivityIndicator color={theme.colors.gray} style={{ margin: 10 }} size={50} />
    }
    return (
        <>
            <FlatList
                data={followList}
                renderItem={handleRenderItem}
                onEndReached={handleLoadScroll}
                onEndReachedThreshold={2}
                contentContainerStyle={theme.styles.scroll_container}
                ListFooterComponent={handleLoaderEnd}
                keyExtractor={item => item.pubkey ?? Math.random().toString()}
            />
        </>
    )
}
