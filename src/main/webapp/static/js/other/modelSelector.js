(function($) {

	var ZHDraw = {};
	//定义一个空对象

	ZHDraw.config = {
		editable : true,
		lineHeight : 15,
		basePath : '',
		rect : {// 状态
			attr : {
				x : 10,
				y : 10,
				width : 100,
				height : 50,
				r : 5,
				fill : '90-#fff-#C0C0C0',
				stroke : '#000',
				"stroke-width" : 1
			},
			showType : 'image&text', // image,text,image&text
			type : 'state',
			name : {
				text : 'state',
				'font-style' : 'italic'
			},
			text : {
				text : '状态',
				'font-size' : 13
			},
			margin : 5,
			props : [],
			img : {}
		},
		path : {// 路径转换
			attr : {
				path : {
					path : 'M10 10L100 100',
					stroke : '#808080',
					fill : "none",
					"stroke-width" : 2
				},
				arrow : {
					path : 'M10 10L10 10',
					stroke : '#808080',
					fill : "#808080",
					"stroke-width" : 2,
					radius : 4
				},
				fromDot : {
					width : 5,
					height : 5,
					stroke : '#fff',
					fill : '#000',
					cursor : "move",
					"stroke-width" : 2
				},
				toDot : {
					width : 5,
					height : 5,
					stroke : '#fff',
					fill : '#000',
					cursor : "move",
					"stroke-width" : 2
				},
				bigDot : {
					width : 5,
					height : 5,
					stroke : '#fff',
					fill : '#000',
					cursor : "move",
					"stroke-width" : 2
				},
				smallDot : {
					width : 5,
					height : 5,
					stroke : '#fff',
					fill : '#000',
					cursor : "move",
					"stroke-width" : 3
				},
				text : {
					cursor : "move",
					'background' : '#000'
				}
			},
			text : {
				//patten : 'TO {to}',
				textPos : {
					x : 0,
					y : -10
				}
			},
			props : {
				text : {
					name : 'text',
					label : '名称',
					value : '',
					editor : function() {
						return new ZHDraw.editors.textEditor();
					}
				},
				el : {
					name : 'el',
					label : '表达式',
					value : '',
					editor : function() {
						return new ZHDraw.editors.inputEditor();
					}
				}
			}
		},
		tools : {// 工具栏
			attr : {
				left : 10,
				top : 10
			},
			pointer : {},
			path : {},
			states : {},
			save : {
				onclick : function(data) {
					alert(data);
				}
			}
		},
		props : {// 属性编辑器
			attr : {
				top : 10,
				right : 30
			},
			props : {}
		},
		restore : '',
		activeRects : {// 当前激活状态
			rects : [],
			rectAttr : {
				stroke : '#ff0000',
				"stroke-width" : 2
			}
		},
		historyRects : {// 历史激活状态
			rects : [],
			pathAttr : {
				path : {
					stroke : '#00ff00'
				},
				arrow : {
					stroke : '#00ff00',
					fill : "#00ff00"
				}
			}
		}
	};

	ZHDraw.util = {
		isLine : function(p1, p2, p3) {// 三个点是否在一条直线上
			var s, p2y;
			if ((p1.x - p3.x) == 0)
				s = 1;
			else
				s = (p1.y - p3.y) / (p1.x - p3.x);
			p2y = (p2.x - p3.x) * s + p3.y;
			// $('body').append(p2.y+'-'+p2y+'='+(p2.y-p2y)+', ');
			if ((p2.y - p2y) < 10 && (p2.y - p2y) > -10) {
				p2.y = p2y;
				return true;
			}
			return false;
		},
		center : function(p1, p2) {// 两个点的中间点
			return {
				x : (p1.x - p2.x) / 2 + p2.x,
				y : (p1.y - p2.y) / 2 + p2.y
			};
		},
		nextId : (function() {
			var uid = 0;
			return function() {
				return ++uid;
			};
		})(),

		connPoint : function(rect, p) {// 计算矩形中心到p的连线与矩形的交叉点
			var start = p, end = {
				x : rect.x + rect.width / 2,
				y : rect.y + rect.height / 2
			};
			// 计算正切角度
			var tag = (end.y - start.y) / (end.x - start.x);
			tag = isNaN(tag) ? 0 : tag;

			var rectTag = rect.height / rect.width;
			// 计算箭头位置
			var xFlag = start.y < end.y ? -1 : 1, yFlag = start.x < end.x ? -1 : 1, arrowTop, arrowLeft;
			// 按角度判断箭头位置
			if (Math.abs(tag) > rectTag && xFlag == -1) {// top边
				arrowTop = end.y - rect.height / 2;
				arrowLeft = end.x + xFlag * rect.height / 2 / tag;
			} else if (Math.abs(tag) > rectTag && xFlag == 1) {// bottom边
				arrowTop = end.y + rect.height / 2;
				arrowLeft = end.x + xFlag * rect.height / 2 / tag;
			} else if (Math.abs(tag) < rectTag && yFlag == -1) {// left边
				arrowTop = end.y + yFlag * rect.width / 2 * tag;
				arrowLeft = end.x - rect.width / 2;
			} else if (Math.abs(tag) < rectTag && yFlag == 1) {// right边
				arrowTop = end.y + rect.width / 2 * tag;
				arrowLeft = end.x + rect.width / 2;
			}
			return {
				x : arrowLeft,
				y : arrowTop
			};
		},

		arrow : function(p1, p2, r) {// 画箭头，p1 开始位置,p2 结束位置, r前头的边长
			var atan = Math.atan2(p1.y - p2.y, p2.x - p1.x) * (180 / Math.PI);

			var centerX = p2.x - r * Math.cos(atan * (Math.PI / 180));
			var centerY = p2.y + r * Math.sin(atan * (Math.PI / 180));

			var x2 = centerX + r * Math.cos((atan + 120) * (Math.PI / 180));
			var y2 = centerY - r * Math.sin((atan + 120) * (Math.PI / 180));

			var x3 = centerX + r * Math.cos((atan + 240) * (Math.PI / 180));
			var y3 = centerY - r * Math.sin((atan + 240) * (Math.PI / 180));
			return [p2, {
				x : x2,
				y : y2
			}, {
				x : x3,
				y : y3
			}];
		}
	};

	ZHDraw.rect = function(o, r) {
		var _this = this, _uid = ZHDraw.util.nextId(), _o = $.extend(true, {}, ZHDraw.config.rect, o), _id = 'rect' + _uid, _r = r, // Raphael画笔
			_rect, _img, // 图标
			_name, // 状态名称
			_text, // 显示文本
			_ox, _oy;
		// 拖动时，保存起点位置;
		//_o.text.text += _uid;

		_rect = _r.rect(_o.attr.x, _o.attr.y, _o.attr.width, _o.attr.height, _o.attr.r).hide().attr(_o.attr);

		_img = _r.image(ZHDraw.config.basePath + _o.img.icon, _o.attr.x + _o.img.width / 2, _o.attr.y + (_o.attr.height - _o.img.height) / 2, _o.img.width, _o.img.height).hide();
		_name = _r.text(_o.attr.x + _o.img.width + (_o.attr.width - _o.img.width) / 2, _o.attr.y + ZHDraw.config.lineHeight / 2, _o.name.text).hide().attr(_o.name);
		_text = _r.text(_o.attr.x + _o.img.width + (_o.attr.width - _o.img.width) / 2, _o.attr.y + (_o.attr.height - ZHDraw.config.lineHeight) / 2 + ZHDraw.config.lineHeight, _o.text.text).hide().attr(_o.text);
		// 文本

		// 拖动处理----------------------------------------
		_rect.drag(function(dx, dy) {
			dragMove(dx, dy);
		}, function() {
			dragStart();
		}, function() {
			dragUp();
		});
		_img.drag(function(dx, dy) {
			dragMove(dx, dy);
		}, function() {
			dragStart();
		}, function() {
			dragUp();
		});
		_name.drag(function(dx, dy) {
			dragMove(dx, dy);
		}, function() {
			dragStart();
		}, function() {
			dragUp();
		});
		_text.drag(function(dx, dy) {
			dragMove(dx, dy);
		}, function() {
			dragStart();
		}, function() {
			dragUp();
		});

		var dragMove = function(dx, dy) {// 拖动中
			if (!ZHDraw.config.editable)
				return;

			var x = (_ox + dx);
			// -((_ox+dx)%10);
			var y = (_oy + dy);
			// -((_oy+dy)%10);

			_bbox.x = x - _o.margin;
			_bbox.y = y - _o.margin;
			resize();
		};

		var dragStart = function() {// 开始拖动
			_ox = _rect.attr("x");
			_oy = _rect.attr("y");
			_rect.attr({
				opacity : 0.5
			});
			_img.attr({
				opacity : 0.5
			});
			_text.attr({
				opacity : 0.5
			});
		};

		var dragUp = function() {// 拖动结束
			_rect.attr({
				opacity : 1
			});
			_img.attr({
				opacity : 1
			});
			_text.attr({
				opacity : 1
			});
		};

		// 改变大小的边框
		var _bpath, _bdots = {}, _bw = 5, _bbox = {
			x : _o.attr.x - _o.margin,
			y : _o.attr.y - _o.margin,
			width : _o.attr.width + _o.margin * 2,
			height : _o.attr.height + _o.margin * 2
		};

		_bpath = _r.path('M0 0L1 1').hide();
		_bdots['t'] = _r.rect(0, 0, _bw, _bw).attr({
			fill : '#000',
			stroke : '#fff',
			cursor : 's-resize'
		}).hide().drag(function(dx, dy) {
			bdragMove(dx, dy, 't');
		}, function() {
			bdragStart(this.attr('x') + _bw / 2, this.attr('y') + _bw / 2, 't');
		}, function() {
		});
		// 上
		_bdots['lt'] = _r.rect(0, 0, _bw, _bw).attr({
			fill : '#000',
			stroke : '#fff',
			cursor : 'nw-resize'
		}).hide().drag(function(dx, dy) {
			bdragMove(dx, dy, 'lt');
		}, function() {
			bdragStart(this.attr('x') + _bw / 2, this.attr('y') + _bw / 2, 'lt');
		}, function() {
		});
		// 左上
		_bdots['l'] = _r.rect(0, 0, _bw, _bw).attr({
			fill : '#000',
			stroke : '#fff',
			cursor : 'w-resize'
		}).hide().drag(function(dx, dy) {
			bdragMove(dx, dy, 'l');
		}, function() {
			bdragStart(this.attr('x') + _bw / 2, this.attr('y') + _bw / 2, 'l');
		}, function() {
		});
		// 左
		_bdots['lb'] = _r.rect(0, 0, _bw, _bw).attr({
			fill : '#000',
			stroke : '#fff',
			cursor : 'sw-resize'
		}).hide().drag(function(dx, dy) {
			bdragMove(dx, dy, 'lb');
		}, function() {
			bdragStart(this.attr('x') + _bw / 2, this.attr('y') + _bw / 2, 'lb');
		}, function() {
		});
		// 左下
		_bdots['b'] = _r.rect(0, 0, _bw, _bw).attr({
			fill : '#000',
			stroke : '#fff',
			cursor : 's-resize'
		}).hide().drag(function(dx, dy) {
			bdragMove(dx, dy, 'b');
		}, function() {
			bdragStart(this.attr('x') + _bw / 2, this.attr('y') + _bw / 2, 'b');
		}, function() {
		});
		// 下
		_bdots['rb'] = _r.rect(0, 0, _bw, _bw).attr({
			fill : '#000',
			stroke : '#fff',
			cursor : 'se-resize'
		}).hide().drag(function(dx, dy) {
			bdragMove(dx, dy, 'rb');
		}, function() {
			bdragStart(this.attr('x') + _bw / 2, this.attr('y') + _bw / 2, 'rb');
		}, function() {
		});
		// 右下
		_bdots['r'] = _r.rect(0, 0, _bw, _bw).attr({
			fill : '#000',
			stroke : '#fff',
			cursor : 'w-resize'
		}).hide().drag(function(dx, dy) {
			bdragMove(dx, dy, 'r');
		}, function() {
			bdragStart(this.attr('x') + _bw / 2, this.attr('y') + _bw / 2, 'r');
		}, function() {
		});
		// 右
		_bdots['rt'] = _r.rect(0, 0, _bw, _bw).attr({
			fill : '#000',
			stroke : '#fff',
			cursor : 'ne-resize'
		}).hide().drag(function(dx, dy) {
			bdragMove(dx, dy, 'rt');
		}, function() {
			bdragStart(this.attr('x') + _bw / 2, this.attr('y') + _bw / 2, 'rt');
		}, function() {
		});
		// 右上
		$([_bdots['t'].node, _bdots['lt'].node, _bdots['l'].node, _bdots['lb'].node, _bdots['b'].node, _bdots['rb'].node, _bdots['r'].node, _bdots['rt'].node]).click(function() {
			return false;
		});

		var bdragMove = function(dx, dy, t) {
			if (!ZHDraw.config.editable)
				return;
			var x = _bx + dx, y = _by + dy;
			switch (t) {
				case 't' :
					_bbox.height += _bbox.y - y;
					_bbox.y = y;
					break;
				case 'lt' :
					_bbox.width += _bbox.x - x;
					_bbox.height += _bbox.y - y;
					_bbox.x = x;
					_bbox.y = y;
					break;
				case 'l' :
					_bbox.width += _bbox.x - x;
					_bbox.x = x;
					break;
				case 'lb' :
					_bbox.height = y - _bbox.y;
					_bbox.width += _bbox.x - x;
					_bbox.x = x;
					break;
				case 'b' :
					_bbox.height = y - _bbox.y;
					break;
				case 'rb' :
					_bbox.height = y - _bbox.y;
					_bbox.width = x - _bbox.x;
					break;
				case 'r' :
					_bbox.width = x - _bbox.x;
					break;
				case 'rt' :
					_bbox.width = x - _bbox.x;
					_bbox.height += _bbox.y - y;
					_bbox.y = y;
					break;
			}
			resize();
		};
		var bdragStart = function(ox, oy, t) {
			_bx = ox;
			_by = oy;
		};

		// 事件处理--------------------------------

		$([_rect.node, _text.node, _name.node, _img.node]).bind('click', function() {
			//if (!ZHDraw.config.editable)
			//      return;

			showBox();
			var mod = $(_r).data('mod');
			switch (mod) {
				case 'pointer' :
					break;
				case 'path' :
					var pre = $(_r).data('currNode');
					if (pre && pre.getId() != _id && pre.getId().substring(0, 4) == 'rect') {
						$(_r).trigger('addpath', [pre, _this]);
					}
					break;
			}
			$(_r).trigger('click', _this);
			$(_r).data('currNode', _this);
			return false;
		});

		var clickHandler = function(e, icon) {
			//if (!ZHDraw.config.editable)
			//      return;
			if (icon.getId() == _id) {
				$(_r).trigger('showprops', [_o.props, icon]);
			} else {
				hideBox();
			}
		};
		$(_r).bind('click', clickHandler);

		var textchangeHandler = function(e, text, icon) {
			if (icon.getId() == _id) {
				_text.attr({
					text : text
				});
			}
		};
		$(_r).bind('textchange', textchangeHandler);

		// 私有函数-----------------------
		// 边框路径
		function getBoxPathString() {
			return 'M' + _bbox.x + ' ' + _bbox.y + 'L' + _bbox.x + ' ' + (_bbox.y + _bbox.height) + 'L' + (_bbox.x + _bbox.width) + ' ' + (_bbox.y + _bbox.height) + 'L' + (_bbox.x + _bbox.width) + ' ' + _bbox.y + 'L' + _bbox.x + ' ' + _bbox.y;
		}

		// 显示边框
		function showBox() {
			_bpath.show();
			for (var k in _bdots) {
				_bdots[k].show();
			}
		}

		// 隐藏
		function hideBox() {
			_bpath.hide();
			for (var k in _bdots) {
				_bdots[k].hide();
			}
		}

		// 根据_bbox，更新位置信息
		function resize() {
			var rx = _bbox.x + _o.margin, ry = _bbox.y + _o.margin, rw = _bbox.width - _o.margin * 2, rh = _bbox.height - _o.margin * 2;

			_rect.attr({
				x : rx,
				y : ry,
				width : rw,
				height : rh
			});
			switch (_o.showType) {
				case 'image' :
					_img.attr({
						x : rx + (rw - _o.img.width) / 2,
						y : ry + (rh - _o.img.height) / 2
					}).show();
					break;
				case 'text' :
					_rect.show();
					_text.attr({
						x : rx + rw / 2,
						y : ry + rh / 2
					}).show();
					// 文本
					break;
				case 'image&text' :
					_rect.show();
					_name.attr({
						x : rx + _o.img.width + (rw - _o.img.width) / 2,
						y : ry + ZHDraw.config.lineHeight / 2
					}).show();
					_text.attr({
						x : rx + _o.img.width + (rw - _o.img.width) / 2,
						y : ry + (rh - ZHDraw.config.lineHeight) / 2 + ZHDraw.config.lineHeight
					}).show();
					// 文本
					_img.attr({
						x : rx + _o.img.width / 2,
						y : ry + (rh - _o.img.height) / 2
					}).show();
					break;
			}

			_bdots['t'].attr({
				x : _bbox.x + _bbox.width / 2 - _bw / 2,
				y : _bbox.y - _bw / 2
			});
			// 上
			_bdots['lt'].attr({
				x : _bbox.x - _bw / 2,
				y : _bbox.y - _bw / 2
			});
			// 左上
			_bdots['l'].attr({
				x : _bbox.x - _bw / 2,
				y : _bbox.y - _bw / 2 + _bbox.height / 2
			});
			// 左
			_bdots['lb'].attr({
				x : _bbox.x - _bw / 2,
				y : _bbox.y - _bw / 2 + _bbox.height
			});
			// 左下
			_bdots['b'].attr({
				x : _bbox.x - _bw / 2 + _bbox.width / 2,
				y : _bbox.y - _bw / 2 + _bbox.height
			});
			// 下
			_bdots['rb'].attr({
				x : _bbox.x - _bw / 2 + _bbox.width,
				y : _bbox.y - _bw / 2 + _bbox.height
			});
			// 右下
			_bdots['r'].attr({
				x : _bbox.x - _bw / 2 + _bbox.width,
				y : _bbox.y - _bw / 2 + _bbox.height / 2
			});
			// 右
			_bdots['rt'].attr({
				x : _bbox.x - _bw / 2 + _bbox.width,
				y : _bbox.y - _bw / 2
			});
			// 右上
			_bpath.attr({
				path : getBoxPathString()
			});

			$(_r).trigger('rectresize', _this);
		};

		// 函数----------------
		// 转化json字串
		this.toJson = function() {
			var data = "{type:'" + _o.type + "',text:{text:'" + _text.attr('text') + "'}, attr:{ x:" + Math.round(_rect.attr('x')) + ", y:" + Math.round(_rect.attr('y')) + ", width:" + Math.round(_rect.attr('width')) + ", height:" + Math.round(_rect.attr('height')) + "}, props:{";
			for (var k in _o.props) {
				if ( typeof (_o.props[k]) != "function" && k != "Class" && k != "_proto_" && k != "localeStringFormatter") {
					data += k + ":{value:'" + _o.props[k].value + "'},";
				}
			}
			if (data.substring(data.length - 1, data.length) == ',')
				data = data.substring(0, data.length - 1);
			data += "}}";
			return data;
		};
		// 从数据中恢复图
		this.restore = function(data) {
			var obj = data;
			// if (typeof data === 'string')
			// obj = eval(data);

			_o = $.extend(true, _o, data);

			_text.attr({
				text : obj.text.text
			});
			resize();
		};

		this.getBBox = function() {
			return _bbox;
		};
		this.getId = function() {
			return _id;
		};
		this.remove = function() {
			_rect.remove();
			_text.remove();
			_name.remove();
			_img.remove();
			_bpath.remove();
			for (var k in _bdots) {
				_bdots[k].remove();
			}
		};
		this.text = function() {
			return _text.attr('text');
		};
		this.attr = function(attr) {
			if (attr)
				_rect.attr(attr);
		};

		resize();
		// 初始化位置
	};

	ZHDraw.path = function(o, r, from, to) {
		var _this = this, _r = r, _o = $.extend(true, {}, ZHDraw.config.path), _path, _arrow, _text, _textPos = _o.text.textPos, _ox, _oy, _from = from, _to = to, _id = 'path' + ZHDraw.util.nextId(), _dotList, _autoText = false;

		// 点
		function dot(type, pos, left, right) {
			var _this = this, _t = type, _n, _lt = left, _rt = right, _ox, _oy, // 缓存移动前时位置
				_pos = pos;
			// 缓存位置信息{x,y}, 注意：这是计算出中心点

			switch (_t) {
				case 'from' :
					_n = _r.rect(pos.x - _o.attr.fromDot.width / 2, pos.y - _o.attr.fromDot.height / 2, _o.attr.fromDot.width, _o.attr.fromDot.height).attr(_o.attr.fromDot);
					break;
				case 'big' :
					_n = _r.rect(pos.x - _o.attr.bigDot.width / 2, pos.y - _o.attr.bigDot.height / 2, _o.attr.bigDot.width, _o.attr.bigDot.height).attr(_o.attr.bigDot);
					break;
				case 'small' :
					_n = _r.rect(pos.x - _o.attr.smallDot.width / 2, pos.y - _o.attr.smallDot.height / 2, _o.attr.smallDot.width, _o.attr.smallDot.height).attr(_o.attr.smallDot);
					break;
				case 'to' :
					_n = _r.rect(pos.x - _o.attr.toDot.width / 2, pos.y - _o.attr.toDot.height / 2, _o.attr.toDot.width, _o.attr.toDot.height).attr(_o.attr.toDot);

					break;
			}
			if (_n && (_t == 'big' || _t == 'small')) {
				_n.drag(function(dx, dy) {
					dragMove(dx, dy);
				}, function() {
					dragStart();
				}, function() {
					dragUp();
				});
				// 初始化拖动
				var dragMove = function(dx, dy) {// 拖动中
					var x = (_ox + dx), y = (_oy + dy);
					_this.moveTo(x, y);
				};

				var dragStart = function() {// 开始拖动
					if (_t == 'big') {
						_ox = _n.attr("x") + _o.attr.bigDot.width / 2;
						_oy = _n.attr("y") + _o.attr.bigDot.height / 2;
					}
					if (_t == 'small') {
						_ox = _n.attr("x") + _o.attr.smallDot.width / 2;
						_oy = _n.attr("y") + _o.attr.smallDot.height / 2;
					}
				};

				var dragUp = function() {// 拖动结束

				};
			}
			$(_n.node).click(function() {
				return false;
			});

			this.type = function(t) {
				if (t)
					_t = t;
				else
					return _t;
			};
			this.node = function(n) {
				if (n)
					_n = n;
				else
					return _n;
			};
			this.left = function(l) {
				if (l)
					_lt = l;
				else
					return _lt;
			};
			this.right = function(r) {
				if (r)
					_rt = r;
				else
					return _rt;
			};
			this.remove = function() {
				_lt = null;
				_rt = null;
				_n.remove();
			};
			this.pos = function(pos) {
				if (pos) {
					_pos = pos;
					_n.attr({
						x : _pos.x - _n.attr('width') / 2,
						y : _pos.y - _n.attr('height') / 2
					});
					return this;
				} else {
					return _pos;
				}
			};

			this.moveTo = function(x, y) {
				this.pos({
					x : x,
					y : y
				});

				switch (_t) {
					case 'from' :
						if (_rt && _rt.right() && _rt.right().type() == 'to') {
							_rt.right().pos(ZHDraw.util.connPoint(_to.getBBox(), _pos));
						}
						if (_rt && _rt.right()) {
							_rt.pos(ZHDraw.util.center(_pos, _rt.right().pos()));
						}
						break;
					case 'big' :

						if (_rt && _rt.right() && _rt.right().type() == 'to') {
							_rt.right().pos(ZHDraw.util.connPoint(_to.getBBox(), _pos));
						}
						if (_lt && _lt.left() && _lt.left().type() == 'from') {
							_lt.left().pos(ZHDraw.util.connPoint(_from.getBBox(), _pos));
						}
						if (_rt && _rt.right()) {
							_rt.pos(ZHDraw.util.center(_pos, _rt.right().pos()));
						}
						if (_lt && _lt.left()) {
							_lt.pos(ZHDraw.util.center(_pos, _lt.left().pos()));
						}
						// 三个大点在一条线上，移除中间的小点
						var pos = {
							x : _pos.x,
							y : _pos.y
						};
						if (ZHDraw.util.isLine(_lt.left().pos(), pos, _rt.right().pos())) {
							_t = 'small';
							_n.attr(_o.attr.smallDot);
							this.pos(pos);
							var lt = _lt;
							_lt.left().right(_lt.right());
							_lt = _lt.left();
							lt.remove();
							var rt = _rt;
							_rt.right().left(_rt.left());
							_rt = _rt.right();
							rt.remove();
						}
						break;
					case 'small' :
						// 移动小点时，转变为大点，增加俩个小点
						if (_lt && _rt && !ZHDraw.util.isLine(_lt.pos(), {
								x : _pos.x,
								y : _pos.y
							}, _rt.pos())) {

							_t = 'big';

							_n.attr(_o.attr.bigDot);
							var lt = new dot('small', ZHDraw.util.center(_lt.pos(), _pos), _lt, _lt.right());
							_lt.right(lt);
							_lt = lt;

							var rt = new dot('small', ZHDraw.util.center(_rt.pos(), _pos), _rt.left(), _rt);
							_rt.left(rt);
							_rt = rt;

						}
						break;
					case 'to' :
						if (_lt && _lt.left() && _lt.left().type() == 'from') {
							_lt.left().pos(ZHDraw.util.connPoint(_from.getBBox(), _pos));
						}
						if (_lt && _lt.left()) {
							_lt.pos(ZHDraw.util.center(_pos, _lt.left().pos()));
						}
						break;
				}

				refreshpath();
			};
		}

		function dotList() {
			var _fromDot, _toDot, _fromBB = _from.getBBox(), _toBB = _to.getBBox(), _fromPos, _toPos;

			_fromPos = ZHDraw.util.connPoint(_fromBB, {
				x : _toBB.x + _toBB.width / 2,
				y : _toBB.y + _toBB.height / 2
			});
			_toPos = ZHDraw.util.connPoint(_toBB, _fromPos);

			_fromDot = new dot('from', _fromPos, null, new dot('small', {
				x : (_fromPos.x + _toPos.x) / 2,
				y : (_fromPos.y + _toPos.y) / 2
			}));
			_fromDot.right().left(_fromDot);
			_toDot = new dot('to', _toPos, _fromDot.right(), null);
			_fromDot.right().right(_toDot);

			// 转换为path格式的字串
			this.toPathString = function() {
				if (!_fromDot)
					return '';

				var d = _fromDot, p = 'M' + d.pos().x + ' ' + d.pos().y, arr = '';
				// 线的路径
				while (d.right()) {
					d = d.right();
					p += 'L' + d.pos().x + ' ' + d.pos().y;
				}
				// 箭头路径
				var arrPos = ZHDraw.util.arrow(d.left().pos(), d.pos(), _o.attr.arrow.radius);
				arr = 'M' + arrPos[0].x + ' ' + arrPos[0].y + 'L' + arrPos[1].x + ' ' + arrPos[1].y + 'L' + arrPos[2].x + ' ' + arrPos[2].y + 'z';
				return [p, arr];
			};
			this.toJson = function() {
				var data = "[", d = _fromDot;

				while (d) {
					if (d.type() == 'big')
						data += "{x:" + Math.round(d.pos().x) + ",y:" + Math.round(d.pos().y) + "},";
					d = d.right();
				}
				if (data.substring(data.length - 1, data.length) == ',')
					data = data.substring(0, data.length - 1);
				data += "]";
				return data;
			};
			this.restore = function(data) {
				var obj = data, d = _fromDot.right();

				for (var i = 0; i < obj.length; i++) {
					d.moveTo(obj[i].x, obj[i].y);
					d.moveTo(obj[i].x, obj[i].y);
					d = d.right();
				}

				this.hide();
			};

			this.fromDot = function() {
				return _fromDot;
			};
			this.toDot = function() {
				return _toDot;
			};
			this.midDot = function() {// 返回中间点
				var mid = _fromDot.right(), end = _fromDot.right().right();
				while (end.right() && end.right().right()) {
					end = end.right().right();
					mid = mid.right();
				}
				return mid;
			};
			this.show = function() {
				var d = _fromDot;
				while (d) {
					d.node().show();
					d = d.right();
				}
			};
			this.hide = function() {
				var d = _fromDot;
				while (d) {
					d.node().hide();
					d = d.right();
				}
			};
			this.remove = function() {
				var d = _fromDot;
				while (d) {
					if (d.right()) {
						d = d.right();
						d.left().remove();
					} else {
						d.remove();
						d = null;
					}
				}
			};
		}

		// 初始化操作
		_o = $.extend(true, _o, o);
		_path = _r.path(_o.attr.path.path).attr(_o.attr.path);
		_arrow = _r.path(_o.attr.arrow.path).attr(_o.attr.arrow);

		_dotList = new dotList();
		_dotList.hide();

		_text = _r.text(0, 0, "").attr(_o.attr.text);
		_text.drag(function(dx, dy) {
			if (!ZHDraw.config.editable)
				return;
			_text.attr({
				x : _ox + dx,
				y : _oy + dy
			});
		}, function() {
			_ox = _text.attr('x');
			_oy = _text.attr('y');
		}, function() {
			var mid = _dotList.midDot().pos();
			_textPos = {
				x : _text.attr('x') - mid.x,
				y : _text.attr('y') - mid.y
			};
		});

		refreshpath();
		// 初始化路径

		// 事件处理--------------------
		$([_path.node, _arrow.node, _text.node]).bind('click', function() {
			//if (!ZHDraw.config.editable)
			//      return;
			$(_r).trigger('click', _this);
			$(_r).data('currNode', _this);
			return false;
		});
		// 处理点击事件，线或矩形
		var clickHandler = function(e, icon) {
			if (!ZHDraw.config.editable)
				return;
			if (icon && icon.getId() == _id) {
				_dotList.show();
				$(_r).trigger('showprops', [_o.props, _this]);
			} else {
				_dotList.hide();
			}

			var mod = $(_r).data('mod');
			switch (mod) {
				case 'pointer' :

					break;
				case 'path' :

					break;
			}

		};
		$(_r).bind('click', clickHandler);
		// 删除事件处理
		var removerectHandler = function(e, icon) {
			if (!ZHDraw.config.editable)
				return;
			if (icon && (icon.getId() == _from.getId() || icon.getId() == _to.getId())) {
				$(_r).trigger('removepath', _this);
			}
		};
		$(_r).bind('removerect', removerectHandler);

		// 矩形移动时间处理
		var rectresizeHandler = function(e, icon) {
			if (!ZHDraw.config.editable)
				return;
			if (_from && _from.getId() == icon.getId()) {
				var rp;
				if (_dotList.fromDot().right().right().type() == 'to') {
					rp = {
						x : _to.getBBox().x + _to.getBBox().width / 2,
						y : _to.getBBox().y + _to.getBBox().height / 2
					};
				} else {
					rp = _dotList.fromDot().right().right().pos();
				}
				var p = ZHDraw.util.connPoint(_from.getBBox(), rp);
				_dotList.fromDot().moveTo(p.x, p.y);
				refreshpath();
			}
			if (_to && _to.getId() == icon.getId()) {
				var rp;
				if (_dotList.toDot().left().left().type() == 'from') {
					rp = {
						x : _from.getBBox().x + _from.getBBox().width / 2,
						y : _from.getBBox().y + _from.getBBox().height / 2
					};
				} else {
					rp = _dotList.toDot().left().left().pos();
				}
				var p = ZHDraw.util.connPoint(_to.getBBox(), rp);
				_dotList.toDot().moveTo(p.x, p.y);
				refreshpath();
			}
		};
		$(_r).bind('rectresize', rectresizeHandler);

		var textchangeHandler = function(e, v, icon) {
			if (icon.getId() == _id) {// 改变自身文本
				_text.attr({
					text : v
				});
				_autoText = false;
			}
			if (_autoText) {
				if (_to.getId() == icon.getId()) {
					_text.attr({
						text : _o.text.patten.replace('{from}', _from.text()).replace('{to}', v)
					});
				} else if (_from.getId() == icon.getId()) {
					_text.attr({
						text : _o.text.patten.replace('{from}', v).replace('{to}', _to.text())
					});
				}
			}
		};
		$(_r).bind('textchange', textchangeHandler);

		// 函数-------------------------------------------------
		this.from = function() {
			return _from;
		};
		this.to = function() {
			return _to;
		};
		// 转化json数据
		this.toJson = function() {
			var data = "{from:'" + _from.getId() + "',to:'" + _to.getId() + "', dots:" + _dotList.toJson() + ",text:{text:'" + _text.attr('text') + "',textPos:{x:" + Math.round(_textPos.x) + ",y:" + Math.round(_textPos.y) + "}}, props:{";
			for (var k in _o.props) {
				if ( typeof (_o.props[k]) != "function" && k != "Class" && k != "_proto_" && k != "localeStringFormatter") {
					data += k + ":{value:'" + _o.props[k].value + "'},";
				}
			}
			if (data.substring(data.length - 1, data.length) == ',')
				data = data.substring(0, data.length - 1);
			data += '}}';
			return data;
		};
		// 恢复
		this.restore = function(data) {
			var obj = data;

			_o = $.extend(true, _o, data);
			if (_text.attr('text') != _o.text.text) {
				_text.attr({
					text : _o.text.text
				});
				_autoText = false;
			}

			_dotList.restore(obj.dots);
		};
		// 删除
		this.remove = function() {
			_dotList.remove();
			_path.remove();
			_arrow.remove();
			_text.remove();
			try {
				$(_r).unbind('click', clickHandler);
			} catch (e) {
			}
			try {
				$(_r).unbind('removerect', removerectHandler);
			} catch (e) {
			}
			try {
				$(_r).unbind('rectresize', rectresizeHandler);
			} catch (e) {
			}
			try {
				$(_r).unbind('textchange', textchangeHandler);
			} catch (e) {
			}
		};
		// 刷新路径
		function refreshpath() {
			var p = _dotList.toPathString(), mid = _dotList.midDot().pos();
			_path.attr({
				path : p[0]
			});
			_arrow.attr({
				path : p[1]
			});
			_text.attr({
				x : mid.x + _textPos.x,
				y : mid.y + _textPos.y
			});
			// $('body').append('refresh.');
		}


		this.getId = function() {
			return _id;
		};
		this.text = function() {
			return _text.attr('text');
		};
		this.attr = function(attr) {
			if (attr && attr.path)
				_path.attr(attr.path);
			if (attr && attr.arrow)
				_arrow.attr(attr.arrow);
		};

	};

	ZHDraw.props = function(o, r) {
		var _this = this, _pdiv = $('#ZHDraw_props').hide().draggable({
			handle : '#ZHDraw_props_handle'
		}).resizable().css(ZHDraw.config.props.attr).bind('click', function() {
			$(_r).data('currNode', null);
			return false;
		}), _tb = _pdiv.find('table'), _r = r, _icon;
		var showpropsHandler = function(e, props, icon) {
			if (_icon && _icon.getId() == icon.getId()) {// 连续点击不刷新
				return;
			}
			_icon = icon;
			$(_tb).find('#pmodel').each(function() {
				var e = $(this).data('editor');
				if (e)
					e.destroy();
			});
			_tb.empty();

			for (var k in props) {
				if (props[k].label) {
					if ( typeof (props[k]) != "function" && k != "Class" && k != "_proto_" && k != "localeStringFormatter") {
						_tb.append('<tr><th>' + props[k].label + '</th><td><div id="p' + k + '"></div></td></tr>');
						if (props[k].editor) {
							props[k].editor().init(props, k, 'p' + k, icon, _r);
						}
					}
				}
			}

			//解决 jquery select组件 在IE 6/7/8下宽度BUG
			$("select").each(function() {
				el = $(this);
				el.data("origWidth", el.css("width"));
			}).focusin(function() {
				el = $(this);
				//el.css("width", "auto");
				el.css("width", el.data("origWidth"));
				//el.data("origWidth", el.css("width"));
			}).bind("blur change ", function() {
				el = $(this);
				el.css("width", el.data("origWidth"));
			});

			_pdiv.show();
		};
		$(_r).bind('showprops', showpropsHandler);
	};

	// 属性编辑器
	ZHDraw.editors = {
		textEditor : function() {
			var _props, _k, _div, _icon, _r;
			this.init = function(props, k, div, icon, r) {
				_props = props;
				_k = k;
				_div = div;
				_icon = icon;
				_r = r;

				$('<input  style="width:100%;"/>').val(_icon.text()).change(function() {
					props[_k].value = $(this).val();
					$(_r).trigger("textchange", [$(this).val(), _icon]);
				}).appendTo('#' + _div);

				$('#' + _div).data('editor', this);
			};
			this.destroy = function() {
				$('#' + _div + ' input').each(function() {
					_props[_k].value = $(this).val();
					$(_r).trigger("textchange", [$(this).val(), _icon]);
				});
			};
		}
	};

	// 初始化流程
	ZHDraw.init = function(c, o) {
		var _w = $(window).width(), _h = isc.Page.height, _r = Raphael(c, _w - 100, _h * 2), _states = {}, _paths = {};

		$.extend(true, ZHDraw.config, o);
		/**
		 * 删除： 删除状态时，触发removerect事件，连接在这个状态上当路径监听到这个事件，触发removepath删除自身；
		 * 删除路径时，触发removepath事件
		 */
		$(document).keydown(function(arg) {
			if (!ZHDraw.config.editable)
				return;
			if (arg.keyCode == 8) {
				var c = $(_r).data('currNode');
				if (c) {
					if (c.getId().substring(0, 4) == 'rect') {
						$(_r).trigger('removerect', c);
					} else if (c.getId().substring(0, 4) == 'path') {
						$(_r).trigger('removepath', c);
					}

					$(_r).removeData('currNode');
				}
				return false;
			}
		});

		$(document).click(function() {
			$(_r).data('currNode', null);
			$(_r).trigger('click', [{
				getId : function() {
					return '00000000';
				}
			}]);
			$(_r).trigger('showprops', [ZHDraw.config.props.props, {
				getId : function() {
					return '00000000';
				}
			}]);
		});

		// 删除事件
		var removeHandler = function(e, icon) {
			if (!ZHDraw.config.editable)
				return;
			if (icon.getId().substring(0, 4) == 'rect') {
				_states[icon.getId()] = null;
				icon.remove();
			} else if (icon.getId().substring(0, 4) == 'path') {
				_paths[icon.getId()] = null;
				icon.remove();
			}
		};
		$(_r).bind('removepath', removeHandler);
		$(_r).bind('removerect', removeHandler);

		// 添加状态
		$(_r).bind('addrect', function(e, type, o) {
			var rect = new ZHDraw.rect($.extend(true, {}, ZHDraw.config.tools.states[type], o), _r);
			_states[rect.getId()] = rect;
		});
		// 添加路径
		var addpathHandler = function(e, from, to) {
			var path = new ZHDraw.path({}, _r, from, to);
			_paths[path.getId()] = path;
		};
		$(_r).bind('addpath', addpathHandler);
		// 模式
		$(_r).data('mod', 'point');

		//if (ZHDraw.config.editable) {
		// 属性框
		new ZHDraw.props({}, _r);
		//}
		// 恢复
		if (o.restore) {
			var data = o.restore;
			ZHDraw.config.props.props.name.value = data.props.props.name.value;
			ZHDraw.config.props.props.id = {
				"value" : data.props.props.id.value
			};
			ZHDraw.config.props.props.key.value = data.props.props.key.value;
			ZHDraw.config.props.props.desc.value = data.props.props.desc.value;
			var rmap = {};
			if (data.states) {
				for (var k in data.states) {
					var rect = new ZHDraw.rect($.extend(true, {}, ZHDraw.config.tools.states[data.states[k].type], data.states[k]), _r);
					rect.restore(data.states[k]);
					rmap[k] = rect;
					_states[rect.getId()] = rect;
				}
			}
			if (data.paths) {
				for (var k in data.paths) {
					var p = new ZHDraw.path($.extend(true, {}, ZHDraw.config.tools.path, data.paths[k]), _r, rmap[data.paths[k].from], rmap[data.paths[k].to]);
					p.restore(data.paths[k]);
					_paths[p.getId()] = p;
				}
			}
		}
		// 历史状态
		var hr = ZHDraw.config.historyRects, ar = ZHDraw.config.activeRects;
		if (hr.rects.length || ar.rects.length) {
			var pmap = {}, rmap = {};
			for (var pid in _paths) {// 先组织MAP
				if (!rmap[_paths[pid].from().text()]) {
					rmap[_paths[pid].from().text()] = {
						rect : _paths[pid].from(),
						paths : {}
					};
				}
				rmap[_paths[pid].from().text()].paths[_paths[pid].text()] = _paths[pid];
				if (!rmap[_paths[pid].to().text()]) {
					rmap[_paths[pid].to().text()] = {
						rect : _paths[pid].to(),
						paths : {}
					};
				}
			}
			for (var i = 0; i < hr.rects.length; i++) {
				if (rmap[hr.rects[i].name]) {
					rmap[hr.rects[i].name].rect.attr(hr.rectAttr);
				}
				for (var j = 0; j < hr.rects[i].paths.length; j++) {
					if (rmap[hr.rects[i].name].paths[hr.rects[i].paths[j]]) {
						rmap[hr.rects[i].name].paths[hr.rects[i].paths[j]].attr(hr.pathAttr);
					}
				}
			}
			for (var i = 0; i < ar.rects.length; i++) {
				if (rmap[ar.rects[i].name]) {
					rmap[ar.rects[i].name].rect.attr(ar.rectAttr);
				}
				for (var j = 0; j < ar.rects[i].paths.length; j++) {
					if (rmap[ar.rects[i].name].paths[ar.rects[i].paths[j]]) {
						rmap[ar.rects[i].name].paths[ar.rects[i].paths[j]].attr(ar.pathAttr);
					}
				}
			}
		};

		isc.defineClass("RuleStateNode", "ToolStripButton").addProperties({
			canDrag : true,
			canDrop : true,
			dragAppearance : "tracker",
			dragDataAction : "copy"
		});

		if (drawLayout.getMember(0).ID == "toolPane") {
			drawLayout.hideMember(toolPane);
		}

		if (ZHDraw.config.editable) {
			isc.Label.create({
				ID : "titleLb",
				align : "center",
				valign : "center",
				canDrag : true,
				dragAppearance : "tracker",
				height : "20",
				width : "40",
				backgroundColor : "#909090",
				contents : "<b>工具箱</b>"
			});

			isc.ToolStripButton.create({
				ID : "saveButton",
				icon : "[APP]/resources/images/process/save.gif",
				title : "保存",
				click : function() {
					if (ZHDraw.config.editable) {

						var data = '{states:{';
						for (var k in _states) {
							if (_states[k]) {
								data += _states[k].getId() + ':' + _states[k].toJson() + ',';
							}
						}
						if (data.substring(data.length - 1, data.length) == ',')
							data = data.substring(0, data.length - 1);
						data += '},paths:{';
						for (var k in _paths) {
							if (_paths[k]) {
								data += _paths[k].getId() + ':' + _paths[k].toJson() + ',';
							}
						}
						if (data.substring(data.length - 1, data.length) == ',')
							data = data.substring(0, data.length - 1);
						data += '},props:{props:{';
						for (var k in ZHDraw.config.props.props) {
							if ( typeof (ZHDraw.config.props.props[k]) != "function" && k != "Class" && k != "_proto_" && k != "localeStringFormatter") {
								data += k + ":{value:'" + ZHDraw.config.props.props[k].value + "'},";
							}
						}
						if (data.substring(data.length - 1, data.length) == ',')
							data = data.substring(0, data.length - 1);
						data += '}}}';

						ZHDraw.config.tools.save.onclick(data);

					}
				}
			});
			isc.ToolStripButton.create({
				ID : "selectButton",
				icon : "[APP]/resources/images/process/select16.gif",
				title : "选择",
				actionType : "radio",
				radioGroup : "selectGroup",
				click : function() {
					$(_r).data('mod', "pointer");
				}
			});
			isc.ToolStripButton.create({
				ID : "linkButton",
				icon : "[APP]/resources/images/process/16/flow_sequence.png",
				title : "连接",
				actionType : "radio",
				radioGroup : "selectGroup",
				click : function() {
					$(_r).data('mod', "path");
				}
			});
			isc.RuleStateNode.create({
				ID : "startButton",
				type : "start",
				icon : "[APP]/resources/images/process/16/start_event_empty.png",
				setDragTracker : "isc.Event.setDragTracker(isc.Canvas.imgHTML('[APP]/resources/images/process/48/start_event_empty.png',24,24))",
				title : "开始"
			});
			isc.RuleStateNode.create({
				ID : "decisionButton",
				type : "fork",
				icon : "[APP]/resources/images/process/16/gateway_exclusive.png",
				setDragTracker : "isc.Event.setDragTracker(isc.Canvas.imgHTML('[APP]/resources/images/process/48/gateway_exclusive.png',24,24))",
				title : "判断"
			});
			isc.RuleStateNode.create({
				ID : "modelButton",
				type : "state",
				icon : "[APP]/resources/images/process/16/task_empty.png",
				setDragTracker : "isc.Event.setDragTracker(isc.Canvas.imgHTML('[APP]/resources/images/process/48/task_empty.png',24,24))",
				title : "模型"
			});

			isc.ToolStrip.create({
				ID : "toolBox",
				membersMargin : 5,
				width : 40,
				height : 180,
				vertical : true,
				members : [titleLb, saveButton, "separator", selectButton, linkButton, "separator", startButton, decisionButton, modelButton]
			});

			isc.VLayout.create({
				ID : "toolPane",
				layoutMargin : 10,
				width : 40,
				height : 180,
				left : 60,
				top : 60,
				members : [toolBox]
			});

			drawLayout.addMember(toolPane, 0);
			var drawDropHandler = function() {
				if (ZHDraw.config.editable) {
					$(_r).trigger('addrect', [isc.Event.getDragTarget().type, {
						attr : {
							x : this.getOffsetX(),
							y : this.getOffsetY()
						}
					}]);
				}
			};

			drawHtmlPane.drop = drawDropHandler;
		}

	};

	// 添加jquery方法
	$.fn.ZHDraw = function(o) {

		ZHDraw.init(document.getElementById("drawPane"), o);
	};

	$.ZHDraw = ZHDraw;

	$.extend(true, ZHDraw.config.rect, {
		attr : {
			r : 8,
			fill : '#F6F7FF',
			stroke : '#03689A',
			"stroke-width" : 2
		}
	});

	$.extend(true, ZHDraw.config.props.props, {
		name : {
			name : 'name',
			label : '名称',
			value : '',
			editor : function() {
				return new ZHDraw.editors.inputEditor();
			}
		},
		key : {
			name : 'key',
			label : '标识',
			value : '',
			editor : function() {
				return new ZHDraw.editors.inputEditor();
			}
		},
		desc : {
			name : 'desc',
			label : '描述',
			value : '',
			editor : function() {
				return new ZHDraw.editors.inputEditor();
			}
		}
	});

	$.extend(true, ZHDraw.config.tools.states, {
		start : {
			showType : 'image',
			type : 'start',
			name : {
				text : '<<start>>'
			},
			text : {
				text : '开始'
			},
			img : {
				icon : 'resources/images/process/48/start_event_empty.png',
				width : 48,
				height : 48
			},
			attr : {
				width : 50,
				heigth : 50
			},
			props : {
				text : {
					name : 'text',
					label : '显示',
					value : '',
					editor : function() {
						return new ZHDraw.editors.textEditor();
					},
					value : '开始'
				}
			}
		},
		end : {
			showType : 'image',
			type : 'end',
			name : {
				text : '<<end>>'
			},
			text : {
				text : '结束'
			},
			img : {
				icon : 'resources/images/process/48/end_event_terminate.png',
				width : 48,
				height : 48
			},
			attr : {
				width : 50,
				heigth : 50
			},
			props : {
				text : {
					name : 'text',
					label : '显示',
					value : '',
					editor : function() {
						return new ZHDraw.editors.textEditor();
					},
					value : '结束'
				}
			}
		},

		state : {
			showType : 'text',
			type : 'state',
			name : {
				text : '<<state>>'
			},
			text : {
				text : '模型'
			},
			img : {
				icon : 'resources/images/process/48/task_empty.png',
				width : 48,
				height : 48
			},
			props : {
				model : {
					name : 'model',
					label : '选择',
					value : '',
					editor : function() {
						return new ZHDraw.editors.selectEditor('model.json', true, true, 'code', 'name');
					}
				}
			}
		},
		fork : {
			showType : 'image',
			type : 'fork',
			name : {
				text : '<<fork>>'
			},
			text : {
				text : '判断'
			},
			img : {
				icon : 'resources/images/process/48/gateway_exclusive.png',
				width : 48,
				height : 48
			},
			attr : {
				width : 50,
				heigth : 50
			},
			props : {
				text : {
					name : 'text',
					label : '显示',
					value : '',
					editor : function() {
						return new ZHDraw.editors.textEditor();
					},
					value : '分支'
				},
				el : {
					name : 'el',
					label : '表达式',
					value : '',
					editor : function() {
						return new ZHDraw.editors.inputEditor();
					}
				}
			}
		}
	});

	$.extend(true, ZHDraw.editors, {
		inputEditor : function(type) {
			var _props, _k, _div, _icon, _r;
			this.init = function(props, k, div, icon, r) {
				_props = props;
				_k = k;
				_div = div;
				_icon = icon;
				_r = r;

				$('<input style="width:100%;"/>').val(props[_k].value).change(function() {
					props[_k].value = $(this).val();
				}).appendTo('#' + _div);

				$('#' + _div).data('editor', this);
			};
			this.destroy = function() {
				$('#' + _div + ' input').each(function() {
					_props[_k].value = $(this).val();
				});
			};
		},
		hiddenEditor : function(type) {
			var _props, _k, _div, _icon, _r;
			this.init = function(props, k, div, icon, r) {
				_props = props;
				_k = k;
				_div = div;
				_icon = icon;
				_r = r;

				$('<input type="hidden"/>').val(props[_k].value).change(function() {
					props[_k].value = $(this).val();
				}).appendTo('#' + _div);

				$('#' + _div).data('editor', this);
				$('#' + _div).hide();
			};
			this.destroy = function() {
				$('#' + _div + ' input').each(function() {
					_props[_k].value = $(this).val();
				});
			};
		},
		selectEditor : function(arg, isChangeText, isRest, key, name) {
			var _props, _k, _div, _icon, _r;
			this.init = function(props, k, div, icon, r) {
				_props = props;
				_k = k;
				_div = div;
				_icon = icon;
				_r = r;

				var sle = $('<select style="width: 150px;" />').val(props[_k].value).change(function() {
					props[_k].value = $(this).val();
					if (isChangeText) {
						$(_r).trigger("textchange", [$(this).find('option:selected').text(), _icon]);
					}
				}).appendTo('#' + _div);
				sle.append('<option value=""></option>');
				if ( typeof arg === 'string') {
					$.ajax({
						type : "GET",
						url : arg,
						success : function(data) {
							var opts = eval(data);

							if (isRest) {
								opts = opts.response.data;
							}
							if (opts && opts.length) {
								for (var idx = 0; idx < opts.length; idx++) {
									sle.append('<option value="' + eval('opts[idx].' + key) + '">' + eval('opts[idx].' + name) + '</option>');
								}
								sle.val(_props[_k].value);
							}

						}
					});
				} else {
					for (var idx = 0; idx < arg.length; idx++) {
						sle.append('<option value="' + arg[idx].value + '">' + arg[idx].name + '</option>');
					}
					sle.val(_props[_k].value);
				}


				$('#' + _div).data('editor', this);

			};
			this.destroy = function() {
				$('#' + _div + ' input').each(function() {
					_props[_k].value = $(this).val();
					if (isChangeText) {
						$(_r).trigger("textchange", [$(this).find('option:selected').text(), _icon]);
					}
				});
			};
		}
	});

})(jQuery);

isc.HTMLFlow.create({
	ID : "drawHtmlPane",
	width : "100%",
	height : "100%",
	autoDraw : false,
	canAcceptDrop : true
});

isc.HLayout.create({
	ID : "drawLayout",
	autoDraw : false,
	width : "100%",
	height : "150%",
	backgroundImage : "[APP]/resources/images/process/bg.png",
	members : [drawHtmlPane]
});

isc.Window.create({
	ID : "ruleWindow",
	title : "流程图",
	autoCenter : true,
	visiable : false,
	isModal : true,
	width : "100%",
	height : "100%",
	autoDraw : false,
	items : [drawLayout],
	closeClick : function() {
		if ($.ZHDraw.config.editable) {
			modelSelectorGrid.invalidateCache();

			modelSelectorGrid.fetchData();
		}
		ruleWindow.hide();
	}
});

isc.ToolStripButton.create({
	ID : "add",
	autoDraw : false,
	title : '添加',
	icon : "[APP]/resources/images/icons/16/icon_add.png",
	setDragTracker : "isc.Event.setDragTracker(isc.Canvas.imgHTML('[APP]/resources/images/icons/16/icon_add.png',16,16))",
	click : function() {
		drawHtmlPane.setContents("<div id='drawPane'> </div><div id='ZHDraw_props' style='position: absolute;top: 30;right: 150; background-color: #fff; width: 220px; padding: 3px;' class='ui-widget-content'><div id='ZHDraw_props_handle' class='ui-widget-header'>属性（请将‘&&’符号换成‘##’）</div><table border='1' width='100%' cellpadding='0' cellspacing='0'></table><div>&nbsp;</div></div>");
		ruleWindow.show();
		$.ZHDraw.config.props.props.id = {
			"value" : ""
		};
		$.ZHDraw.config.props.props.key.value = '';
		$.ZHDraw.config.props.props.name.value = '';
		$.ZHDraw.config.props.props.desc.value = '';
		$('#drawPane').ZHDraw({
			basePath : "",
			restore : "",
			editable : true,
			tools : {
				save : {
					onclick : function(data) {
						var url = "modelSelector";
						var obj = eval('(' + data + ')');
						var methd = "POST";
						if (!obj.props.props.key.value) {
							isc.say("请输入规则标识！");
							return false;
						} else if (!obj.props.props.name.value) {
							isc.say("请输入规则名称！");
							return false;
						}

						if (obj.props.props.id && obj.props.props.id.value) {
							url += "/" + obj.props.props.id.value + "/update";
							methd = "POST";
						}
						data = escape(encodeURIComponent(data));
						$.ajax({
							type : methd,
							url : url,
							contentType: "application/x-www-form-urlencoded; charset=utf-8",
							data : "content=" + data,
							error : function(msg) {
								isc.say("保存失败：" + msg.errors);
							},
							success : function(rdata) {
								var obj = eval("(" + rdata.response.data.content + ")");
								$.ZHDraw.config.props.props.id.value = obj.props.props.id.value;
							}
						});
					}
				}
			}
		});

	}
});

isc.ToolStripButton.create({
	ID : 'modeledit',
	hidden : true,
	icon : "[APP]/resources/images/icons/16/icon_edit.png",
	title : '修改',
	click : function() {
		var record = modelSelectorGrid.getSelectedRecord();
		if (!record) {
			isc.say("请先选择一条记录！");
			return;
		}
		drawHtmlPane.setContents("<div id='drawPane' style='height:100%;'> </div><div id='ZHDraw_props' style='position: absolute;top: 30;right: 150; background-color: #fff; width: 220px; padding: 3px;' class='ui-widget-content'><div id='ZHDraw_props_handle' class='ui-widget-header'>属性（请将‘&&’符号换成‘##’）</div><table border='1' width='100%' cellpadding='0' cellspacing='0'></table><div>&nbsp;</div></div>");
		ruleWindow.show();
		$('#drawPane').ZHDraw({
			basePath : "",
			restore : eval("(" + record.content + ")"),
			editable : true,
			tools : {
				save : {
					onclick : function(data) {
						var url = "modelSelector";
						var obj = eval('(' + data + ')');
						if (!obj.props.props.key.value) {
							isc.say("请输入规则标识！");
							return false;
						} else if (!obj.props.props.name.value) {
							isc.say("请输入规则名称！");
							return false;
						}

						if (obj.props.props.id && obj.props.props.id.value) {
							url += "/" + obj.props.props.id.value + "/update";
						}
						data = escape(encodeURIComponent(data));
						$.ajax({
							type : "POST",
							url : url,
							data : "content=" + data,
							error : function(msg) {
								isc.say("保存失败：" + msg.errors);
							},
							success : function(rdata) {
								var obj = eval("(" + rdata.response.data.content + ")");
								$.ZHDraw.config.props.props.id.value = obj.props.props.id.value;
							}
						});
					}
				}
			}
		});
	}
});

isc.ToolStripButton.create({
	ID : 'modelpublish',
	hidden : true,
	icon : "[APP]/resources/images/icons/16/icon_publish.png",
	title : '发布',
	click : function() {
		var record = modelSelectorGrid.getSelectedRecord();
		if (!record) {
			isc.say("请先选择一条记录！");
			return;
		}
		dsPublish.addData(record, function(dsResponse, data, dsRequest) {
			modelSelectorGrid.invalidateCache();
			modelSelectorGrid.fetchData();
		});
	}
});

isc.ToolStripButton.create({
	ID : "modeldel",
	hidden : true,
	icon : "[APP]/resources/images/icons/16/icon_delete.png",
	title : '删除',
	click : function() {
		var record = modelSelectorGrid.getSelectedRecord();
		if (!record) {
			isc.say("请先选择一条记录！");
			return;
		}
		isc.ask("你确定要删除该记录吗?", "if(value){modelSelectorGrid.removeData({id:'" + record.id + "'});}");
	}
});

isc.ToolStripButton.create({
	ID : "modelinfo",
	hidden : true,
	icon : "[APP]/resources/images/icons/16/icon_info.png",
	title : '查看',
	click : function() {
		var record = modelSelectorGrid.getSelectedRecord();
		if (!record) {
			isc.say("请先选择一条记录！");
			return;
		}
		drawHtmlPane.setContents("<div id='drawPane'> </div><div id='ZHDraw_props' style='position: absolute;top: 30;right: 150; background-color: #fff; width: 220px; padding: 3px;' class='ui-widget-content'><div id='ZHDraw_props_handle' class='ui-widget-header'>属性（请将‘&&’符号换成‘##’）</div><table border='1' width='100%' cellpadding='0' cellspacing='0'></table><div>&nbsp;</div></div>");
		ruleWindow.show();
		$('#drawPane').ZHDraw({
			basePath : "",
			restore : eval("(" + record.content + ")"),
			editable : false
		});
		//                        drawHtmlPane.setHeight("");
		ruleWindow.resized();
	}
});

isc.ToolStripButton.create({
	ID : 'modelcopy',
	hidden : true,
	icon : "[APP]/resources/images/icons/16/icon_copy.png",
	title : '复制',
	click : function() {
		var record = modelSelectorGrid.getSelectedRecord();
		if (!record) {
			isc.say("请先选择一条记录！");
			return;
		}
		var cp = dsModelSelector.copyRecord(record);
		dsModelSelector.addData(cp);
	}
});

isc.ToolStripButton.create({
	ID : "refresh",
	autoDraw : false,
	title : '刷新',
	icon : "[APP]/resources/images/icons/16/icon_refresh.png",
	click : " modelSelectorGrid.invalidateCache();modelSelectorGrid.fetchData()"
});

isc.Label.create({
	padding : 5,
	ID : "summaryTotalsLabel"
});

isc.ListGrid.create({
	ID : "modelSelectorGrid",
	autoDraw : false,
	dataSource : "dsModelSelector",
	width : "100%",
	showFilterEditor : true,
	filterOnKeypress : true,
	alternateRecordStyles : true,
	fetchDelay : 500,
	showRecordComponents : true,
	showRecordComponentsByCell : true,
	autoFetchData : true,
	dataPageSize : 30,
	sortFieldNum : 0,
	sortDirection : "ascending",
	gridComponents : [ "filterEditor", "header", "body"],
	dataChanged : function() {
		this.Super("dataChanged", arguments);
		var totalRows = this.data.getLength();
		if (totalRows > 0 && this.data.lengthIsKnown()) {
			summaryTotalsLabel.setContents("共&nbsp;" + totalRows + "&nbsp;条记录");
		} else {
			summaryTotalsLabel.setContents("&nbsp;");
		}
	},
	recordClick : "this.updateForms()",
	updateForms : function() {
		var record = this.getSelectedRecord();
		if (record.status == 1) {
			modeledit.show();
			modelpublish.show();
			modeldel.show();
			modelinfo.hide();
			modelcopy.hide();
		} else {
			modeledit.hide();
			modelpublish.hide();
			modeldel.hide();
			modelinfo.show();
			modelcopy.show();
		}
		if (record == null) {

		} else {

		}

	}
});

isc.ZHDataSource.create({
	ID : "dsDictionary",
	dataURL : "[APP]/dictionary",
	metaDataPrefix : "",
	dataFormat : "json",
	fields : [{
		name : "code"
	}, {
		name : "name"
	}]
});

isc.ZHDataSource.create({
	ID : "dsPublish",
	dataURL : "[APP]/modelSelector/publish",
	metaDataPrefix : "",
	dataFormat : "json"
});

isc.ZHDataSource.create({
	ID : "dsModelSelector",
	dataURL : "[APP]/modelSelector",
	metaDataPrefix : "",
	dataFormat : "json",
	fields : [{
		name : "id",
		primaryKey : true,
		canEdit : false,
		hidden : true
	}, {
		name : "code",
		title : "代码",
		required : true
	}, {
		name : "name",
		title : "名称",
		required : true
	}, {
		name : "desc",
		title : "描述"
	}, {
		name : "content",
		title : "内容",
		hidden : true
	}, {
		name : "version",
		title : "版本",
		type : "float"
	}, {
		name : "status",
		title : "状态",
		type : "select",
		optionDataSource : "dsDictionary",
		valueField : "code",
		displayField : "name",
		optionCriteria : {
			"dictionaryCategory.code" : "MSSTATUS"
		}
	}]
});

isc.SectionStack.create({
	autoDraw : false,
	width : "100%",
	height : "100%",
	sections : [{
		ID : "SectionStackSection1",
		title : "模型选择信息",
		autoShow : true,
		resizeable : true,
		controls : [summaryTotalsLabel,add,modelcopy,modelinfo,modeledit,modeldel,modelpublish,refresh],
		items : [modelSelectorGrid]

	}]
});