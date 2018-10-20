
"use strict";
// 生成下一步
exports.nextStep = function (i,direction,robots){
    // console.log(robots[i].route,robots[i].cupboard);
     // 如果预计下一步被占用，则换一个方向,柜子的坐标0为x，1为y
     let route = robots[i].route.split('-');
     route= [parseInt(route[0]),parseInt(route[1])];
     let nextPoi = [];

    if(direction=='x'){
        //去往货柜
        if(robots[i].state==1){
            let cupboard = robots[i].cupboard.split('-');
            cupboard= [parseInt(cupboard[0]),parseInt(cupboard[1])];
            nextPoi = caculateX(i,robots,route,cupboard,2);
        }else if(robots[i].state==2){
            // 去往分拣台
            let cupboard = robots[i].worker.split('-');
            cupboard= [parseInt(cupboard[0]),parseInt(cupboard[1])];
            nextPoi = caculateX(i,robots,route,cupboard,3);
        }else if(robots[i].state==3){
            // 送返货柜
            let cupboard = robots[i].cupboard.split('-');
            cupboard= [parseInt(cupboard[0]),parseInt(cupboard[1])];
            nextPoi = caculateX(i,robots,route,cupboard,4);
        }else if(robots[i].state==4){
            // 回到充电区，这里应该重置机器人
            let cupboard = robots[i].position.split('-');
            cupboard= [parseInt(cupboard[0]),parseInt(cupboard[1])];
            nextPoi = caculateX(i,robots,route,cupboard,0);
        }
    }else{
        //去往货柜
        if(robots[i].state==1){
            let cupboard = robots[i].cupboard.split('-');
            cupboard= [parseInt(cupboard[0]),parseInt(cupboard[1])];
            nextPoi = caculateY(i,robots,route,cupboard,2);
        }else if(robots[i].state==2){
            // 去往分拣台
            let cupboard = robots[i].worker.split('-');
            cupboard= [parseInt(cupboard[0]),parseInt(cupboard[1])];
            nextPoi = caculateY(i,robots,route,cupboard,3);
        }else if(robots[i].state==3){
            // 送返货柜
            let cupboard = robots[i].cupboard.split('-');
            cupboard= [parseInt(cupboard[0]),parseInt(cupboard[1])];
            nextPoi = caculateY(i,robots,route,cupboard,4);
        }else if(robots[i].state==4){
            // 回到充电区，这里应该重置机器人
            let cupboard = robots[i].position.split('-');
            cupboard= [parseInt(cupboard[0]),parseInt(cupboard[1])];
            nextPoi = caculateY(i,robots,route,cupboard,0);
        }
    }
    return nextPoi; 
}


// 计算路径并变更状态,x优先
/**
 * 
 * @param {*} i 每几个任务
 * @param {*} robots 所有任务
 * @param {*} route 当前位置
 * @param {*} cupboard 目的地
 * @param {*} state 下一个状态
 */
function caculateX(i,robots,route,cupboard,state){
    let nextPoi = [];
    //先计算x方向,x到相等了就只能计算y方向了
    if(route[0]<cupboard[0]){
        nextPoi = [route[0]+1,route[1]];
    }else if(route[0]>cupboard[0]){
        nextPoi = [route[0]-1,route[1]];
    }else{
        //y方向
        if(route[1]<cupboard[1]){
            nextPoi = [route[0],route[1]+1];
        }else if(route[1]>cupboard[1]){
            nextPoi = [route[0],route[1]-1];
        }else{
            // xy都相等了就是到了，从此开始下一阶段，即运往分拣台。
            robots[i].state = state;
        }
    }
    return nextPoi;
}

// 计算路径并变更状态,y优先
/**
 * 
 * @param {*} i 每几个任务
 * @param {*} robots 所有任务
 * @param {*} route 当前位置
 * @param {*} cupboard 目的地
 * @param {*} state 下一个状态
 */
function caculateY(i,robots,route,cupboard,state){
    let nextPoi = [];
    //y方向,y到相等了就只能计算x方向了
    if(route[1]<cupboard[1]){
        nextPoi = [route[0],route[1]+1];
    }else if(route[1]>cupboard[1]){
        nextPoi = [route[0],route[1]-1];
    }else{
        //计算x方向,
        if(route[0]<cupboard[0]){
            nextPoi = [route[0]+1,route[1]];
        }else if(route[0]>cupboard[0]){
            nextPoi = [route[0]-1,route[1]];
        }else{
            // xy都相等了就是到了，从此开始下一阶段，即运往分拣台。
            robots[i].state = state;
        }
    }
    return nextPoi;
}