/**
 * Copyright (C) zhao.
 */

var http = require('http');
var cheerio = require('cheerio');
var Q = require('q');
var iconv = require('iconv-lite');

var options = 'http://www.tvsou.com/program/TV_208/Channel_909/W1.htm';

var parsePage = function (html) {
    $ = cheerio.load(html);

    var proDiv = $('div[class="tvgenre clear"] li');
    if(proDiv.html() === null){
        console.error('error format page');
        return;
    }
    proDiv.each(function (i, e) {
        var proTime = $(e).find('span').text()||null;
        var proName = $(e).find('a').eq(0).text()||$(e).text()||null;
        if( proName === null || proTime === null){
            console.log("error format");
        }else{
            console.log(proTime + " " + proName);
        }

    });
};

var getPage = function (url, callback) {

    http.get(options, function (response) {
        console.log(url);
        if(response.statusCode != 200)
        {
            console.error("page not found");
            return;
        }

        var chunks = [];
        var size = 0;
        response.on('data', function (chunk) {
            chunks.push(chunk);
            size += chunk.length;
        });
        response.on('end', function () {
            var buf = Buffer.concat(chunks, size);
            var str = iconv.decode(buf, 'gb2312');

            callback(str);

        });
    }).on('error', function (e) {
        console.log(e.message);
    });
};

getPage(options, parsePage);


