// ======================================
//CONECTANDO INTERFACE COM O SERVIDOR
//=======================================

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.all('*', function (req,res,next) {
    if (!req.get('Origin')) return next();

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET,POST');
    res.set('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');

    if ('OPTIONS' == req.method) return res.send(200);

    next();

});

app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

app.post('/minimax/play/', function (req, res) {
    var jogo = req.body.game;
    var movimento = melhorJogada(jogo);
    var retorno = {}

    if (jogo == undefined || movimento == undefined) {
        retorno = {
            'status' : 500,
            'msg' : 'Erro'
        }

        res.status(500).send(retorno);
    } else {
        retorno = {
            'status' : 200,
            'move' : movimento
        }

        res.status(200).send(retorno);
    }
});


app.listen(5001, function () {
    console.log('App sendo executado na porta 5001!');
});

// ============================================================
// IMPLEMENTANDO MINIMAX
//=============================================================

//VERIFICA SE HÁ IGAUALDADE ENTRE OS PARÂMETROS
function igual(a, b, c) {
    return a == b && b == c && a != 0;
}

//TESTA VITÓRIA
function testarVitoria(tabuleiro) {
    for (var i = 0; i < 3; i++) {
        if (igual(tabuleiro[i * 3], tabuleiro[i * 3 + 1], tabuleiro[i * 3 + 2])) {
            return tabuleiro[i * 3] == 1 ? 10 : -10;
        } else if (igual(tabuleiro[i + 0], tabuleiro[i + 3], tabuleiro[i + 6])) {
            return tabuleiro[i + 0] == 1 ? 10 : -10;
        }
    }

    if (igual(tabuleiro[0], tabuleiro[4], tabuleiro[8])) {
        return tabuleiro[0] == 1 ? 10 : -10;
    } else if (igual(tabuleiro[2], tabuleiro[4], tabuleiro[6])) {
        return tabuleiro[2] == 1 ? 10 : -10;
    }

    return 0;
}

//VERIFICA SE O GAME FOI FINALIZADO
function finalizado(tabuleiro) {
    var ret = true;

    for (var i = 0; i < 9; i++) {
        if (tabuleiro[i] == 0) {
            ret = false;
            break;
        }
    }

    return ret;
}


//FUNÇÃO MINIMAX
function minimax(tabuleiro, maximizando) {
    var p = testarVitoria(tabuleiro);

    if (p != 0) {
        return p;
    } else if (finalizado(tabuleiro)) {
        return p;
    }

    if (maximizando) {
        var pontos = -Infinity;

        for (var i = 0; i < 9; i++) {
            if (tabuleiro[i] == 0) {
                tabuleiro[i] = 1;
                var pontuacao = minimax(tabuleiro, false);
                pontos = Math.max(pontuacao, pontos);
                tabuleiro[i] = 0;
            }
        }

        return pontos;
    } else {
        var pontos = Infinity;

        for (var i = 0; i < 9; i++) {
            if (tabuleiro[i] == 0) {
                tabuleiro[i] = 2;
                var pontuacao = minimax(tabuleiro, true);
                pontos = Math.min(pontuacao, pontos);
                tabuleiro[i] = 0;
            }
        }

        return pontos;
    }
}

function melhorJogada(tabuleiro) {
    var melhor = -Infinity;
    var jogada = 0;


    for (var i = 0; i < 9; i++) {
        if (tabuleiro[i] == 0) {
            tabuleiro[i] = 1;
            var pontuacao = minimax(tabuleiro, false);
            if (pontuacao > melhor) {
                melhor = pontuacao
                jogada = i;
            }
            tabuleiro[i] = 0;
        }
    }

    //RETORNAR COORDENADA DA CASA
    return [Math.floor(jogada / 3), jogada % 3];
}