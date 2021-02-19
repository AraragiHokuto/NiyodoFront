var webpack = require('webpack');

module.exports = {
    devtool: "source-map",
    target: "web",
    resolve: {
	extensions: [".ts", ".tsx", ".js", ".jsx"]
    },
    devServer: {
	port: 8080,
	historyApiFallback: true,
	publicPath: "/dist/",
	proxy: {
	    '/api': {
		loglevel: "debug",
		target: 'http://[::1]:8000',
		secure: false,
		changeOrigin: true,
		pathRewrite: {'^/api' : ''}
	    }
	}
    },
    module: {
	rules: [
	    {
		test: /\.ts(x?)$/,
		exclude: /node_modules/,
		use: [
		    {
			loader: "ts-loader"
		    }
		]
	    },
	    {
		test: /\.s[ac]ss$/i,
		use: [
		    "style-loader",
		    "css-loader",
		    "sass-loader",
		],
	    },
	    {
		enforce: "pre",
		test: /\.js$/,
		loader: "source-map-loader"
	    }
	]
    },
    plugins: [
	new webpack.DefinePlugin({
	    "process.env": "{}"
	})
    ]
};
