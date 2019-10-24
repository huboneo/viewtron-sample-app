const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isEnvProduction = process.env.NODE_ENV === 'production';
const isEnvDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
    devtool: isEnvDevelopment ? 'inline-source-map' : false,
    mode: isEnvProduction ? 'production' : 'development',
    entry: './src/ui/main.tsx',
    output: {
        filename: 'ui.bundle.js',
        path: path.join(__dirname, 'dist/ui')
    },
    node: { __dirname: false, __filename: false },
    target: 'electron-renderer',
    resolve: {
        symlinks: false,
        extensions: ['.js', '.json', '.ts', '.tsx'],
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                loader: 'ts-loader'
            },
            {
                test: /\.(scss|css)$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(jpg|png|svg|ico|icns)$/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]',
                },
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './public/index.html'),
        }),
    ]
};
