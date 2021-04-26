const FPS = 30;
const SAVE_KEY_SCORE = 'highscore'; // salvar local storage key da maior pontuacao
const NO_OF_HIGH_SCORES = 10;
const HIGH_SCORES = 'highScores';

let MUSIC_ON = true; // sem som o jogo
let SOUND_ON = true; // sem som o jogo
const GAME_LIVES = 5; // inicia com numero de vidas 

const SHIP_EXPLODE_DUR = 0.3; // duração de explosão da nave 
const SHIP_INV_DUR = 3; // duração do renascimento
const SHIP_BLINK_DUR = 0.1; // duração da nave invisível por seg
const SHIP_SIZE = 30; // nave em pixels
const SHIP_THRUST = 5; //impulso da nave em pixels
const TURN_SPEED = 360; //velocidade de virar por graus

const LASER_DIST = 0.4; // maximo de distancia de laser até sair da tela
const LASER_MAX = 10; // maximo de numero de laser
const LASER_SPD = 700; // velocidade do laser in pixels por seg
const LASER_EXPLODE_DUR = 0.1; // duração de explosão do laser in seconds


const ROIDS_JAG = 0.4; // serrilhamento do asteroid 0=sem e 1 é mt
const ROIDS_SIZE = 100; // tamanho do asteroid inicial em pixels
const ROIDS_SPD = 50; // máximo de velocidade por fps em pixels
const ROIDS_VERT = 10; // numero de vertices do asteroid
const ROIDS_NUM = 2; // numero de asteroids iniciais
const ROIDS_PTS_LGE = 20 ; // Ponto pelos asteroids maiores
const ROIDS_PTS_MED = 50 ; // Ponto pelos asteroids médios 
const ROIDS_PTS_SML = 100 ; // Ponto pelos asteroids menores  


const FRICTION = 0.7; // fricção esta entre 0-1 pra parar a nave
const SHOW_BOUNDING = false; // mostra ou não colision bounding
const SHOW_CENTRE_DOT = false; // mostra ou não pontinho vermelho no centro da tela
const TEXT_FADE_TIME = 2.5; // text fade time 
const TEXT_SIZE = 40; // texto tamanho da fonte

let special = true;
let restart, nickName;


function Musica() {
  MUSIC_ON = !MUSIC_ON;
  if(!MUSIC_ON) {
    document.getElementById('musica').innerText = 'Musica OFF';
  }
  else{
    document.getElementById('musica').innerText = 'Musica ON';
  }
}

function Efeitos() {
  SOUND_ON = !SOUND_ON;
  if(!SOUND_ON) {
    document.getElementById('efeito').innerText = 'Efeitos OFF';
  }
  else{
    document.getElementById('efeito').innerText = 'Efeitos ON';
  }
}

document.getElementById("restart").addEventListener(('click'), () => {
  restart = true
  newGame();
  showHighScores();
});


function showHighScores() {
  let highScores = JSON.parse(localStorage.getItem(HIGH_SCORES)) || [];
  let highScoreList = document.getElementById(HIGH_SCORES);
  
  if(highScoreList != null){
    highScoreList.innerHTML = '';
  }

  highScores.map((score) => {
    let li = document.createElement('li');
    li.className = 'rank';
    li.innerText = `${score.score}  -  ${score.nickName}`;
    highScoreList.appendChild(li);
  })
  // .join('');
  console.log(highScoreList);
}

function checkHighScore(score) {
  if(over == true){    
    const highScores = JSON.parse(localStorage.getItem(HIGH_SCORES)) || [];
    const lowestScore = highScores[NO_OF_HIGH_SCORES - 1]?.score ?? 0;
    
    console.log(lowestScore);


    if ((score > lowestScore )&& over === true) {
      saveHighScore(score, highScores); // TODO
      // showHighScores(); // TODO  
    }
  }
}


function saveHighScore(score, highScores) {
  if(nickName == undefined){
    nickName = prompt('Bom score manda teu nick pra salvar:');
  }

  const newScore = { score, nickName };
  
  
  // 1. Add to list
  let exist = highScores.find((item) => (item.nickName === nickName) && (item.score === score) );
  if (!exist) {
    highScores.push(newScore);
  }

  // 2. Sort the list
  highScores.sort((a, b) => b.score - a.score);
  
  // 3. Select new list
  highScores.splice(NO_OF_HIGH_SCORES);
  
  // 4. Save to local storage
  localStorage.setItem(HIGH_SCORES, JSON.stringify(highScores));
};

function Btn(){
  document.getElementById("nick").style.display= "none";
  document.getElementById('startButton').style.display= "none";
  start();
};

document.getElementById("nick").addEventListener(('change'), (e) =>{
  nickName = e.target.value;
});

/** @type {HTMLCanvasElement} */
let canv = document.getElementById('gameCanvas');
let ctx = canv.getContext("2d");

let fxExplode = new Sound('sounds/explode.m4a');
let fxHit = new Sound('sounds/hit.m4a', 5, 0.5);
let fxLaser = new Sound('sounds/laser.m4a', 5, 0.09);
let fxThrust = new Sound('sounds/thrust.wav', 5, 0.2);

let music = new Music('sounds/music-low.m4a','sounds/music-high.m4a');
let roidsLeft, roidsTotal;

let DM_width = 920;
let DM_height = 700;


function Redimencionar(){
  let widht = document.getElementById("width").value;
  let height = document.getElementById("height").value;
  console.log(height,widht);
  if((widht <= 1900 && widht >= 600) && (height <= 1000 && height >= 600) ){
    resizeCanvas(widht, height);
  }  
  else{
    alert('widht precisa está entre 600px à 1900px e height entre 1000px à 600px')
  }
}

function resizeCanvas(width, height) {
/** @type {HTMLCanvasElement} */
  let canv = document.getElementById('gameCanvas');
  canv.width = width;
  canv.height = height;
  DM_width = width;
  DM_height = height;
}

//  Parametros inicias do game
let level, lives, roids, over,auxScoreFlag, score, scoreHigh,ship, text, textAlpha;

newGame();

// configurar evento
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

function start() {
  setInterval(update, 1000 / FPS);
}

function createAsteroidBelt() {
  roids = [];
  roidsTotal = (ROIDS_NUM + level) * 7;
  roidsLeft = roidsTotal;
  let x,y;
  for (let i = 0; i < ROIDS_NUM + level; i++) {
    do{
      x = Math.floor(Math.random() * canv.width);
      y = Math.floor(Math.random() * canv.height);
    }while(distBetweenPoints(ship.x, ship.y, x, y) < ROIDS_SIZE * 2 + ship.r);
    roids.push(newAsteroid(x, y, Math.ceil( ROIDS_SIZE / 2)));
    
  }
}

function destroyAsteroid(index) {

  let x = roids[index].x;
  let y = roids[index].y;
  let r = roids[index].r;

  // dividir asteroid em dois se necessário
  if(r == Math.ceil( ROIDS_SIZE / 2)){
    roids.push(newAsteroid(x,y,Math.ceil(ROIDS_SIZE / 4)));
    roids.push(newAsteroid(x,y,Math.ceil(ROIDS_SIZE / 4)));
    score += ROIDS_PTS_LGE;
    auxScoreFlag += ROIDS_PTS_LGE;
  }
  else if(r == Math.ceil(ROIDS_SIZE / 4)){
    roids.push(newAsteroid(x,y,Math.ceil(ROIDS_SIZE / 8)));
    roids.push(newAsteroid(x,y,Math.ceil(ROIDS_SIZE / 8)));
    score += ROIDS_PTS_MED;
    auxScoreFlag += ROIDS_PTS_MED;
  }
  else{
    score += ROIDS_PTS_SML;
    auxScoreFlag += ROIDS_PTS_SML;
  }

  if(auxScoreFlag >= 3000 && ship.power == false){
    special = true;    
  }

  if(score > scoreHigh){
    scoreHigh = score;
    localStorage.setItem(SAVE_KEY_SCORE, JSON.stringify({
      score: scoreHigh,
      nick: nickName,
    }));
  }

  // destroir asteroid
  roids.splice(index, 1);
  fxHit.play();

  roidsLeft--;
  music.setAsteroidRatio(roidsLeft == 0 ? 1 : roidsLeft / roidsTotal);

  // novo level quando não tiver mais asteroid
  if(roids.length == 0){
    level++;
    newLevel();
  }
}

document.onload(showHighScores());

function distBetweenPoints(x1, y1, x2, y2){
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)); 
}

function drawShip(x, y, a, colour = "white"){
  ctx.strokeStyle = colour; // bordas da nave
  ctx.lineWidth = SHIP_SIZE / 20;
  ctx.beginPath();
  ctx.moveTo( // nariz da nave
    x + 5 / 3 * ship.r * Math.cos(a),
    y -  5 / 3 * ship.r * Math.sin(a),
  );
  ctx.lineTo( // nave traseira esquerda
    x - ship.r * ( 3 / 3 * Math.cos(a) + Math.sin(a)),
    y + ship.r * ( 3 / 3 * Math.sin(a) - Math.cos(a))
  );
  ctx.lineTo( // nave traseira direita
    x - ship.r * ( 3 / 3 * Math.cos(a) - Math.sin(a)),
    y + ship.r * ( 3 / 3 * Math.sin(a) + Math.cos(a))
  );
  ctx.closePath();
  ctx.stroke();

  if(ship.power){
    ctx.fillStyle = gerar_cor(8);
    ctx.fill();
  }
  else{
    ctx.fillStyle = colour;
    ctx.fill();
  } 
}

function explodeShip() {
  ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
  fxExplode.play();
}

function gameOver() {
  ship.dead = true;
  text = 'Game Over';
  textAlpha = 1.0;
  over = true;
  checkHighScore(score);
}

function keyDown(/** @type {KeyboardEvent} */ ev ) {
  
  if(ship.dead){
    return;
  }

  switch(ev.key){
    case ' ':
      // Disparo laser
      shootLaser();
      break;
    case 'ArrowLeft':
      //roda nave pra esquerda
      ship.rot = TURN_SPEED / 245 * Math.PI / FPS;
      break;
    case 'ArrowUp':
      //faz a nave andar
      ship.thrusting = true;
      break;
    case 'ArrowRight':
      //roda nave pra direita
      ship.rot =  - TURN_SPEED / 245 * Math.PI / FPS;
      break;
    case 'ArrowDown':
      if(special){
        ship.power = true;
        special = false;
        auxScoreFlag = 0;
      } 
      if(ship.power){
        console.log(special);
        setTimeout(()=>{
          special = false;
          ship.power = false;
        }, 6000)
      }
      break;
  }
}

function keyUp(/** @type {KeyboardEvent} */ ev ) {

  if(ship.dead){
    return;
  }

  switch(ev.key){

    case ' ':
      // Disparo laser novamente permitir
      ship.canShoot = true;
      break;
    case 'ArrowLeft':
      //parar a nave pra esquerda
      ship.rot = 0;
      break;
    case 'ArrowUp':
      //faz a nave parar andar
      ship.thrusting = false;
      break;
    case 'ArrowRight':
      //parar a nave pra direita
      ship.rot =  - 0;
      break;
    case 'ArrowDown':
      // ship.power = false;
      break;
  }
}

function gerar_cor(opacidade = 1) {
  let r = Math.random() * 255;
  let g = Math.random() * 255;
  let b = Math.random() * 255;
  
  return `rgba(${r}, ${g}, ${b}, ${opacidade})`;
}

// novo asteroid
function newAsteroid(x, y, r) {
  if(!ship.dead){
    let lvlMult = 1;//1 + 0.1 * level;
    if(level >= 5){
      lvlMult += 0.8; 
    }
    let roid = {
      x: x,
      y: y,
      xv: Math.random() * ROIDS_SPD * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
      yv: Math.random() * ROIDS_SPD * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
      r,
      a: Math.random() * Math.PI * 2, 
      vert: Math.floor(Math.random() * ( ROIDS_VERT + 1 ) + ROIDS_VERT / 2),
      offs: []
    };

    // criando vertices offs do array
    for (let i = 0; i < roid.vert; i++) {
      roid.offs.push(Math.random() * ROIDS_JAG * 2 + 1 - ROIDS_JAG);
    }

    return roid;
  }
}

function newGame() {
  level = 0; 
  special = true;
  lives = GAME_LIVES;
  score = 0;
  auxScoreFlag = score;
  ship = newShip();
  over = true;

  let scoreString = JSON.parse(localStorage.getItem(SAVE_KEY_SCORE));
  // const highScoreString = localStorage.getItem (HIGH_SCORES); 
  // const highScores = JSON.parse (highScoreString) || [];

  // const lowestScore = highScores[NO_OF_HIGH_SCORES-1]?.score ?? 0;

  // console.log(lowestScore);

  if(scoreString == null){
    scoreHigh = 0;
  }
  else{
    scoreHigh = parseInt(scoreString.score);
  }
  
  newLevel();
}

function newLevel(){
  if(!special){}
  text = "Level " + (level + 1);
  textAlpha = 1.0;
  createAsteroidBelt();
}

function newShip() {
  return  {
    x: canv.width / 2,
    y: canv.height /2,
    r: SHIP_SIZE / 2,
    a: 90 / 180 * Math.PI, // converter para radianos
    blinkNumber: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),
    blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
    canShoot: true,
    dead: false,
    lasers: [],
    rot: 0,
    thrusting: false,
    power: false,
    explodeTime: 0,
    thrust:{
      x:0,
      y:0
    },
  };
}

function shootLaser() {
  // criar laser 
  if(ship.canShoot && ship.lasers.length < LASER_MAX){
    ship.lasers.push({ // topo da nave pra pegar o tiro
      x:  ship.x + 6 / 3 * ship.r * Math.cos(ship.a),
      y:  ship.y -  6 / 3 * ship.r * Math.sin(ship.a),
      xv: LASER_SPD * Math.cos(ship.a) / FPS,
      yv: - LASER_SPD * Math.sin(ship.a) / FPS,
      dist: 0,
      explodeTime: 0,
    });
    fxLaser.play();
  }

  // prevenir novos disparos
  ship.canShoot = false;
}

function Music(srcLow, srcHigh){
  this.soundLow = new Audio(srcLow);
  this.soundHigh = new Audio(srcHigh);
  this.low = true;

  this.tempo = 1.0;
  this.beatTime = 0;

  this.play = function (){
    if(MUSIC_ON){     
      if(this.low){
        this.soundLow.play();
      }
      else{
        this.soundHigh.play();
      }
      this.low = !this.low;
    }
  }

  this.setAsteroidRatio = function (ratio){
    this.tempo = 1.0 - 0.75 * (1.0 - ratio);
  }

  this.tick = function (){ 
    if(this.beatTime == 0){
      this.play();
      this.beatTime = Math.ceil(this.tempo * FPS);
    }
    else{
      this.beatTime--;
    }
   }
}

function Sound(src, maxStreams = 1, vol = 1.0){
  this.streamNum = 0;
  this.streams = [];
  for (let i = 0; i < maxStreams; i++) {
    this.streams.push(new Audio(src)); 
    this.streams[i].volume = vol;
  }

  this.play = function() {
    if(SOUND_ON){
      this.streamNum = (this.streamNum + 1) % maxStreams;
      this.streams[this.streamNum].play();
    }
  }

  this.stop = function(){
    this.streams[this.streamNum].pause();
    this.streams[this.streamNum].currentTime = 0;
  }
}

function update() {
  let blinkOn = ship.blinkNumber % 2 == 0;
  let exploding = ship.explodeTime > 0;

  
  music.tick();

  // desenhar o espaço
  ctx.fillStyle = '#000';
  ctx.fillRect(0,0, DM_width * canv.width, canv.height * DM_height);

  // inpulso da nave

  if(ship.thrusting && !ship.dead){
    let lvlSPD = 1; //0.1 * level;
    if(level >= 5){
      lvlSPD += 0.8; 
    }
    ship.thrust.x += (SHIP_THRUST + lvlSPD) * Math.cos(ship.a) / FPS;
    ship.thrust.y -= (SHIP_THRUST + lvlSPD) * Math.sin(ship.a) / FPS;
    fxThrust.play();
    
    //desenhar impulso
    if(!exploding && blinkOn){    
      
      if(ship.blinkNumber > 0){
        ctx.fillStyle = "#3eb7d0";
        ctx.strokeStyle = 'white';
      }else{
        ctx.fillStyle = "#ff9000";
        ctx.strokeStyle = 'red';
      }

      ctx.lineWidth = SHIP_SIZE / 10;
      ctx.beginPath();
      ctx.moveTo( // traseeira esquerda
        ship.x - ship.r * ( 3 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
        ship.y + ship.r * ( 3 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
      );
      ctx.lineTo( // nave traseira esquerda
        ship.x - ship.r * 6 / 3 * Math.cos(ship.a),
        ship.y + ship.r * 6 / 3 * Math.sin(ship.a),
      );
      ctx.lineTo( // nave traseira direita
        ship.x - ship.r * ( 3 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
        ship.y + ship.r * ( 3 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

    }
  }
  else{
    ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
    ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    fxThrust.stop();
  }


  // desenhar nave triangular
  if(!exploding){
  
    if(blinkOn && !ship.dead){
      drawShip(ship.x,ship.y, ship.a,);
    }
    
    // piscando a nave 
    if(ship.blinkNumber > 0){
      // reduzir tempo do piscar
      ship.blinkTime--;
      // reduzir numero de piscadas
      if(ship.blinkTime == 0){
        ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
        ship.blinkNumber--;
      }
    }
  } else { 
    // desenhar explosão
    ctx.fillStyle = 'darkred';
    ctx.beginPath();
    ctx.arc(ship.x + 1, ship.y + 1, ship.r * 1.7, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(ship.x + 1, ship.y + 1, ship.r * 1.4, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(ship.x + 1, ship.y + 1, ship.r * 1.1, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(ship.x + 1, ship.y + 1, ship.r * 0.8, 0, Math.PI * 2, false);
    ctx.fill();

    while(ship.blinkNumber > 0){
      ctx.fillStyle =  gerar_cor(8);
    }
    ctx.beginPath();
    ctx.arc(ship.x + 1, ship.y + 1, ship.r * 0.5, 0, Math.PI * 2, false);
    ctx.fill();

  }
  
  

  if(SHOW_BOUNDING){
    ctx.strokeStyle = 'lime';
    ctx.beginPath();
    ctx.arc(ship.x + 1, ship.y + 1, ship.r, 0, Math.PI * 2, false);
    ctx.stroke();
  }

  // desenhar asteroids
  let x, y, r, a, vert, offs;
  for (let i = 0; i < roids.length; i++) {
    
    ctx.strokeStyle = 'White';
    ctx.lineWidth = SHIP_SIZE / 20;

    // pegar props do asteroid
    x = roids[i].x;
    y = roids[i].y;
    r = roids[i].r;
    a = roids[i].a;
    vert = roids[i].vert;
    offs = roids[i].offs;

    // desenhar o caminho
    ctx.beginPath();
    ctx.moveTo(
      x + r * offs[0] * Math.cos(a),
      y + r * offs[0] * Math.sin(a),
    );
    
    // desenhar o poligono
    for (let j = 1; j < vert; j++) {
      ctx.lineTo(
        x + r * offs[j] * Math.cos(a + j  * Math.PI * 2 / vert),
        y + r * offs[j] * Math.sin(a + j  * Math.PI * 2 / vert),
      );
    }
    ctx.closePath();
    ctx.stroke();

    if(SHOW_BOUNDING){
      ctx.strokeStyle = 'lime';
      ctx.beginPath();
      ctx.arc( x + 1,  y + 1,  r, 0, Math.PI * 2, false);
      ctx.stroke();
    }

  }

  if(SHOW_CENTRE_DOT){
    ctx.fillStyle = 'red';
    ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
  }

  // desenhar o lasers
  for(var i = 0; i < ship.lasers.length; i++){
    if(ship.lasers[i].explodeTime == 0 ){
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
      ctx.fill();
    }
    else{
      // desenhar explosão
      ctx.fillStyle = 'orangered';
      ctx.beginPath();
      ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false);
      ctx.fill();

      ctx.fillStyle = 'salmon';
      ctx.beginPath();
      ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.5, 0, Math.PI * 2, false);
      ctx.fill();

      ctx.fillStyle = 'pink';
      ctx.beginPath();
      ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false);
      ctx.fill();

    }  
  }

  // desenhar o texto na tela
  if(textAlpha >= 0){
    ctx.fillStyle = "rgba(255,255,255,"+(textAlpha)+")"; 
    ctx.font = "small-caps " + TEXT_SIZE + "px dejavu sans mono";
    ctx.fillText(text, canv.width / 2, canv.height * 0.75);
    textAlpha -= (1.0 / TEXT_FADE_TIME / FPS);
  }
  else if(ship.dead && over == true){  
    gameOver();
    over = false
  }

  if(special === true){
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,00,1)"; 
    ctx.font = "small-caps " + TEXT_SIZE * 0.60 + "px dejavu sans mono";
    ctx.fillText("ScorePower:"+auxScoreFlag, canv.width - SHIP_SIZE / 2, canv.height - 20);
  }else{
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,0,0,1)"; 
    ctx.font = "small-caps " + TEXT_SIZE * 0.60  + "px dejavu sans mono";
    ctx.fillText("ScorePower:"+auxScoreFlag, canv.width - SHIP_SIZE / 2, canv.height - 20);
  }

  // desenhar vidas do jogo
  let lifeColour;
  for (let i = 0; i < lives; i++) {
    // desenhar nave
    lifeColour = exploding && i == lives -1 ? 'red' : 'white';
    drawShip(SHIP_SIZE + i * SHIP_SIZE * 1.2, SHIP_SIZE,  0.5 * Math.PI, lifeColour);
    
  }

  // desenhar a pontuação do game
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "white"; 
  ctx.font = TEXT_SIZE + "px dejavu sans mono";
  ctx.fillText(score, canv.width - SHIP_SIZE / 2, SHIP_SIZE);

  // desenhar pontuação mais alta do game
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "white"; 
  ctx.font = (TEXT_SIZE * 0.75) + "px dejavu sans mono";
  ctx.fillText('Top Score '+scoreHigh, canv.width / 2, SHIP_SIZE);

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "white"; 
  ctx.font = (TEXT_SIZE * 0.75) + "px dejavu sans mono";
  ctx.fillText('Level '+(level+1), 0 , canv.height - 20 ); 

  ctx.fillStyle = "rgba(255,255,255,"+(textAlpha)+")"; 
  ctx.font = "small-caps " + TEXT_SIZE + "px dejavu sans mono";
  ctx.fillText(text, canv.width / 2, canv.height * 0.75);
  textAlpha -= (1.0 / TEXT_FADE_TIME / FPS);
  ctx.fill(); 
  
  
  
  
  // detectar o tiro do laser no asteroid
  let ax,ay,ar,lx,ly;
  for (let i = roids.length - 1; i >= 0 ; i--) {
    
    // pegar as prop astroid 
    ax = roids[i].x;
    ay = roids[i].y;
    ar = roids[i].r;

    // loop tirando lasers
    for (let j = ship.lasers.length -1; j >=0 ; j--) {
      
      // pegar prop lasers
      lx = ship.lasers[j].x;
      ly = ship.lasers[j].y;
      
      // detectar o choque
      if(ship.lasers[j].explodeTime === 0 && distBetweenPoints(ax,ay,lx,ly) < ar){
        
        
        // destroir asteroid e laser da explosão
        destroyAsteroid(i);
        ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * FPS);
        break;
      }

    }    
  }

  // checar colisão com asteroid
  
  if(!exploding){
    if(ship.blinkNumber == 0 && !ship.dead){
      for (let i = 0; i < roids.length; i++) {
        if(distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r){
          if(!ship.power){
            explodeShip(); 
            special = true;
            destroyAsteroid(i);
            break;
          }
        }
      }
    }

    // rodar a nave
    ship.a += ship.rot;
    
    // movimentação da nave
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;
  }     
  else{
    ship.explodeTime--;

    if(ship.explodeTime == 0){
      lives--;
      if(lives == 0){
        gameOver();
      }
      else{
        ship = newShip();
      }
    }
  }

  // borda da tela
  if(ship.x <= 0 - ship.r){
    ship.x = canv.width + ship.r;
  }
  else if(ship.x >= canv.width + ship.r){
    ship.x =  0 - ship.r;
  }

  if(ship.y <= 0 - ship.r){
    ship.y = canv.height + ship.r;
  }
  else if(ship.y > canv.height + ship.r){
    ship.y =  0 - ship.r;
  }

  // mover lasers 
  for (let i = ship.lasers.length - 1; i >= 0; i--) {      
    
    // checar distancia do tiro pra remover da tela
    if( ship.lasers[i].dist > LASER_DIST * canv.width){
      ship.lasers.splice(i, 1);
      continue;
    }

    // lidando com a explosão
    if(ship.lasers[i].explodeTime > 0){
      ship.lasers[i].explodeTime--;
      
      // destroir laser depois da sua duração
      if(ship.lasers[i].explodeTime == 0){
        ship.lasers.splice(i, 1);
        continue;
      }
    }
    else{
      // mover tiro
      ship.lasers[i].x += ship.lasers[i].xv;
      ship.lasers[i].y += ship.lasers[i].yv; 

      // calculo pra distancia do laser
      ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv,2));
    }
    
    // lidar com o a borda da tela e o tiro
    if( ship.lasers[i].x < 0 ){
      ship.lasers[i].x = canv.width;
    }
    else if( ship.lasers[i].x > canv.width){
      ship.lasers[i].x = 0;
    }
    if( ship.lasers[i].y < 0 ){
      ship.lasers[i].y = canv.height;
    }
    else if( ship.lasers[i].y > canv.height){
      ship.lasers[i].y = 0;
    }
  }

  // mover asteroid
  for (let i = 0; i < roids.length; i++) {
    
    roids[i].x += roids[i].xv;
    roids[i].y += roids[i].yv;
    
    // lidar com linha da borda
    if(roids[i].x <= 0 - roids[i].r){
      roids[i].x = canv.width + roids[i].r;
    }
    else if(roids[i].x > canv.width + roids[i].r){
      roids[i].x = 0 - roids[i].r
    }
    if(roids[i].y <= 0 - roids[i].r){
      roids[i].y = canv.height + roids[i].r;
    }
    else if(roids[i].y > canv.height + roids[i].r){
      roids[i].y = 0 - roids[i].r
    }
  }
}
