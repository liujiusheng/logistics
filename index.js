const xlsx = require('xlsx');
const fs = require("fs");
const http = require("http");
const lib =  require('./lib.js');
/**
 * 规定横向为x轴，纵向为y轴
 * 假设整区域为9*5的网络，
 */

// 所有货物
const goods = JSON.parse(fs.readFileSync('goods.json',{encoding:'utf-8'}));
// 所有货架
// const cupboard = JSON.parse(fs.readFileSync('cupboard.json',{encoding:'utf-8'}));
let cupboard = {};
for(let i=0;i<15;i++){
    for(let k=0;k<7;k++){
    
    }
}
for(let i=3; i<43; i=i+3){
    for(let k=0;k<8;k++){
        cupboard[(19+k*6)+'-'+i] = {"state":false,"goods":[0,1,2,3,4,5,6]};
        cupboard[(20+k*6)+'-'+i] = {"state":false,"goods":[0,1,2,3,4,5,6]};
        cupboard[(21+k*6)+'-'+i] = {"state":false,"goods":[0,1,2,3,4,5,6]};
        cupboard[(22+k*6)+'-'+i] = {"state":false,"goods":[0,1,2,3,4,5,6]};
        cupboard[(23+k*6)+'-'+i] = {"state":false,"goods":[0,1,2,3,4,5,6]};
    }
}
// console.log(cupboard);
// return;
// 订单
const order = JSON.parse(fs.readFileSync('order.json',{encoding:'utf-8'}));

let workers = JSON.parse(fs.readFileSync('worker.json',{encoding:'utf-8'})); // 工人工作状态，空闲状态的将被分配订单,暂定6个工人
let robots = [];// 机器人数量可以无限增加，以使用的最大机器人数量为本题的结果。一个正在执行的任务就是一个机器人。不需要同时存在机器人和任务两个对象。
const maxRobots = 17;//最多使用6台机器人
let num = 0;//随机挑选分拣人员次数,只有6个工作台，最多执行6次
let map = new Array(3520);
let timeCost = 0;//花费的总时间

// 通过定时器模拟下单
setInterval(departmentOrder,1000);


// 任务执行
setInterval(function(){
    // console.log('每秒执行任务');
    
    map.fill(0);
    // 还需要把货架占用的地方和分拣占用的地方排除出去
    map.splice(0,17,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1);//充电桩
    for(let i=0; i<7; i++){
        map.splice(((i*5+15)*64+13),2,1,1);//分拣台
        map.splice(((i*5+16)*64+13),2,1,1);//分拣台
    }
    let sss =0;
    for(let i=3; i<43; i=i+3){
        for(let k=0;k<8;k++){
            
            map.splice((i*64+19+k),5,1,1,1,1,1);//散货架
            map.splice(((i+1)*64+19+k),5,1,1,1,1,1);//散货架
        }
    }
    // console.log(map);
    for(let i=45; i<55; i++){
        map.splice((i*64+19),44,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1);//整货架，全部填充
    }

    // 上一次机器人的位置也需要填充，不然多个机器人可能跑到同一位置
    for(const i in robots){
        let route = robots[i].route.split('-');
        const index = parseInt(route[0])+parseInt(route[1])*64;
        map.splice(index,1,1);
    }
    // fs.writeFileSync('map2.json',JSON.stringify(map));
    console.log('每一组数据输出：');
    for(const i in robots){
        console.log('当前工作机器人数：'+robots.length+',货柜：'+robots[i].cupboard+'，分拣台：'+robots[i].worker+'，充电桩：'+robots[i].position+',当前位置：'+robots[i].route+'，当前状态：'+robots[i].state);
    }
    for(const i in robots){
        let nextPoi = lib.nextStep(i,'x',robots);
        
        if(check(i,'x',nextPoi)){
            //如果没被占用，则标记下一个点被占用，同时移动自身位置
            
        }else{
            nextPoi = lib.nextStep(i,'y',robots);
            if(check(i,'y',nextPoi)){
                //如果没被占用，则标记下一个点被占用，同时移动自身位置
            }else{
                // 如果换一个方向还是被点用，则等待
            }
        }
    }
    timeCost ++;
    console.log('花费时间：'+timeCost+'秒');
},1000);




// 检查是否可以走下一步，不行则换方向或者暂停,可以返回true,被占用返回false
function check(i,direction,nextPoi){
    const index = nextPoi[0]+nextPoi[1]*64;
    const nextPath = nextPoi[0]+'-'+nextPoi[1];//console.log(map[index]);
    const workerXY = robots[i].worker.split('-');
    const cupboardXY = robots[i].cupboard.split('-');
    const positionXY = robots[i].position.split('-');
    // 机器人在运往分拣台时不能到分拣台同一x或小于x，因为分拣台实际是由4个点组成
    // 送返货柜时y轴需要选进入货柜前后的区域再移动x轴
    
    if(map[index]==0){
        // console.log('计算',robots[i].state,nextPoi[0],positionXY,cupboardXY,robots[i].state==3&&(nextPoi[0]>19||nextPoi[0]==19)&&!(positionXY[1]==parseInt(cupboardXY[1])+1||positionXY[1]==parseInt(cupboardXY[1])-1));
        if(robots[i].state==2&&(nextPoi[0]<workerXY[0]||nextPoi[0]==workerXY[0])){
            return false;
        }
        else if(robots[i].state==3&&(nextPoi[0]>19||nextPoi[0]==19)&&!(positionXY[1]==parseInt(cupboardXY[1])+1||positionXY[1]==parseInt(cupboardXY[1])-1)){
            return false;
        }
        else{
            map[index] = 1;// 标注占用
            // 修改机器人位置
            robots[i].route = nextPath
            return true;
        }
    }else{
        //如果有东西占用则要判断下一步是不是目标点,目标点分别有：前往柜子，送还柜子，分拣台，充电桩
        if(robots[i].state==1&&nextPath==robots[i].cupboard){
            map[index] = 1;// 标注占用
            // 修改机器人位置
            robots[i].route = nextPath
            return true;
        }else if(robots[i].state==2&&nextPath==robots[i].worker){
            map[index] = 1;// 标注占用
            // 修改机器人位置
            robots[i].route = nextPath;
            workers[robots[i].workerIndex].state = false;// 分拣员重新恢复空闲状态
            return true;
        }else if(robots[i].state==3&&nextPath==robots[i].cupboard){
            map[index] = 1;// 标注占用
            // 修改机器人位置
            robots[i].route = nextPath;
            cupboard[robots[i].cupboard].state = false;// 柜子重新恢复空闲状态
            return true;
        }else if(robots[i].state==4&&nextPath==robots[i].position){
            map[index] = 1;// 标注占用
            // 修改机器人位置
            robots[i].route = nextPath;
            robots.splice(i,1);//机器人回到了充电桩，移除任务
            return true;
        }
        return false;
    }
}




function departmentOrder(){
    if(order.length<1){
        console.log('没有订单了');
        return;
    }
    num = 0;
    let orderIndex = 0;// 因为处理过的订单直接从列表里面移除了，所以每次只需要取第一个就对了
    let workerIndex = chooseWorker();// 分配订单给分拣人员,没有人员空闲则即出分配，下一次再分配
    if(workerIndex===false){
        console.log('暂无空闲分拣人员');
        return;
    }
    let cupboardIndex = chooseCupboard(orderIndex); // 选择货柜
    let schedule = chooseRobot(workerIndex,orderIndex,cupboardIndex); // 选择机器人并生成任务
    // 如果生成任务成果则在订单中删除，若不成功则下次继续分派此订单
    if(schedule===true){
        order.shift();
    }else{
        console.log('暂无空闲机器人');
    }
}


// 挑选订单分拣人员
function chooseWorker(){
    num ++;
    if(num>6){
        return false;
    }else{
        let index = Math.floor(Math.random()*6);//最多6个分拣台同时工作

        if(workers[index].state){
            return chooseWorker();
        }else{
            workers[index].state = true;//分拣完成后需要把它重新设置为false
            return index;
        }
    }
}


// 选择货架,首先要确定柜子在原位置,然后根据订单的内容选择,现在假设所有订单都能在一个货架选完,理论上货架数量远大于机器人数量，所以货架不存在全部为true的情况（后期进行ABC分类后可进一步优化此部分）
function chooseCupboard(orderIndex){
    let currentOrder = order[orderIndex];
    for(const i in cupboard){
        // 如果货架在原位置
        if(cupboard[i].state == false){
            let has = true;
            for(const k in currentOrder){
                const result = cupboard[i].goods.indexOf(currentOrder[k]);
                if(result==-1){
                    has = false;
                }
            }

            if(has){
                cupboard[i].state = true;
                return i;
            }
        }
    }
}


// 选择机器人,当机器人不够时可自动增加,有上限
// 0:空闲，1:前往货柜，2:前往分拣台，3:送回货柜，4:回到充电区
function chooseRobot(workerIndex,orderIndex,cupboard){
    const currentOrder = JSON.parse(JSON.stringify(order[orderIndex]));
    if(robots.length<1){
        robots.push({"state":1,"worker":workers[workerIndex]['place'],"workerIndex":workerIndex,"order":currentOrder,"cupboard":cupboard,"position":"0-0","route":"0-0"});
        return true;
    }else{//return;
        let has = false;
        let index = null;
        for(const i in robots){
            if(robots[i].state==0){
                has = true;
                index = i;
            }
        }
        // 有空机器则不加机器，后续可以增加这里的添加机器条件
        if(has){
            robots[index].state = 1; 
            robots[index].worker = workers[workerIndex]['place']
            robots[index].workerIndex = workerIndex; 
            robots[index].order = currentOrder; 
            robots[index].cupboard = cupboard;
            return true;
        }else{
            if(maxRobots<robots.length||maxRobots==robots.length){
                return false;
            }else{
                robots.push({"state":1,"worker":workers[workerIndex]['place'],"workerIndex":workerIndex,"order":currentOrder,"cupboard":cupboard,"position":robots.length+"-0","route":robots.length+"-0"});
                return true;
            }
        }
    }
}


// 计算每一秒的网格占用
