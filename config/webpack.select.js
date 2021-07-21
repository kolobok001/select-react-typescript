const path = require("path");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (env, argv) => {
    const isProd = argv.mode === 'production';
    const isAnal = argv.anal === 'true';
    return {
        entry: {
            select: "./src/select.tsx"
        },
        mode: isProd ? 'production' : 'development',
        devtool: isProd ? false : 'source-map',
        performance: { hints: false },
        output: {
            filename: isProd ? '[name]-bundle.min.js' : '[name]-bundle.js',
            path: path.resolve(__dirname, "./build/"),
            libraryTarget: "umd",
            pathinfo: false
        },
        module: {
            rules: [
                {
                    test: /\.html$/,
                    use: ["raw-loader"],
                    exclude: /node_modules/
                },
                {
                    test: /\.css$/,
                    use: ["raw-loader"]
                },
                {
                    test: /\.(js|ts)x?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                    },
                }
            ]
        },
        resolve: {
            // Add `.ts` and `.tsx` as a resolvable extension.
            extensions: [".ts", ".tsx", ".js", "jsx"],
        },
        plugins: [
            new BundleAnalyzerPlugin({ analyzerMode: isAnal ? "server" : "disabled" })
        ]
    }
    
};