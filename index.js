/**
 * Copyright (C) zhao.
 */

var http = require('http');
var cheerio = require('cheerio');
var Q = require('q');
var iconv = require('iconv-lite');
var events = require('events');
var xmlBuilder = require('xmlbuilder');

var xml = xmlBuilder.create('channelList',
                            {version: '1.0', encoding: 'UTF-8', standalone: true},
                            {pubID: null, sysID: null},
                            {allowSurrogateChars: false, skipNullAttributes: false,
                                headless: false, ignoreDecorators: false, stringify: {}});

xml.com('更新日期：2015-07-22 起始日期：2015-07-20 结束日期：2015-07-26');

var options = 'http://www.tvsou.com/programys/TV_1/Channel_1/W1.htm';

var channels = {'天天高清':[]};

var parsePage = function (html) {

    $ = cheerio.load(html);

    var proDiv = $('div[class="tvgenre clear"] li');
    if(proDiv.html() === null){
        console.error('error format page');
        return;
    }

    var programs = {};
    proDiv.each(function (i, e) {
        var proTime = $(e).find('span').text()||null;
        var proName = $(e).find('a').eq(0).text()||$(e).contents().eq(-1).text()||null;
        if( proName === null || proTime === null){
            console.log("error format");
        }else{
            console.log(proTime + " " + proName);
            programs[proTime] = proName;
        }

    });
};

var getPage = function (url) {

    var deferred = Q.defer();

    http.get(url, function (response) {

        console.log(url);
        if(response.statusCode != 200)
        {
            console.error("page not found");
            deferred.reject(new Error('page not found'));
        }else{
            var chunks = [];
            var size = 0;
            response.on('data', function (chunk) {
                chunks.push(chunk);
                size += chunk.length;
            });
            response.on('end', function () {
                var buf = Buffer.concat(chunks, size);
                var str = iconv.decode(buf, 'gb2312');
                deferred.resolve(str);
            });
        }
    });
    return deferred.promise;
};

for(var i = 0; i < 1; i++) {
    getPage(options)
        .then(function (html) {
            var deferred = Q.defer();
            $ = cheerio.load(html);

            var proDiv = $('div[class="tvgenre clear"] li');
            if (proDiv.html() === null) {
                console.error('error format page');
                deferred.reject(new Error('error format page'));
            } else {
                var programs = {};
                proDiv.each(function (i, e) {
                    var proTime = $(e).find('span').text() || null;
                    var proName = $(e).find('a').eq(0).text() || $(e).contents().eq(-1).text() || null;
                    if (proName === null || proTime === null) {
                        console.log("error format");
                    } else {
                        console.log(proTime + " " + proName);
                        programs[proTime] = proName;
                        deferred.resolve(programs);
                    }

                });
            }
            return deferred.promise;
        })
        .then(function (programs) {
            console.log(programs);

        }, function (err) {
            console.log(err);
        })
}
