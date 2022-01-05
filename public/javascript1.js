const canvas = document.getElementById('mainLayer');
const context = canvas.getContext('2d');
const paintLayer = document.getElementById('paintLayer');
const paintLayerCtx = paintLayer.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.position = 'absolute';

paintLayer.width = window.innerWidth;
paintLayer.height = window.innerHeight/4;
paintLayer.style.top = (window.innerHeight/4 + paintLayer.height/2)+'px';
paintLayer.style.position = 'absolute';
paintLayerCtx.fillStyle = 'orange';
paintLayerCtx.fillRect(0, 0, paintLayer.width, paintLayer.height);

let lineArr = [];
const mouseCoor = {
    x: 0,
    y: 0
}
let isDrawing = false;

paintLayer.addEventListener('mousedown', event =>{
    isDrawing = true;
    mouseCoor.x = event.offsetX;
    mouseCoor.y = event.offsetY;
    const newLine = new Line(mouseCoor.x, mouseCoor.y, 5, 3);
    lineArr.push(newLine);
    newLine.draw();
});

paintLayer.addEventListener('mousemove', event =>{
    if(isDrawing){
        mouseCoor.x = event.offsetX;
        mouseCoor.y = event.offsetY;
        const newLine = new Line(mouseCoor.x, mouseCoor.y, 5, 3);
        lineArr.push(newLine);
        newLine.draw();
    }
});

paintLayer.addEventListener('mouseup', event =>{
    isDrawing = false;
    mouseCoor.x = 0;
    mouseCoor.y = 0;
});

class LinePixel{
    constructor(x, y, size){
        this.x = x;
        this.y = y;
        this.size = size;
    }
    draw(){
        paintLayerCtx.fillStyle = 'red';
        paintLayerCtx.beginPath();
        paintLayerCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        paintLayerCtx.fill();
        paintLayerCtx.closePath();
    }
}

class Line{
    constructor(x, y, pixelSize, size){
        this.x = x;
        this.y = y;
        this.pixelSize = pixelSize;
        this.size = size;
        this.pixelArr = [];
    }

    draw(){
        paintLayerCtx.fillStyle = 'white';
        paintLayerCtx.beginPath();
        paintLayerCtx.arc(this.x, this.y, this.pixelSize, 0, Math.PI * 2);
        paintLayerCtx.fill();
        paintLayerCtx.closePath();
        if(this.size % 2 == 0){
            for(let i = 0; i <= 1; i++){
                let posNega = this.pixelSize*2;
                if(i==1){
                    posNega = -this.pixelSize*2;
                }
                for(let k = 0; k < ((this.size/2) - i); k++){
                    const newPixel = new LinePixel(this.x, this.y + (k * posNega) + posNega, this.pixelSize);
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
                    const newPixel = new LinePixel(this.x, this.y + (k * posNega) + posNega, this.pixelSize);
                    this.pixelArr.push(newPixel);
                    newPixel.draw();
                }
            }
        }
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

