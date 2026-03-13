let score = 0;
let timeLeft = 60;
let gameActive = false;
let highscore = localStorage.getItem('neonHighscore') || 0;
const candyColors = ['pink', 'blue', 'green', 'yellow', 'orange'];

function startGame() {
    document.getElementById('intro-screen').style.display = 'none';
    gameActive = true;
}

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('#grid');
    const scoreDisplay = document.querySelector('#score');
    const highscoreDisplay = document.querySelector('#highscore');
    const timerDisplay = document.querySelector('#timer');
    const comboDisplay = document.querySelector('#combo');
    const overlay = document.querySelector('#msg-overlay');

    let squares = [];
    let idDrag, idDrop;
    let combo = 1;
    let lastMatchTime = 0;

    highscoreDisplay.innerHTML = highscore;

    // Spielfeld erstellen
    function createBoard() {
        for (let i = 0; i < 64; i++) {
            const square = document.createElement('div');
            square.setAttribute('draggable', true);
            square.setAttribute('id', i);
            let randomColor = candyColors[Math.floor(Math.random() * 5)];
            square.classList.add('candy', randomColor);
            grid.appendChild(square);
            squares.push(square);

            square.addEventListener('dragstart', function() { if(gameActive) idDrag = parseInt(this.id) });
            square.addEventListener('dragover', e => e.preventDefault());
            square.addEventListener('drop', function() {
                if(!gameActive) return;
                idDrop = parseInt(this.id);
                let validMoves = [idDrag-1, idDrag+1, idDrag-8, idDrag+8];
                if (validMoves.includes(idDrop)) {
                    let c1 = squares[idDrag].className;
                    let c2 = squares[idDrop].className;
                    squares[idDrag].className = c2;
                    squares[idDrop].className = c1;
                    checkMatches();
                }
            });
        }
    }

    // Timer Logik
    let countdown = setInterval(() => {
        if (gameActive) {
            timeLeft--;
            timerDisplay.innerHTML = timeLeft;
            if (timeLeft <= 0) {
                gameActive = false;
                endGame();
            }
        }
    }, 1000);

    function checkMatches() {
        let found = false;
        for (let i = 0; i < 64; i++) {
            let colorClass = squares[i].className.split(' ')[1];
            if (colorClass === 'blank') continue;

            // Horizontal 4er (Bombe)
            if (i % 8 < 5 && squares[i+1].classList.contains(colorClass) && 
                squares[i+2].classList.contains(colorClass) && squares[i+3].classList.contains(colorClass)) {
                [i, i+1, i+2, i+3].forEach(idx => squares[idx].className = 'candy blank');
                squares[i].className = `candy ${colorClass} bomb`;
                score += 50;
                found = true;
            }
            // Horizontal 3er
            else if (i % 8 < 6 && squares[i+1].classList.contains(colorClass) && squares[i+2].classList.contains(colorClass)) {
                if ([i, i+1, i+2].some(idx => squares[idx].classList.contains('bomb'))) explode(i);
                [i, i+1, i+2].forEach(idx => squares[idx].className = 'candy blank');
                found = true;
            }
            // Vertikal 3er
            if (i < 48 && squares[i+8].classList.contains(colorClass) && squares[i+16].classList.contains(colorClass)) {
                if ([i, i+8, i+16].some(idx => squares[idx].classList.contains('bomb'))) explode(i);
                [i, i+8, i+16].forEach(idx => squares[idx].className = 'candy blank');
                found = true;
            }
        }

        if (found) {
            updateScore();
            setTimeout(moveDown, 200);
        }
    }

    function explode(idx) {
        const area = [idx-1, idx+1, idx-8, idx+8, idx-9, idx-7, idx+7, idx+9];
        area.forEach(i => {
            if (squares[i]) {
                squares[i].className = 'candy blank';
                score += 20;
            }
        });
        triggerOverlay("KERNEL EXPLOSION!");
    }

    function updateScore() {
        let now = Date.now();
        combo = (now - lastMatchTime < 1200) ? combo + 1 : 1;
        lastMatchTime = now;
        score += 10 * combo;
        scoreDisplay.innerHTML = score;
        comboDisplay.innerHTML = combo;
        if (score > 0 && score % 200 === 0) triggerOverlay("FIREWALL LAYER GEKNACKT!");
    }

    function moveDown() {
        for (let i = 0; i < 56; i++) {
            if (squares[i+8].classList.contains('blank')) {
                squares[i+8].className = squares[i].className;
                squares[i].className = 'candy blank';
            }
        }
        for (let i = 0; i < 8; i++) {
            if (squares[i].classList.contains('blank')) {
                squares[i].className = `candy ${candyColors[Math.floor(Math.random()*5)]}`;
            }
        }
        checkMatches(); // Erneut prüfen nach Nachrücken
    }

    function triggerOverlay(txt) {
        overlay.innerHTML = txt;
        overlay.classList.add('show');
        setTimeout(() => overlay.classList.remove('show'), 1200);
    }

    function endGame() {
        if (score > highscore) {
            localStorage.setItem('neonHighscore', score);
            triggerOverlay(`SYSTEM ÜBERNOMMEN!<br>REKORD: ${score}`);
        } else {
            triggerOverlay(`LOCKDOWN!<br>PUNKTE: ${score}`);
        }
        setTimeout(() => location.reload(), 4000);
    }

    createBoard();
});
