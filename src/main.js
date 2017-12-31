import './style.styl'

import Lotte from './lotte';


const lotte = new Lotte({
    el: document.querySelector('#lotte .trigger'),
    speed: 100, // 每帧速度
    pieces: 8, // 奖区数量
    initAngle: 0
});
let index = -1;


lotte.on('start', () => {
    const sec = (new Date).getSeconds();
    if (sec > 8) {
        index = Math.round((sec - 8) / 8)
    }
    else {
        index = Math.round(sec)
    }
    lotte.result(index);
});


lotte.on("end", () => {

    console.log(index)

});
const trigger = document.querySelector('.trigger');
trigger.addEventListener("click", () => lotte.draw());









