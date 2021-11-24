// img
let cabeca;
let maca;
let bola;
let obstaculo = Array(2).fill(null);

// audio
let macaAudio;
let obstaculoAudio;
let bgm;
let gameOver;
let wins;

// obstaculo config
const obstaculoQnt = 10;
const obstaculo_x = [];
const obstaculo_y = [];

// localStorage
let players = localStorage.getItem("players")
  ? JSON.parse(localStorage.getItem("players"))
  : {
      nome: [],
      ponto: [],
    };
if (!localStorage.getItem("players"))
  localStorage.setItem("players", JSON.stringify(players));

let pontos;
let vida = 5;

//alimento
let maca_x = [];
let maca_y = [];
const macaQnt = 2;
const macaInv = -100;
let countComidasPraVida = 0;

const rangeDeErro = 10;

// start game config
let randomStart = Math.round(Math.random() * 2) % 2;
let paraEsquerda = randomStart ? 1 : 0;
let paraDireita = randomStart ? 0 : 1;
let paraCima = false;
let paraBaixo = false;
let noJogo = true;

// tela config
let tela;
let ctx;
let ATRASO = 140;

let bodyWidth = document.querySelector(".bodyClass").offsetWidth;
if (bodyWidth < 900) {
}
const TAMANHO_PONTO = 30;
const ALEATORIO_MAXIMO = 25;
const C_ALTURA = 900;
const C_LARGURA = 900;

// console.log(document.querySelector(".bodyClass").offsetHeight);
// console.log();

// move
const TECLA_ESQUERDA = 37;
const TECLA_DIREITA = 39;
const TECLA_ACIMA = 38;
const TECLA_ABAIXO = 40;

// cobra config
const cobraX = [];
const cobraY = [];

onkeydown = verificarTecla; // Define função chamada ao se pressionar uma tecla

iniciar(); // Chama função inicial do jogo

// Definição das funções

function iniciar() {
  tela = document.getElementById("tela");
  ctx = tela.getContext("2d");

  ctx.fillStyle = "#F24E1F";
  ctx.fillRect(0, 0, C_LARGURA, C_ALTURA);

  carregarImagens();
  carregarAudio();
  setTimeout(() => {
    bgm.play();
    bgm.loop = true;
    criarCobra();
    addNoJogo(obstaculo_x, obstaculo_y, obstaculoQnt, null, maca_x);
    addNoJogo(maca_x, maca_y, macaQnt, macaInv, obstaculo_x);
  }, ATRASO);

  setTimeout("cicloDeJogo()", ATRASO);
}

function carregarAudio() {
  obstaculoAudio = new Audio("./audio/Roblox Death Sound.mp3");
  macaAudio = new Audio("./audio/marioMoeda.mp3");
  bgm = new Audio("./audio/Sweden.mp3");
  gameOver = new Audio("./audio/gameOver.mp3");
  wins = new Audio("./audio/marioWins.mp3");
}

function carregarImagens() {
  cabeca = new Image();
  cabeca.src = "./img/cabeca.svg";

  bola = new Image();
  bola.src = "./img/ponto.svg";

  maca = new Image();
  maca.src = "./img/maca.svg";

  for (let i in obstaculo) {
    obstaculo[+i] = new Image();
    obstaculo[+i].src = `./img/obstaculo${+i + 1}.svg`;
  }
}

function criarCobra() {
  pontos = 3;

  //! Utilizar essa lógica para criação dos obstáculos/maças !!!!
  const posAleatoria = Math.random() * C_LARGURA - TAMANHO_PONTO;
  const a = posAleatoria - (posAleatoria % TAMANHO_PONTO);

  for (var z = 0; z < pontos; z++) {
    cobraX[z] = a - z * TAMANHO_PONTO;
    cobraY[z] = a;
  }
}

function addNoJogo(arrX, arrY, qnt, invisivel, ...arrColision) {
  if (!!arrX.find((a) => a === invisivel)) {
    arrX = arrX.map(() => null);
    arrY = arrY.map(() => null);
  }
  for (let i = 0; i < qnt; i++) {
    while (
      !arrX[i] ||
      !arrY[i] ||
      arrY[i] === cobraY[0] ||
      arrX[i] === cobraX[0]
    ) {
      // se já tiver sido comida, verificar se já foi spawnado
      while (true) {
        // evitar mesma posicao
        var r = Math.floor(Math.random() * ALEATORIO_MAXIMO);

        const value = r * TAMANHO_PONTO;

        if (!arrX.find((a) => a === value)) {
          for (let arr of arrColision)
            if (!arr.find((a) => a === value)) arrX[i] = value;
        } else break;
      }
      r = Math.floor(Math.random() * ALEATORIO_MAXIMO);
      arrY[i] = r * TAMANHO_PONTO;
      if (arrX.length === qnt) break;
    }
  }
  return [arrX, arrY];
}

function cicloDeJogo() {
  if (noJogo) {
    verificarColisao();
    mover();
    fazerDesenho();
    setTimeout("cicloDeJogo()", ATRASO);
  }
}

function aoComerMaca(index) {
  macaAudio.pause();
  macaAudio.play();
  pontos++;
  maca_x[index] = macaInv;
  maca_y[index] = macaInv;
  ATRASO -= 2;
  countComidasPraVida++;

  if (countComidasPraVida === 3) {
    countComidasPraVida = 0;
    vida++;
  }
  if (ATRASO >= 90) ATRASO = 50;
}

function macaDpsDeComerTd() {
  if (verificarQntdeMaca()) noJogo = false;
}

function aoColidirComObj(index) {
  vida--;
  console.log(vida);

  obstaculoAudio.play();

  obstaculo_x[index] = macaInv;

  if (vida === 0) {
    vida = 0;
    noJogo = false;
  }
}

function objColision(arrX, arrY, qnt, ...cb) {
  for (let i = 0; i < qnt; i++)
    if (cobraX[0] == arrX[i] || cobraX[0] + rangeDeErro == arrX[i])
      if (cobraY[0] == arrY[i] || cobraY[0] + rangeDeErro == arrY[i]) cb[0](i);

  cb = cb.slice(1);
  cb.forEach((fn) => fn());
}

function verificarQntdeMaca() {
  let count = 0;
  for (let i = 0; i < macaQnt; i++) if (maca_x[i] === macaInv) count++;
  return count === maca_x.length;
}

function ajustarPosicaoDaCobra(a, b) {
  cobraX[0] = a;
  cobraY[0] = b;
}

function verificarColisao() {
  for (var z = pontos; z > 0; z--)
    if (z > 4 && cobraX[0] == cobraX[z] && cobraY[0] == cobraY[z])
      noJogo = false;

  // baixo
  if (cobraY[0] >= C_ALTURA) ajustarPosicaoDaCobra(cobraX[0], 0);

  // cima
  if (cobraY[0] < 0) ajustarPosicaoDaCobra(cobraX[0], C_ALTURA);

  // direita
  if (cobraX[0] >= C_LARGURA) ajustarPosicaoDaCobra(0, cobraY[0]);

  // esquerda
  if (cobraX[0] < 0) ajustarPosicaoDaCobra(C_LARGURA, cobraY[0]);

  objColision(obstaculo_x, obstaculo_y, obstaculoQnt, aoColidirComObj);
  objColision(maca_x, maca_y, macaQnt, aoComerMaca, macaDpsDeComerTd);
}

function mover() {
  for (var z = pontos; z > 0; z--) {
    cobraX[z] = cobraX[z - 1];
    cobraY[z] = cobraY[z - 1];
  }

  if (paraEsquerda) cobraX[0] -= TAMANHO_PONTO;

  if (paraDireita) cobraX[0] += TAMANHO_PONTO;

  if (paraCima) cobraY[0] -= TAMANHO_PONTO;

  if (paraBaixo) cobraY[0] += TAMANHO_PONTO;
}

function fazerDesenho() {
  ctx.clearRect(0, 0, C_LARGURA, C_ALTURA);
  ctx.fillRect(0, 0, C_LARGURA, C_ALTURA);

  if (noJogo) {
    for (let i = 0; i < obstaculoQnt; i++)
      if (i > 4) ctx.drawImage(obstaculo[0], obstaculo_x[i], obstaculo_y[i]);
      else ctx.drawImage(obstaculo[1], obstaculo_x[i], obstaculo_y[i]);
    for (let i = 0; i < macaQnt; i++) ctx.drawImage(maca, maca_x[i], maca_y[i]);
    for (var z = 0; z < pontos; z++) {
      if (z < Math.floor(cobraX.length / 2) - 1)
        ctx.drawImage(cabeca, cobraX[z], cobraY[z]);
      else ctx.drawImage(bola, cobraX[z], cobraY[z]);
    }
  } else fimDeJogo();
}

function addPlayer() {
  let nome = prompt("Qual teu nome? bota só 3 letras ai 🙈🙈🙈").slice(0, 3);
  players.nome.push(nome);
  players.ponto.push(pontos - 3);
  localStorage.setItem("players", JSON.stringify(sortBest5players(players)));
}

function sortBest5players() {
  for (let i in players.ponto)
    for (let j = +i + 1; j < players.ponto.length; j++) {
      if (j >= players.ponto.length) break;
      if (players.ponto[j] > players.ponto[i]) {
        trocaTroca(players.ponto, i, j);
        trocaTroca(players.nome, i, j);
      }
    }
  return {
    nome: players.nome.slice(0, 5),
    ponto: players.ponto.slice(0, 5),
  };
}

function trocaTroca(arr, indexI, indexJ) {
  let aux = arr[indexJ];
  arr[indexJ] = arr[indexI];
  arr[indexI] = aux;
}

function fimDeJogo() {
  let myFont = new FontFace(
    "PressStart2P",
    "url(http://fonts.gstatic.com/s/pressstart2p/v5/8Lg6LX8-ntOHUQnvQ0E7o3uGXJk6cuEylToZ-uuaubQ.ttf)"
  );
  myFont.load().then((font) => {
    document.fonts.add(font);
    ctx.fillStyle = "white";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = `normal bold 32px PressStart2P`;
    bgm.pause();
    if (!verificarQntdeMaca()) {
      ctx.fillText("DEU MOLE 😭😭💀💀", C_LARGURA / 2, C_ALTURA / 2);
      gameOver.play();
      // addPlayer();
      return;
    }
    wins.play();
    ctx.fillText(
      `${pontos - 3} PONTOS???😳😳😳`,
      C_LARGURA / 2,
      C_ALTURA / 2 - 35
    );
    ctx.fillText("BRABO!!🥵🥵🥵", C_LARGURA / 2, C_ALTURA / 2 + 35);
    // addPlayer();
  });
}

function verificarTecla(e) {
  var tecla = e.keyCode;

  if (tecla == TECLA_ESQUERDA && !paraDireita) {
    paraEsquerda = true;
    paraCima = false;
    paraBaixo = false;
  }

  if (tecla == TECLA_DIREITA && !paraEsquerda) {
    paraDireita = true;
    paraCima = false;
    paraBaixo = false;
  }

  if (tecla == TECLA_ACIMA && !paraBaixo) {
    paraCima = true;
    paraDireita = false;
    paraEsquerda = false;
  }

  if (tecla == TECLA_ABAIXO && !paraCima) {
    paraBaixo = true;
    paraDireita = false;
    paraEsquerda = false;
  }
}
