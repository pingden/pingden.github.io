var r = 255, g = 0, b = 0;  // 颜色值
var pointColor = {         // 描点属性
    radius: 3,
    stroke: false,
    fillColor: 'rgb(' + r + ',' + g + ',' + b + ')',
    fillOpacity: 1,
};

// 起始点标志, 0为起点、1为普通点、2为终点
var flag = 0;

// 重现速度
var displaySpeed = 50;
//最大速度
var MaxSpeed = 0;

// 上一地图级别，当前地图级别
var last = 16, current = 16;
var pointArr = [];   // 坐标数组
var infoArr = [];    // 信息数组

function setSpeed(){  //设置描点时间 单位：ms/点
  displaySpeed = document.getElementById('spedSet').value;
}
function ZoomIn(){  // 放大地图
  map.zoomIn();
}
function ZoomOut(){ //缩小地图
  map.zoomOut();
}
//文件读取函数
function dealSelectFiles() {
            var file = document.getElementById("selectFiles").files[0];
            var reader = new FileReader();//这是核心,读取操作就是由它完成.
            reader.readAsText(file);//读取文件的内容,也可以读取文件的URL

            reader.onload = function () {
                //当读取完成后回调这个函数,然后此时文件的内容存储到了result中,直接操作即可
                var arr = this.result.split("$");   //数据分行处理

                var i = 1;                
                var high,sped;
                flag_timer = true;

                while(arr[i]!=null && arr[i] != undefined && arr[i] != ''){                    
                    //找到返回位置，未找到返回-1
                   if(arr[i].indexOf('GPGGA') != -1){
                       var info = arr[i].split(",");
                       high = info[9];                       
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
                           my_translate(info[3],info[5]);
                           sped = parseFloat(info[7]) * 1.852;   //km/h = 海速*1.852
                           if(MaxSpeed < sped)MaxSpeed = sped;

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
               //更新颜色条刻度
               document.getElementById("sped1").innerText = parseInt(MaxSpeed/4);     
               document.getElementById("sped2").innerText = parseInt(MaxSpeed/2);
               document.getElementById("sped3").innerText = parseInt(MaxSpeed/4 * 3);
               document.getElementById("maxsped").innerText = parseInt(MaxSpeed);                       

               var index = 0;
               var len = pointArr.length;              
               var timer = setInterval(function(){

                    display(pointArr[index].lat,pointArr[index].lon,infoArr[index].speed);
                    document.getElementById("high").value = infoArr[index].high +' m';
                    document.getElementById("time").value = infoArr[index].time;
                    document.getElementById("speed").value = infoArr[index].speed.toFixed(4)+' km/h';;    //保留4位小数
                    document.getElementById("direction").value = infoArr[index].direction;
                    document.getElementById("date").value = infoArr[index].date;
                    document.getElementById("longitude").value = pointArr[index].lon.toFixed(4)+'°E';
                    document.getElementById("latitude").value = pointArr[index].lat.toFixed(4)+'°N';

                    // 更新高度显示
                    if(!isNaN(infoArr[index].high))document.getElementById("highbar").value = infoArr[index].high;                           

                    index++;
                    // 更新进度条
                    var Progress = (index/len)*1000;
                    document.getElementById("progressbar").value = Progress;

                    if(index>= len){   // 描点结束
                        flag = 2;
                        display(pointArr[len-1].lat,pointArr[len-1].lon); 
                        pointArr = [];  //清空数组
                        infoArr = [];                      
                        clearInterval(timer);
                    }
                    if(flag_timer == false){  // 描点被按下Backspace结束
                      flag_timer = true;
                      flag = 2;
                      pointArr = [];
                      infoArr = [];
                      clearInterval(timer);
                    }

               },displaySpeed);             
            }
        }

//设置当前可能的状态图
function stateDisplay(speed){
  if(speed < 10){
    document.getElementById("state").src = "icon/foot.png";
  }  else if(speed < 30){
    document.getElementById("state").src = "icon/bike.png";
  }  else if(speed < 120){
    document.getElementById("state").src = "icon/car.png";
  }  else if(speed < 200){
    document.getElementById("state").src = "icon/train.png";
  }  else if(speed < 500){
    document.getElementById("state").src = "icon/high_speed.png";
  }  else if(speed >= 500){
    document.getElementById("state").src = "icon/plane.png";
  }
}

// 坐标转换
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

    var point_temp = {
      lat: lat,
      lon: lon,
    };
    pointArr.push(point_temp);
}

var start =  {
    icon: L.icon({
        iconUrl: 'icon/start.png',
        iconSize: [48, 48],
        iconAnchor: [24, 42],
    })
};
var final =  {
    icon: L.icon({
        iconUrl: 'icon/final.png',
        iconSize: [48, 48],
        iconAnchor: [24, 42],
    })
};

var count = 0; //用于地图级别设置消抖
function display(lat,lon,speed){             
  stateDisplay(speed); 
  g = parseInt(speed/MaxSpeed * 255);
  b = g;
  pointColor.fillColor = 'rgb('+r+','+g+','+b+')';
    if(flag == 0){
       new L.Marker([lat,lon],start).addTo(map);         //描起点          
       map.panTo([lat,lon]); // 设置地图中心点
       flag = 1;
    }
    else if(flag == 1){      
      new L.circleMarker([lat,lon],pointColor).addTo(map);
      if(speed<150){
         current = 16;
       }else if(speed<400){
         current = 15;
       }else if(speed<600){
         current = 14; 
       }else if(speed>=600){
         current = 13;             // speed存在空值需过滤
       }       

      map.panTo([lat,lon],{
          animate:  false
       }); // 设置地图中心点
       
       //设置地图级别
       if(last != current){
          count++;             
          if(count > 10){            
             count = 0;
             last = current;
             map.setZoom(current);                          
          }
       }
    }
    else{
       new L.Marker([lat,lon],final).addTo(map); //描终点
       map.panTo([lat,lon]); // 设置地图中心点          
       flag = 0;
    }
}

