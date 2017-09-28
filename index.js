// 引入 express 模块，文件是从哪来的？位置是从你安装 node 的时候所在的位置
const express = require('express');
// 引用 node.js 的 fs 核心模块
const fs = require('fs');
// 引用核心模块 path
const path = require('path');
// 使用 express 初始化 app
const app = express();

/**
 * data json 文件
 * main 主页面
 * style 样式文件
 * js 脚本
 */

const main = fs.readFileSync('./index.html');

/**
 * request 代表 http 的请求，response 代表响应
 * 表示当用户输入一个 url 之后，在根目录服务器应该给访问的用户发送的东西
 * 比如我们的在chroms中输入一个127.0.0.1:3000
 */

app.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(main);
});

// 将本地的文件 public 目录映射到 ／static , public 下的文件均可以 ／static 访问到
app.use('/public', express.static(path.join(__dirname, 'public'))).listen(3000, () => {
  console.log('it is running...');
});
