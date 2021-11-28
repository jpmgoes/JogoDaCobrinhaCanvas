// cronometro
let countCronometro = {
  min: 1,
  sec: 20,
};
let minFormatado = countCronometro.min.toString().padStart(2, "0");
let secFormatado = countCronometro.sec.toString().padStart(2, "0");
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
      time: [],
    };
if (!localStorage.getItem("players"))
  localStorage.setItem("players", JSON.stringify(players));

let pontos;
let vida = 5;

//alimento
let maca_x = [];
let maca_y = [];
const macaQnt = 15;
const macaInv = -100;
let countComidasPraVida = 0;

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
let ATRASO = 120;
const TAMANHO_PONTO = 30;
const ALEATORIO_MAXIMO = 25;
const C_ALTURA = 900;
const C_LARGURA = C_ALTURA;

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
  cronometroScreen();

  setTimeout(() => {
    bgm.play();
    bgm.loop = true;
    criarCobra();
    addNoJogo(obstaculo_x, obstaculo_y, obstaculoQnt, maca_x);
    addNoJogo(maca_x, maca_y, macaQnt, obstaculo_x);
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

  const posAleatoria = Math.random() * C_LARGURA - TAMANHO_PONTO;
  const a = posAleatoria - (posAleatoria % TAMANHO_PONTO);

  for (var z = 0; z < pontos; z++) {
    cobraX[z] = a - z * TAMANHO_PONTO;
    cobraY[z] = a;
  }
}

function addNoJogo(arrX, arrY, qnt, ...arrColision) {
  for (let i = 0; i < qnt; i++) {
    while (!arrX[i] || arrY[i] === cobraY[0]) {
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
  obstaculoAudio.play();
  obstaculo_x[index] = macaInv;
  if (vida === 0) {
    vida = 0;
    noJogo = false;
  }
}

function objColision(arrX, arrY, qnt, ...cb) {
  for (let i = 0; i < qnt; i++)
    if (cobraX[0] == arrX[i] && cobraY[0] == arrY[i]) cb[0](i);

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
  players.time.push(`${minFormatado}:${secFormatado}`);
  players = sortBest5players(players);
  localStorage.setItem("players", JSON.stringify(players));
}

function sortBest5players() {
  for (let i in players.ponto)
    for (let j = +i + 1; j < players.ponto.length; j++) {
      if (j >= players.ponto.length) break;
      if (players.ponto[j] > players.ponto[i]) {
        permuta(players.ponto, i, j);
        permuta(players.nome, i, j);
        permuta(players.time, i, j);
      }
    }
  return {
    nome: players.nome.slice(0, 5),
    ponto: players.ponto.slice(0, 5),
    time: players.time.slice(0, 5),
  };
}

function permuta(arr, indexI, indexJ) {
  let aux = arr[indexJ];
  arr[indexJ] = arr[indexI];
  arr[indexI] = aux;
}

function fimDeJogo() {
  addPlayer();
  const centro = {
    lado: C_LARGURA / 2,
    altura: C_ALTURA / 2,
  };

  let myFont = new FontFace("PressStart2P", "url(./font/pressstart2p.ttf)");

  myFont.load().then((font) => {
    document.fonts.add(font);
    ctx.fillStyle = "white";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = `normal bold 32px PressStart2P`;

    bgm.pause();

    if (!verificarQntdeMaca()) {
      ctx.fillText("DEU MOLE!! 😭😭💀💀", centro.lado, centro.altura - 132);
      gameOver.play();
      setInterval(showPlayers, 3800);
      return;
    }

    ctx.fillText(
      `${pontos - 3} PONTOS???😳😳😳`,
      centro.lado,
      centro.altura - 164
    );
    ctx.fillText("BRABO!!🥵🥵🥵", centro.lado, centro.altura - 100);
    wins.play();
    setInterval(showPlayers, 7600);

    function showPlayers() {
      let countAltura = 64;
      let countTempo = 0;

      ctx.fillText("NICK PT TIME", centro.lado, centro.altura + countAltura);

      countAltura += 64;

      for (let index in players.ponto) {
        let numIndex = +index;
        let posicao = +index + 1;

        setTimeout(() => {
          let name = players.nome[numIndex].padStart(3, " ");
          ctx.fillText(
            `${posicao} ${name} ${players.ponto[numIndex]
              .toString()
              .padStart(2, "0")} ${players.time[numIndex]}`,
            centro.lado,
            centro.altura + countAltura
          );
          countAltura += 40;
        }, countTempo * numIndex);

        countTempo = 500;
      }
    }
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

function cronometroScreen() {
  let element = document.querySelector(".cronometro");
  let countFn = setInterval(() => {
    if (noJogo) {
      cronometro();
    } else {
    }

    minFormatado = countCronometro.min.toString().padStart(2, "0");
    secFormatado = countCronometro.sec.toString().padStart(2, "0");

    element.textContent = `${minFormatado}:${secFormatado}`;
  }, 1000);

  function cronometro() {
    countCronometro.sec--;
    if (countCronometro.sec < 0) {
      countCronometro.sec = 60;
      if (countCronometro.min <= 0) {
        noJogo = false;
        ctx.clearRect(0, 0, C_LARGURA, C_ALTURA);
        ctx.fillRect(0, 0, C_LARGURA, C_ALTURA);
        fimDeJogo();
        countCronometro.min = 0;
        countCronometro.sec = 0;
        clearInterval(countFn);
      } else countCronometro.min--;
    }
  }
}
