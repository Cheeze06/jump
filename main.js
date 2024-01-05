var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

canvas.width = window.innerWidth - 100;
canvas.height = window.innerHeight - 100;

var background_sound = new Audio('background_sound.mp3');
var jump_sound = new Audio('mario_jump.mp3');
var gameover_sound = new Audio('end.mp3');

var backgrounds = [
    'background1.jpg',  // Default background
    'background2.jpg'  // New background for score >= 100
];


var showBossText = false; // Variable to control boss text visibility
var bossTextTimer = 0;    // Timer to control how long the boss text is visible


var currentBackground = 0;  // Index of the current background

var img_background = new Image();
img_background.src = backgrounds[currentBackground];
var back = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,

    draw() {
        ctx.drawImage(img_background, this.x, this.y, this.width, this.height)
    }
}
back.draw();

var img_user = [];
var img1 = new Image();
img1.src = 'mario_img1.png';
var img2 = new Image();
img2.src = 'mario_img2.png';
var img3 = new Image();
img3.src = 'mario_img3.png';
var img4 = new Image();
img4.src = 'mario_img4.png';
img_user = [img1, img2, img3, img4];

var user = {
    x: 10,
    y: 275,
    width: 100,
    height: 180,
    img_index: 0,

    draw(a) {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        if (a % 5 == 0) {
            this.img_index = (this.img_index + 1) % 3;
        }
        if (user.y < 250) {
            ctx.drawImage(img_user[2], this.x, this.y, this.width, this.height);
        }
        else {
            ctx.drawImage(img_user[this.img_index], this.x, this.y, this.width, this.height);
        }
    }
}
user.draw(0);

var img_koopa = new Image();
img_koopa.src = 'koopa.png';

var users = {
    x: 1200,
    y: 260,
    width: 200, // Adjust the width to match the koopa image size
    height: 200, // Adjust the height to match the koopa image size

    draw() {
        ctx.drawImage(img_koopa, this.x, this.y, this.width, this.height);
    }
}

users.draw();


var img_bomb = new Image();
img_bomb.src = 'goomba.png';

class Bomb {
    constructor() {
        // Set x coordinate randomly within the canvas width
        this.x = canvas.width + Math.random() * 500;
        this.y = 385;
        this.width = 70;
        this.height = 70;

        // Set a random speed for each bomb
        this.speed = Math.random() * 4 + 1; // Adjust the speed range as needed
    }

    draw() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(img_bomb, this.x, this.y, this.width, this.height);
    }

    move() {
        // Move the bomb to the left based on its speed
        this.x -= this.speed;
    }
}

var timer = 0;
var bombs = [];
var jumpingTimer = 0; //60프레임 세주는 변수
var animation;

var img_koopa_flame = new Image();
img_koopa_flame.src = 'koopa_flame.png';

class KoopaFlame {
    constructor() {
        // Set x coordinate randomly within the canvas width
        this.x = 1150;
        this.y = 300;
        this.width = 120;
        this.height = 50;
        this.followPlayerTimer = 0;  // Timer to track the follow duration
        this.followPlayerDuration = 30;  // Follow player for 30 frames (adjust as needed)
        this.speed = Math.random() * 4 + 1; // Adjust the speed range as needed
    }

    draw() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(img_koopa_flame, this.x, this.y, this.width, this.height);
    }

    move() {
        if (this.followPlayerTimer < this.followPlayerDuration) {
            // Follow the player for the initial duration
            this.x -= this.speed;
            this.y = user.y;  // Follow the player's y value
            this.followPlayerTimer++;
        } else {
            // After the follow duration, move with a fixed y value
            this.x -= this.speed;
        }
    }
}


var koopaFlames = []; // Array to store koopa flames
var koopaFlameTimer = 0; // Timer to control the appearance of koopa flames

function frameSecond() {
    animation = requestAnimationFrame(frameSecond);

    // 프레임 돌때마다 프레임에 있는 요소들 clear 해주는 함수
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    timer++;

    // 배경 추가
    back.draw();

    // 점수 추가
    gameScore();

    // 배경음악 재생
    background_sound.play();

    // Check and change background based on the score
    changeBackground(Math.round(timer / 50));

    if (timer % 150 == 0) {
        var bomb = new Bomb();
        bombs.push(bomb);
    }

    if (showBossText) {
        // Display boss text for 50 frames (adjust as needed)
        if (bossTextTimer < 10) {
            ctx.font = '30px Arial';
            ctx.fillStyle = 'red';
            ctx.fillText('goomba is sleep!', canvas.width / 2 - 60, canvas.height / 2);
            bossTextTimer++;
        } else {
            // After 50 frames, hide the boss text
            showBossText = false;
            bossTextTimer = 0;
        }
    }

    bombs.forEach((b, i, o) => {
        if (b.x + b.width < 0) {
            o.splice(i, 1);
        }
        b.move(); // Move the bomb
        bomb_gameScore(b.x);
        collision(user, b);
        b.draw();
    });

    // Check and change background based on the score
    changeBackground(Math.round(timer / 50));

    // Check if it's time to create a koopa flame
    if (timer % 200 == 0) {
        var koopaFlame = new KoopaFlame();
        koopaFlames.push(koopaFlame);
    }

    koopaFlames.forEach((kf, i, o) => {
        if (kf.x + kf.width < 0) {
            o.splice(i, 1);
        }
        kf.move(user.y);  // 플레이어의 y값을 전달하여 이동
        collision(user, kf);
        kf.draw();
    });

    // Draw the users object
    users.draw();

    if (jumping == true) {
        user.y = user.y - 4;
        jumpingTimer++;
    }
    if (jumpingTimer > 40) {
        jumping = false;
        jumpingTimer = 0;
    }
    if (jumping == false && user.y < 275) {
        user.y = user.y + 2;
    }
    user.draw(timer);
}

frameSecond();

function changeBackground(score) {
    // Check if the score is 30 or more
    if (score >= 30) {
        // If the score is 30 or more, change the background to the new one
        currentBackground = 1;  // Index of the new background
        img_background.src = backgrounds[currentBackground];

        // Reset the bombs array
        bombs = [];
    }
}

// 충돌 확인 코드
function collision(user, bomb) {
    var x_diff = bomb.x - (user.x + user.width);
    var y_diff = (bomb.y + user.height) - user.y;
    if (x_diff < 0 && y_diff <= 0) {
        // 프레임 돌때마다 프레임에 있는 요소들 clear 해주는 함수
        //ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animation);

        ctx.fillStyle = 'red';
        ctx.font = '60px Cooper';

        ctx.fillText('Game Over', canvas.width / 5, canvas.height / 5);
        background_sound.pause();
        gameover_sound.play();
    }
}

var jumping = false;
document.addEventListener('keydown', function (e) {
    if (e.code == "Space") {
        jumping = true;
        jump_sound.play();
    }
})

function gameScore() {
    ctx.font = '20px 맑은 고딕';
    ctx.fillStyle = 'black';
    ctx.fillText('SCORE : ' + Math.round(timer / 50), 10, 30);
}


var score = 0;
function bomb_gameScore(x) {
    ctx.font = '20px 맑은 고딕';
    ctx.fillStyle = 'black';

    if (x == 0) {
        score++;
    }
    ctx.fillText('SCORE: ' + score, 10, 60)
}

function changeBackground(score) {
    // Check if the score is 30 or more
    if (score >= 30) {
        // If the score is 30 or more, change the background to the new one
        currentBackground = 1;  // Index of the new background
        img_background.src = backgrounds[currentBackground];

        // Reset the bombs array
        bombs = [];

        // Show boss text when changing to the boss map
        showBossText = true;
    }
}
