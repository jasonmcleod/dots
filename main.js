
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function isTouch() {
    return (('ontouchstart' in window)
         || (navigator.MaxTouchPoints > 0)
         || (navigator.msMaxTouchPoints > 0));
   }
var inputMove = isTouch() ? 'touchmove' : 'mousemove';
var inputAction = isTouch() ? 'touchstart' : 'click';
var inputLabel = isTouch() ? 'Tap' : 'Click';

var scoreElem = document.getElementById('score');
var topScoreElem = document.getElementById('topScore');
var gameCountElem = document.getElementById('gameCount');

var randomBuffer = () => ~~(Math.random() * 200);

canvas.width = window.innerWidth - 10;
canvas.height = window.innerHeight - 50;

class Game {
    constructor() {
        this.width = canvas.width;
        this.height = canvas.height;
        this.score = 0;
        this.topScore = 0;
        this.dots = [];
        this.playing = false;
        this.dotSize = 8;
        this.total = document.location.hash ? document.location.hash.replace('#','') : 50; 
        this.plays = 1;
    }

    start() {
        let side = 0;
        for(var i = 0; i < this.total; i++) {
            side = side === 0 ? 1 : 0;
            this.addDot(side);
        }
        this.playing = true;
        window.requestAnimationFrame(loop);
    }

    reset() {
        this.plays++;
        this.dots.length = 0;
        this.score = 0;
        player.reset();
        this.start();
    }

    showMessage(text) {
        ctx.font = `30px Arial`;
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.textAlign = "center";
        ctx.fillText(text, game.width / 2, game.height / 2);
    }

    end() {
        this.playing = false;
        this.showMessage(`Game Over! ${inputLabel} to play again`);
    }

    win() {
        this.playing = false;
        this.showMessage(`You Win! ${inputLabel} to play again`);
    }

    addScore(v) {
        this.score+=v;
        if(this.score > this.topScore) this.topScore = this.score;
    }

    addDot(side) {
        this.dots.push(new Dot(this.dotSize, side));
    }

    removeDot(dot) {
        this.dots.splice(this.dots.findIndex((s) => s === dot), 1);
    }
}

class Player {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.side = 0;
        this.color = 'rgba(255,0,0,100)';
        this.reset();
    }

    reset() {
        this.width = 16;
        this.height = 16;
    }

    setInvincible(flag) {
        clearInterval(this.invincible);
        if(flag) {              
            let tick = 0;
            let dir = 1;
            this.invincible = setInterval(() => {
                tick+=dir;
                this.alpha = tick * 10;
                this.applyColor();
                if(tick>=10) dir = -1
                if(tick<=0)  dir = 1;
            }, 10);
        } else {
            this.alpha = 100;
            this.invincible = false;
            this.applyColor();
        }
    }

    grow() {
        this.width+=1;
        this.height+=1;
    }

    shrink() {
        this.width-=1;
        this.height-=1;
    }

    flip() {
        this.side = this.side === 0 ? 1 : 0;
        this.applyColor();
    }

    applyColor() {
        this.color = this.side === 0 ? `rgba(255,0,0,${this.alpha/100})` : `rgba(0,0,0,${this.alpha/100})`;
    }
}

class Dot {
    constructor(size, side) {
        this.width = size;
        this.height = size;
        this.color = side === 0 ? 'red' : 'black';
        this.side = side;
        this.dir = ~~(Math.random()*4);
        if(this.dir === 0) { this.y = game.height + game.dotSize + randomBuffer(); this.x = ~~(Math.random() * game.width);  }
        if(this.dir === 1) { this.x = game.dotSize * -1 + randomBuffer() * - 1;    this.y = ~~(Math.random() * game.height); }
        if(this.dir === 2) { this.y = game.dotSize * -1 + randomBuffer() * - 1;    this.x = ~~(Math.random() * game.width);  }
        if(this.dir === 3) { this.x = game.width + game.dotSize + randomBuffer();  this.y = ~~(Math.random() * game.height); }
        this.moveRate = Math.random()*2+1;
    }
}

var player = new Player();
var game = new Game();

document.addEventListener('mousemove', function(e) {
    player.x = e.offsetX - player.width / 2;
    player.y = e.offsetY - player.height / 2;
});

document.addEventListener('touchmove', function(e) {
    player.x = (e.touches[0].clientX - player.width / 2) - 100;
    player.y = (e.touches[0].clientY - player.height / 2) - 100;
  e.preventDefault();
});

document.addEventListener(inputAction, function(e) {
    if(game.playing) {
        player.flip();
    } else {
        game.reset();
        gameCountElem.innerHTML = game.plays.toString();
    }
});

function drawDot(s) {
    if(s.color === 'red') {
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x, s.y, game.dotSize, game.dotSize);
    } else {
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x, s.y, game.dotSize, game.dotSize);
        ctx.fillStyle = 'white';
        ctx.fillRect(s.x+1, s.y+1, game.dotSize-2, game.dotSize-2);
    }
}

function loop() {
    if(!game.playing) return;
    ctx.clearRect(0, 0, game.width, game.height);
    game.dots.forEach((s) => {
        if(s.dir===0) s.y -= s.moveRate; // move up
        if(s.dir===1) s.x += s.moveRate; // move right
        if(s.dir===2) s.y += s.moveRate; // move down
        if(s.dir===3) s.x -= s.moveRate; // move left

        drawDot(s);

        if(s.dir===0 && s.y < game.dotSize) {              game.addDot(s.side); game.removeDot(s); }
        if(s.dir===1 && s.x > game.width + game.dotSize) { game.addDot(s.side); game.removeDot(s); }
        if(s.dir===2 && s.y > game.height) {               game.addDot(s.side); game.removeDot(s); }
        if(s.dir===3 && s.x < game.dotSize) {              game.addDot(s.side); game.removeDot(s); }

        if(!player.invincible) {
            if(s.x < player.x + player.width && s.x + s.width > player.x && s.y < player.y + player.height && s.height + s.y > player.y) {
                if(s.side === player.side) {
                    player.grow();
                    game.removeDot(s);
                    game.addScore(1);
                    if(game.score === game.total) {
                        game.win();
                    }
                    scoreElem.innerHTML = game.score.toString() + ' / ' + game.total;
                    topScoreElem.innerHTML = game.topScore.toString();
                } else {
                    console.log('lose');
                    game.end();
                }
            }
        }
    });
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    window.requestAnimationFrame(loop)
}

game.start();
player.setInvincible(true);
setTimeout(() => player.setInvincible(false), 1500);