jsPlumb.ready(function () {

    var instance = jsPlumb.getInstance({
        // default drag options
        DragOptions: {cursor: 'pointer', zIndex: 2000},
        // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
        // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
        ConnectionOverlays: [
            ["Arrow", {location: 1}],
            ["Label", {
                location: 0.1,
                id: "label",
                cssClass: "aLabel"
            }]
        ],
        Container: "canvas"
    });

    var basicType = {
        connector: "StateMachine",
        paintStyle: {strokeStyle: "red", lineWidth: 2},
        hoverPaintStyle: {strokeStyle: "blue"},
        overlays: [
            "Arrow"
        ]
    };
    instance.registerConnectionType("basic", basicType);

    // this is the paint style for the connecting lines..
    var connectorPaintStyle = {
            lineWidth: 2,
            strokeStyle: "#61B7CF",
            joinstyle: "round",
            outlineColor: "white",
            outlineWidth: 2
        },
    // .. and this is the hover style.
        connectorHoverStyle = {
            lineWidth: 2,
            strokeStyle: "#216477",
            outlineWidth: 2,
            outlineColor: "white"
        },
        endpointHoverStyle = {
            fillStyle: "#216477",
            strokeStyle: "#216477"
        },
    // the definition of source endpoints (the small blue ones)
        sourceEndpoint = {
            endpoint: "Dot",
            paintStyle: {
                strokeStyle: "#7AB02C",
                fillStyle: "transparent",
                radius: 3,
                lineWidth: 2
            },
            isSource: true,
            connector: ["Flowchart", {stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true}],
            connectorStyle: connectorPaintStyle,
            hoverPaintStyle: endpointHoverStyle,
            connectorHoverStyle: connectorHoverStyle,
            dragOptions: {},
            overlays: [
                ["Label", {
                    location: [0.5, 1.5],
                    // label: "Drag",
                    cssClass: "endpointSourceLabel"
                }]
            ]
        },
    // the definition of target endpoints (will appear when the user drags a connection)
        targetEndpoint = {
            endpoint: "Dot",
            paintStyle: {fillStyle: "#7AB02C", radius: 4},
            hoverPaintStyle: endpointHoverStyle,
            maxConnections: -1,
            dropOptions: {hoverClass: "hover", activeClass: "active"},
            isTarget: true,
            overlays: [
                ["Label", {location: [0.5, -0.5], cssClass: "endpointTargetLabel"}]
            ]
        },
        init = function (connection) {
            connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
        };

    var xid;
    var _addEndpoints = function (toId, sourceAnchors, targetAnchors) {
        for (var i = 0; i < sourceAnchors.length; i++) {
            var sourceUUID = toId + sourceAnchors[i];
            //xid = sourceUUID;
            instance.addEndpoint("flowchart" + toId, sourceEndpoint, {
                anchor: sourceAnchors[i], uuid: sourceUUID
            });
        }
        for (var j = 0; j < targetAnchors.length; j++) {
            var targetUUID = toId + targetAnchors[j];
            instance.addEndpoint("flowchart" + toId, targetEndpoint, {anchor: targetAnchors[j], uuid: targetUUID});
        }
    };

    // suspend drawing and initialise.
    instance.batch(function () {
        _addEndpoints("Window1", ["LeftMiddle", "BottomCenter"], ["TopCenter", "RightMiddle"]);
        _addEndpoints("Window2", ["LeftMiddle", "RightMiddle"], ["TopCenter", "BottomCenter"]);

        // listen for new connections; initialise them the same way we initialise the connections at startup.
        instance.bind("connection", function (connInfo, originalEvent) {
            init(connInfo.connection);
        });

        // make all the window divs draggable
        instance.draggable(jsPlumb.getSelector(".flowchart-demo .window"), {grid: [20, 20]});
        // THIS DEMO ONLY USES getSelector FOR CONVENIENCE. Use your library's appropriate selector
        // method, or document.querySelectorAll:
        //jsPlumb.draggable(document.querySelectorAll(".window"), { grid: [20, 20] });

        // connect a few up
        instance.connect({uuids: ["Window1BottomCenter", "Window2TopCenter"], editable: true});

        //

        //
        // listen for clicks on connections, and offer to delete connections on click.
        //
        instance.bind("click", function (conn, originalEvent) {
            // if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
            //   instance.detach(conn);
            conn.toggleType("basic");
        });

        instance.bind("connectionDrag", function (connection) {
            console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
        });

        instance.bind("connectionDragStop", function (connection) {
            console.log("connection " + connection.id + " was dragged");
        });

        instance.bind("connectionMoved", function (params) {
            console.log("connection " + params.connection.id + " was moved");
        });
    });

    jsPlumb.fire("jsPlumbDemoLoaded", instance);

    var index = 3;
    $(".add").bind('click', function () {//增加模块
        console.log(instance);
        var id = 'flowchartWindow' + index;
        var content = $('<div>').attr('id', id); //创建一个父DIV
        content.addClass("draggable").addClass("window").addClass("jtk-node").addClass("mod").addClass("_jsPlumb_endpoint_anchor")
            .addClass("jsplumb-draggable").addClass("_jsPlumb_connected");
        var mod_head = $('<div></div>');
        mod_head.attr('class', 'mod_head');
        mod_head.appendTo(content);
        var editor_head = $('<input>').val('项目标题' + index);
        editor_head.attr('class', 'editor_head');
        editor_head.appendTo(mod_head);
        editor_head = $('<i></i>');
        editor_head.attr('class', 'del');
        editor_head.appendTo(mod_head);
        var mod_content = $('<textarea></textarea>');
        mod_content.attr('class', 'mod_content');
        mod_content.appendTo(content);

        content.appendTo('.content'); //将父DIV添加到BODY中

        instance.draggable(jsPlumb.getSelector(".flowchart-demo #" + id), {grid: [20, 20]});
        _addEndpoints("Window" + index, ["BottomCenter"], ["TopCenter"]);

        if (index % 2 == 0) {
            instance.connect({
                uuids: ["Window" + (index - 1) + "BottomCenter", "Window" + index + "TopCenter"],
                editable: true
            });
        }

        index++;
    });

    $(document).on('click', '.del', function (e) {
        $(this).parents("div.mod").detach();
        console.log(instance);
        instance.deleteEndpoint(xid);
    });

});