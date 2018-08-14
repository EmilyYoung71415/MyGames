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
            let {boardBox} = this.options;
            //如果用户没有传容器 自己帮用户创建一个             
            if (!boardBox) {
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
            let move=(dir)=>{
                // 0:左, 1:上 2:右, 3:下
                this.boardObj.move(dir);
                // 无效移动 ---特效抖一抖
                if(!this.boardObj.isMoveable){
                    const {boardBox} = this.options;
                    boardBox.classList.add('shake');
                    boardBox.addEventListener('animationend',function(){
                        boardBox.classList.remove('shake');
                    })
                    return;
                }
                // 有效移动则更新最终棋盘结果  
                // 每次是拿到board的board值进行绘制 所以先updateView再进行输赢判断              
                this.updateView();
                // 游戏胜利
                if(this.boardObj.isWin){
                    setTimeout(function(){
                        let winNode = document.querySelector('.win');
                        winNode.classList.remove('hidden');
                    },2000);
                    return;
                }                              
                // 游戏结束
                if(this.boardObj.isLose()){
                    setTimeout(function(){
                        let loseNode = document.querySelector('.lose');
                        loseNode.classList.remove('hidden');
                    },500);
                    return;
                }
            }
            let clear=()=>{
                this.boardObj.clear();
                this.curScore = 0;
                this.curScoreBox = []; //存放每次移动的得到的新值arr
                this.sumScore = 0;
                // 更新视图 ==》 重新初始化棋盘界面 + 隐藏clear界面
                this.updateView();
            }
            window.addEventListener('keydown', function(e){
                switch (e.keyCode) {
                    case 37://left
                        e.preventDefault();
                        move(0);break;
                    case 38://up
                        e.preventDefault();
                        move(1);break;
                    case 39://right
                        e.preventDefault();
                        move(2);break;
                    case 40://down
                        e.preventDefault();
                        move(3);break;
                }
            });
            // 移动端
            let 
                touchStartX=0,
                touchStartY=0,
                touchEndX=0,
                touchEndY=0;
            document.addEventListener('touchstart',function(event){
                if(event.target.className.includes('clear')){
                    clear()
                    return;
                }
                touchStartX=event.touches[0].pageX;
                touchStartY=event.touches[0].pageY;
            });
            document.addEventListener('touchend',function(event){
                if(event.target.className.includes('clear')){
                    clear()
                    return;
                }
                touchEndX=event.changedTouches[0].pageX;
                touchEndY=event.changedTouches[0].pageY;
                let disX = touchStartX - touchEndX;
                let disY = touchStartY - touchEndY;
                let absdisX=Math.abs(disX);
                let absdisY=Math.abs(disY);
                // 确定移动方向   0:左, 1:上 2:右, 3:下
                // 设定滑动阀值，当滑动xx距离才纳入滑动动作
                 if(absdisX<30&&absdisY<30) return;
                let direction = absdisX > absdisY ? (disX < 0 ? 2 : 0) : (disY < 0 ? 3 : 1);
                move(direction);  
            });

            // 监听clear事件 也可以触发清盘
            let clearBtns = document.querySelectorAll('.clear');
            for(let i=0;i<clearBtns.length;i++){
                clearBtns[i].addEventListener('click',clear)
            }
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
            const {boardArr,curScoreArr,direction,initFlag} = this.boardObj;
            const {size,guideLine,curScoreBox,sumScoreBox}  = this.options;
            // 隐藏弹出框
            let winNode = document.querySelector('.win');
            let loseNode = document.querySelector('.lose');
            winNode.classList.add('hidden');
            loseNode.classList.add('hidden');
            // 更新得分视图
            let curMax = Math.max.apply(null,curScoreArr);// 每次移动获得的最大得分
            if(this.options.music) playSound(curMax);// 算出每次移动合并得到的最大新生块 不同块对应不同音效
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
                    
                    if (boardArr[i][j] !== 0) {
                        // 根据Board矩阵有值的行列 找到对应的Dom节点
                        let updateNode = document.querySelector(`div[data-key="${i+""+j}"]`);
                        // 不同数值对应不同的背景颜色
                        updateNode.classList.add(`cell-con-${boardArr[i][j]}`);
                        // 目标块高亮
                        if(boardArr[i][j]===this.options.level){
                            updateNode.classList.add('targetLevel');
                        }
                        // 如果添加辅助线
                        if(guideLine){
                            let col = [];
                            for(let k = 0;k<size;k++){
                                col.push(boardArr[k][j])
                            }
                            // 找到矩阵中最近一圈的有数字的位置，判断是否相等
                            let rowDir = checkCombine(row,j); // 本行的第几个元素 [0,0] 左右
                            let colDir = checkCombine(col,i); // 本列的第几个元素 [0,0] 上下
                            let dirArr = getConvertDir(rowDir,colDir);// 根据行列数组获得四个方向的关键词
                            // 如果方向数组可合并的对象，那么在对应的方向上加上border
                           if(dirArr.length){
                                for(let i=0;i<dirArr.length;i++){
                                    updateNode.classList.add(`border-${dirArr[i]}`);
                                }
                           }
                           
                        }
                        !initFlag&&addmotion(updateNode,direction,this.options.size,i,j);
                        //updateNode.classList.add(`move-${direction}`);
                        updateNode.innerText = boardArr[i][j];
                    }
                }
            }
        }
    }


    /**
     * @class Board对象
     * @func  专职处理棋盘数据
     */
    function Board(props) {
        this.boardArr = [];
        this.usefulCells = []; // 空格
        this.size = argOptions.size;
        this.level = argOptions.level;
        this.isWin = false;
        this.isMoveable = true;
        this.curScoreArr = [0];//每次合并得到的合并值数组
        this.direction = null;
        this.initFlag = true;
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
            this.initFlag = count===2?true:false;
            while (count--) {
                this.getUsefulCells();
                // selectCell
                const selectedCell = this.usefulCells[Math.floor(Math.random() * this.usefulCells.length)];
                // addRandomNumber
                const newNumber = Math.random() < 0.9 ? 2 : 4;
                this.boardArr[selectedCell.x][selectedCell.y] = newNumber;
            }
        },
        // 从棋盘获得可填充的空格区域
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
            this.direction = dir;
            this.isMoveable = true;
            // 无效移动无需计算
            if(!this.moveableCheck(dir)){
                this.isMoveable = false;
                return;
            };          
            // 每次移动前初始化
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
                return;
            } 
            //有效移动 随机产生新格子
            this.gernerateNew(1);
        },
        isLose:function(){
            // 没有可空格 且无法合并
            // 判断是否还存在0
            this.getUsefulCells();
            if(this.usefulCells.length) return false;
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
        // 判断按既定方向的该次移动是否有效
        // 方向只是确定了行移还是列移
        // 判断该行/列是否有0 或 可以合并
        moveableCheck:function(dir){
            // 每行判断自己前面的元素是否为0(不是判断0是否存在，有可能0在最后哦)
            // 转换之后判断this.boardArr[i] 即是移动方向的row
            let convertedArr = convertArr(this.boardArr, dir);
            for(let i=0;i<this.size;i++){
                // 得到当前行 怎么判断当前行是可移动的呢？ 
                // 将所有0移动到棋row最后，如果两个row相同则不能移动
                // 即移动方向上移动前方无空位，[且]无可合并的对象
                let row = getMoveInit(convertedArr[i]);
                if(row.toString()!==convertedArr[i].toString()){
                    return true;
                }
                //情况2 有可以合并的格子
                for(let j=0;j<this.size;j++){
                    if(row[j]===row[j+1]){
                        return true;
                    } 
                }
            }
            return false;
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