const canvas = document.getElementById('mainLayer');
const context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.position = 'absolute';

const drawingArea = document.getElementById('drawingArea');
drawingArea.width = window.innerWidth;
drawingArea.height = window.innerHeight/4;
drawingArea.style.top = (window.innerHeight/4 + drawingArea.height/2)+'px';
drawingArea.style.position = 'absolute';


const paintLayer = document.getElementById('paintLayer');
const paintLayerCtx = paintLayer.getContext('2d');
paintLayer.width = drawingArea.width;
paintLayer.height = drawingArea.height;
paintLayer.style.position = 'absolute';
paintLayerCtx.fillStyle = 'orange';
paintLayerCtx.fillRect(0, 0, paintLayer.width, paintLayer.height);

const picFrame = document.getElementById('picFrame');
const picFrameCtx = picFrame.getContext('2d');
picFrame.width = 0;
picFrame.height = 0;
picFrame.style.position = 'absolute';

const doneBtn = document.getElementById('paintDone');
doneBtn.style.top = (window.innerHeight/4 + paintLayer.height + paintLayer.height/2)+'px';
doneBtn.style.position = 'absolute';

var requestId;
function paintDone(){
    //pullRightPlace();
    //paintLayer.style.top = '100px';
    window.cancelAnimationFrame(requestId);
    requestId = undefined;
    drawPicFrame();
    repaintToPicFrame();
    picFrame.style.top = (paintLayer.height - picFrame.height) + 'px';
}
let picFrameDragable = false;
let picFrameMouse = {
    x: 0,
    y: 0
};
picFrame.addEventListener('mousedown', e =>{
    picFrameDragable = true;
    picFrameMouse.x = e.offsetX;
    picFrameMouse.y = e.offsetY;
}, false);
picFrame.addEventListener('touchstart', e =>{
    picFrameDragable = true;
    picFrameMouse.x = e.touches[0].pageX;
    picFrameMouse.y = e.touches[0].pageY;
    e.preventDefault();
}, false);
picFrame.addEventListener('touchend', e =>{
    picFrameDragable = false;
    e.preventDefault();
}, false);
picFrame.addEventListener('mouseup', e =>{
    picFrameDragable = false;
}, false);

let lineArr = [];
const mouseCoor = {
    x: 0,
    y: 0
}
let isDrawing = false;
let penPixelSize = 5;

paintLayer.addEventListener('mousedown', event =>{
    isDrawing = true;
    mouseCoor.x = event.offsetX;
    mouseCoor.y = event.offsetY;
    const newLine = new Line(mouseCoor.x, mouseCoor.y, penPixelSize, 3, paintLayerCtx);
    lineArr.push(newLine);
    //newLine.draw();
}, false);

paintLayer.addEventListener('touchstart', event =>{
    mouseCoor.x = event.touches[0].pageX;
    mouseCoor.y = event.touches[0].pageY;
    const newLine = new Line(mouseCoor.x, mouseCoor.y, penPixelSize, 3, paintLayerCtx);
    lineArr.push(newLine);
    //newLine.draw();
}, false);

paintLayer.addEventListener('touchmove', event =>{
    event.preventDefault();
    event.stopPropagation();
    if(picFrameDragable){
        picFrame.style.left = (event.changedTouches[0].pageX - picFrameMouse.x) + 'px';
    }else{
        mouseCoor.x = event.touches[0].pageX;
        mouseCoor.y = event.touches[0].pageY;
        const newLine = new Line(mouseCoor.x, mouseCoor.y, penPixelSize, 3, paintLayerCtx);
        lineArr.push(newLine);
        //newLine.draw();
    }
}, false);

paintLayer.addEventListener('mousemove', event =>{
    if(picFrameDragable){
        picFrame.style.left = (event.offsetX - picFrameMouse.x) + 'px';
    }else{
        if(isDrawing){
            mouseCoor.x = event.offsetX;
            mouseCoor.y = event.offsetY;
            const newLine = new Line(mouseCoor.x, mouseCoor.y, penPixelSize, 3, paintLayerCtx);
            lineArr.push(newLine);
            //newLine.draw();
        }
    }
}, false);

paintLayer.addEventListener('mouseup', event =>{
    isDrawing = false;
    mouseCoor.x = 0;
    mouseCoor.y = 0;
}, false);

/*paintLayer.addEventListener('touchend', e =>{
    isDrawing = false;
    mouseCoor.x = 0;
    mouseCoor.y = 0;
}, false);*/

function drawingLineArr(){
    paintLayerCtx.clearRect(0, 0, paintLayer.width, paintLayer.height);
    //paintLayerCtx.fillStyle = 'orange';
    //paintLayerCtx.fillRect(0, 0, paintLayer.width, paintLayer.height);
    for(let i = 0; i < lineArr.length; i++){
        lineArr[i].draw();
    }
    requestId = window.requestAnimationFrame(drawingLineArr);
}

drawingLineArr();

function paintLayerFindMaxY(){
    let biggest = 0;
    const lineArrLength = lineArr.length > 1 ? lineArr.length - 1 : lineArr.length;
    for(let a = 0; a < lineArrLength; a++){
        let biggestArr = [];
        for(let b = 0; b < lineArr[a].pixelArr.length; b++){         
            if(lineArr.length == 1){
                biggestArr.push(lineArr[a].pixelArr[b].y);
            }else{
                if(lineArr[a].pixelArr[b].y >= lineArr[a+1].pixelArr[b].y){
                    biggestArr.push(lineArr[a].pixelArr[b].y);
                }else{
                    biggestArr.push(lineArr[a+1].pixelArr[b].y);
                }
            }  
        }
        if(biggest <= Math.max(...biggestArr)){
            biggest = Math.max(...biggestArr);
        } 
    }
    return biggest;
}

function paintLayerFindMinY(){
    let smallest = paintLayer.height * 2;
    const lineArrLength = lineArr.length > 1 ? lineArr.length - 1 : lineArr.length;
    for(let a = 0; a < lineArrLength; a++){
        let smallestArr = [];
        for(let b = 0; b < lineArr[a].pixelArr.length; b++){         
            if(lineArr.length == 1){
                smallestArr.push(lineArr[a].pixelArr[b].y);
            }else{
                if(lineArr[a].pixelArr[b].y <= lineArr[a+1].pixelArr[b].y){
                    smallestArr.push(lineArr[a].pixelArr[b].y);
                }else{
                    smallestArr.push(lineArr[a+1].pixelArr[b].y);
                }
            }  
        }
        if(smallest >= Math.min(...smallestArr)){
            smallest = Math.min(...smallestArr);
        } 
    }
    return smallest;
}

function paintLayerFindMaxX(){
    let biggest = lineArr[0].x;
    const lineArrLength = lineArr.length > 1 ? lineArr.length - 1 : lineArr.length;
    if(lineArr.length == 1){
        return biggest;
    }else{
        for(let a = 0; a < lineArrLength; a++){
            if(biggest <= lineArr[a+1].x){
                biggest = lineArr[a+1].x;
            }
        }
    }
    return biggest;
}

function paintLayerFindMinX(){
    let smallest = lineArr[0].x;
    const lineArrLength = lineArr.length > 1 ? lineArr.length - 1 : lineArr.length;
    if(lineArr.length == 1){
        return smallest;
    }else{
        for(let a = 0; a < lineArrLength; a++){
            if(smallest >= lineArr[a+1].x){
                smallest = lineArr[a+1].x;
            }
        }
    }
    return smallest;
}

function repaintToPicFrame(){
    paintLayerCtx.clearRect(0, 0, paintLayer.width, paintLayer.height);
    //paintLayerCtx.fillStyle = 'orange';
    //paintLayerCtx.fillRect(0, 0, paintLayer.width, paintLayer.height);
    for(let a = 0; a < lineArr.length; a++){
        lineArr[a].x = lineArr[a].x - picFrame.offsetLeft;
        lineArr[a].y = lineArr[a].y - picFrame.offsetTop;
        lineArr[a].ctx = picFrameCtx;
        lineArr[a].selfDraw();
        for(let b = 0; b < lineArr[a].pixelArr.length; b++){
            lineArr[a].pixelArr[b].x = lineArr[a].pixelArr[b].x - picFrame.offsetLeft;
            lineArr[a].pixelArr[b].y = lineArr[a].pixelArr[b].y - picFrame.offsetTop;
            lineArr[a].pixelArr[b].ctx = picFrameCtx;
            lineArr[a].pixelArr[b].draw();
        }
    }
}

function drawPicFrame(){
    console.log(lineArr);
    const x = paintLayerFindMinX() - penPixelSize;
    const y = paintLayerFindMinY() - penPixelSize;
    const width = paintLayerFindMaxX() - x + penPixelSize;
    const height = paintLayerFindMaxY() - y + penPixelSize;

    picFrame.width = width;
    picFrame.height = height;
    picFrame.style.border = 'thin solid #0000FF'
    picFrame.style.top = y + 'px';
    picFrame.style.left = x + 'px';
    console.log('X: '+ picFrame.offsetTop + ' Y: '+ picFrame.offsetLeft);
}

function pullRightPlace(){
    let biggest = 0;
    const lineArrLength = lineArr.length > 1 ? lineArr.length - 1 : lineArr.length;
    console.log('LineLength: ' + lineArrLength);
    for(let a = 0; a < lineArrLength; a++){
        let biggestArr = [];
        for(let b = 0; b < lineArr[a].pixelArr.length; b++){
            if(lineArr[a].pixelArr[b].y + lineArr[a].pixelArr[b].size >= paintLayer.height){
                console.log('Farthest: ' + lineArr[a].pixelArr[b].y);
            }else{
                if(lineArr.length == 1){
                    biggestArr.push(lineArr[a].pixelArr[b].y);
                }else{
                    if(lineArr[a].pixelArr[b].y >= lineArr[a+1].pixelArr[b].y){
                        biggestArr.push(lineArr[a].pixelArr[b].y);
                    }else{
                        biggestArr.push(lineArr[a+1].pixelArr[b].y);
                    }
                }   
            }
        }
        if(biggest <= Math.max(...biggestArr)){
            biggest = Math.max(...biggestArr);
        } 
    }
    console.log(biggest);
    biggest += 5;
    while(biggest < paintLayer.height){
        paintLayerCtx.clearRect(0, 0, paintLayer.width, paintLayer.height);
        paintLayerCtx.fillStyle = 'orange';
        paintLayerCtx.fillRect(0, 0, paintLayer.width, paintLayer.height);
        for(let i = 0; i < lineArr.length; i++){
            lineArr[i].increaseY(1);
            for(let k = 0; k < lineArr[i].pixelArr.length; k++){
                lineArr[i].pixelArr[k].increaseY(1);
            }
        }
        biggest += 1;
    }
}

class LinePixel{
    constructor(x, y, size, ctx){
        this.x = x;
        this.y = y;
        this.size = size;
        this.ctx = ctx;
    }
    draw(){
        this.ctx.fillStyle = 'red';
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();
    }
    increaseY(n){
        this.y += n;
        this.draw();
    }

}

class Line{
    constructor(x, y, pixelSize, size, ctx){
        this.x = x;
        this.y = y;
        this.pixelSize = pixelSize;
        this.size = size;
        this.pixelArr = [];
        this.ctx = ctx;
    }
    selfDraw(){
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.pixelSize, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();
    }
    draw(){
        this.selfDraw();
        this.pixelArr = [];
        if(this.size % 2 == 0){
            for(let i = 0; i <= 1; i++){
                let posNega = this.pixelSize*2;
                if(i==1){
                    posNega = -this.pixelSize*2;
                }
                for(let k = 0; k < ((this.size/2) - i); k++){
                    const newPixel = new LinePixel(this.x, this.y + (k * posNega) + posNega, this.pixelSize, this.ctx);
                    this.pixelArr.push(newPixel);
                    newPixel.draw();
                }
            }
        }else{
            for(let i = 0; i <= 1; i++){
                let posNega = this.pixelSize*2;
                if(i==1){
                    posNega = -this.pixelSize*2;
                }
                for(let k = 0; k < Math.floor(this.size/2); k++){
                    const newPixel = new LinePixel(this.x, this.y + (k * posNega) + posNega, this.pixelSize, this.ctx);
                    this.pixelArr.push(newPixel);
                    newPixel.draw();
                }
            }
        }
    }

    increaseY(n){
        this.y += n;
        this.selfDraw();
    }

}

class Player{
    constructor(x, y, size, color){
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
    }

    draw(){
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.closePath();
        context.fill();
    }
}
const player1 = new Player(canvas.width/2, canvas.height/2, 20, 'red');


class Bullet{
    constructor(x, y, velocityX, velocityY, speed, type){
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.speed = speed;
        this.type = type;
    }

    draw(){
        context.fillStyle = 'white';
        context.beginPath();
        switch(this.type){
            case '5bl':
                context.strokeStyle = 'red';
                context.lineWidth = 10;
                context.lineCap = 'round';
                context.setLineDash([2, 20]);
                context.moveTo(this.x, this.y);
                context.lineTo(this.x + this.velocityX * 50, this.y + this.velocityY * 50);
                context.stroke();
                break;
            default: context.arc(this.x, this.y, 5, 0, Math.PI * 2);
                break;
        }
        context.closePath();
        //context.fill();
    }
    
    update(){
        this.draw();
        this.x += this.velocityX * this.speed;
        this.y += this.velocityY * this.speed;
    }
}

let bulletArr = [];

function addBulletLine(x, y){
    const angle = Math.atan2(y - canvas.height/2, x - canvas.width/2);
    const bx = Math.cos(angle);
    const by = Math.sin(angle);
    bulletArr.push(new Bullet(player1.x, player1.y, bx, by, 3, '5bl'));
}

function shotting(){   
    context.fillStyle = 'rgba(0,0,0,.05)';
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    //context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    player1.draw();
    bulletArr.forEach((bullet) => {
        bullet.update();
    })
    requestAnimationFrame(shotting);
}

/*addEventListener('click', function(event){
    addBulletLine(event.clientX, event.clientY);
});

shotting();*/

