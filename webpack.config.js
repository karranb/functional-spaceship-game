const ExtractTextPlugin = require('extract-text-webpack-plugin')
const path = require('path')

module.exports = {
  entry: ['./src/index.js', './src/web/assets/style/index.scss'],
  output: {
    filename: './bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
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
  // watch: true,
  // Development Tools (Map Errors To Source File)
  devtool: 'source-map',
  resolve: {
    alias: {
      _utils: path.resolve(__dirname, 'src/utils/'),
      // _buttons: path.resolve(__dirname, 'src/js/web/components/buttons/'),
      // _canvas: path.resolve(__dirname, 'src/js/web/components/canvas/'),
      _models: path.resolve(__dirname, 'src/models/'),
      _ai: path.resolve(__dirname, 'src/ai/'),
      // _engine: path.resolve(__dirname, 'src/js/models/engine/'),
      // _game: path.resolve(__dirname, 'src/js/models/game/'),
      // _player: path.resolve(__dirname, 'src/js/models/player/'),
      // _spaceship: path.resolve(__dirname, 'src/js/models/spaceship/'),
      _web: path.resolve(__dirname, 'src/web'),
      _assets: path.resolve(__dirname, 'src/web/assets/'),
      _components: path.resolve(__dirname, 'src/web/components/'),
    },
  },
}
