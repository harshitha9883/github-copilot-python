let currentSolution = [];
let timerId = null;
let seconds = 0;

function formatDuration(s) {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
}

function startTimer() {
    clearInterval(timerId);
    seconds = 0;
    document.getElementById("timer").textContent = "00:00";
    timerId = setInterval(() => {
        seconds++;
        document.getElementById("timer").textContent = formatDuration(seconds);
    }, 1000);
}

function getSubgridClass(r, c) {
    return (Math.floor(r / 3) + Math.floor(c / 3)) % 2 === 0 ? "block-even" : "block-odd";
}

async function fetchNewGame() {
    const diff = document.getElementById("difficulty").value;
    document.getElementById("status").textContent = "Loading puzzle...";
    try {
        const res = await fetch(`/api/puzzle?difficulty=${diff}`);
        const data = await res.json();
        currentSolution = data.solution;
        renderGrid(data.puzzle);
        startTimer();
        document.getElementById("status").textContent = "";
    } catch {
        document.getElementById("status").textContent = "Error loading puzzle.";
    }
}

function renderGrid(board) {
    const container = document.getElementById("sudoku-grid");
    container.innerHTML = "";
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const val = board[r][c];
            const cell = document.createElement("div");
            cell.className = `cell ${getSubgridClass(r, c)}`;
            if (val !== 0) {
                cell.classList.add("fixed");
                cell.textContent = val;
            } else {
                const inp = document.createElement("input");
                inp.type = "text";
                inp.maxLength = 1;
                inp.dataset.row = r;
                inp.dataset.col = c;
                inp.addEventListener("input", (e) => {
                    if (!/^[1-9]$/.test(e.target.value)) e.target.value = "";
                });
                cell.appendChild(inp);
            }
            container.appendChild(cell);
        }
    }
}

function readCurrentGrid() {
    const res = [];
    const cells = document.querySelectorAll("#sudoku-grid .cell");
    let i = 0;
    for (let r = 0; r < 9; r++) {
        const row = [];
        for (let c = 0; c < 9; c++) {
            const el = cells[i++];
            if (el.classList.contains("fixed")) {
                row.push(parseInt(el.textContent, 10));
            } else {
                const val = el.querySelector("input").value;
                row.push(val ? parseInt(val, 10) : 0);
            }
        }
        res.push(row);
    }
    return res;
}

function saveHighScore(sec) {
    let scores = JSON.parse(localStorage.getItem("top_scores") || "[]");
    scores.push(sec);
    scores.sort((a, b) => a - b);
    scores = scores.slice(0, 10);
    localStorage.setItem("top_scores", JSON.stringify(scores));
    displayLeaderboard();
}

function displayLeaderboard() {
    const list = document.getElementById("leaderboard-list");
    const scores = JSON.parse(localStorage.getItem("top_scores") || "[]");
    list.innerHTML = scores.map((s, idx) => `<li>Record #${idx + 1}: ${formatDuration(s)}</li>`).join("");
}

async function verifyGame() {
    const userBoard = readCurrentGrid();
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (userBoard[r][c] === 0) {
                document.getElementById("status").textContent = "Grid incomplete!";
                return;
            }
        }
    }
    const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board: userBoard, solution: currentSolution })
    });
    const result = await res.json();
    if (result.is_correct) {
        clearInterval(timerId);
        document.getElementById("status").textContent = "Solved! Saved to Top 10!";
        saveHighScore(seconds);
    } else {
        document.getElementById("status").textContent = "Errors identified on board.";
    }
}

document.getElementById("btn-new").addEventListener("click", fetchNewGame);
document.getElementById("btn-verify").addEventListener("click", verifyGame);
document.getElementById("btn-hint").addEventListener("click", () => {
    const blanks = Array.from(document.querySelectorAll("#sudoku-grid input")).filter(i => !i.value);
    if (!blanks.length) return;
    const target = blanks[Math.floor(Math.random() * blanks.length)];
    target.value = currentSolution[target.dataset.row][target.dataset.col];
});
document.getElementById("btn-solve").addEventListener("click", () => {
    clearInterval(timerId);
    renderGrid(currentSolution);
    document.getElementById("status").textContent = "Solution displayed.";
});

window.addEventListener("DOMContentLoaded", () => {
    fetchNewGame();
    displayLeaderboard();
});
