function best5players() {
  let players = {
    nome: ["joao", "dm", "pedro", "paulo", "cinco", "seis"],
    ponto: [4,      4,    1,       79,      33,     1],
  };
  for (let i in players.ponto)
    for (let j = +i + 1; j < players.ponto.length; j++) {
      if (j >= players.ponto.length) break;
      if (players.ponto[j] > players.ponto[i]) {
        trocaTroca(players.ponto, i, j);
        trocaTroca(players.nome, i, j);
      }
      console.log(players.ponto.slice(0 , 5));
    }
}
function trocaTroca(arr, indexI, indexJ) {
  let aux = arr[indexJ];
  arr[indexJ] = arr[indexI];
  arr[indexI] = aux;
}
best5players()