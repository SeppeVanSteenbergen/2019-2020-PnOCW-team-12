const dev = true

let secure = true // true for https, false for http

if(dev) secure = false

const devServ = {
  backend: {
    url: 'http://localhost:8012',
    port: 8012
  },
  frontend: {
    url: 'http://localhost:8080',
    port: 8080
  }
}
const servPub = {
  backend: {
    url: 'http://stylify.duckdns.org:3040',
    port: 3040
  },
  frontend: {
    url: 'http://stylify.duckdns.org:3040',
    port: 3040
  }
}

let server = {}
if (dev) {
  server = devServ
} else {
  server = servPub
}

module.exports = {
  server: {
    domain: server.backend.domain, // This server
    port: server.backend.port
  },
  session: {
    secret: 'secretPassword123$$=:;',
    name: 'login'
  },
  client: {
    url: server.frontend.url,
    port: server.frontend.port
  },
  secure: secure // true for https, false for http
}
