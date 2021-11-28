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
    cobra.addNoJogo();
    htmlVidaChange();
    obstaculo.addNoJogo(comida);
    comida.addNoJogo(obstaculo);
  }, ATRASO);

  setTimeout("cicloDeJogo()", ATRASO);
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

    for (let obj of objNoJogo) for (let i = 0; i < obj.qnt; i++) obj.fn(i);
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
      countCronometro.sec = 59;
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
