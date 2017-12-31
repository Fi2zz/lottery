
#大转盘

原repo https://github.com/94cstyles/lottery

https://github.com/94cstyles/lottery/blob/master/src/dial.js
原repo做法是转动转盘，感觉略不方便，所以我改成了转动指针


```javascript
import Lotte from './lotte';

let index = -1;

const app = new Lotte({
    el: document.querySelector('#lotte .trigger'),
    speed: 100, // 每帧速度
    pieces: 8, // 奖区数量
    initAngle: 0    //初始角度
});

//转盘开始转动
app.on('start', () => {
    const sec = (new Date).getSeconds();
    if (sec > 8) {
        index = Math.round((sec - 8) / 8)
    }
    else {
        index = Math.round(sec)
    }
    app.result(index);
});

//抽奖结束，得到奖品索引
app.on("end", () => {
    console.log(`奖品索引 ${index}`)
});

//抽奖
document.querySelector('.trigger').addEventListener("click", () => {
    app.draw()
});




```


