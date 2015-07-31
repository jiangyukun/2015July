/**
 * @author ZL
 */
	$(function() {
				$(".add").bind('click',function(){//增加模块
					var content = $('<div></div>'); //创建一个父DIV
			        content.addClass("jtk-node").addClass("window").addClass("mod").addClass("_jsPlumb_endpoint_anchor").addClass("jsplumb-draggable").addClass("_jsPlumb_connected");
			        
			        var mod_head = $('<div></div>'); 
			        mod_head.attr('class', 'mod_head'); //给父DIV设置CLASS
			        mod_head.appendTo(content);
			        
			        var editor_head = $('<input></input>'); 
			        editor_head.attr('class', 'editor_head'); 
			        editor_head.appendTo(mod_head);
			 
			        var mod_content = $('<textarea></textarea>');
			        mod_content.attr('class', 'mod_content');
			        mod_content.appendTo(content);
			 
			        var mod_foot = $('<div></div>');
			        mod_foot.attr('class', 'mod_foot');
			        mod_foot.appendTo(content);
			        
			        var editor = $('<a></a>').text("编辑");
			        editor.attr('class', 'editor');
			        editor.appendTo(mod_foot);
			        
			        var del= $('<a></a>').text("删除");
			        del.attr('class', 'del');
			        del.appendTo(mod_foot);
			 
			        content.appendTo('.content'); //将父DIV添加到BODY中
			        startDrag(move[0], content[0]);
        
				});
				
				$(document).on('click', '.del', function(e) {//jQuery动态添加后解决点击事件
 					$(this).parents("div.mod").detach();
				});
				
				$(".lin").click(function(){
					alert("链接");
				});
				
				$(document).on('click', '.delete', function(i) {//清除
 					$("div.mod").detach();
 					$("div.arr_left").detach();
				});
				
			});
			
			




















