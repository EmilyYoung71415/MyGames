/**
 * 
 *  Api实现效果
 * 
 *  //使用自定义参数，可以不写全
    let argOptions = {
        level:2048, //关卡
        bgMusic:true,//背景音乐
        music:true,//音效
        guideLine:true,//是否添加辅助线
    }
    game2048({
       boardBox :document.querySelector(".chess_board"),
       ...argOptions
    }).play();
 * 
 */


/**
* board 类
* ===》 专职处理键盘矩阵值
*      initBoardArr
*      initBoardDOM ====> render
*      getUsefulCells
*      isOver
*      isWin
*      gernerateNew(2)
* play:
*      init: 分数置0 随机产生两个棋子 
*      初始化生成2个棋子 
*          let boardObj = new Board();
*          boardArr = boardObj.gernerateNew(2);
*          // 需要用level 但是是全局变量了 每次返回当前最新的矩阵 
*              
           this.boardObj.initBoard();

       render:
           根据矩阵循环出棋盘视图，如果[i][j]!==0 则有棋子。
           但是棋子的状态 new Piece({point:[i,j]}).getStatus 返回pieceNode


           this.updateView();
*      每次游戏前判断游戏状态
*      render: 拿着矩阵值渲染当前分数、矩阵排布

4
8
16
32
64
128
256
512
1024





*/