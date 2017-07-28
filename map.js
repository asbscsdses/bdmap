$("#container").css({height:$(window).height(300), width:$(window).width(), marginTop:"0px",marginBottom:"50px"});

var map = new BMap.Map("container");
var center = new BMap.Point(113.646769, 34.769658);

//记录marker、label、polyline的个数
var NUM_MARKER = 0,
	NUM_LABEL = 0,
	NUM_POLYLINE = 0;
	
//鼠标样式
var cursorStyle = {
	"ol_marker" : "hand",
	"ol_polygen" : "crosshair",
	"ol_label" : "text",
	"default" : "auto"
};

//添加标注时，鼠标的label信息
var labelInfo = {
	"ol_marker" : "左键标记，右键退出",
	"ol_polygen" : "左键单击开始画线，双击结束画线，右键退出",
	"ol_label" : "左键标记，右键退出",
	"drawing_line" : "双击结束画线"
};

/*
 *用于存储地图各个配置项的数据结构
 *包括：地图中心点、地图的监听事件、地图的控件、地图上的覆盖物等信息
 *用于获取代码的时候绘制地图
 */
var config = {
	city: "北京",
	center_point: new BMap.Point(116.403874,39.914889),
	zoom: 12,

	container_width: 700,
	container_height: 550,

	enableScrollWheelZoom: true,
	enableKeyboard: true,
	enableDragging: true,
	enableDoubleClickZoom: true,
	scale_control: {
		added: true,
		anchor: "BMAP_ANCHOR_BOTTOM_LEFT",
		type: "BMAP_UNIT_IMPERIAL"
	},
	nav_control: {
		added: true,
		anchor: "BMAP_ANCHOR_TOP_LEFT",
		type: "BMAP_NAVIGATION_CONTROL_LARGE"
	},
	overview_control: {
		added: true,
		anchor: "BMAP_ANCHOR_BOTTOM_RIGHT",
		isopen: true
	},
	label_array: [],
	label_config: [],
	marker_array: [],
	marker_config: [],
	polyline_config: [],
	polyline_array: []
}

// 此变量在添加标注功能时，用于记录当前的click事件的处理函数
var clickHandler;

//声明和初始化跟随鼠标移动的label
var cursorLabel = new BMap.Label();
	cursorLabel.setOffset(new BMap.Size(10,10));
	map.addOverlay(cursorLabel);
	cursorLabel.hide();
	
$("#btn").click(function(){	
	setCursor("ol_marker");
});

map.centerAndZoom(center, 12);

map.enableScrollWheelZoom();

map.addControl(new BMap.NavigationControl());

var marker = new BMap.Marker(center);  　　　　　 // 创建标注
map.addOverlay(marker);                        // 将标注添加到地图中       

var infoWindow = new BMap.InfoWindow("I am here");    // 创建信息窗口对象
map.openInfoWindow(infoWindow,center);                 //开启信息窗口

//map.setDefaultCursor("crosshair"); 

var label = new BMap.Label("abc", center);
map.addOverlay(label);

//相应添加marker按钮
function addMarker(){
	//如果click已经有事件处理函数，先清除掉
	if(clickHandler)
		exitDrawing(clickHandler);

	map.addEventListener("click",addMarkerAction);
	clickHandler = addMarkerAction;
	//单击右键退出绘制
	map.addEventListener("rightclick",function(e){
		exitDrawing(addMarkerAction);
	});
}


//添加marker的具体处理
function addMarkerAction(e){	
	NUM_MARKER ++;
	
	var point = e.point;
	var marker = new BMap.Marker(point,{icon:new BMap.Icon("http://api.map.baidu.com/lbsapi/createmap/images/icon.png", new BMap.Size(20,25),{
		imageOffset:new BMap.Size(0,3)
	}),title:"可移动改变位置"});
	var label = new BMap.Label("我的标记", {offset: new BMap.Size(25,5)});
	var infoWdOpt = {
		width: 200,
		title: "我的标记",
		enableMessage: false
	};
	var infoWd = new BMap.InfoWindow("我的备注",infoWdOpt);
	map.addOverlay(marker);
	marker.setLabel(label);
	marker.enableDragging();
	marker.addEventListener("click",function(e){
		marker.openInfoWindow(infoWd);
	});
	marker.addEventListener("dragend",function(e){
		markerDragged(e,NUM_MARKER);
	});
	config.marker_array.push(marker);
	var marker_item = {  position: {lng: e.point.lng, lat: e.point.lat},
						"title":"我的标记",
						"content": "我的备注",
						"imageOffset":{width:0,height:3}
					};
	config.marker_config.push(marker_item);

	//每次添加marker之后先退出绘制
	exitDrawing(addMarkerAction);
}

//隐藏鼠标提示信息
function cursorLabelHide(){
	cursorLabel.hide();
}
//显示鼠标提示信息
function cursorLableShow(){
	cursorLabel.show();
}
//marker被拖拽后在配置信息中重新设定它的坐标
function markerDragged(e,index){
	config.marker_config[index-1].position.lng = e.point.lng;
	config.marker_config[index-1].position.lat = e.point.lat;
}

//根据当前绘制的标注类型来设置鼠标的样式
function setCursor(overlayType){
	if(overlayType == "ol_marker"){
		var cursorUrl = "url('./images/" + overlayType + ".cur')";
		map.setDefaultCursor(cursorUrl+','+cursorStyle[overlayType]);
	}else{
		map.setDefaultCursor(cursorStyle[overlayType]);
	}
	cursorLabel.setContent(labelInfo[overlayType]);
	map.addEventListener("mousemove",cursorLabelMove);
	map.addEventListener("mouseout",cursorLabelHide);
	map.addEventListener("mouseover",cursorLableShow);
}

// 鼠标提示信息的跟随处理
function cursorLabelMove(e){
	cursorLabel.setPosition(e.point);
}

//退出标注的绘制。需要清除掉map上click的处理函数。并把鼠标设置为默认的样式
function exitDrawing(handlerToRemove){
	cursorLabel.hide();
	map.setDefaultCursor(cursorStyle["default"]);
	map.removeEventListener("click",handlerToRemove);
	map.removeEventListener("mouseout",cursorLabelHide);
	map.removeEventListener("mouseover",cursorLableShow);	
}
