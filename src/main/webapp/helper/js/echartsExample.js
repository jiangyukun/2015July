var myChart;
var domCode = document.getElementById('sidebar-code');
var domGraphic = document.getElementById('graphic');
var domMain = document.getElementById('main');
var domMessage = document.getElementById('wrong-message');
var iconResize = document.getElementById('icon-resize');
var needRefresh = false;

var enVersion = location.hash.indexOf('-en') != -1;
var hash = location.hash.replace('-en', '');
hash = hash.replace('#', '') || (needMap() ? 'default' : 'shine');
hash += enVersion ? '-en' : '';

var curTheme;
function requireCallback(ec, defaultTheme) {
    console.log(1);
    curTheme = themeSelector ? defaultTheme : {};
    echarts = ec;
    refresh();
    window.onresize = myChart.resize;
}

var themeSelector = $('#theme-select');
if (themeSelector) {
    themeSelector.html(
        '<option selected="true" name="shine">shine</option>'
        + '<option name="macarons">macarons</option>'
    );
    $(themeSelector).on('change', function () {
        selectChange($(this).val());
    });
    function selectChange(value) {
        var theme = value;
        myChart.showLoading();
        $(themeSelector).val(theme);
        if (theme != 'default') {
            window.location.hash = value + (enVersion ? '-en' : '');
            require(['theme/' + theme], function (tarTheme) {
                curTheme = tarTheme;
                setTimeout(refreshTheme, 500);
            })
        }
        else {
            window.location.hash = enVersion ? '-en' : '';
            curTheme = {};
            setTimeout(refreshTheme, 500);
        }
    }

    function refreshTheme() {
        myChart.hideLoading();
        myChart.setTheme(curTheme);
    }

    if ($(themeSelector).val(hash.replace('-en', '')).val() != hash.replace('-en', '')) {
        $(themeSelector).val('macarons');
        hash = 'macarons' + enVersion ? '-en' : '';
        window.location.hash = hash;
    }
}

function autoResize() {
    if ($(iconResize).hasClass('glyphicon-resize-full')) {
        focusCode();
        iconResize.className = 'glyphicon glyphicon-resize-small';
    }
    else {
        focusGraphic();
        iconResize.className = 'glyphicon glyphicon-resize-full';
    }
}

function focusCode() {
    domCode.className = 'col-md-8 ani';
    domGraphic.className = 'col-md-4 ani';
}

function focusGraphic() {
    domCode.className = 'col-md-4 ani';
    domGraphic.className = 'col-md-8 ani';
    if (needRefresh) {
        myChart.showLoading();
        setTimeout(refresh, 1000);
    }
}

var editor = CodeMirror.fromTextArea(
    document.getElementById("code"),
    {lineNumbers: true}
);
editor.setOption("theme", 'shine');


editor.on('change', function () {
    needRefresh = true;
});

function refresh(isBtnRefresh) {
    if (isBtnRefresh) {
        needRefresh = true;
        focusGraphic();
        return;
    }
    needRefresh = false;
    if (myChart && myChart.dispose) {
        myChart.dispose();
    }
    myChart = echarts.init(domMain, curTheme);
    window.onresize = myChart.resize;
    (new Function(editor.doc.getValue()))();
    myChart.setOption(option, true)
    domMessage.innerHTML = '';
}

function needMap() {
    var href = location.href;
    return href.indexOf('map') != -1
        || href.indexOf('mix3') != -1
        || href.indexOf('mix5') != -1
        || href.indexOf('dataRange') != -1;

}

var echarts;

// for echarts online home page
require.config({
    paths: {
        echarts: './js'
    }
});
launchExample();

var isExampleLaunched;
function launchExample() {
    if (isExampleLaunched) {
        return;
    }

    // 按需加载
    isExampleLaunched = 1;
    require(
        [
            'echarts',
            'theme/' + hash.replace('-en', ''),
            'echarts/chart/line',
            'echarts/chart/bar',
            'echarts/chart/k'
        ],
        requireCallback
    );
}