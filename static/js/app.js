let currentSolution = []; let startingBoard = []; let timerInterval = null; let secondsPassed = 0;
function formatTime(s) { return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }
function startTimer() { clearInterval(timerInterval); secondsPassed = 0; document.getElementById("timer").textContent = "00:00"; timerInterval = setInterval(() => { secondsPassed++; document.getElementById("timer").textContent = formatTime(secondsPassed); }, 1000); }
async function loadNewPuzzle() {
    const diff = document.getElementById("difficulty-selector").value;
    document.getElementById("game-status").textContent = "Loading...";
    try {
        const res = await fetch(`/api/puzzle?difficulty=${diff}`);
        const data = await res.json();
        startingBoard = data.puzzle; currentSolution = data.solution;
        renderBoard(startingBoard); startTimer(); document.getElementById("game-status").textContent = "";
    } catch { document.getElementById("game-status").textContent = "Error"; }
}
function renderBoard(grid) {
    const container = document.getElementById("sudoku-board"); container.innerHTML = "";
    for (let r=0; r<9; r++) {
        for (let c=0; c<9; c++) {
            const val = grid[r][c]; const cell = document.createElement("div"); cell.className = "cell";
            if (val !== 0) { cell.classList.add("fixed"); cell.textContent = val; }
            else {
                const input = document.createElement("input"); input.type = "text"; input.maxLength = 1; input.dataset.row = r; input.dataset.col = c;
                input.addEventListener("input", (e) => { if (!/^[1-9]$/.test(e.target.value)) e.target.value = ""; });
                cell.appendChild(input);
            }
            container.appendChild(cell);
        }
    }
}
function getCurrentBoardState() {
    const state = []; const cells = document.querySelectorAll("#sudoku-board .cell"); let i = 0;
    for (let r=0; r<9; r++) {
        const row = [];
        for (let c=0; c<9; c++) {
            const el = cells[i++];
            if (el.classList.contains("fixed")) row.push(parseInt(el.textContent, 10));
            else { const v = el.querySelector("input").value; row.push(v === "" ? 0 : parseInt(v, 10)); }
        }
        state.push(row);
    }
    return state;
}
async function checkSolution() {
    const userBoard = getCurrentBoardState();
    for (let r=0; r<9; r++) for (let c=0; c<9; c++) if (userBoard[r][c] === 0) { document.getElementById("game-status").textContent = "Puzzle incomplete!"; return; }
    const res = await fetch("/api/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ board: userBoard, solution: currentSolution }) });
    const result = await res.json();
    document.getElementById("game-status").textContent = result.is_correct ? "Congratulations! Solved!" : "Errors found.";
    if (result.is_correct) clearInterval(timerInterval);
}
function fillHint() {
    const inputs = Array.from(document.querySelectorAll("#sudoku-board input")).filter(i => !i.value);
    if (!inputs.length) return;
    const target = inputs[Math.floor(Math.random() * inputs.length)];
    target.value = currentSolution[parseInt(target.dataset.row)][parseInt(target.dataset.col)];
}
function revealSolution() { clearInterval(timerInterval); renderBoard(currentSolution); document.getElementById("game-status").textContent = "Solution revealed."; }
document.getElementById("btn-new-game").addEventListener("click", loadNewPuzzle);
document.getElementById("btn-check").addEventListener("click", checkSolution);
document.getElementById("btn-hint").addEventListener("click", fillHint);
document.getElementById("btn-solve").addEventListener("click", revealSolution);
window.addEventListener("DOMContentLoaded", loadNewPuzzle);
