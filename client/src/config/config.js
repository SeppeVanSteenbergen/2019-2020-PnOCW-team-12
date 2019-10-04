const dev = false

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
    url: 'http://stylify.duckdns.org:3040', // This server
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

export default {
  backend: {
    url: server.backend.url,
    port: server.backend.port
  },
  frontend: {
    url: server.frontend.url,
    port: server.frontend.port
  },
  secure: secure // true for https, false for http
}
