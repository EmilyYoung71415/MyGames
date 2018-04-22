/**
 * @desc 传入 元素所在行/列 + 元素在本行/列的索引 
 * @returns 返回该方向上合并标记的数组 
 * @example ([2,2,0,4],1) ==> [1,0] 表示 arr[1]即2左边有可合并元素 右边无可合并元素
 */
function checkCombine(arr,index){
    let backArr = [0,0] //默认是左右均不能合并
    // 左 只需要找改变的，即出现合并的情况
    let temp = arr[index];
    if(index>0){
        let leftIndex = index;
        while(leftIndex>0){
            leftIndex--;
            if(arr[leftIndex]!==0){
                if(arr[leftIndex]===temp) 
                backArr[0]=1;
                break;
            }
        }
    }
    // 右
    if(index<3){
        let rightIndex = index;
        while(rightIndex<arr.length){
            rightIndex++;
            if(arr[rightIndex]!==0){
                if(arr[rightIndex]===temp) 
                backArr[1]=1;
                break;
            }
        }
    }
    return backArr;
}

/**
 * @desc 传入行+列方向的可合并标记 转换为四个方向的字符型标记
 * @param row [0,0] 代表 左右、col [0,0]代表上下
 * @func 用于添加辅助线border class
 * @example getConvertDir([1,1],[0,1]) ==> ['left','right','bottom']
 */

function getConvertDir(row,col){
    let direction = [];
    if(row[0]) direction.push('left');
    if(row[1]) direction.push('right');
    if(col[0]) direction.push('top');
    if(col[1]) direction.push('bottom');
    return direction;
}



/**
 * mergeArr
 * @desc 合并数组包括： 将数组归一处理(getMoveInit) + 合并数组
 *  // 若是向左滑
    [2, 0, 2, 0], //2 2 0 0 -- 4 0 0 0
    [0, 0, 2, 0], //2 0 0 0 -- 2 0 0 0 
    [0, 2, 0, 0], //2 0 0 0 -- 2 0 0 0
    [0, 2, 4, 4] // 2 4 4 0 -- 2 8 0 0
 */


/**
 * @desc 数组归一操作
 *  // 若是向左滑
    [2, 0, 2, 0], //2 2 0 0 
    [0, 0, 2, 0], //2 0 0 0 
    [0, 2, 0, 0], //2 0 0 0 
    [0, 2, 4, 4] // 2 4 4 0 
 */

function getMoveInit(arr) {
    //思路:按顺序存储数字 不足补齐0
    let tempArr = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== 0) {
            tempArr.push(arr[i])
        }
    }
    for (let j = tempArr.length; j < arr.length; j++) {
        tempArr[j] = 0;
    }
    return tempArr;
}
/**
 * @desc 按照不同移动方向将 数组转换为指定形式(方便操作)
 *       之后统一操作该数组
 */

function convertArr(arr, dir) {
    let list = [[],[],[],[]];
    let size = arr.length;
    for (let i = 0; i < size; i++)
        for (let j = 0; j < size; j++) { 
            // 0:左, 1:上 2:右, 3:下
            switch (dir) {
                case 0:
                    list[i].push(arr[i][j]);
                    break;
                case 1:
                    list[i].push(arr[j][i]);
                    break;
                case 2:
                    list[i].push(arr[i][size - 1 - j]);
                    break;
                case 3:
                    list[i].push(arr[size - 1 - j][i]);
                    break;
            }
        }
    return list;
}



/**
 * @desc 将转换后的数组再转换为符合视图的矩阵形式
 */
function normalArr(arr,dir) {
    let result = [[],[],[],[]];
    let size = arr.length;
    for (let i = 0; i < size; i++){
        for (let j = 0; j < size; j++) {
            // 0:左, 1:上 2:右, 3:下
            switch (dir) {
                case 0:
                    result[i][j] = arr[i][j];break;
                case 1:
                    result[i][j] = arr[j][i];break;
                case 2:
                    result[i][j] = arr[i][size - 1 - j];break;
                case 3:
                    result[i][j] = arr[j][size - 1 - i];break;
            }
        }
    }
    return result;
}


/**
 * @desc 播放音乐
 * 
 */

 function playSound(name){
    const audio = document.querySelector(`audio[data-key="${name}"]`); // 根据触发按键的键码，获取对应音频
    if (!audio) return; 
    audio.currentTime = 0; // 每次播放之后都使音频播放进度归零
    audio.play(); // 播放相应音效
 }