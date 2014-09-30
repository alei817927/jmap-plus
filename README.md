jmap-plus
================
## 简介

`jmap-plus` 是一个基于 JS 的地图插件，前身是俄罗斯男孩 [Kirill Lebedev](http://careers.stackoverflow.com/kirilllebedev) 开发的 [JVectorMap](http://jvectormap.com/) ，`JVectorMap` 是一个很不错的轻量级地图插件，只依赖 `JQuery` 和 `JQuery mousewheel`，兼容所有主流浏览器，并且支持移动版操作。最近由于工作需要，认真读了它的文档和代码，发现了几个问题：

* 地图数据转化器是用 `perl` 编写的，其中还有些小 `Bug` ，对于不太了解这个语言的我，阅读比较困难。
* 地图数据虽然已经很多，但是还不够，精确到省份（州）的地图只有2个。
* 功能不满足工作需要，不支持区域名字显示、路线图等。

针对这几个问题，最近做了一些工作：

* 使用 `Java` 编写了新的地图数据转化器 [jmap-plus-converter](https://github.com/alei817927/jmap-plus-converter)，支持路线数据生成。
* 增加了中国 32 个省份地图数据。
* 增加区域名字显示和路线图展示功能。

## 示例

* [example-1](http://www.u396.com/wp-content/jmap-plus/examples/example-1.html)
* [example-2](http://www.u396.com/wp-content/jmap-plus/examples/example-2.html)
* [example-3](http://www.u396.com/wp-content/jmap-plus/examples/example-3.html)
* [example-4](http://www.u396.com/wp-content/jmap-plus/examples/example-4.html)
* [example-5](http://www.u396.com/wp-content/jmap-plus/examples/example-5.html)

## 计划

站在前人的肩上加了点东西，也跟大家分享一下，对于这个项目，短期计划：

* 优化程序结构，继续保证浏览器兼容性。
* 继续增加新的地图数据。
* 增加新功能，比如支持鼠标点击、多类型标签展示等。
* 逐渐完善相关文档。

长期计划希望能够做成类似 `GeoServer` 这种即时请求的地图服务，展示多样化。

## 相关链接

* [JVectorMap 介绍](http://www.u396.com/jvectormap.html)
* [JVectorMap 教程](http://www.u396.com/tag/jvectormap-tutorials)
  * [简单的世界地图](http://www.u396.com/jvectormap-tutorials1.html)
  * [分级统计图](http://www.u396.com/jvectormap-choropleth-map.html)
* [JVectorMap API](http://www.u396.com/tag/jvectormap-api)
  * [数据格式](http://www.u396.com/jvectormap-api-data-format.html)
  * [WorldMap](http://www.u396.com/jvectormap-api-worldmap.html)
  * [DataSeries](http://www.u396.com/jvectormap-api-dataseries.html)
  * [Proj](http://www.u396.com/jvectormap-api-proj.html)
  * [Converter](http://www.u396.com/jvectormap-api-converter.html)
* [地图数据下载](http://www.u396.com/jvectormap-mapdata-download.html)
