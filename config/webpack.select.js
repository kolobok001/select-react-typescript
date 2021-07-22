const path = require("path");

module.exports = (env, argv) => {
    const isProd = argv.mode === 'production';
    return {
        entry: {
            select: path.resolve(__dirname, '../src/index.tsx'),
        },
        mode: isProd ? 'production' : 'development',
        devtool: isProd ? false : 'source-map',
        performance: { hints: false },
        output: {
            filename: isProd ? 'bundle.min.js' : 'bundle.js',
            path: path.resolve(__dirname, "../build"),
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
        }
    }
    
};