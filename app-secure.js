const http = require('http')
const { URL } = require('url')

const PORT = 3000

function escapeHtml (value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function securityHeaders () {
  return {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Security-Policy': "default-src 'self'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'; form-action 'self'",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  }
}

function page (title, body) {
  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${body}
  <hr>
  <p><a href="/">Home</a> | <a href="/profile?name=Taufik">Profile</a></p>
</body>
</html>`
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const q = url.searchParams.get('q') || 'belum ada pencarian'

  if (url.pathname === '/') {
    res.writeHead(200, securityHeaders())
    res.end(page('Secure App', `<p>Search: ${escapeHtml(q)}</p><form><input name="q" placeholder="search"><button>Search</button></form>`))
    return
  }

  if (url.pathname === '/profile') {
    const name = url.searchParams.get('name') || 'guest'
    res.writeHead(200, securityHeaders())
    res.end(page('Profile', `<p>Nama: ${escapeHtml(name)}</p>`))
    return
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('not found')
})

server.listen(PORT, () => {
  console.log(`Secure app running at http://localhost:${PORT}`)
})
