/**
 * @author ZL
 */
$(function () {
    $(".add").bind('click', function () {//增加模块
        var content = $('<div>'); //创建一个父DIV
        content.attr('class', 'info_mod_sq'); //给父DIV设置CLASS

        var mod_sq_head = $('<div>');
        mod_sq_head.attr('class', 'mod_sq_head');
        mod_sq_head.appendTo(content);

        var editor_head = $('<input>');
        editor_head.attr('class', 'editor_head');
        editor_head.appendTo(mod_sq_head);

        var mod_sq_content = $('<textarea></textarea>');
        mod_sq_content.attr('class', 'mod_sq_content');
        mod_sq_content.appendTo(content);

        var mod_sq_foot = $('<div>');
        mod_sq_foot.attr('class', 'mod_sq_foot');
        mod_sq_foot.appendTo(content);

        var move = $('<a>').text("移动");
        move.attr('class', 'move');
        move.appendTo(mod_sq_foot);

        var editor = $('<a>').text("编辑");
        editor.attr('class', 'editor');
        editor.appendTo(mod_sq_foot);

        var del = $('<a>').text("删除");
        del.attr('class', 'del');
        del.appendTo(mod_sq_foot);

        content.appendTo('.content'); //将父DIV添加到BODY中

        startDrag(move[0], content[0]);

    });

    $(document).on('click', '.del', function (e) {//jQuery动态添加后解决点击事件
        $(this).parents("div.info_mod_sq").detach();
    });

    $(".lin").click(function () {
        alert("链接");
    });

    $(document).on('click', '.delete', function (i) {//清除
        $("div.info_mod_sq").detach();
        $("div.arr_left").detach();
    });

    // $(".info_mod_sq").myDrag();//There're some wrong of drag

    // $(document).on('mousedown', '.info_mod_sq', function(e){
    // $(".info_mod_sq").myDrag();
    // });
    //drag
    // jQuery.fn.myDrag=function(){
    // _IsMove = 0;
    // _MouseLeft = 0;
    // _MouseTop = 0;
    // return $(this).bind("mousemove",function(e){
    // if(_IsMove==1){
    // $(this).offset({top:e.pageY-_MouseLeft,left:e.pageX-_MouseTop});
    // }
    // }).bind("mousedown",function(e){
    // _IsMove=1;
    // var offset =$(this).offset();
    // _MouseLeft = e.pageX - offset.left;
    // _MouseTop = e.pageY - offset.top;
    // }).bind("mouseup",function(){
    // _IsMove=0;
    // }).bind("mouseout",function(){
    // _IsMove=0;
    // });
    // };
});
			
			




















