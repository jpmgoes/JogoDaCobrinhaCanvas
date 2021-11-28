// tela config
let tela;
let ctx;
let ATRASO = 120;
const TAMANHO_PONTO = 30;
const ALEATORIO_MAXIMO = 25;
const C_ALTURA = 900;
const C_LARGURA = C_ALTURA;
const centro = {
  lado: C_LARGURA / 2,
  altura: C_ALTURA / 2,
};

class AddNoJogo {
  constructor(qnt = 0, imgQnt = 1) {
    this.img = Array(imgQnt).fill(null);
    this.audio = null;
    this.x = [];
    this.y = [];
    this.qnt = qnt;
    this.invisivel = -100;
  }
  carregarImg(imgName, type) {
    this.img.forEach((_, i) => {
      this.img[+i] = new Image();
      this.img[+i].src = `./img/${imgName}${+i + 1}.${type}`;
    });
  }
  fazerDesenho(cb) {
    cb();
  }
}

let comida = new AddNoJogo(15);
let obstaculo = new AddNoJogo(10, 2);
let cobra = new AddNoJogo(3, 2);

// cronometro
let countCronometro = {
  min: 1,
  sec: 20,
};
let minFormatado = countCronometro.min.toString().padStart(2, "0");
let secFormatado = countCronometro.sec.toString().padStart(2, "0");
document.querySelector(
  ".cronometro"
).textContent = `${minFormatado}:${secFormatado}`;

// audio
let bgm;
let gameOver;
let wins;

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

//alimento
let countComidasPraVida = 0;
let vida = 5;

// start game config
let randomStart = Math.round(Math.random() * 2) % 2;
let paraEsquerda = randomStart ? 1 : 0;
let paraDireita = randomStart ? 0 : 1;
let paraCima = false;
let paraBaixo = false;
let noJogo = true;

// move
const TECLA_ESQUERDA = 37;
const TECLA_DIREITA = 39;
const TECLA_ACIMA = 38;
const TECLA_ABAIXO = 40;

// cobra config

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
    htmlVidaChange();
    addNoJogo(obstaculo, obstaculo.qnt, comida.x);
    addNoJogo(comida, comida.qnt, obstaculo.x);
  }, ATRASO);

  setTimeout("cicloDeJogo()", ATRASO);
}

function carregarAudio() {
  obstaculo.audio = new Audio("./audio/Roblox Death Sound.mp3");
  comida.audio = new Audio("./audio/marioMoeda.mp3");
  bgm = new Audio("./audio/Sweden.mp3");
  gameOver = new Audio("./audio/gameOver.mp3");
  wins = new Audio("./audio/marioWins.mp3");
}

function carregarImagens() {
  cobra.carregarImg("cobra", "svg");
  comida.carregarImg("comida", "svg");
  obstaculo.carregarImg("obstaculo", "svg");
}

function criarCobra() {
  const posAleatoria = Math.random() * C_LARGURA - TAMANHO_PONTO;
  const a = posAleatoria - (posAleatoria % TAMANHO_PONTO);

  for (var z = 0; z < cobra.qnt; z++) {
    cobra.x[z] = a - z * TAMANHO_PONTO;
    cobra.y[z] = a;
  }
}

function addNoJogo(obj, qnt, ...arrColision) {
  for (let i = 0; i < qnt; i++) {
    while (!obj.x[i] || obj.y[i] === cobra.x[0]) {
      // garantir que vai pegar todos os valores e nao vai ser na mesma linha da cobra
      while (true) {
        // evitar mesma posicao
        const r = Math.floor(Math.random() * ALEATORIO_MAXIMO);
        const value = r * TAMANHO_PONTO;

        if (!obj.x.find((a) => a === value)) {
          for (let arr of arrColision)
            if (!arr.find((a) => a === value)) obj.x[i] = value;
        } else break;
      }
      const r = Math.floor(Math.random() * ALEATORIO_MAXIMO);
      obj.y[i] = r * TAMANHO_PONTO;
      if (obj.x.length === qnt) break;
    }
  }
  return [obj.x, obj.y];
}

function cicloDeJogo() {
  if (noJogo) {
    verificarColisao();
    mover();
    ctx.clearRect(0, 0, C_LARGURA, C_ALTURA);
    ctx.fillRect(0, 0, C_LARGURA, C_ALTURA);
    fazerDesenho();
    setTimeout("cicloDeJogo()", ATRASO);
  } else fimDeJogo();
}

function htmlVidaChange() {
  let vidaElement = document.querySelector(".vida--count");
  vidaElement.textContent = vida.toString().padStart(2, "0");
}

function aoComerComida(index) {
  comida.audio.play();
  cobra.qnt++;
  comida.x[index] = comida.invisivel;
  comida.y[index] = comida.invisivel;
  ATRASO -= 2;
  countComidasPraVida++;

  if (countComidasPraVida === 3) {
    countComidasPraVida = 0;
    vida++;
    htmlVidaChange();
  }
  if (ATRASO >= 90) ATRASO = 50;
}

function comidaDpsDeComerTd() {
  if (verificarQntdeComida()) noJogo = false;
}

function aoColidirComObj(index) {
  vida--;
  htmlVidaChange();
  obstaculo.audio.play();
  obstaculo.x[index] = obstaculo.invisivel;
  if (vida === 0) {
    vida = 0;
    noJogo = false;
  }
}

function objColision(obj, ...cb) {
  for (let i = 0; i < obj.qnt; i++)
    if (cobra.x[0] == obj.x[i] && cobra.y[0] == obj.y[i]) cb[0](i);

  cb = cb.slice(1);
  cb.forEach((fn) => fn());
}

function verificarQntdeComida() {
  let count = 0;
  for (let i = 0; i < comida.qnt; i++)
    if (comida.x[i] === comida.invisivel) count++;
  return count === comida.x.length;
}

function ajustarPosicaoDaCobra(a, b) {
  cobra.x[0] = a;
  cobra.y[0] = b;
}

function verificarColisao() {
  for (var z = cobra.qnt; z > 0; z--)
    if (z > 4 && cobra.x[0] == cobra.x[z] && cobra.y[0] == cobra.y[z])
      noJogo = false;

  // baixo
  if (cobra.y[0] >= C_ALTURA) ajustarPosicaoDaCobra(cobra.x[0], 0);

  // cima
  if (cobra.y[0] < 0) ajustarPosicaoDaCobra(cobra.x[0], C_ALTURA);

  // direita
  if (cobra.x[0] >= C_LARGURA) ajustarPosicaoDaCobra(0, cobra.y[0]);

  // esquerda
  if (cobra.x[0] < 0) ajustarPosicaoDaCobra(C_LARGURA, cobra.y[0]);

  objColision(obstaculo, aoColidirComObj);
  objColision(comida, aoComerComida, comidaDpsDeComerTd);
}

function mover() {
  for (var z = cobra.qnt; z > 0; z--) {
    cobra.x[z] = cobra.x[z - 1];
    cobra.y[z] = cobra.y[z - 1];
  }

  if (paraEsquerda) cobra.x[0] -= TAMANHO_PONTO;

  if (paraDireita) cobra.x[0] += TAMANHO_PONTO;

  if (paraCima) cobra.y[0] -= TAMANHO_PONTO;

  if (paraBaixo) cobra.y[0] += TAMANHO_PONTO;
}

function fazerDesenho() {
  if (noJogo) {
    const objNoJogo = [comida, obstaculo, cobra];

    obstaculo.fn = (i) => {
      if (i > 4)
        ctx.drawImage(obstaculo.img[0], obstaculo.x[i], obstaculo.y[i]);
      else ctx.drawImage(obstaculo.img[1], obstaculo.x[i], obstaculo.y[i]);
    };

    comida.fn = (i) => ctx.drawImage(comida.img[0], comida.x[i], comida.y[i]);

    cobra.fn = (i) => {
      if (i < Math.floor(cobra.x.length / 2) - 1)
        ctx.drawImage(cobra.img[0], cobra.x[i], cobra.y[i]);
      else ctx.drawImage(cobra.img[1], cobra.x[i], cobra.y[i]);
    };

    for (let obj of objNoJogo)
      for (let i = 0; i < obj.qnt; i++) obj.fazerDesenho(() => obj.fn(i));
  }
}

function addPlayer() {
  let nome;
  try {
    nome = prompt("Qual teu nome? bota só 3 letras ai 🙈🙈🙈", "Ano").slice(
      0,
      3
    );
  } catch {
    nome = "NoN"; // No Name
  }
  players.nome.push(nome);
  players.ponto.push(cobra.qnt - 3);
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
  let myFont = new FontFace("PressStart2P", "url(./font/pressstart2p.ttf)");
  myFont.load().then((font) => {
    document.fonts.add(font);
    ctx.fillStyle = "white";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = `normal bold 32px PressStart2P`;

    bgm.pause();

    if (!verificarQntdeComida()) {
      ctx.fillText("DEU MOLE!! 😭😭💀💀", centro.lado, centro.altura - 132);
      gameOver.play();
      setInterval(showPlayers, 3800);
      return;
    }

    ctx.fillText(
      `${cobra.qnt - 3} PONTOS???😳😳😳`,
      centro.lado,
      centro.altura - 164
    );
    ctx.fillText("BRABO!!🥵🥵🥵", centro.lado, centro.altura - 100);
    wins.play();
    setInterval(showPlayers, 7600);
  });
}

function showPlayers() {
  let countAltura = 64;
  let countTempo = 0;

  ctx.fillText("NICK PT TIME", centro.lado, centro.altura + countAltura);

  countAltura += 64;

  for (let index = 0; index < 5; index++) {
    const numIndex = +index;
    const posicao = +index + 1;

    const playersNome = players.nome[numIndex]
      ? players.nome[numIndex].padStart(3, " ")
      : "???";
    let playersPonto = players.ponto[numIndex]
      ? players.ponto[numIndex].toString().padStart(2, "0")
      : "??";
    if (playersNome !== "???" && playersPonto === "??") playersPonto = "00";
    const playersTime = players.time[numIndex]
      ? players.time[numIndex]
      : "??:??";

    setTimeout(() => {
      ctx.fillText(
        `${posicao} ${playersNome} ${playersPonto} ${playersTime}`,
        centro.lado,
        centro.altura + countAltura
      );
      countAltura += 40;
    }, countTempo * numIndex);

    countTempo = 500;
  }
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
