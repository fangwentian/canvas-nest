! function() {
	//封装方法，压缩之后减少文件大小
	function get_attribute(node, attr, default_value) {
		return node.getAttribute(attr) || default_value;
	}
	//封装方法，压缩之后减少文件大小
	function get_by_tagname(name) {
		return document.getElementsByTagName(name);
	}
	//获取配置参数
	function get_config_option() {
		var scripts = get_by_tagname("script"),
			script_len = scripts.length,
			script = scripts[script_len - 1]; //当前加载的script。不管页面中有多少个script标签，执行到当前脚本的时候获取到的scripts，当前script肯定是最后一个。
		return {
			l: script_len, //长度，用于生成id用
			z: get_attribute(script, "zIndex", -1), //z-index
			o: get_attribute(script, "opacity", 0.5), //opacity
			c: get_attribute(script, "color", "0,0,0"), //color
			n: get_attribute(script, "count", 99) //count
		};
	}
	//设置canvas的高宽
	function set_canvas_size() {
		canvas_width = the_canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
		canvas_height = the_canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	}

	//绘制过程
	function draw_canvas() {
		// 每次进来清除画布，重新绘制
		context.clearRect(0, 0, canvas_width, canvas_height);
		//随机的线条和当前位置联合数组
		var e, i, d, x_dist, y_dist, dist; //临时节点
		//遍历处理每一个点
		random_lines.forEach(function(r, idx) {
			// r是当前点
			r.x += r.xa,
			r.y += r.ya, //移动
			r.xa *= r.x > canvas_width || r.x < 0 ? -1 : 1,
			r.ya *= r.y > canvas_height || r.y < 0 ? -1 : 1, //碰到边界，反向反弹， xa、ya的值为-1到1之间，给xa或者ya乘以-1，改变移动方向
			context.fillRect(r.x - 0.5, r.y - 0.5, 1, 1); //绘制一个宽高为1的点
			//从下一个点开始
			for (i = idx + 1; i < all_array.length; i++) {
				// e是要比较的点
				e = all_array[i];
				//不是当前点
				if (null !== e.x && null !== e.y) {
						x_dist = r.x - e.x, //x轴距离 l
						y_dist = r.y - e.y, //y轴距离 n
						dist = x_dist * x_dist + y_dist * y_dist; //两点之间的总距离
					// 逻辑运算表达式，来执行操作
					// 当两点之前的距离小于max值
					dist < e.max && (
						// 循环到了all_array的最后一个值，就是当前鼠标的位置
						e === current_point &&
						// 当前点跟鼠标位置的距离在max/2 和 max之间
						dist >= e.max / 2 && (r.x -= 0.03 * x_dist, r.y -= 0.03 * y_dist), //靠近的时候加速，只要点移动远离鼠标，就靠近鼠标，因此最后点停留在跟鼠标点dist为max/2=10000的地方，即圆球的半径为100px
						// 下面的语句，在满足dist < e.max的情况下就会执行，因此，任意两个点之间的距离只要小于max就会连接两点之间的线
						d = (e.max - dist) / e.max,
						context.beginPath(),
						// 线的宽度，距离越近线越宽，最大为0.5
						context.lineWidth = d / 2,
						context.strokeStyle = "rgba(" + config.c + "," + (d + 0.2) + ")",
						context.moveTo(r.x, r.y),
						context.lineTo(e.x, e.y), // 连接2个点
						context.stroke()
					);
				}
			}
		}), frame_func(draw_canvas);
	}
	//创建画布，并添加到body中
	var the_canvas = document.createElement("canvas"), //画布
		config = get_config_option(), //配置
		canvas_id = "c_n" + config.l, //canvas id
		context = the_canvas.getContext("2d"), canvas_width, canvas_height,
		// requestAnimationFrame 的 mixin方法
		frame_func = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(func) {
			window.setTimeout(func, 1000 / 45);
		}, random = Math.random,
		current_point = {
			x: null, //当前鼠标x
			y: null, //当前鼠标y
			max: 20000
		},
		all_array;
	the_canvas.id = canvas_id;
	the_canvas.style.cssText = "position:fixed;top:0;left:0;z-index:" + config.z + ";opacity:" + config.o;
	get_by_tagname("body")[0].appendChild(the_canvas);
	//初始化画布大小

	set_canvas_size(), window.onresize = set_canvas_size;
	//当时鼠标位置存储，离开的时候，释放当前位置信息
	window.onmousemove = function(e) {
		e = e || window.event, current_point.x = e.clientX, current_point.y = e.clientY;
	}, window.onmouseout = function() {
		current_point.x = null, current_point.y = null;
	};
	//随机生成config.n条线位置信息
	for (var random_lines = [], i = 0; config.n > i; i++) {
		var x = random() * canvas_width, //随机位置
			y = random() * canvas_height,
			xa = 2 * random() - 1, //随机运动方向, 大小在 -1 到 1 之间
			ya = 2 * random() - 1;
		random_lines.push({
			x: x,
			y: y,
			xa: xa,
			ya: ya,
			max: 6000 //沾附距离
		});
	}
	all_array = random_lines.concat([current_point]);
	//0.1秒后绘制
	setTimeout(function() {
		draw_canvas();
	}, 100);
}();
