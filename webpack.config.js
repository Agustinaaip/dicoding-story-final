const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { merge } = require("webpack-merge");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  const commonConfig = {
    entry: {
      app: path.resolve(__dirname, "src/js/index.js"),
    },
    output: {
      filename: "[name].bundle.js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
    },
    resolve: {
      alias: {
        "@presenters": path.resolve(__dirname, "src/js/presenters"),
        "@components": path.resolve(__dirname, "src/js/components"),
        "@utils": path.resolve(__dirname, "src/js/utils"),
      },
    },
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif)$/i,
          type: "asset/resource",
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : "style-loader",
            "css-loader",
          ],
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: ["@babel/preset-env"],
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "src/index.html"),
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "src/assets/"),
            to: path.resolve(__dirname, "dist/"),
          },
          {
            from: path.resolve(__dirname, "src/js/utils/sw.js"),
            to: path.resolve(__dirname, "dist/"),
          },

          {
            from: path.resolve(__dirname, "public/manifest.json"),
            to: path.resolve(__dirname, "dist/manifest.json"),
          },

          {
            from: path.resolve(__dirname, "public/images"),
            to: path.resolve(__dirname, "dist/images"),
          },
        ],
      }),
    ],
  };

  const devConfig = {
    mode: "development",
    devServer: {
      static: path.resolve(__dirname, "dist"),
      port: 9000,
      client: {
        overlay: {
          errors: true,
          warnings: true,
        },
      },
    },
  };

  const prodConfig = {
    mode: "production",
    plugins: [new CleanWebpackPlugin(), new MiniCssExtractPlugin()],
  };

  return merge(commonConfig, isProduction ? prodConfig : devConfig);
};
