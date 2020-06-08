/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
 * @typedef {object} Env
 * @property {boolean} development Whether we are running in a dev environment.
 * @property {boolean} production Whether we are running in a prod environment.
 * @property {boolean} analyze Whether to perform bundle size analysis.
 */

/**
 * @param env Current environment.
 * @returns config
 */
exports.default = (env = {production: true}) => ({
  context: __dirname,
  entry: ['./src/index.ts'],
  devtool: env.development ? 'eval-source-map' : false,
  devServer: {
    port: 8090,
    hot: true,
    proxy: [{
      context: ['/api', '/_ah'],
      target: 'http://localhost:8080',
      autoRewrite: true,
      // changeOrigin: true,
    }],
    host: '0.0.0.0',
    allowedHosts: ['localhost', '127.0.0.1', 'penguin.linux.test'],
  },
  optimization: {
    runtimeChunk: false,
    splitChunks: {
      chunks: 'all',
    },
  },
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, '../webapp'),
    crossOriginLoading: 'anonymous',
  },
  module: {
    rules: [
      {
        test: /\.ts$/i,
        exclude: /node_modules/,
        use: [
          'babel-loader',
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
        test: /\.(pdf)$/i,
        use: ['file-loader'],
      },
      {
        test: /\.(jpe?g|png)$/i,
        resourceQuery: /responsive/,
        use: [
          {
            loader: 'responsive-loader',
            options: {
              adapter: require('responsive-loader/sharp'),
            },
          },
        ],
      },
      {
        test: /\.(jpe?g|png|svg|gif)$/i,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 75,
              },
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: [0.65, 0.90],
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
              // the webp option will enable WEBP
              webp: {
                quality: 75,
              },
            },
          },
        ],
      },
      {
        test: /\.(md)$/i,
        use: ['frontmatter-markdown-loader'],
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
    new CleanPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!WEB-INF', '!WEB-INF/*'],
    }),
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
    extensions: ['.js', '.ts'],
    alias: {
      '@res': path.resolve(__dirname, 'res'),
    },
    plugins: [
      new TsConfigPathsPlugin(),
    ],
  },
});
