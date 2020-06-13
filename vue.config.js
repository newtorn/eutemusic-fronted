const isProd = process.env.NODE_ENV === "production";

module.exports = {
  runtimeCompiler: true,
  assetsDir: "public",
  publicPath: isProd ? "./" : "/",
  productionSourceMap: true,

  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        win: {
          icon: "build/icons/icon.ico",
          // 图标路径 windows系统中icon需要256*256的ico格式图片，更换应用图标亦在此处
          target: [
            {
              // 打包成一个独立的 exe 安装程序
              target: "nsis",
              arch: [
                "x64",
                // 'ia32'
              ],
            },
          ],
        },
        dmg: {
          contents: [
            {
              x: 410,
              y: 150,
              type: "link",
              path: "/Applications",
            },
            {
              x: 130,
              y: 150,
              type: "file",
            },
          ],
        },
        linux: {
          icon: "build/icons/icon.png",
          target: "AppImage",
        },
        mac: {
          icon: "build/icons/icon.icns",
        },
        files: ["**/*"],
        asar: false,
        nsis: {
          // 是否一键安装，建议为 false，可以让用户点击下一步、下一步、下一步的形式安装程序，如果为true，当用户双击构建好的程序，自动安装程序并打开，即：一键安装（one-click installer）
          oneClick: false,
          // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
          allowElevation: true,
          // 允许修改安装目录，建议为 true，是否允许用户改变安装目录，默认是不允许
          allowToChangeInstallationDirectory: true,
          // 安装图标
          installerIcon: "build/icons/icon.ico",
          // 卸载图标
          uninstallerIcon: "build/icons/unins.ico",
          // 安装时头部图标
          installerHeaderIcon: "build/icons/icon.ico",
          // 创建桌面图标
          createDesktopShortcut: true,
          // 创建开始菜单图标
          createStartMenuShortcut: true,
        },
      },
      outputDir: "dist",
      mainProcessFile: "src/background.js",
      mainProcessWatch: ["src"],
    },
  },
};