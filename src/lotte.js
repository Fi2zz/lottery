function getPrefix(el, property, value) {
    function camelCase(str) {
        return str.replace(/-([a-z])/ig, function (all, letter) {
            return letter.toUpperCase()
        })
    }

    if (el.style[property] === undefined) {
        for (const vendor of ['webkit', 'ms', 'moz', 'o', null]) {
            if (!vendor) return null
            property = camelCase(vendor + '-' + property)
            if (el.style[property] !== undefined) {
                break
            }
        }
    }
    if (value) el.style[property] = value
    return property
}

function isObject(object) {
    return Object.prototype.toString.call(object) === '[object Object]'
}

function merge() {
    let temp = {};
    const args = arguments;
    const len = args.length;
    if (len <= 0) {
        return temp;
    }

    for (let i = 0; i < len; i++) {
        let arg = args[i];
        if (isObject(arg)) {
            for (let key in arg) {
                if (arg.hasOwnProperty(key)) {

                    if (!temp[key]) {
                        temp[key] = arg[key]
                    }


                }
            }
        }
    }
    return temp
}

const cancelAnimationFrame = window.cancelAnimationFrame ||
    window['msCancelAnimationFrame'] ||
    window['mozCancelAnimationFrame'] ||
    window['webkitCancelAnimationFrame'] ||
    window['oCancelAnimationFrame'] ||
    function (id) {
        clearInterval(id)
    };


const requestAnimationFrame = window.requestAnimationFrame ||
    window['msRequestAnimationFrame'] ||
    window['mozRequestAnimationFrame'] ||
    window['webkitRequestAnimationFrame'] ||
    window['oRequestAnimationFrame'] ||
    function (callback) {
        const currTime = new Date().getTime()
        const timeToCall = Math.max(0, 16 - (currTime - lastTime));
        const id = window.setTimeout(() => {
            callback(currTime + timeToCall) // eslint-disable-line
        }, timeToCall)

        lastTime = currTime + timeToCall
        return id
    };

class Lotte {
    constructor(options) {
        const DEFAULTS = {
            speed: 30, // 每帧速度
            pieces: 8,
            randomAngle: 2,// 随机结果角度偏差值 为了防止出现指针和扇区分割线无限重合 单位:°
            initAngle: 0
        };
        this.pointer = options.el;
        this._queue = [];
        this.options = merge(options, DEFAULTS);
        this.initAngle = `${this.options.initAngle}deg`;
        this.init();

    }

    on(key, callback) {
        this._queue[key] = this._queue[key] || []
        this._queue[key].push(callback)
        return this
    }

    emit(key, ...args) {
        if (this._queue[key]) {
            this._queue[key].forEach((callback) => callback.apply(this, args))
        }
        return this
    }


    init() {
        // 初始化样式设定
        this.transform = getPrefix(this.pointer, 'transform', `rotate(${this.initAngle})`);
        getPrefix(this.pointer, 'backfaceVisibility', 'hidden');
        getPrefix(this.pointer, 'perspective', '1000px');
        this._raf = null;
        this.runAngle = 0;
        this.targetAngle = -1;
    }

    reset(event = 'reset') {
        if (!this._raf) return;

        cancelAnimationFrame(this._raf);

        this._raf = null;
        this.runAngle = 0;
        this.targetAngle = -1;
        this.emit(event);
        if (event === 'reset') {
            getPrefix(this.pointer, this.transform, 'rotate(0deg)')
        }
    }

    result(index) {

        const reverseIndex = this.options.pieces + index;
        // 得到中奖结果 index:中奖奖区下标
        const singleAngle = 360 / this.options.pieces // 单个奖区角度值
        let endAngle = Math.random() * singleAngle // 随机得出结果在扇区内的角度
        endAngle = Math.max(this.options.randomAngle, endAngle);
        endAngle = Math.min(singleAngle - this.options.randomAngle, endAngle);
        endAngle = Math.ceil(endAngle + (reverseIndex * singleAngle))
        this.runAngle = 0;
        let random = (Math.ceil(Math.random() * 4) + 4) * 360;
        let range = endAngle % singleAngle;
        //正负偏差5度
        if (range > singleAngle - 5) {
            endAngle -= 5
        } else if (range < 5) {
            endAngle += 5
        }
        this.targetAngle = endAngle + random  // 随机旋转几圈再停止


    }


    step() {
        // 如果没有设置结束点 就匀速不停旋转
        // 如果设置了结束点 就减速到达结束点
        if (this.targetAngle === -1) {
            this.runAngle += this.options.speed
        } else {
            this.angles = (this.targetAngle - this.runAngle) / this.options.speed
            this.angles = this.angles > this.options.speed ? this.options.speed : this.angles < 0.5 ? 0.5 : this.angles
            this.runAngle += this.angles
            this.runAngle = this.runAngle > this.targetAngle ? this.targetAngle : this.runAngle
        }


        const rotate = `rotate(${this.runAngle % 360}deg)`
        // 指针旋转
        getPrefix(this.pointer, this.transform, rotate);

        if (this.runAngle === this.targetAngle) {
            this.reset('end')
        } else {
            this._raf = requestAnimationFrame(() => this.step())
        }
    }

    draw() {

        if (this._raf) return;


        if (!!this._queue["start"]) {
            this.emit('start')

        }


        this.angles = 0;
        this._raf = requestAnimationFrame(() => this.step())
    }
}

export default Lotte
