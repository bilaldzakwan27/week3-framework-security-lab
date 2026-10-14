const http = require('http')
const target = process.argv[2] || 'http://localhost:3000/'
const required = [
  'content-security-policy',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy'
]

http.get(target, (res) => {
  console.log(`Status: ${res.statusCode}`)
  for (const h of required) {
    const value = res.headers[h]
    console.log(`${value ? 'OK     ' : 'MISSING'} ${h}${value ? ': ' + value : ''}`)
  }
  res.resume()
}).on('error', (err) => {
  console.error('Request failed:', err.message)
  process.exit(1)
})
