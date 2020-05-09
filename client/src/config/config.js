const dev = false

let secure = true // true for https, false for http

let kuleuven = false

if (dev) secure = false

const devServ = {
  backend: {
    url: 'http://192.168.0.146:8012',
    port: 8012
  },
  frontend: {
    url: 'http://192.168.0.146:8080',
    port: 8080
  }
}
const servPub = {
  backend: {
    url: secure
      ? 'https://stylify.duckdns.org:8081'
      : 'http://stylify.duckdns.org',
    port: secure ? 8081 : 80
  },
  frontend: {
    url: secure
      ? 'https://stylify.duckdns.org:8080'
      : 'http://stylify.duckdns.org',
    port: secure ? 8080 : 80
  }
}

const kuleuvenServer = {
  backend: {
    url: 'https://penocw12.student.cs.kuleuven.be',
    port: 443
  },
  frontend: {
    url: 'https://penocw12.student.cs.kuleuven.be',
    port: 443
  }
}

let server = {}
if (dev) {
  server = devServ
} else {
  server = servPub
}

if(kuleuven) {
  server = kuleuvenServer
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
