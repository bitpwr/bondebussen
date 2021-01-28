module.exports = {
  publicPath: '/',
  chainWebpack: config => {
    config.plugins.delete('optimize-css')
  }
}
