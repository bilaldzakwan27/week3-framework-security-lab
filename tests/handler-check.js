// Evidence reproducer: actual application handlers run with a mock HTTP transport.
// This does not open a port and does not prove browser behavior or live HTTP.
const fs = require('fs')
const path = require('path')
const vm = require('vm')
const assert = require('assert')
const lab = path.resolve(__dirname, '..')
const required = ['Content-Security-Policy', 'X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy']
let checks = 0
console.log('Evidence type: in-memory handler test; no socket, browser, or npm audit.')
for (const file of ['app-baseline.js', 'app-secure.js']) {
  let handler
  const context = {
    require (name) {
      if (name === 'http') return { createServer (fn) { handler = fn; return { listen () {} } } }
      return require(name)
    },
    console
  }
  vm.runInNewContext(fs.readFileSync(path.join(lab, file), 'utf8'), context, { filename: file })
  const secure = file === 'app-secure.js'
  console.log('\nAPP:', file)
  function request (url) {
    let status, headers, body
    handler({ url, headers: { host: 'localhost:3000' } }, {
      writeHead (s, h) { status = s; headers = h }, end (b) { body = b }
    })
    return { status, headers, body }
  }
  const root = request('/')
  assert.equal(root.status, 200); checks++
  console.log('Home headers:', JSON.stringify(root.headers))
  for (const h of required) { assert.equal(Boolean(root.headers[h]), secure); checks++ }
  for (const [route, key, label] of [['/', 'q', 'Search'], ['/profile', 'name', 'Nama']]) {
    for (const [input, escaped] of [
      ['<script>alert(1)</script>', '&lt;script&gt;alert(1)&lt;/script&gt;'],
      ['<b>halo</b>', '&lt;b&gt;halo&lt;/b&gt;'],
      ['&<>"\'', '&amp;&lt;&gt;&quot;&#39;']
    ]) {
      const result = request(route + '?' + key + '=' + encodeURIComponent(input))
      assert.equal(result.status, 200); checks++
      assert.ok(result.body.includes(label + ': ' + (secure ? escaped : input))); checks++
      console.log(route + ' ' + JSON.stringify(input) + ' => ' + result.body.split('\n').find(line => line.includes(label + ':')))
    }
    assert.equal(request(route).status, 200); checks++
  }
  const missing = request('/missing')
  assert.equal(missing.status, 404); checks++
  console.log('404 headers:', JSON.stringify(missing.headers))
  const logs = []
  const mockedHttp = { get (target, callback) {
    callback({ statusCode: 200, headers: Object.fromEntries(Object.entries(root.headers).map(([k, v]) => [k.toLowerCase(), v])), resume () {} })
    return { on () { return this } }
  } }
  vm.runInNewContext(fs.readFileSync(path.join(lab, 'tools/header_check.js'), 'utf8'), {
    require () { return mockedHttp }, process: { argv: ['node', 'header_check.js', 'http://localhost:3000/'] }, console: { log (x) { logs.push(x) } }
  })
  console.log('header_check.js with mocked transport:\n' + logs.join('\n'))
}
console.log('\nPASS:', checks, 'assertions. Live HTTP and browser not tested.')
