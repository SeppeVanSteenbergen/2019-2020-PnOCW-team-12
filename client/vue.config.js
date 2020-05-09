module.exports = {
  pwa: {
    workboxOptions: {
      // config to enable cache busting
      skipWaiting: true,
      clientsClaim: true
    }
  },
  devServer: {
    //proxy: 'http://stylify.duckdns.org:8080',
    //skipHostCheck: true,
    //public: 'http://stylify.duckdns.org'
  }
}
