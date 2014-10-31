var Module={
	require:function(js,callback){
		if(js){
			var s = document.createElement("script");
			s.src = js;
			s.onload=function(){
				callback();
			};
			(document.body||document.head).appendChild(s);
		}else{
			if(typeof window.addEventListener!="undefined"){
				window.addEventListener("load",function(){
					callback();	
				});	
			}else{
				window.attachEvent("onload",function(){
					callback();	
				});
			}
			
		}
		
	}
};

var url = "";//"http://api.map.baidu.com/getscript?v=2.0&ak=&services=true&t=20141026152027";
Module.require(url,function(){
	//公共 
	function G(id) {
		return document.getElementById(id);
	}
	
    //创建和初始化地图函数：
    function initMap(){
        createMap();//创建地图
        setMapEvent();//设置地图事件
        addMapControl();//向地图添加控件
        setAutoComplete("suggestId");
        setPositionControl();
        
        G("btn1").onclick=function(){
        	startSelect();
        } ;
    }
    
    //创建地图函数：
    function createMap(){
    	//在百度地图容器中创建一个地图
        var map = new BMap.Map("dituContent");
        var point = new BMap.Point(116.373798,39.908294);
        map.centerAndZoom(point,12);//设定地图的中心点和坐标并将地图显示在地图容器中
        window.map = map;//将map变量存储在全局 
    }
    
    //地图事件设置函数：
    function setMapEvent(){
        map.enableDragging();//启用地图拖拽事件，默认启用(可不写)
        map.enableScrollWheelZoom();//启用地图滚轮放大缩小
        map.enableDoubleClickZoom();//启用鼠标双击放大，默认启用(可不写)
        map.enableKeyboard();//启用键盘上下左右键移动地图
        
        
    }
    
    function setAutoComplete(inputId){
    	var ac = new BMap.Autocomplete(    //建立一个自动完成的对象
			{"input" : "suggestId"
			,"location" : map
		});
		
		ac.addEventListener("onconfirm", function(e) {    //鼠标点击下拉列表后的事件
			var _value = e.item.value;
				myValue = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
				G("searchResultPanel").innerHTML ="onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;
				setPlace();
			});
    }
    function setPlace(){
		map.clearOverlays();    //清除地图上所有覆盖物
		function myFun(){
			var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
			map.centerAndZoom(pp, 18);
			map.addOverlay(new BMap.Marker(pp));    //添加标注
		}
		var local = new BMap.LocalSearch(map, { //智能搜索
		  onSearchComplete: myFun
		});
		local.search(myValue);
	}
	
	
	function setPositionControl(){
		G("weidu").onblur=G("jingdu").onblur=function(e){
			setPosition(G("weidu").value,G("jingdu").value);
			var m = new BMap.Marker(new BMap.Point(G("weidu").value,G("jingdu").value));
			map.addOverlay(m);
		};
	}
	
	function setPosition(x,y){
		x = x||116.331398,y = y||39.897445;
		map.centerAndZoom(new BMap.Point(x,y),11);
	}
    
    //地图控件添加函数：
    function addMapControl(){
        //向地图中添加缩放控件
	var ctrl_nav = new BMap.NavigationControl({anchor:BMAP_ANCHOR_TOP_LEFT,type:BMAP_NAVIGATION_CONTROL_LARGE});
	map.addControl(ctrl_nav);
        //向地图中添加缩略图控件
	var ctrl_ove = new BMap.OverviewMapControl({anchor:BMAP_ANCHOR_BOTTOM_RIGHT,isOpen:1});
	map.addControl(ctrl_ove);
        //向地图中添加比例尺控件
	var ctrl_sca = new BMap.ScaleControl({anchor:BMAP_ANCHOR_BOTTOM_LEFT});
	map.addControl(ctrl_sca);
    }
    
    //地图可以支持圈选
    var poly,poly_temp;
    var pointerArr;
    var selecting = true;
    
    var selectStartHandle=function(e){
		if(poly && !selecting){
			var pointer = e.point;
			alert("你点击的点在圈选的范围内吗？  "+isPointInSelection(pointer));
		}
		if(!selecting)return;
		var pointer = e.point;
    	pointerArr.push(new BMap.Point(pointer.lng,pointer.lat)); 
    	poly_temp.setPath(pointerArr);	
   };
   var selectMoveHandle=function(e){
    	//return;
    	if(!selecting)return;
    	var pointer = e.point; 
    	poly_temp.setPath(pointerArr.concat(pointer));
   };
   var selectDbcHandle=function(e){         	
    	var pointer = e.point;
    	pointerArr.push(pointer); 
    	poly_temp.setPath(pointerArr);	
    	endSelect(); 
    	if(e && e.domEvent && e.domEvent.stopPropagation)e.domEvent.stopPropagation();
    	return false;
   };
   var selectWinKeyDownHandle = function(e){
    	if(e.keyCode==27){
    		endSelect();
    	}        	
   };
    function startSelect(){
    	//例子
    	if(0){
    		var polygon = new BMap.Polygon([
				new BMap.Point(116.387112,39.920977),
				new BMap.Point(116.385243,39.913063),
				new BMap.Point(116.394226,39.917988),
				new BMap.Point(116.401772,39.921364),
				new BMap.Point(116.41248,39.927893)
			], {strokeColor:"blue", strokeWeight:2, strokeOpacity:0.5});  //创建多边形
	    	map.addOverlay(polygon);
	    	setTimeout(function(){
	    		polygon.enableEditing();
	    	},1000); 
	    	return;
    	}
    	//end 例子 
    	pointerArr = [
				// new BMap.Point(116.300, 39.912),
				// new BMap.Point(116.405, 39.990),
				// new BMap.Point(116.425, 39.890)
		];  
		poly_temp = new BMap.Polygon(pointerArr, {strokeColor:"blue", strokeWeight:2, strokeOpacity:0.5});		
		map.addOverlay(poly_temp);
		 
		map.addEventListener("click",selectStartHandle,true); 
        map.addEventListener("mousemove",selectMoveHandle,true); 
        map.addEventListener("dblclick",selectDbcHandle);        
        if(typeof window.addEventListener!="undefined"){
        	window.addEventListener("keydown",selectWinKeyDownHandle);
        }else{
        	window.attachEvent("onkeydown",selectWinKeyDownHandle);
        }
    }
    //结束圈选状态
    function endSelect(){
    	selecting = false;
    	map.removeOverlay(poly_temp);
    	poly = new BMap.Polygon(pointerArr, {strokeColor:"blue", strokeWeight:2, strokeOpacity:0.5});
    	map.addOverlay(poly);
    	poly.enableEditing();
    	
    	alert("圈选的框的路径为"+getPosArrayFromPointArray(pointerArr));
    }
    
    //
    function isPointInSelection(point){
    	//return poly.getBounds().containsPoint(point);
    	return _isPointInPoly(point,poly.getPath());
    }
    //点是否在多面体内
    function _isPointInPoly(pt, poly){
    	 for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) 
	        ((poly[i].lat <= pt.lat && pt.lat < poly[j].lat) || (poly[j].lat <= pt.lat && pt.lat < poly[i].lat)) 
	        && (pt.lng < (poly[j].lng - poly[i].lng) * (pt.lat - poly[i].lat) / (poly[j].lat - poly[i].lat) + poly[i].lng) 
	        && (c = !c); 
	    return c; 
    }
    
    
    function getPosArrayFromPointArray(pointArray){
    	var arr  =[];
    	for(var i=0;i<pointArray.length;i++){
    		arr.push([pointArray[i].lng,pointArray[i].lat]);	
    	}
    	return arr;
    }
    
    initMap();//创建和初始化地图
	
});	