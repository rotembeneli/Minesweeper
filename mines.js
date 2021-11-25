'use strict'

const EMPTY = '';
const BOMB = '✘';
const FLAG = '📍';

var gLevel = {
    SIZE: 4,
    MINES: 2,
    LIVES: 1
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gBoard;
var gLifeCounter = 0;
var gBombCounter = gLevel.MINES;
var gBestScore = 0;
var gTimerInt = 0;
var gBom


function initGame() {
    gGame.isOn = true;
    document.querySelector('.restart').innerText = '😃';
    gLifeCounter = gLevel.LIVES;
    gBombCounter = gLevel.MINES;
    gBoard = buildBoard(gLevel.SIZE);
    renderBoard(gBoard);
    console.table(gBoard);
    document.querySelector('.bombCount').innerText = gBombCounter;
}

function buildBoard(matLength) {
    var board = [];
    for (var i = 0; i < matLength; i++) {
        board.push([]);
        for (var j = 0; j < matLength; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = { ...cell };
        }
    }
    console.table(board);
    // locateBombs(board);
    // locateNums(board);
    return board;
}

function locateBombs(board) {
    var bombCounter = 0;
    while (gLevel.MINES !== bombCounter) {
        var i = getRandomInt(0, gLevel.SIZE - 1);
        var j = getRandomInt(0, gLevel.SIZE - 1);
        if (!board[i][j].isMine) {
            board[i][j].isMine = true;
            bombCounter++;
        }
    }
    return board;
}

function setMinesNegsCount(cellI, cellJ, mat) {
    var negsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > mat[i].length - 1) continue;
            if (i === cellI && j === cellJ) continue;
            if (mat[i][j].isMine) negsCount++;
        }
    }
    return negsCount;
}

function locateNums(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].isMine) {
                // document.querySelector(`.cell-${i}-${j}`).innerText = BOMB;
                continue;
            }
            board[i][j].minesAroundCount = setMinesNegsCount(i, j, board);
            if (!setMinesNegsCount(i, j, board)) board[i][j].minesAroundCount = '';
        }
    }
    return board;
}

function cellClicked(elCell, i, j) {
    if (!gGame.isOn) return;
    if (gGame.shownCount === 0) {
        console.log('cell clicked');
        startTimer();
        locateBombs(gBoard);
        locateNums(gBoard);
        showAllBombs(gBoard);
    }
    if (gBoard[i][j].isMarked) return;
    if (gBoard[i][j].isShown) return;
    gBoard[i][j].isShown = true;
    if (gBoard[i][j].isMine) {
        elCell.innerText = BOMB;
        gGame.markedCount++;
        gBombCounter--;
        document.querySelector('.bombCount').innerText = gBombCounter;
        document.querySelector('.restart').innerText = '🤯';
        //for another life
        if (gLifeCounter) { //backkkk
            gLifeCounter--;
            livesCount();
            setTimeout(() => {
                document.querySelector('.restart').innerText = '😃';
            }, 1000);
        } else checkGameOver(false);
    } else {
        elCell.innerText = gBoard[i][j].minesAroundCount;
        gGame.shownCount++;
    }
    if (gBoard[i][j].minesAroundCount === '') expandShown(gBoard, elCell, i, j);
    checkWinning();
}

function cellMarked(elCell, i, j) {
    const context = document.getElementById('table')
    context.addEventListener("contextmenu", e => e.preventDefault());
    if (gBoard[i][j].isShown) return;
    if (gGame.markedCount === gLevel.MINES) {
        alert(`You already marked ${gLevel.MINES} mines`);
        return;
    }
    if (gBoard[i][j].isMarked) {
        elCell.innerText = '';
        gBoard[i][j].isMarked = false;
        gGame.markedCount--;
        gBombCounter++;
        document.querySelector('.bombCount').innerText = gBombCounter;
    } else {
        elCell.innerText = FLAG;
        gBoard[i][j].isMarked = true;
        gGame.markedCount++;
        gBombCounter--;
        document.querySelector('.bombCount').innerText = gBombCounter;
        checkWinning();
    }
}

function expandShown(board, elCell, cellI, cellJ) {
    // console.log(elCell);
    elCell.style.backgroundColor = 'blue';
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > board[i].length - 1) continue;
            if (i === cellI && j === cellJ) continue;
            if (board[i][j].isShown) continue;
            var elCurrCell = document.querySelector(`.cell-${i}-${j}`);
            elCurrCell.style.backgroundColor = 'blue';
            elCurrCell.innerText = board[i][j].minesAroundCount;
            board[i][j].isShown = true;
            gGame.shownCount++;
            checkWinning();
            if (board[i][j].minesAroundCount === '') expandShown(board, elCurrCell, i, j);
        }
    }
}

function checkGameOver(isVictory) {
    gGame.isOn = false;
    if (isVictory) {
        document.querySelector('.restart').innerText = '😎';
        document.querySelector('.modal').style.display = 'block';
        document.querySelector('.modal h2').innerText = 'You win!';
        stopClock();
        // var currScore = 0;
        // if (gBestScore < currScore) {
        //     gBestScore = currScore;
        //     document.querySelector('.bestScore').innerText = gBestScore;
        // }
    } else {
        stopClock();
        document.querySelector('.modal').style.display = 'block';
        var numOfBombs = gGame.markedCount
        document.querySelector('.numBombs').innerText = numOfBombs;
    }
}

function checkWinning() {
    // console.log(gGame.shownCount);
    // console.log(gGame.markedCount);
    if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) return checkGameOver(true);
    // if (gGame.shownCount + gLevel.MINES === gLevel.SIZE ** 2) return checkGameOver(true);
    // if (gGame.markedCount === gLevel.MINES) return checkGameOver(true); add a condition
}

function livesCount() {
    document.querySelector('.lives').style.display = 'block';
    if (gLifeCounter === 2) document.querySelector('.lives h2').innerText = `You have left ${gLifeCounter} lives!`;
    if (gLifeCounter === 1) document.querySelector('.lives h2').innerText = `You have left only ${gLifeCounter} life!`;
    setTimeout(closeModal(false), 2000);
}

function restartGame() {
    console.log('restert');
    gGame.markedCount = 0;
    console.log('gGame.markedCount', gGame.markedCount);
    gGame.shownCount = 0;
    console.log('gGame.shownCount', gGame.shownCount);
    stopClock();
    initGame();
}

function setDiff(elBtn) {
    switch (elBtn.innerText) {
        case 'Easy 4*4':
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            gLevel.LIVES = 1;
            restartGame();
            break;
        case 'Medium 8*8':
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            gLevel.LIVES = 3;
            restartGame();
            break;
        case 'Expert 12*12':
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            gLevel.LIVES = 3;
            restartGame();
            break;
    }
}

function showAllBombs(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].isMine) {
                document.querySelector(`.cell-${i}-${j}`).innerText = BOMB;
            }
        }
    }
    return board;
}

function closeModal(first) {
    if (first) document.querySelector('.modal').style.display = 'none';
    else document.querySelector('.lives').style.display = 'none';
}

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var className = `cell-${i}-${j}`
            strHTML += `\t<td class="cell ${className}" onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this,${i},${j})">\n`;
            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }
    // console.log('strHTML is:');
    // console.log(strHTML);
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function startTimer() {
    var startTime = Date.now();
    gTimerInt = setInterval(showTimer, 100, startTime);
}
function showTimer(startTime) {
    var timeGap = Date.now() - startTime;
    document.querySelector('.timer').innerHTML = 'Timer: ' + (timeGap / 1000).toFixed(3);
}
function stopClock() {
    clearInterval(gTimerInt);
    document.querySelector('.timer').innerText = '00:00:00';
}