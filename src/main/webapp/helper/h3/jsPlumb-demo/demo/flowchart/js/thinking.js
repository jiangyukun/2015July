/**
 * @author ZL
 */
	$(function() {
				$(".add").bind('click',function(){//增加模块
					var content = $('<div></div>'); //创建一个父DIV
			        content.addClass("draggable").addClass("window").addClass("jtk-node").addClass("mod").addClass("_jsPlumb_endpoint_anchor").addClass("jsplumb-draggable").addClass("_jsPlumb_connected");
			        
			        var mod_head = $('<div></div>'); 
			        mod_head.attr('class', 'mod_head'); 
			        mod_head.appendTo(content);
			        
			        var editor_head = $('<input></input>'); 
			        editor_head.attr('class', 'editor_head'); 
			        editor_head.appendTo(mod_head);
			        
			        var editor_head = $('<i></i>'); 
			        editor_head.attr('class', 'del'); 
			        editor_head.appendTo(mod_head);
			 
			        var mod_content = $('<textarea></textarea>');
			        mod_content.attr('class', 'mod_content');
			        mod_content.appendTo(content);
			 
			        content.appendTo('.content'); //将父DIV添加到BODY中
			        // startDrag(move[0], content[0]);
        
				});
				
				$(".add—info").bind('click',function(){
        
				});
				
			});
			
			
			//drag 原生js 拖拽 迟钝问题
			//获取相关CSS属性
			// var getCss = function(o,key){
				// return o.currentStyle? o.currentStyle[key] : document.defaultView.getComputedStyle(o,false)[key]; 	
			// };
// 			
			// //拖拽的实现
			// var startDrag = function(move, target, callback){
				// var params = {
				// left: 0,
				// top: 0,
				// currentX: 0,
				// currentY: 0,
				// flag: false
			// };
				// if(getCss(target, "left") !== "auto"){
					// params.left = getCss(target, "left");
				// }
				// if(getCss(target, "top") !== "auto"){
					// params.top = getCss(target, "top");
				// }
				// //o是移动对象
				// move.onmousedown = function(event){
					// params.flag = true;
					// if(!event){
						// event = window.event;
						// //防止IE文字选中
						// move.onselectstart = function(){
							// return false;
						// }  
					// }
					// var e = event;
					// params.currentX = e.clientX;
					// params.currentY = e.clientY;
				// };
				// move.onmouseup = function(){
					// params.flag = false;	
					// if(getCss(target, "left") !== "auto"){
						// params.left = getCss(target, "left");
					// }
					// if(getCss(target, "top") !== "auto"){
						// params.top = getCss(target, "top");
					// }
				// };
				// move.onmousemove = function(event){
					// var e = event ? event: window.event;
					// if(params.flag){
						// var nowX = e.clientX, nowY = e.clientY;
						// var disX = nowX - params.currentX, disY = nowY - params.currentY;
						// target.style.left = parseInt(params.left) + disX + "px";
						// target.style.top = parseInt(params.top) + disY + "px";
					// }
// 					
					// if (typeof callback == "function") {
						// callback(parseInt(params.left) + disX, parseInt(params.top) + disY);
					// }
				// }	
			// };		
// 



















