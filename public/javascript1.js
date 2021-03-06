const canvas = document.getElementById('mainLayer');
const context = canvas.getContext('2d');
const mainDiv = document.getElementById('mainDiv');
canvas.width = mainDiv.clientWidth;
canvas.height = mainDiv.clientHeight;
//canvas.style.position = 'absolute';
context.fillStyle = 'snow';
context.fillRect(0, 0, canvas.width, canvas.height);

const drawingArea = document.getElementById('drawingArea');
drawingArea.width = window.innerWidth;
drawingArea.height = window.innerHeight/4;
drawingArea.style.top = (window.innerHeight/4 + drawingArea.height/2)+'px';
drawingArea.style.position = 'absolute';

const paintLayer = document.getElementById('paintLayer');
const paintLayerCtx = paintLayer.getContext('2d');
paintLayer.width = drawingArea.width;
paintLayer.height = drawingArea.height;
paintLayer.style.border = 'thin solid cyan';
paintLayer.style.position = 'absolute';

const picFrame = document.getElementById('picFrame');
const picFrameCtx = picFrame.getContext('2d');
picFrame.width = 0;
picFrame.height = 0;
picFrame.style.position = 'absolute';

const doneBtn = document.getElementById('paintDone');
doneBtn.style.top = (window.innerHeight/4 + paintLayer.height + paintLayer.height/2)+'px';
doneBtn.style.position = 'absolute';

let firePicFrame = false;
let picFrameTop = -(drawingArea.offsetTop * 2);
function paintDone(){
    if(firePicFrame){
        picFrameTop = picFrame.offsetTop;
        firePicFrame = false;
    }else{
        drawPicFrame();
        repaintToPicFrame();
        picFrame.style.top = (paintLayer.height - picFrame.height) + 'px';
        doneBtn.innerText = 'FIRE';
        firePicFrame = true;
    }
}

function firePic(){
    if(picFrameTop > drawingArea.offsetTop * -1){
        picFrame.style.border = 'none';
        picFrame.style.top = picFrameTop + 'px';
        picFrameTop -= 2;
    }
    requestAnimationFrame(firePic);
}

firePic();

let picFrameDragable = false;
let picFrameXTouch = 0;
picFrame.addEventListener('mousedown', e =>{
    picFrameDragable = true;
    picFrameXTouch = e.offsetX;
}, false);
picFrame.addEventListener('mousemove', e =>{
    if(picFrameDragable){
        const xChange = picFrame.offsetLeft + ((picFrame.offsetLeft + e.offsetX) - (picFrame.offsetLeft + picFrameXTouch));
        picFrame.style.left = xChange + 'px';
    }
}, false);

picFrame.addEventListener('touchmove', e =>{
    e.preventDefault();
    picFrame.style.left = (e.changedTouches[0].pageX - picFrame.width/2) + 'px';
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
    newLine.draw();
}, false);
paintLayer.addEventListener('mousemove', event =>{
    if(isDrawing){
        mouseCoor.x = event.offsetX;
        mouseCoor.y = event.offsetY;
        const newLine = new Line(mouseCoor.x, mouseCoor.y, penPixelSize, 3, paintLayerCtx);
        lineArr.push(newLine);
        newLine.draw();
    }
}, false);
window.addEventListener('mouseup', event =>{
    isDrawing = false;
    picFrameDragable = false;
    mouseCoor.x = 0;
    mouseCoor.y = 0;
}, false);
/////
paintLayer.addEventListener('touchstart', event =>{
    event.preventDefault();
    mouseCoor.x = event.touches[0].clientX;
    mouseCoor.y = event.touches[0].clientY - drawingArea.offsetTop;
    const newLine = new Line(mouseCoor.x, mouseCoor.y, penPixelSize, 3, paintLayerCtx);
    lineArr.push(newLine);
    newLine.draw();
}, false);
paintLayer.addEventListener('touchmove', event =>{
    event.preventDefault();
    mouseCoor.x = event.touches[0].clientX ;
    mouseCoor.y = event.touches[0].clientY - drawingArea.offsetTop;
    const newLine = new Line(mouseCoor.x, mouseCoor.y, penPixelSize, 3, paintLayerCtx);
    lineArr.push(newLine);
    newLine.draw();
}, false);
paintLayer.addEventListener('touchend', e =>{
    isDrawing = false;
    mouseCoor.x = 0;
    mouseCoor.y = 0;
}, false);

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
    const x = paintLayerFindMinX() - penPixelSize;
    const y = paintLayerFindMinY() - penPixelSize;
    const width = paintLayerFindMaxX() - x + penPixelSize;
    const height = paintLayerFindMaxY() - y + penPixelSize;

    picFrame.width = width;
    picFrame.height = height;
    picFrame.style.border = 'thin solid yellow'
    picFrame.style.top = y + 'px';
    picFrame.style.left = x + 'px';
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

//{For Testing
class Circle{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    draw(){
        paintLayerCtx.fillStyle = 'pink';
        paintLayerCtx.beginPath();
        paintLayerCtx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        paintLayerCtx.fill();
        paintLayerCtx.closePath();
    }
} //}

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

const moveUpBtn = document.getElementById('moveUp');
const moveUpBtn1 = document.getElementById('moveUp1');
const moveLeftBtn = document.getElementById('moveLeft');
const moveRightBtn = document.getElementById('moveRight');
const moveDownBtn = document.getElementById('moveDown');
const moveDownBtn1 = document.getElementById('moveDown1');
let timer;
const holdDur = 400;
let isHold = false;
let playerDirs = {
    up: 'up',
    left: 'left',
    right: 'right',
    down: 'down',
    none: 'none'
};
let playerDir = playerDirs.none;
moveUpBtn.addEventListener('touchstart', e=>{
    e.preventDefault();
    timer = setTimeout(function(){
        playerDir = playerDirs.up;
        isHold = true;
    }, holdDur);
}, false);
moveUpBtn.addEventListener('touchend', e=>{
    endHoldDir(playerDirs.none, moveUp);
}, false);
moveUpBtn1.addEventListener('touchstart', e=>{
    e.preventDefault();
    timer = setTimeout(function(){
        playerDir = playerDirs.up;
        isHold = true;
    }, holdDur);
}, false);
moveUpBtn1.addEventListener('touchend', e=>{
    endHoldDir(playerDirs.none, moveUp);
}, false);
////
moveLeftBtn.addEventListener('touchstart', e=>{
    e.preventDefault();
    timer = setTimeout(function(){
        playerDir = playerDirs.left;
        isHold = true;
    }, holdDur);
}, false);
moveLeftBtn.addEventListener('touchend', e=>{
    endHoldDir(playerDirs.none, moveLeft);
}, false);
////
moveRightBtn.addEventListener('touchstart', e=>{
    e.preventDefault();
    timer = setTimeout(function(){
        playerDir = playerDirs.right;
        isHold = true;
    }, holdDur);
}, false);
moveRightBtn.addEventListener('touchend', e=>{
    endHoldDir(playerDirs.none, moveRight);
}, false);
////
moveDownBtn.addEventListener('touchstart', e=>{
    e.preventDefault();
    timer = setTimeout(function(){
        playerDir = playerDirs.down;
        isHold = true;
    }, holdDur);
}, false);
moveDownBtn.addEventListener('touchend', e=>{
    endHoldDir(playerDirs.none, moveDown);
}, false);
moveDownBtn1.addEventListener('touchstart', e=>{
    e.preventDefault();
    timer = setTimeout(function(){
        playerDir = playerDirs.down;
        isHold = true;
    }, holdDur);
}, false);
moveDownBtn1.addEventListener('touchend', e=>{
    endHoldDir(playerDirs.none, moveDown);
}, false);

function endHoldDir(dir, moveDir){
    if(isHold){
        playerDir = dir;
    }else{
        moveDir();
    }
    isHold = false;
    clearTimeout(timer);
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
        context.fillRect(this.x, this.y, this.size, this.size);
    }
}
const player1 = new Player(canvas.width/2 - 25, canvas.height - 50, 50, 'red');

function playerMove(x, y, preX, preY){
    player1.x += x;
    player1.y += y;
    context.clearRect(preX, preY, 50, 50);
    context.fillStyle = 'snow';
    context.fillRect(preX, preY, 50, 50);
}

const prePlayerPos = {
    x: canvas.width/2 - 25,
    y: canvas.height - 50
};
function moveUp(){
    playerMove(0, -10, prePlayerPos.x, prePlayerPos.y);
}
function moveLeft(){
    playerMove(-10, 0, prePlayerPos.x, prePlayerPos.y);
}
function moveRight(){
    playerMove(10, 0, prePlayerPos.x, prePlayerPos.y);
}
function moveDown(){
    playerMove(0, 10, prePlayerPos.x, prePlayerPos.y);
}

function drawPlayer(){
    switch(playerDir){
        case playerDirs.up:
            playerMove(0, -2, prePlayerPos.x, prePlayerPos.y);
            break;
        case playerDirs.left:
            playerMove(-2, 0, prePlayerPos.x, prePlayerPos.y);
            break;
        case playerDirs.right:
            playerMove(2, 0, prePlayerPos.x, prePlayerPos.y);
            break;
        case playerDirs.down:
            playerMove(0, 2, prePlayerPos.x, prePlayerPos.y);
            break;    
        default: break;
    }
    player1.draw();
    prePlayerPos.x = player1.x;
    prePlayerPos.y = player1.y;
    requestAnimationFrame(drawPlayer);
}

drawPlayer();

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
        context.fillStyle = 'pink';
        context.fillRect(this.x, this.y, 10, 10);
        /*switch(this.type){
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
        }*/
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
    const angle = Math.atan2(y - player1.y, x - player1.x);
    const bx = Math.cos(angle);
    const by = Math.sin(angle);
    bulletArr.push(new Bullet(player1.x + 20, player1.y, bx, by, 3, '5b'));
}

function shoot(){
    addBulletLine(player1.x, player1.y - 20);
}

function shooting(){   
    context.fillStyle = 'rgba(0,0,0,.05)';
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    //context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    player1.draw();
    bulletArr.forEach((bullet) => {
        bullet.update();
    })
    requestAnimationFrame(shooting);
}

/*addEventListener('click', function(event){
    addBulletLine(event.clientX, event.clientY);
});*/

shooting();

