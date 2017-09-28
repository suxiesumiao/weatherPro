let http = require('http');
let fs = require('fs');
http.createServer((req, res) => {
  let url = req.url;
  if (url === '/') {
    fs.readFile('./index.html', (err, data) => {
      res.writeHead(200, { 'Content-type': 'text/html;charset=UTF-8' });
      res.end(data)
    })
  } else if (url.match(/[^\.]\w*$/)[0] === 'svg'){
    fs.readFile(url, (err, data) => {
      res.writeHead(200, { 'Content-type': 'image/svg+xml;charset=UTF-8' });
      res.end(data)
    })
  } else {
    url = '.' + url;
    fs.readFile(url, (err, data) => {
      res.writeHead(200, { 'Content-type': 'text/css;charset=UTF-8' });
      res.end(data)
    })
  }
}).listen(8888, () => {
  console.log('it is running...')
})