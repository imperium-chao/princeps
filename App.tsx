// require('node-libs-react-native/globals')

// fixeds the problems with 'nostr-utils' on generate keys => include crypto.getRandomValues on native core
import "react-native-get-random-values"

// fixeds the problems with 'notr-utils' on encode and decode cophers => include TextDecoder and TextEncoder on native core 
import './libs/global';

import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import theme from '@src/theme';
import AppRoutes from './src/routes';
import { AuthProvider } from "./src/providers/userProvider";
import { SettingsProvider } from "./src/providers/settingsProvider";
import { TranslateProvider } from "./src/providers/translateProvider";
import { TorProvider } from "./src/providers/torProvider";

export default function App() {
    return (
        <View style={styles.root} >
            <StatusBar hidden translucent /> 
            <View style={styles.space}></View>
            <TranslateProvider>
                <SettingsProvider>
                    <AuthProvider>
                        {/* <TorProvider> */}
                        <AppRoutes />
                        {/* </TorProvider> */}
                    </AuthProvider>
                </SettingsProvider>
            </TranslateProvider>
        </View>
    )
}

const styles = StyleSheet.create({
    root: { 
        flex: 1,
        backgroundColor: theme.colors.black,
    },
    space: {
        height: 40,
        width: "100%"
    }
})
