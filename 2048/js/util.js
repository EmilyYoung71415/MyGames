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