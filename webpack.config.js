const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = function(){
  return {
    mode: 'development',
    entry: [
      './src/app.js'
    ],
    watch: true,
    watchOptions: {
      aggregateTimeout: 300,                                // Process all changes which happened in this time into one rebuild
      poll: 1000,                                           // Check for changes every second,
      ignored: /node_modules/,
      // ignored: [
      //   '**/*.scss', '/node_modules/'
      // ]
    },
    devtool: 'source-maps',
    devServer: {
      contentBase: path.join(__dirname, 'src'),
      watchContentBase: true,
      hot: true,
      open: true,
      inline: true
    },
    plugins: [
      new HtmlWebpackPlugin({                               // use an instance of this plugin and give it a name
        title: 'Webpack starter project',
        template: path.resolve('./src/index.html')          // path is a native node.js thing to help with managing filenames
      }),
      new webpack.HotModuleReplacementPlugin()
    ],
    module: {
      rules: [
        {
          test: /\.scss$/,                                  // whenever webpack matches a scss file, use these 3 loaders
          use: [
            'style-loader',
            "css-loader",
            "sass-loader"
          ]
        },
        {
          test: /\.m?js$/,                                  // for es6, use babel-loader
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
            test: /\.(jpg|jpeg|gif|png|svg|webp|ico)$/,           // for any image files, use file-loader
            use: [
            {
              loader: "file-loader",
              options: {
                outputPath: './images',        // was ./images
                name: "[name].[ext]",
              },
            },
            ]
        },
        {
            test: /\.ttf$/,                              // for font files, another rule. bugged right now.
            use: [
                {
                    //loader: "ttf-loader",
                    loader: "file-loader",
                    options: {
                        //outputPath: './Fonts',
                        //name: "[name].[ext]",
                        //name: './Fonts/[name].[ext]', // instead of ./font/[hash].[ext]
                        outputPath: './font',
                        name: '[name].[ext]',
                    },
                },
            ]
        },
        {
          test: /\.html$/,
          use: {
            loader: 'html-loader',
          }
        },
      ]
    }
  };
}
