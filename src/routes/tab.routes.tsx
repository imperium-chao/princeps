import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { useTranslate } from "../services/translate"
import Settings from "@screens/root/settings"
import { Ionicons } from "@expo/vector-icons"
import Donate from "@screens/root/donate"
import Home from "@screens/root/home"
import Feed from "@screens/root/feed"
import theme from "@src/theme"

const Tab = createMaterialBottomTabNavigator()

const TabRoutes = () => {

    return (
        <Tab.Navigator
            initialRouteName="home"
            activeColor={theme.colors.white}
            inactiveColor={theme.colors.gray}
            screenOptions={{ tabBarColor: theme.colors.gray }}
            barStyle={{ backgroundColor: theme.colors.black }}
            activeIndicatorStyle={{ backgroundColor: theme.colors.blue }}
        >
            <Tab.Screen
                name="home"
                component={Home}
                options={{
                    tabBarLabel: useTranslate("menu.home"),
                    tabBarIcon: ({ color }) => <Ionicons name="home" color={color} size={theme.icons.medium} />,
                }}
            />
            <Tab.Screen
                name="feed"
                component={Feed}
                options={{
                    tabBarLabel: useTranslate("menu.buy&sell"),
                    tabBarIcon: ({ color }) => <Ionicons name="wallet" color={color} size={theme.icons.medium} />,
                }}
            />
            <Tab.Screen
                name="donate"
                component={Donate}
                options={{
                    tabBarLabel: useTranslate("menu.donate"),
                    tabBarIcon: ({ color }) => <Ionicons name="heart" color={color} size={theme.icons.medium} />,
                }}
            />
            <Tab.Screen
                name="settings"
                component={Settings}
                options={{
                    tabBarLabel: useTranslate("menu.setting"),
                    tabBarIcon: ({ color }) => <Ionicons name="settings" color={color} size={theme.icons.medium} />,
                }}
            />
        </Tab.Navigator>
    )
}

export default TabRoutes

