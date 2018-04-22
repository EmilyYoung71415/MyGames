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
            if(this.options.bgMusic) playSound('bgMusic');
            this.initView();
            //监听键盘事件触发updateView
            let move=(e)=>{
                // 0:左, 1:上 2:右, 3:下
                switch (e.keyCode) {
                    case 37://left
                        e.preventDefault();
                        this.boardObj.move(0);break;
                    case 38://up
                        e.preventDefault();
                        this.boardObj.move(1);break;
                    case 39://right
                        e.preventDefault();
                        this.boardObj.move(2);break;
                    case 40://down
                        e.preventDefault();
                        this.boardObj.move(3);break;
                }
                // 游戏结束
                this.updateView();
                if(this.boardObj.isLose()){
                    let loseNode = document.querySelector('.lose');
                    loseNode.classList.remove('hidden');
                    return;
                }
                if(this.boardObj.isWin){
                    let winNode = document.querySelector('.win');
                    winNode.classList.remove('hidden');
                    return;
                }
            }

            let clear=()=>{
                this.boardObj.clear();
                this.curScore = 0;
                this.curScoreBox = []; //存放每次移动的得到的新值arr
                this.sumScore = 0;
                this.updateView();
            }
            window.addEventListener('keydown', move);
            // 监听clear事件 也可以触发清盘
            let clearBtns = document.querySelectorAll('.clear');
            for(let i=0;i<clearBtns.length;i++){
                clearBtns[i].addEventListener('click',clear)
            }
        },
        isGameOver:function(){
            const {boardArr} = this.boardObj;
            // 全局无空格
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
            const {boardArr,curScoreArr} = this.boardObj;
            const {size,guideLine,curScoreBox,sumScoreBox}  = this.options;
            let winNode = document.querySelector('.win');
            let loseNode = document.querySelector('.lose');
            winNode.classList.add('hidden');
            loseNode.classList.add('hidden');
            // 更新得分视图
            let curMax = Math.max.apply(null,curScoreArr);// 每次移动获得的最大得分
            if(this.options.music) playSound(curMax);
            this.curScore = curScoreArr.reduce((prev,cur)=> prev + cur)
            this.sumScore +=  this.curScore;
            curScoreBox.innerText = `本次得分:${this.curScore}`;
            sumScoreBox.innerText = `总分:${this.sumScore}`;
            // 更新棋盘视图
            for (let i = 0; i < size; i++) {
                let row = boardArr[i];
                for (let j = 0; j <size; j++) {
                    //每个进行清零
                    let everyNode = document.querySelector(`div[data-key="${i+""+j}"]`);
                    everyNode.innerText = '';
                    everyNode.className = 'board_cell';
                    
                    // 清class
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
        this.isWin = false;
        this.curScoreArr = [0];//每次合并得到的合并值数组
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
        },
        move:function(dir){
            
            this.curScoreArr = [0];
            //0:左, 1:上, 2:右, 3:下
            //根据不同方向得到的新数组 convertArr()            
            let convertedArr = convertArr(this.boardArr, dir);
            // 合并后的二维数组
            let mergedArr = this.mergeArr(convertedArr);
            // 将数组转换为正常数组
            let resultArr =  normalArr(mergedArr,dir);
            this.boardArr = resultArr;
            // 判断移动完之后是否出现了2048 curScore <== 1024 
            if(this.curScoreArr.includes(this.level)){
                this.isWin = true;
                // 如果成功则无需再产生新棋子
                return ;
            } 
            //有效移动 随机产生新格子
            this.gernerateNew(1);
        },
        isLose:function(){
            // 判断是否还存在0
            for (let i = 0; i < this.size; i++){ 
                for (let j = 1; j < this.size; j++) {
                    if(!this.boardArr[i][j]){
                        return false;
                    }
                }
            }

            //  元素上下左右不等
            for (let i = 0; i < this.size; i++){ // 左右不等
                for (let j = 1; j < this.size; j++) {
                    if (this.boardArr[i][j] == this.boardArr[i][j - 1])
                    return false;
                }
            }
            for (let j = 0; j < this.size; j++)  // 上下不等
                for (let i = 1; i < this.size; i++) {
                    if (this.boardArr[i][j] == this.boardArr[i - 1][j])
                    return false;
            }
            return true;
        },
        clear:function(ops){
            this.boardArr = [];
            this.usefulCells = []; // 空格
            this.size = argOptions.size;
            this.level = argOptions.level;
            this.isOver = false;
            this.isWin = false;
            this.curScoreArr = [0];
            Object.assign(this, ops);
            this.initBoard();
        },
        // 判断按既定方向该次的移动是否有效
        isMoveable:function(arr){
            /* 
                boarArr: left        arr    
                    0 2 2 0 ---- 2 2 0 0
                    2 4 2 0 ---- 2 4 2 0
                    2 2 0 4 ---- 2 2 4 0
                    0 0 2 0 ---- 2 0 0 0
            */
            for (let i = 0; i < arr.length; i++) {
                let row = arr[i];
                // checkMoveable 情况1，移动前方有空位
                if(row.indexOf(0)>-1&&row.indexOf(0)<4){
                    return false;
                }
                // 情况2 有可以合并的格子
                for(let j=0;j<row.length;j++){
                    if(row[j]==row[j+1]) 
                        return false;
                }
                return true;
            }
        },
        mergeArr:function(arr) {
            let newArr = [[],[],[],[]];
            // 将每行进行零归一操作 (将零归到一起)
            for (let i = 0; i < this.size; i++) {
                let row = arr[i];
                // 将row的所有0移到末尾变为 2200
                row = getMoveInit(row);
                newArr[i] = row;
               
                // 合并
                for(let j=0;j<this.size;j++){
                    if(row[j+1]==row[j]&&row[j]!==0){
                        newArr[i][j] += newArr[i][j+1];
                        // 每次得分： 新增合并数值
                        this.curScoreArr.push(newArr[i][j]);
                        //sumScore += curScore;
                        newArr[i][j+1] = 0;
                    }
                }
        
                // 再次调用零归一操作(因为会新产生0)
                newArr[i] = getMoveInit(newArr[i]);
            }
            return newArr;
        }
    }

    game2048.prototype.init.prototype = game2048.prototype;
    window.game2048 = game2048;
})(window)