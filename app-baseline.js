const http = require('http')
const { URL } = require('url')

const PORT = 3000

function page (title, body) {
  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
</head>
<body>
  <h1>${title}</h1>
  ${body}
  <hr>
  <p><a href="/">Home</a> | <a href="/profile?name=Taufik">Profile</a></p>
</body>
</html>`
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const q = url.searchParams.get('q') || 'belum ada pencarian'

  // Intentionally weak for lab: no secure headers and no output escaping.
  if (url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(page('Baseline App', `<p>Search: ${q}</p><form><input name="q" placeholder="search"><button>Search</button></form>`))
    return
  }

  if (url.pathname === '/profile') {
    const name = url.searchParams.get('name') || 'guest'
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(page('Profile', `<p>Nama: ${name}</p>`))
    return
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('not found')
})

server.listen(PORT, () => {
  console.log(`Baseline app running at http://localhost:${PORT}`)
})
