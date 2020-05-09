const fs = require('fs')
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
    key: fs.readFileSync(
      'C:\\Users\\Dirk Vanbeveren\\.ssl\\stylify\\key.pem',
      'utf8'
    ),
    cert: fs.readFileSync(
      'C:\\Users\\Dirk Vanbeveren\\.ssl\\stylify\\cert.pem',
      'utf8'
    ),

    https: true,
    public: 'https://stylify.duckdns.org:8080',
    port: 8080,
    disableHostCheck: true
  }
}
