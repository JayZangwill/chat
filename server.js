var http = require("http");
var fs = require("fs");
var path = require("path");
var mime = require("mime"); //根据文件扩展名得出mime类型
var cache = {}; //缓存文件的对象
/*文件没找到*/
function send404(res) {
	res.writeHead(404, {
		"Content-Type": "text/plain"
	});
	res.write("错误404:资源没找到。");
	res.end();
}
/*读取文件*/
function sendFile(res, filePath, fileContents) {
	res.writeHead(200, {
		"Content-Type": mime.lookup(path.basename(filePath))
	});
	res.end(fileContents);
}
/*静态文件服务*/
function serverStatic(res, cache, absPath) {
	if(cache[absPath]) //看文件是否在缓存在内存中
	{
		sendFile(res, absPath, cache[absPath]); //从内存返回文件
	} else {
		fs.exists(absPath, function(exists) { //检查文件是否存在
			if(exists) {
				fs.readFile(absPath, function(err, data) { //从硬盘读取
					if(err) {
						send404(res);
					} else {
						cache[absPath] = data;
						sendFile(res, absPath, data);
					}
				});
			} else {
				send404(res);
			}
		});
	}
}
/*创建服务器*/
	var server = http.createServer(function(req, res) {
		var filePath = false;
		if(req.url == "/") {
			filePath = "chat/index.html";
		} else {
			filePath = req.url; //将url转为相对路径
		}
		var absPath = './' + filePath;
		serverStatic(res, cache, absPath); //返回静态文件
	});
	server.listen(3000, function() {
		console.log("success");
	});
	var chatServer = require('./lib/chat_server');
	chatServer.listen(server);