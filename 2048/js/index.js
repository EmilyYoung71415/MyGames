/**
 *  @desc 2048小游戏
 *  @author yxy
 *  @date 2018/4/21
 * 
 */

(function(window, undefined) {
    // 预设参数
    let 
        argOptions = {
            size:4,//4*4
            level:2048, //关卡
            bgMusic:true,//背景音乐
            music:true,//音效
            guideLine:true,//是否添加辅助线
        },
        game2048 = function(argOptions){
            return new game2048.prototype.init(argOptions);
        }



    game2048.prototype ={
        init:function(options){
            // 解析键盘dom、初始化参数值(如果用户没传则使用默认参数值)
            options = Object.assign({}, argOptions, options);
            let boardObj = new Board({
                size:options.size,
                level:options.level
            });            
            this.options = options;
            this.boardObj = boardObj;
            this.curScore = 0;
            this.sumScore = 0;
            
            // 初始化棋盘
            boardObj.initBoard();
            //如果用户没有传容器 自己帮用户创建一个 

            this.render();
            return this;
        },
        play:function(){

        },
        render:function(){
            // 渲染得分情况
            const {boardArr} = boardObj;
            // 循环boardArr
        }
    }


    /**
     * @class Board对象
     */
    function Board(props){
        this.boardArr = [];
        this.size = 4;
        this.usefulCells = [];// 空格
        this.level = 2048;
        Object.assign(this, props);
        return this;
    }
    
    Board.prototype = {
        initBoard:function(){
            // 初始化棋盘，全0 
            for (let i = 0; i < this.size; i++) {
                this.boardArr.push([]);
                for (let j = 0; j < this.size; j++) {
                    this.boardArr[i][j] = 0;
                }
            }
            this.gernerateNew(2);
        },
        gernerateNew:function(count){

        }
    }
    



    game2048.prototype.init.prototype = game2048.prototype;
	window.game2048 = game2048;
})(window)
