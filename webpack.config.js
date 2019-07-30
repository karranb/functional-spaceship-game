const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  entry: ['./src/index.js', './src/web/assets/style/index.css'],
  output: {
    filename: './bundle.js',
    webassemblyModuleFilename: '[modulehash].wasm',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.wasm$/,
        type: 'webassembly/experimental',
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../',
            },
          },
          {
            loader: 'css-loader',
            options: { importLoaders: 1 },
          },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: './postcss.config.js',
              },
            },
          },
        ],
      },
      {
        test: /\.(jpg|png)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'imgs/[name].[ext]',
          },
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].bundle.css',
      chunkFilename: '[id].css',
    }),
  ],
  // watch: true,
  // Development Tools (Map Errors To Source File)
  devtool: 'source-map',
  resolve: {
    alias: {
      _utils: path.resolve(__dirname, 'src/utils/'),
      _models: path.resolve(__dirname, 'src/models/'),
      _ai: path.resolve(__dirname, 'src/ai/'),
      _web: path.resolve(__dirname, 'src/web'),
      _assets: path.resolve(__dirname, 'src/web/assets/'),
      _components: path.resolve(__dirname, 'src/web/components/'),
    },
  },
}
