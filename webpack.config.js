const path  = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 自定义模块
module.exports = {
    mode: "production",
    devServer: {
        contentBase: "./build",
        port: 9001,
        open: true
    },
    entry:{
        main:'./src/index.js',
        esm:'./src/index.js'
    },
    output:{
            library: 'createPoster',
            libraryTarget: 'umd',
            libraryExport: 'default', // libraryExport改为webpackDemo
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            esModule: false,
                            limit: 20
                        }
                    }
                ]
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
              },
        ]
    },
    plugins: [
        // html
        new HtmlWebpackPlugin({
            template: `./src/demo.html`
        })
    ]
};
