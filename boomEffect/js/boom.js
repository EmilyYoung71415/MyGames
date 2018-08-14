/**
 * @author yxy
 * @desc 基于canvas的图片爆炸
 * @date 2018/2/19
 */


(function (window, undefined) { 
    var 
        canvas = document.getElementById("canvas"),
        ctx = canvas.getContext("2d"),
        balls = [],//爆炸的小球数组
        colors = [],//提取的主题色
        cw = null,
        ch = null,
        cpointX = 0 ,
        cpointY = 0,
        ballCount = 60,
        stopDraw = false;


    function Boom(elems){
        return new Boom.prototype.init(elems);
    }
    // boom对象
    Boom.prototype = {
        //初始化变量及调用其它函数 主题颜色、链式调用等  在原图周围生成一个比原图大的canvas
        init: function (elem) {
            if (arguments[0] !== undefined) {
                this.boom(elem) ;
            }
            return this;
        },
            
        boom:function(elem){
            var posi =  elem.getBoundingClientRect();
            //动态修改canvas属性
           	canvas.style.position = 'absolute';
           	canvas.style.top = posi.top + 'px';
           	canvas.style.left = posi.left + 'px';
           	
               
			canvas.width = elem.width//window.innerWidth;
            canvas.height = elem.height//window.innerWidth;
            cw = canvas.width+20;
            ch = canvas.height+20;
            cpointX = ~~cw/2 ;
            cpointY = ~~ch/2;
			
			
            //获取颜色值
            var colorThief = new ColorThief(); 
            colors = colorThief.getPalette(elem);
	
            //生成60个小球对象
            while(ballCount--){
                balls.push(new Ball(cpointX,cpointY));
            }

			//抖三斗
			elem.className = 'shake';
			//CSS3动画回调
            elem.addEventListener('animationend',loop)
            return this;
        }    
    }
    
    function loop(){
        if(!stopDraw){
            requestAnimationFrame(loop);
        }
        //清空画布
        ctx.clearRect(0, 0, cw, ch);
        var i = balls.length;
        while(i--){
            balls[i].draw();
            balls[i].update();
        }
    }

    //爆炸小球对象
    function Ball(x,y){
        this.posX = x;//圆心x坐标
        this.posY = y;
        this.radius = cw/25;//小球半径
        this.alpha = 1;//初始透明度
        this.speedY = random(10,20);
        this.speedX = random(10,26);
        this.angle = random(0, 2 * Math.PI);//任意方向
        this.frictionY = 0.9;//y轴摩擦力
        this.frictionX = 0.6;
        this.fillcolor = randomColor();
        this.alphaincre = 0.009;//每次减0.0009
    }

    Ball.prototype = {
        update:function(){
            var isCrashed = false;
            //碰撞算法
            if(this.posY > ch - this.radius-random(10,150)){//下边检测
                this.angle =  random(1.45* Math.PI,1.55 * Math.PI)//垂直向上为270度 1.5
                isCrashed = true;
            }
            if(this.posX > cw - this.radius -random(10,50)){//右边检测
                this.angle = random(1.40* Math.PI,1.49 * Math.PI)//斜左向上
                isCrashed = true;
            }
            if(this.posX < this.radius +random(10,50)){//左边检测
				this.angle = random(1.51* Math.PI,1.60 * Math.PI)//斜右向上
				isCrashed = true;
            }   
            
            
            //碰撞前摩擦力大碰撞后摩擦力小
            if(isCrashed){
            	this.speedY = random(6,15);
            	this.speedX = random(6,15);
            	this.frictionX = 1;
                this.frictionY = 0.8;
                this.alphaincre = 0.012;
            }

			
            this.posX +=  Math.cos(this.angle) * this.speedX*this.frictionX;
            this.posY += Math.sin(this.angle) * this.speedY*this.frictionY;
            this.radius -= 0.1;
            this.alpha -= this.alphaincre;
        },
        draw:function(){
        	if(this.radius<=0){
                stopDraw = true;
        		return;
        	}
            ctx.beginPath();
            ctx.arc(this.posX,this.posY,this.radius,0,2*Math.PI); 
            //颜色 
            var fillcolor = `rgba(${this.fillcolor[0]},${this.fillcolor[1]},${this.fillcolor[2]},${this.alpha})`; 
            ctx.fillStyle = fillcolor;
            ctx.closePath();
            ctx.fill();
        }
    }
	

    /**
     *  @desc 下面是一些工具函数
     */

    //重绘函数
    window.requestAnimFrame = (function(){
    return window.requestAnimationFrame        || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     ||
            function(callback){
                //最平滑动画的最佳循环间隔是1000ms/60  大多数电脑显示器的刷新频率是60Hz，大概相当于每秒钟重绘60次
                window.setTimeout(callback, 1000 / 60);
            };
    })();

     function random(min,max){
         return Math.random() * (max - min) + min;
     }

     function randomColor(){
        var i = Math.floor(Math.random() * colors.length);
        return colors[i];
     }

     Boom.prototype.init.prototype = Boom.prototype;
    //暴露变量
    window.boom = Boom;
})(window)