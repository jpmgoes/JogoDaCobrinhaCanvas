// tela config
let tela;
let ctx;
let ATRASO = 120;
const TAMANHO_PONTO = 21;
const ALEATORIO_MAXIMO = 25;

const C_ALTURA = 630;
const C_LARGURA = C_ALTURA;
const centro = {
  lado: C_LARGURA / 2,
  altura: C_ALTURA / 2,
};

let comida = new ObjDoJogo(15);
comida.addNoJogo = addNoJogo;
comida.objColision = objColision;
let obstaculo = new ObjDoJogo(10, 2);
obstaculo.addNoJogo = addNoJogo;
obstaculo.objColision = objColision;

let cobra = new ObjDoJogo(3, 2);
cobra.addNoJogo = criarCobra;

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
document.querySelector(".vida--count").textContent = `${vida
  .toString()
  .padStart(2, "0")}`;

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

onkeydown = verificarTecla; // Define função chamada ao se pressionar uma tecla

createTelaInicial();
