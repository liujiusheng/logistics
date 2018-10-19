const xlsx = require('xlsx');
const fs = require("fs");
const http = require("http");
/**
 * 规定横向为x轴，纵向为y轴
 * 假设整区域为9*5的网络，
 */

// 所有货物
const goods = JSON.parse(fs.readFileSync('goods.json',{encoding:'utf-8'}));
// 所有货架
const cupboard = JSON.parse(fs.readFileSync('cupboard.json',{encoding:'utf-8'}));
// 订单
const order = JSON.parse(fs.readFileSync('order.json',{encoding:'utf-8'}));

let workers = [false,false,false,false,false,false]; // 工人工作状态，空闲状态的将被分配订单,暂定6个工人
let robots = [];// 机器人数量可以无限增加，以使用的最大机器人数量为本题的结果。一个正在执行的任务就是一个机器人。不需要同时存在机器人和任务两个对象。
const maxRobots = 6;//最多使用6台机器人
let num = 0;//随机挑选分拣人员次数,只有6个工作台，最多执行6次


// 通过定时器模拟下单
setInterval(departmentOrder,1000);


// 任务执行
setInterval(function(){
    // console.log('每秒执行任务');
    let map = new Array(45);
    map.fill(0);
    // 还需要把货架占用的地方和分拣占用的地方排除出去
    map.splice(0,9,1,1,1,1,1,1,1,1,1);//充电桩
    for(let i=1; i<5; i++){
        map.splice((i*9),1,1);//分拣台
        map.splice((i*9+7),2,1,1);//货架
    }
    
    // console.log(map);
    for(const i in robots){
        // console.log(robots[i].route,robots[i].cupboard);
        // 如果预计下一步被占用，则换一个方向
        let route = robots[i].route.split('-');
        route= [parseInt(route[0]),parseInt(route[1])];
        let cupboard = robots[i].cupboard.split('-');
        routecupboard= [parseInt(cupboard[0]),parseInt(cupboard[1])];

        
        let nextPoi = [];
        //去往货柜
        if(robots[i].state==1){
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
                    robots[i].state = 2;
                }
            }
        }else if(robots[i].state==2){
            // 去往分拣台

        }else if(robots[i].state==3){
            // 送返货柜

        }else if(robots[i].state==4){
            // 回到充电区

        }
        
        console.log(nextPoi);

        
        // if(){
        //     // 如果换一个方向还是被点用，则等待
        //     if(){

        //     }else{
        //         //如果没被占用，则标记下一个点被占用，同时移动自身位置
        //     }
        // }else{
        //     //如果没被占用，则标记下一个点被占用，同时移动自身位置
        // }   
    }
    
},1000);

// fs.writeFileSync(outputpath,JSON.stringify(newContent));

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
        let index = Math.floor(Math.random()*5);
        if(workers[index]){
            return chooseWorker();
        }else{
            workers[index] = true;//分拣完成后需要把它重新设置为false
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
function chooseRobot(worker,orderIndex,cupboard){
    const currentOrder = JSON.parse(JSON.stringify(order[orderIndex]));
    if(robots.length<1){
        robots.push({"state":1,"worker":worker,"order":currentOrder,"cupboard":cupboard,"position":"1-0","route":"1-0"});
        return true;
    }else{
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
            robots[index].worker = worker; 
            robots[index].order = currentOrder; 
            robots[index].cupboard = cupboard;
            return true;
        }else{
            if(maxRobots<robots.length||maxRobots==robots.length){
                return false;
            }else{
                robots.push({"state":1,"worker":worker,"order":currentOrder,"cupboard":cupboard,"position":robots.length+"-0","route":robots.length+"-0"});
                return true;
            }
        }
    }
}


// 计算每一秒的网格占用
