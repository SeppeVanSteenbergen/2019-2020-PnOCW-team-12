const dev = true

let secure = true // true for https, false for http

if (dev) secure = false

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
    url: secure
      ? 'https://stylify.duckdns.org:443'
      : 'http://stylify.duckdns.org',
    port: secure ? 443 : 80
  },
  frontend: {
    url: secure
      ? 'https://stylify.duckdns.org:443'
      : 'http://stylify.duckdns.org',
    port: secure ? 443 : 80
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
