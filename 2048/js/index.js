/**
 *  @desc 2048小游戏
 *  @author yxy
 *  @date 2018/4/21
 * 
 */

(function (window, undefined) {
    // 预设参数
    let
        argOptions = {
            size: 4, //4*4
            level: 2048, //关卡
            bgMusic: true, //背景音乐
            music: true, //音效
            guideLine: true, //是否添加辅助线
            boardBox: null,
            curScoreBox: null,
            sumScoreBox: null
        },
        game2048 = function (argOptions) {
            return new game2048.prototype.init(argOptions);
        }



    game2048.prototype = {
        init: function (options) {
            // 解析键盘dom、初始化参数值(如果用户没传则使用默认参数值)
            options = Object.assign({}, argOptions, options);
            let boardObj = new Board({
                size: options.size,
                level: options.level
            });
            this.options = options;
            this.boardObj = boardObj;
            this.curScore = 0;
            this.curScoreBox = []; //存放每次移动的得到的新值arr
            this.sumScore = 0;
            //如果用户没有传容器 自己帮用户创建一个             
            if (!this.options.boardBox) {
                boardBox = document.createElement('div');
                boardBox.classList.add("board");
                document.body.appendChild(boardBox);
            }
            this.play();
            return this;
        },
        play: function () {
            this.initView();
            //监听键盘事件触发updateView
        },
        initView: function(){
            // 初始化页面Dom结构
            const {
                size,
                boardBox
            } = this.options;
            let chessPieces = "";
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    chessPieces += `<div class='board_cell' data-key=${i+""+j}></div>`
                }
            }
            boardBox.innerHTML = chessPieces;
            this.boardObj.initBoard();            
            this.updateView();
        },
        updateView: function () {
            const {boardArr} = this.boardObj;
            const {size,guideLine}  = this.options;

            // 更新得分视图
            for (let i = 0; i < size; i++) {
                let row = boardArr[i];
                for (let j = 0; j <size; j++) {
                    if (boardArr[i][j] !== 0) {
                        let updateNode = document.querySelector(`div[data-key="${i+""+j}"]`);
                        // 更新运动 + 根据周围情况判断 辅助线
                        updateNode.classList.add(`cell-con-${boardArr[i][j]}`);

                        // 添加辅助线
                        if(guideLine){
                            let col = [];
                            col.push(
                                boardArr[0][j],
                                boardArr[1][j],
                                boardArr[2][j],
                                boardArr[3][j]
                            )
                            // 找到矩阵中最近一圈的有数字的位置，判断是否相等
                            let rowDir = checkCombine(row,j); // 本行的第几个元素 [0,0] 左右
                            let colDir = checkCombine(col,i); // 本列的第几个元素 [0,0] 上下
                            let direction = getConvertDir(rowDir,colDir);

                           if(direction.length){
                                for(let i=0;i<direction.length;i++){
                                    updateNode.classList.add(`border-${direction[i]}`);
                                }
                           }
                           
                        }
                        updateNode.innerText = boardArr[i][j];
                    }
                }
            }
        }
    }


    /**
     * @class Board对象
     */
    function Board(props) {
        this.boardArr = [];
        this.usefulCells = []; // 空格
        this.size = argOptions.size;
        this.level = argOptions.level;
        Object.assign(this, props);
        return this;
    }

    Board.prototype = {
        initBoard: function () {
            // 初始化棋盘，全0 
            for (let i = 0; i < this.size; i++) {
                this.boardArr.push([]);
                for (let j = 0; j < this.size; j++) {
                    this.boardArr[i][j] = 0;
                }
            }
            this.gernerateNew(2);
        },
        gernerateNew: function (count) {
            while (count--) {
                this.getUsefulCells();
                // selectCell
                const selectedCell = this.usefulCells[Math.floor(Math.random() * this.usefulCells.length)];
                // addRandomNumber
                const newNumber = Math.random() < 0.9 ? 2 : 4;
                this.boardArr[selectedCell.x][selectedCell.y] = newNumber;
            }
        },
        getUsefulCells: function () {
            this.usefulCells = []; // 每次清空
            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    if (this.boardArr[i][j] === 0) {
                        this.usefulCells.push({
                            x: i,
                            y: j
                        })
                    }
                }
            }
        }
    }




    game2048.prototype.init.prototype = game2048.prototype;
    window.game2048 = game2048;
})(window)