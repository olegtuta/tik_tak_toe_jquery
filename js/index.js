let computerIcon = 'X';
let yourIcon = 'O';
let computerMove;
//1 - это computerIcon, -1 - это yourIcon
let liveBoard = [1, -1, -1, -1, 1, 1, 1, -1, -1];
let successLanes = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function renderBoard(board) {
    board.forEach((el, i) => {
        let squareId = '#' + i.toString();
        if (el === -1) {
            $(squareId).text(yourIcon);
        } else if (el === 1) {
            $(squareId).text(computerIcon);
        }
    });

    $('.square-area:contains(X)').addClass('symbol-X');
    $('.square-area:contains(O)').addClass('symbol-O');
}

function animateSuccessLine() {
    let idxOfArray = successLanes.map((winLines) => {
        return winLines.map((winLine) => {
            return liveBoard[winLine];
        }).reduce((prev, cur) => {
            return prev + cur;
        });
    });
    let squaresToAnimate = successLanes[idxOfArray.indexOf(Math.abs(3))];

    squaresToAnimate.forEach((el) => {
        $('#' + el).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200);
    });
}


function chooseMarker() {
    $('.modal-wrapper').css('display', 'block');
    $('.choose-modal').addClass('animated bounceInUp');

    //jquery-старьё не хочет принимать стрелочную функцию :(
    $('.button-area span').click(function () {
        let marker = $(this).text();
        yourIcon = (marker === 'X' ? 'X' : 'O');
        computerIcon = (marker === 'X' ? 'O' : 'X');

        $('.choose-modal').addClass('animated bounceOutDown');
        setTimeout(() => {
            $('.modal-wrapper').css('display', 'none');
            $('.choose-modal').css('display', 'none');
            startNewGame();
        }, 700);

        $('.button-area span').off();
    });
}

function endGameMessage() {
    let result = checkVictory(liveBoard);
    $('.end-game-modal h3').text(result === 'win' ? 'проигрыш' : "ничья");

    $('.modal-wrapper').css('display', 'block');
    $('.end-game-modal').css('display', 'block').removeClass('animated bounceOutDown').addClass('animated bounceInUp');
    //jquery-старьё не хочет принимать стрелочную функцию :(
    $('.button-area span').click(function () {

        $('.end-game-modal').removeClass('animated bounceInUp').addClass('animated bounceOutDown');

        setTimeout(() => {
            $('.modal-wrapper').css('display', 'none');
            startNewGame();
        }, 700);

        $('.button-area span').off();
    });
}

function startNewGame() {
    liveBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    $('.square-area').text("").removeClass('symbol-O symbol-X');
    renderBoard(liveBoard);
    playerTakeTurn();
}

function playerTakeTurn() {
    $('.square-area:empty').hover(() => {
        $(this).text(yourIcon).css('cursor', 'pointer');
    }, () => {
        $(this).text('');
    });

    //jquery-старьё не хочет принимать стрелочную функцию :(
    $('.square-area:empty').click(function () {
        $(this).css('cursor', 'default');
        liveBoard[parseInt($(this).attr('id'))] = -1;
        renderBoard(liveBoard);

        if (checkVictory(liveBoard)) {
            setTimeout(endGameMessage, (checkVictory(liveBoard) === 'win') ? 700 : 100);
        } else {
            setTimeout(aiTakeTurn, 100);
        }
        $('.square-area').off();
    });
}

function aiTakeTurn() {
    minimumMaximum(liveBoard, 'aiPlayer');
    liveBoard[computerMove] = 1;
    renderBoard(liveBoard);
    if (checkVictory(liveBoard)) {
        animateSuccessLine();
        setTimeout(endGameMessage, checkVictory(liveBoard) === 'win' ? 700 : 100);
    } else {
        playerTakeTurn();
    }
}

function checkVictory(board) {
    let squaresInPlay = board.reduce((previous, current) => {
        return Math.abs(previous) + Math.abs(current);
    });

    let outcome = successLanes.map((winLines) => {
        return winLines.map((winLine) => {
            return board[winLine];
        }).reduce((previous, current) => {
            return previous + current;
        });
    }).filter((winLineTotal) => {
        return Math.abs(winLineTotal) === 3;
    });

    if (outcome[0] === 3) {
        return 'win';
    } else if (outcome[0] === -3) {
        return 'lose';
    } else if (squaresInPlay === 9) {
        return 'draw';
    } else {
        return false;
    }
}

function availableMoves(board) {
    return board.map((el, i) => {
        if (!el) {
            return i;
        }
    }).filter((e) => {
        return (typeof e !== "undefined");
    });
}

//За основу взят известный алгоритм для крестиков-ноликов - минимакс. Подробнее здесь: https://habr.com/ru/post/329058/
// Описание алгоритма. Допустим, что X является игроком, который ходит:
// Если игра окончена, вернуть счет для X
// В противном случае возвращается список новых игровых состояний для каждого возможного хода.
// Создаем список баллов
// Для каждого из этих состояний добавим минимальный и максимальный результат этого состояния в список результатов.
// Если настала очередь Х, то вернём максимальное количество очков из списка результатов.
// Если настала очередь O, вернём минимальный балл из списка баллов.
// Алгоритм напоминает рекурсию, он "бегает" от игрока к игроку, пока не будет найден окончательный счет.
function minimumMaximum(state, player) {
    //чекать все состояния и вернуть очки с точки зрения компа
    let rv = checkVictory(state);
    if (rv === 'win') {
        return 10;
    }
    if (rv === 'lose') {
        return -10;
    }
    if (rv === 'draw') {
        return 0;
    }

    let moves = [];
    let scores = [];
    availableMoves(state).forEach((square) => {
        state[square] = (player === 'aiPlayer') ? 1 : -1;
        scores.push(minimumMaximum(state, (player === 'aiPlayer') ? 'opponent' : 'aiPlayer'));
        moves.push(square);
        state[square] = 0;
    });

    if (player === 'aiPlayer') {
        computerMove = moves[scores.indexOf(Math.max.apply(Math, scores))];
        return Math.max.apply(Math, scores);
    } else {
        computerMove = moves[scores.indexOf(Math.min.apply(Math, scores))];
        return Math.min.apply(Math, scores);
    }
}

renderBoard(liveBoard);
chooseMarker();
