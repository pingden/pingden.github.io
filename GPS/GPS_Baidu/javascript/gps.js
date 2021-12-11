var pointArr = [];
var infoArr = [];
//文件读取函数
function dealSelectFiles() {
            var file = document.getElementById("selectFiles").files[0];
            var reader = new FileReader();//这是核心,读取操作就是由它完成.
            reader.readAsText(file);//读取文件的内容,也可以读取文件的URL

            reader.onload = function () {
                //当读取完成后回调这个函数,然后此时文件的内容存储到了result中,直接操作即可
                var arr = this.result.split("$");   //数据分行处理

                // 终点的经纬度
                var final_lat,final_lon;
                var i = 1;
                flag_timer = 1;
                var high;

                while(arr[i]!=null && arr[i] != undefined && arr[i] != ''){                    
                    //找到返回位置，未找到返回-1
                   if(arr[i].indexOf('GPGGA') != -1){
                       var info = arr[i].split(",");
                       high = info[9] +' m';                       
                   }
                   else if(arr[i].indexOf('GPRMC') != -1 && arr[i].indexOf('V') == -1){

                       var info_temp = {
                                date:undefined,
                                time:undefined,
                                high:undefined,
                                speed:undefined,
                                direction:undefined
                            };
                       
                       var info = arr[i].split(",");

                       if(info[2] == 'A'){
                           final_lat = info[3];
                           final_lon = info[5];
                           my_translate(info[3],info[5]);
                           sped = parseFloat(info[7]) * 1.852;   //km/h = 海速*1.852

                           info_temp.high = high;
                           info_temp.speed = sped;
                           info_temp.time = (parseInt(info[1].slice(0,2))+8)%24+':'+info[1].slice(2,4)+':'+info[1].slice(4,6);
                           info_temp.date = info[9].slice(4,6)+'年'+info[9].slice(2,4)+'月'+info[9].slice(0,2)+'日';
                           info_temp.direction = info[8]+'°';

                           infoArr.push(info_temp);                           
                       }
                   }
                   i++;
               }
               alert('数据处理完成');

               var index = 0;
               var len = pointArr.length; 
               var points = [];
               while(index<len){
                var temp = new BMap.Point(pointArr[index].lon,pointArr[index].lat);
                points.push(temp);   
                index++;
               } 
               var options = {
                size: BMAP_POINT_SIZE_SMALLER,
                shape: BMAP_POINT_SHAPE_CIRCLE,
                color: '#0000FF'
                }
                var pointCollection = new BMap.PointCollection(points, options);  // 初始化PointCollection
                map.addOverlay(pointCollection);  // 添加Overlay   
                map.addOverlay(new BMap.Marker(new BMap.Point(pointArr[0].lon,pointArr[0].lat),{icon: startIcon})); //描起点
                map.addOverlay(new BMap.Marker(new BMap.Point(pointArr[len-1].lon,pointArr[len-1].lat),{icon: finalIcon})); //描起点                            
            }
        }

function my_translate(lat,lon)    //根据坐标信息描点
{
    //转换经度   dddmm.mmmm转ddd.dddd
    var d = lon.slice(0,3);      //取出度
    var m = lon.slice(3,10);     //取出分
    m = m/60;
    lon = parseFloat(d) + parseFloat(m);

    //转换纬度   ddmm.mmmm转dd.dddd
    d = lat.slice(0,2);
    m = lat.slice(2,9);
    m = m/60;
    lat = parseFloat(d) + parseFloat(m);    //转成浮点型后计算

    var t1 = wgs2gcj(lat, lon);
    var t2 = gcj2bd(t1[0],t1[1]);

    var point_temp = {
        lat: t2[0],
        lon: t2[1],
    };
    pointArr.push(point_temp);
}

// 下方代码本来是想直接使用百度地图API来实现项目功能的，后来改用了Leaflet
// 有兴趣的可以参考一下，很简单
/* 
// 阻塞函数
function sleep(delay) {
    var start = (new Date()).getTime();
    while((new Date()).getTime() - start < delay) {
        continue;
    }
}

var count = 0; //用于地图级别设置消抖
function display(lat,lon,speed){
           
    if(flag == 0){
       //map.addOverlay(new BMap.Marker(new BMap.Point(lon, lat))); //描起点
       map.setCenter(new BMap.Point(lon, lat)); // 设置地图中心点
       map.addOverlay(new BMap.Marker(new BMap.Point(lon, lat),{icon: startIcon})); //描起点
       flag = 1;
    }
    else if(flag == 1){
       if(speed<30){
              //map.addOverlay(new BMap.Marker(new BMap.Point(lon, lat),{icon: redIcon})); //低速红点
              map.addOverlay(new BMap.Circle(new BMap.Point(lon, lat),1,red));
              current = 17;
       }
       else if(speed<60){
              //map.addOverlay(new BMap.Marker(new BMap.Point(lon, lat),{icon: yellowIcon})); //中速黄点
              map.addOverlay(new BMap.Circle(new BMap.Point(lon, lat),1,yellow));
              current = 17;
       }
       else if(speed<150){
              //map.addOverlay(new BMap.Marker(new BMap.Point(lon, lat),{icon: whiteIcon})); //快速白点
              map.addOverlay(new BMap.Circle(new BMap.Point(lon, lat),1,white));
              current = 17;
       }
       else if(speed<400){
              //map.addOverlay(new BMap.Marker(new BMap.Point(lon, lat),{icon: blueIcon})); //极速蓝点
              map.addOverlay(new BMap.Circle(new BMap.Point(lon, lat),1,blue));
              current = 16;
       }
       else if(speed<600){
            //map.addOverlay(new BMap.Marker(new BMap.Point(lon, lat),{icon: blueIcon})); //极速蓝点
            map.addOverlay(new BMap.Circle(new BMap.Point(lon, lat),1,blue));
            current = 15;
        }
        else if(speed<800){
            //map.addOverlay(new BMap.Marker(new BMap.Point(lon, lat),{icon: blueIcon})); //极速蓝点
            map.addOverlay(new BMap.Circle(new BMap.Point(lon, lat),1,blue));
            current = 14;
        }
       else{
            map.addOverlay(new BMap.Circle(new BMap.Point(lon, lat),1,black));
            current = 13;
       }

       if(last != current){
               count++;
               if(count > 10){
                 map.setZoom(current);
                 last = current;
                 count = 0;
               }               
        }

       if(speed>30)map.panTo(new BMap.Point(lon, lat),{
                    noAnimation: true,
            }); // 设置地图中心点
    }
    else{
       //map.addOverlay(new BMap.Marker(new BMap.Point(lon, lat))); //描终点
       map.addOverlay(new BMap.Marker(new BMap.Point(lon, lat),{icon: finalIcon})); //描终点
       flag = 0;
    }  
}

function translate(lat,lon){
    var t1 = wgs2gcj(lat, lon);
    var t2 = gcj2bd(t1[0],t1[1]);  
    
        
    if(flag == 0){
       //map.addOverlay(new BMap.Marker(new BMap.Point(t2[1], t2[0]))); //描起点
       map.setCenter(new BMap.Point(t2[1], t2[0])); // 设置地图中心点
       map.addOverlay(new BMap.Marker(new BMap.Point(t2[1], t2[0]),{icon: startIcon})); //描起点      
       flag = 1;
    }
    else if(flag == 1){
       if(sped<30){
              //map.addOverlay(new BMap.Marker(new BMap.Point(t2[1], t2[0]),{icon: redIcon})); //低速红点
              map.addOverlay(new BMap.Circle(new BMap.Point(t2[1], t2[0]),1,red));
              current = 17;
       }
       else if(sped<60){
              //map.addOverlay(new BMap.Marker(new BMap.Point(t2[1], t2[0]),{icon: yellowIcon})); //中速黄点
              map.addOverlay(new BMap.Circle(new BMap.Point(t2[1], t2[0]),1,yellow));
              current = 17;
       }
       else if(sped<150){
              //map.addOverlay(new BMap.Marker(new BMap.Point(t2[1], t2[0]),{icon: whiteIcon})); //快速白点
              map.addOverlay(new BMap.Circle(new BMap.Point(t2[1], t2[0]),1,white));
              current = 17;
       }
       else if(sped<400){
              //map.addOverlay(new BMap.Marker(new BMap.Point(t2[1], t2[0]),{icon: blueIcon})); //极速蓝点
              map.addOverlay(new BMap.Circle(new BMap.Point(t2[1], t2[0]),1,blue));
              current = 16;
       }
       else{
                map.addOverlay(new BMap.Circle(new BMap.Point(t2[1], t2[0]),1,black));
                current = 15;
       }

       if(last != current){
               count++;
               if(count > 10){
                 map.setZoom(current);
                 last = current;
                 count = 0;
               }               
        }

       if(sped>30)map.setCenter(new BMap.Point(t2[1], t2[0]),{
            noAnimation: true,
       }); // 设置地图中心点
       //if(sped>30)map.panTo(new BMap.Point(t2[1], t2[0])); // 设置地图中心点

    }
    else{
       //map.addOverlay(new BMap.Marker(new BMap.Point(t2[1], t2[0]))); //描终点
       map.addOverlay(new BMap.Marker(new BMap.Point(t2[1], t2[0]),{icon: finalIcon})); //描终点
       flag = 0;
    }  
}
*/
