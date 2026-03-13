let score = 0, timeLeft = 60, gameActive = false;
let highscore = localStorage.getItem('neonHighscore') || 0;
const colors = ['pink', 'blue', 'green', 'yellow', 'orange'];
let squares = [], startX, startY, idDrag;

function startGame() {
    document.getElementById('intro-screen').style.display = 'none';
    gameActive = true;
    let timerId = setInterval(() => {
        if(gameActive && timeLeft > 0) { timeLeft--; document.getElementById('timer').innerText = timeLeft; }
        else if(timeLeft <= 0) { clearInterval(timerId); endGame(); }
    }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    document.getElementById('highscore').innerText = highscore;

    function createBoard() {
        for (let i = 0; i < 64; i++) {
            const sq = document.createElement('div');
            sq.id = i;
            sq.classList.add('candy', colors[Math.floor(Math.random() * 5)]);
            sq.addEventListener('touchstart', e => { 
                startX = e.touches[0].clientX; 
                startY = e.touches[0].clientY; 
                idDrag = parseInt(sq.id); 
            }, {passive: true});
            sq.addEventListener('touchend', e => {
                handleTouch(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            }, {passive: true});
            grid.appendChild(sq);
            squares.push(sq);
        }
    }

    function handleTouch(ex, ey) {
        if(!gameActive) return;
        let dx = ex - startX, dy = ey - startY, target;
        if(Math.abs(dx) > Math.abs(dy)) { if(Math.abs(dx) > 30) target = dx > 0 ? idDrag+1 : idDrag-1; }
        else { if(Math.abs(dy) > 30) target = dy > 0 ? idDrag+8 : idDrag-8; }

        if(target !== undefined && target >= 0 && target < 64) {
            let isREdge = (idDrag % 8 === 7 && target === idDrag + 1);
            let isLEdge = (idDrag % 8 === 0 && target === idDrag - 1);
            if(!isREdge && !isLEdge) {
                let c1 = squares[idDrag].className, c2 = squares[target].className;
                squares[idDrag].className = c2; squares[target].className = c1;
                checkMatches();
            }
        }
    }

    function checkMatches() {
        let found = false;
        for (let i = 0; i < 64; i++) {
            let c = squares[i].className.replace('bomb', '').trim();
            if(c.includes('blank')) continue;

            // Horiz 4er -> Bomb
            if(i%8<5 && squares[i+1].className.includes(c) && squares[i+2].className.includes(c) && squares[i+3].className.includes(c)) {
                [i,i+1,i+2,i+3].forEach(idx => squares[idx].className = 'candy blank');
                squares[i].className = `${c} bomb`; score += 50; found = true;
            }
            // Horiz 3er
            else if(i%8<6 && squares[i+1].className.includes(c) && squares[i+2].className.includes(c)) {
                if([i,i+1,i+2].some(idx => squares[idx].className.includes('bomb'))) explode(i);
                [i,i+1,i+2].forEach(idx => squares[idx].className = 'candy blank'); found = true;
            }
            // Vert 3er
            if(i<48 && squares[i+8].className.includes(c) && squares[i+16].className.includes(c)) {
                if([i,i+8,i+16].some(idx => squares[idx].className.includes('bomb'))) explode(i);
                [i,i+8,i+16].forEach(idx => squares[idx].className = 'candy blank'); found = true;
            }
        }
        if(found) { 
            score += 10; 
            document.getElementById('score').innerText = score; 
            setTimeout(moveDown, 250); 
        }
    }

    function explode(idx) {
        let area = [idx-1,idx+1,idx-8,idx+8,idx-9,idx-7,idx+7,idx+9];
        area.forEach(i => { if(squares[i]){ squares[i].className='candy blank'; score+=20; }});
        triggerOverlay("KERNEL BOOM!");
    }

    function moveDown() {
        for(let i=0; i<56; i++) {
            if(squares[i+8].className.includes('blank')) {
                squares[i+8].className = squares[i].className;
                squares[i].className = 'candy blank';
            }
        }
        for(let i=0; i<8; i++) {
            if(squares[i].className.includes('blank')) {
                squares[i].className = `candy ${colors[Math.floor(Math.random()*5)]}`;
            }
        }
        checkMatches();
    }

    function triggerOverlay(txt) {
        const o = document.getElementById('msg-overlay');
        o.innerHTML = txt; o.classList.add('show');
        setTimeout(() => o.classList.remove('show'), 1200);
    }

    function endGame() {
        gameActive = false;
        if(score > highscore) localStorage.setItem('neonHighscore', score);
        triggerOverlay(`LOCKDOWN!<br>PUNKTE: ${score}`);
        setTimeout(() => location.reload(), 4000);
    }

    createBoard();
});
