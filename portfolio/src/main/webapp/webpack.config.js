const webpack = require('webpack');
const path = require('path');

const HtmlPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin: CleanPlugin} = require('clean-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const SriPlugin = require('webpack-subresource-integrity');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin');
const EslintPlugin = require('eslint-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');

const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

/**
 * @typedef {Object} Env
 * @property {Boolean} development Whether we are running in a dev environment.
 * @property {Boolean} production Whether we are running in a prod environment.
 * @property {Boolean} analyze Whether to perform bundle size analysis.
 */

/** @param {Env} env Current environment.
 *  @return {webpack.Configuration} */
exports.default = (env = {production: true}) => ({
  context: __dirname,
  entry: ['./src/index.tsx'],
  devtool: env.development ? 'eval-source-map' : false,
  devServer: {
    port: 1234,
    hot: true,
    historyApiFallback: true,
  },
  optimization: {
    runtimeChunk: false,
    splitChunks: {
      chunks: 'all',
    },
  },
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, 'dist'),
    crossOriginLoading: 'anonymous',
  },
  module: {
    rules: [
      {
        test: /\.ts$/i,
        exclude: /node_modules/,
        use: [
          'ts-loader',
        ],
      },
      {
        test: /\.tsx$/i,
        exclude: /node_modules/,
        use: [
          'surplus-loader',
          'ts-loader',
        ],
      },
      {
        test: /\.scss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: true,
              hmr: env.development,
            },
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: env.development ? '[path][name]__[local]--[hash:base64:5]' : '[hash:base64]',
              },
              localsConvention: 'camelCase',
              esModule: true,
            },
          },
          {
            loader: 'resolve-url-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(pdf|jpg|png|svg)$/i,
        use: ['file-loader'],
      },
    ],
  },
  plugins: [
    new EslintPlugin(),
    new StylelintPlugin(),
    new HtmlPlugin({
      template: 'src/template.html',
    }),
    new ForkTsCheckerPlugin({
      workers: ForkTsCheckerPlugin.TWO_CPUS_FREE,
    }),
    new CleanPlugin(),
    new MiniCssExtractPlugin(),
    ...(env.production ?
      [
        new CompressionPlugin({
          threshold: 8192,
        }),
        new SriPlugin({
          hashFuncNames: ['sha384', 'sha512'],
        }),
      ] :
      []),
    ...(env.analyze ?
      [
        new BundleAnalyzerPlugin(),
      ] :
      []),
    ...(env.development ?
      [
        new webpack.HotModuleReplacementPlugin(),
      ] :
      []),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
    plugins: [
      new TsConfigPathsPlugin(),
    ],
  },
});
