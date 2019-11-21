module.exports = {
  pwa: {
    workboxOptions: {
      // config to enable cache busting
      skipWaiting: true,
      clientsClaim: true
    }
  }
}
