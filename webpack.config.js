const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  // Modo de desenvolvimento (altere para 'production' no deploy)
  mode: 'development',

  // Ponto de entrada principal
  entry: './src/js/app.js',

  // Configurações de saída
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash].bundle.js',
    assetModuleFilename: 'assets/[hash][ext][query]',
    clean: true
  },

  // Configurações do servidor de desenvolvimento
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
    open: true,
    hot: true
  },

  // Módulos e regras
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                auto: true,
                localIdentName: '[name]__[local]--[hash:base64:5]'
              }
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[hash][ext][query]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext][query]'
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },

  // Plugins
  plugins: [
    new HtmlWebpackPlugin({
        template: './src/public/index.html',
        minify: false
      })
  ],

  // Otimizações para produção
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: 2020,
          compress: { drop_console: true },
          output: { comments: false }
        }
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true }
            }
          ]
        }
      })
    ],
    splitChunks: {
      chunks: 'all'
    }
  }
};