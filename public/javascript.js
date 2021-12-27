const canvas = document.getElementById('canvas2');
const context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particleArray = [];

//handle mouse
const mouse = {
    x: null,
    y: null,
    radius: 120
};

window.addEventListener('mousemove', function(event){
    mouse.x = event.x;
    mouse.y = event.y;
})

const textImage = {
    width: 100,
    height: 100
};

context.fillStyle = 'white';
context.font = '30px Courier New';
context.fillText('Vy', 30, 55);
context.strokeStyle = 'white';
context.strokeRect(0, 0, textImage.width, textImage.height);
const textData = context.getImageData(0, 0, textImage.width, textImage.height);


class Particle{
    constructor(x, y, color){
        this.x = x;
        this.y = y;
        this.size = 3;
        this.baseX = x;
        this.baseY = y;
        this.density = (Math.random() * 30) + 1;
        this.color = color;
    }

    draw(){
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.closePath();
        context.fill();
    }

    update(){
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let maxDistance = mouse.radius;
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;
        if(distance < mouse.radius){
            this.x -= directionX;
            this.y -= directionY;
        }else{
            if(this.x != this.baseX){
                let dx = this.x - this.baseX;
                this.x -= dx/15;
            }
            if(this.y != this.baseY){
                let dy = this.y - this.baseY;
                this.y -= dy/15;
            }
        }
    }
}

function init(){
    particleArray = [];
    for(let y = 0; y < textData.height; y++){
        for(let x = 0; x < textData.width; x++){
            if(textData.data[(y * 4 * textData.width) + (x * 4 + 3)] >= 128){
                const particleX = x * 5;
                const particleY = y * 5;
                particleArray.push(new Particle(particleX, particleY, 'red'));
            }else{
                const particleX = x * 5;
                const particleY = y * 5;
                particleArray.push(new Particle(particleX, particleY, 'white'));
            }
        }
    }
}

init();

function animate(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    for(let i = 0; i < particleArray.length; i++){
        particleArray[i].draw();
        particleArray[i].update();

    }
    requestAnimationFrame(animate);
}

animate();