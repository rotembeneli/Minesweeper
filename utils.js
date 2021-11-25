'use strict'

function getRandomInt(min, max) { // includes min and max
    return Math.floor(Math.random() * (max - min) + min);
}

function copyMat(mat) { // recieve mat and returns new one the same
    var newMat = [];
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = [];
        for (var j = 0; j < mat[0].length; j++) {
            newMat[i][j] = mat[i][j];
        }
    }
    return newMat;
}

// createBoard(10);

function createBoard(matLength) { // creates squared mat
    var board = [];
    for (var i = 0; i < matLength; i++) {
        board.push([])
        for (var j = 0; j < matLength; j++) {
            board[i][j] = (Math.random() > 0.5) ? BOMB : EMPTY;
        }
    }
    console.table(board);
    return board;
}


// function renderBoard(board) {
//     // console.table(board);

//     var strHTML = '';
//     for (var i = 0; i < board.length; i++) {
//         strHTML += '<tr>'
//         for (var j = 0; j < board[0].length; j++) {
//             var cell = board[i][j]
//             var className = 'cell';
//             // var className = (cell) ? 'bomb' : '';
//             strHTML += `<td class="${className}" 
//             data-i="${i}" data-j="${j}"
//             onclick="cellClicked(this,${i},${j})">
//             ${cell}</td>`
//         }
//         strHTML += '</tr>'
//     }

//     // console.log(strHTML)
//     var elBoard = document.querySelector('.board');
//     elBoard.innerHTML = strHTML;
// }

//  count Negs countNegs(1,1,mat)
function countNegs(cellI, cellJ, mat) {
    var negsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > mat[i].length - 1) continue;
            if (i === cellI && j === cellJ) continue;
            // if (mat[i][j] === LIFE || mat[i][j] === SUPER_LIFE) negsCount++;
            if (mat[i][j]) negsCount++;
        }
    }
    return negsCount;
}

function printMat(mat, selector) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j];
            // console.log(cell);
            var className = 'cell cell' + i + '-' + j;
            if (cell === '#') className += ' wall';
            strHTML += '<td class="' + className + '"> ' + cell + ' </td>'
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}
