module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            ['react-native-worklets-core/plugin'],
            [
                'module-resolver',
                {
                    root: ['./src'],
                    extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
                    alias: {
                        '@': '.',
                        '@assets': './assets',
                        '@src': './src',
                        '@components': './src/components',
                        '@screens': './src/screens'
                    },
                },
            ]
        ],
    };
};
