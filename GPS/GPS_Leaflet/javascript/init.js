// Creating map options
var mapOptions = {
    center: [30.63231, 104.0820],
    zoom: 16
}
// Creating a map object
var map = new L.map('map', mapOptions);

// Creating Layer objects
// 高德地图影像
var Gaode = new L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    maxNativeZoom: 20,
    minZoom: 3,
    attribution: "高德地图 AutoNavi.com",
    subdomains: "1234"
});

// 天地图影像
var Tiandi = L.tileLayer('http://t{s}.tianditu.gov.cn/img_w/wmts?tk=da144caca3dc9a894a921aa6c937ca71&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}', {
    subdomains: [0, 1, 2, 3, 4, 5, 6, 7],
});

// MapBox
var mapBox = L.tileLayer('https://api.mapbox.com/styles/v1/deven3433/ckvi4woqi0vy615qljjvthgn9/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZGV2ZW4zNDMzIiwiYSI6ImNrdmkzYjMxcTI2Y2Iydm55NmEwaWs2Z2wifQ.bMgbUERe8dqTan0PENXgBw');

var baseLayers = {
    //"高德地图": layer1,    // 高德卫星影像显示不全，故没有采用，此外高德和另外两个采用的坐标系不同
    "天地图": Tiandi,       
    "MapBox": mapBox
};

// Adding layer to the map
map.addLayer(Tiandi);

// 添加图层选择控件到地图
L.control.layers(baseLayers, null).addTo(map);


var flag_timer = true;  // 定时描点使能标志
document.onkeydown = function (event) {        //在全局中绑定按下事件
    var e = event || window.e;
    var keyCode = e.keyCode || e.which;

    switch (keyCode) {
        // 按Backspace结束描点
        case 8:
            flag_timer = false;
            break;
        // 按空格暂停描点
        case 32:
            alert('暂停，点击确定继续');
            break;
    }
}