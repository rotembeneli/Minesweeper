'use strict'

const EMPTY = '';
const BOMB = '✘';
const FLAG = '📍';
const HEART = '<img src="img/heart.png" />';

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


function initGame() {
    gGame.isOn = true;
    document.querySelector('.restart').innerText = '😃';
    gLifeCounter = gLevel.LIVES;
    showLives();
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
    return board;
}

function locateBombs(board, cellI, cellJ) {
    var bombCounter = 0;
    while (gLevel.MINES !== bombCounter) {
        var i = getRandomInt(0, gLevel.SIZE - 1);
        var j = getRandomInt(0, gLevel.SIZE - 1);
        if (i === cellI && j === cellJ) continue;
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
        timerStart(Date.now());
        locateBombs(gBoard, i, j);
        locateNums(gBoard);
    }
    if (gBoard[i][j].isMarked) return;
    if (gBoard[i][j].isShown) return;
    gBoard[i][j].isShown = true;
    if (gBoard[i][j].isMine) {
        elCell.innerText = BOMB;
        elCell.style.boxShadow = 'none';
        gGame.markedCount++;
        gBombCounter--;
        document.querySelector('.bombCount').innerText = gBombCounter;
        document.querySelector('.restart').innerText = '🤯';
        //for another life
        if (gLifeCounter > 1) {
            gLifeCounter--;
            showLives();
            setTimeout(() => {
                document.querySelector('.restart').innerText = '😃';
            }, 1000);
        } else checkGameOver(false);
    } else {
        elCell.innerText = gBoard[i][j].minesAroundCount;
        setColor(gBoard[i][j].minesAroundCount, i, j);
        elCell.style.boxShadow = 'none';
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
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > board[i].length - 1) continue;
            if (i === cellI && j === cellJ) continue;
            if (board[i][j].isShown) continue;
            if (board[i][j].isMarked) continue;
            if (!board[i][j].isMine) {
                var elCurrCell = document.querySelector(`.cell-${i}-${j}`);
                elCurrCell.innerText = board[i][j].minesAroundCount;
                setColor(board[i][j].minesAroundCount, i, j);
                elCurrCell.style.boxShadow = 'none';
                board[i][j].isShown = true;
                gGame.shownCount++;
                checkWinning();
                if (board[i][j].minesAroundCount === '') expandShown(board, elCurrCell, i, j);
            }
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
        showAllBombs(gBoard);
        document.querySelector('.modal').style.display = 'block';
        var numOfBombs = gGame.markedCount;
        document.querySelector('.numBombs').innerText = numOfBombs;
    }
}

function checkWinning() {
    if (checkMarkedTrue()) {
        if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) return checkGameOver(true);
        if (gGame.shownCount + gLevel.MINES === gLevel.SIZE ** 2) return checkGameOver(true);
        if (gGame.markedCount === gLevel.MINES) return checkGameOver(true);
    }
}

function checkMarkedTrue() {
    var counter = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMarked && gBoard[i][j].isMine) {
                counter++;
            }
        }
    }
    if (counter === gLevel.MINES) return true;
    else return false;
}

function showLives() {
    var strHTML = '';
    for (var i = 0; i < gLifeCounter; i++) {
        strHTML += getHeartHTML(HEART);
    }
    document.querySelector('.hearts').innerHTML = strHTML;
}

function getHeartHTML(heart) {
    return `<span>${heart}</span>`;
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
                document.querySelector(`.cell-${i}-${j}`).style.boxShadow = 'none';
            }
        }
    }
    return board;
}

function closeModal() {
    document.querySelector('.modal').style.display = 'none';
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
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function setColor(num, i, j) {
    switch (num) {
        case 1:
            document.querySelector(`.cell-${i}-${j}`).style.color = 'blue';
            break;
        case 2:
            document.querySelector(`.cell-${i}-${j}`).style.color = 'green';
            break;
        case 3:
            document.querySelector(`.cell-${i}-${j}`).style.color = 'red';
            break;
        case 4:
            document.querySelector(`.cell-${i}-${j}`).style.color = 'rgb(87, 1, 87)';
            break;
        case 5:
            document.querySelector(`.cell-${i}-${j}`).style.color = 'rgb(77, 0, 0)';
            break;
        case 6:
            document.querySelector(`.cell-${i}-${j}`).style.color = 'rgb(45, 141, 131)';
            break;
        case 7:
            document.querySelector(`.cell-${i}-${j}`).style.color = 'purple';
            break;
        case 8:
            document.querySelector(`.cell-${i}-${j}`).style.color = 'black';
            break;
    }
}

function timerStart(startTimer) {
    var elTimer = document.querySelector('.timer');
    gTimerInt = setInterval(function () {
        var time = ((Date.now() - startTimer) / 1000).toFixed(1)
        elTimer.textContent = time + '';
    }, 100)
}

function stopClock() {
    clearInterval(gTimerInt);
    document.querySelector('.timer').innerText = '0.00';
}