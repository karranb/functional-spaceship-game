const ExtractTextPlugin = require('extract-text-webpack-plugin')
const path = require('path')

module.exports = {
  entry: ['./src/js/index.js', './assets/style/index.scss'],
  output: {
    filename: 'js/bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['es2015', 'stage-2'],
            },
          },
        ],
      },
      { // regular css files
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: 'css-loader?importLoaders=1',
        }),
      },
      { // sass / scss loader for webpack
        test: /\.(sass|scss)$/,
        use: ExtractTextPlugin.extract(['css-loader', 'sass-loader']),
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
    new ExtractTextPlugin({
      filename: 'css/bundle.css',
      allChunks: true,
    }),
  ],
  resolve: {
    alias: {
      _buttons: path.resolve(__dirname, 'src/js/buttons/'),
      _canvas: path.resolve(__dirname, 'src/js/canvas/'),
      _engine: path.resolve(__dirname, 'src/js/engine/'),
      _game: path.resolve(__dirname, 'src/js/game/'),
      _player: path.resolve(__dirname, 'src/js/player/'),
      _spaceship: path.resolve(__dirname, 'src/js/spaceship/'),
      _utils: path.resolve(__dirname, 'src/js/utils/'),
      _base: path.resolve(__dirname, 'src/js/utils/base'),
      _assets: path.resolve(__dirname, 'assets/'),
    },
  },
}
