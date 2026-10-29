
const API = "/api/game";

const cells = [...document.querySelectorAll(".cell")];
const statusText = document.getElementById("status");
const instruction = document.getElementById("instruction");
const restartButton = document.getElementById("restart");

const playerX = document.getElementById("playerX");
const playerO = document.getElementById("playerO");
const countX = document.getElementById("countX");
const countO = document.getElementById("countO");

const themeToggle = document.getElementById("themeToggle");
const musicToggle = document.getElementById("musicToggle");
const soundToggle = document.getElementById("soundToggle");
const volume = document.getElementById("volume");
const volumeValue = document.getElementById("volumeValue");

const modal = document.getElementById("aboutModal");
const aboutOpen = document.getElementById("aboutOpen");
const aboutClose = document.getElementById("aboutClose");
const aboutDone = document.getElementById("aboutDone");
const developerPhoto = document.getElementById("developerPhoto");

const backgroundAudio = document.getElementById("backgroundAudio");
const placeAudio = document.getElementById("placeAudio");
const moveAudio = document.getElementById("moveAudio");
const winAudio = document.getElementById("winAudio");

let gameState = null;
let busy = false;
let effectsEnabled = true;
let musicEnabled = false;
let lastFocusedElement = null;

// Theme preference
function applyTheme(theme) {
    document.body.classList.toggle("light", theme === "light");
    themeToggle.textContent = theme === "light" ? "🌙" : "☀️";
    themeToggle.title =
        theme === "light" ? "Switch to dark mode" : "Switch to light mode";

    document.querySelector('meta[name="theme-color"]')
        .setAttribute("content", theme === "light" ? "#f3f5fc" : "#101426");
}

let savedTheme = "dark";

try {
    savedTheme = localStorage.getItem("ttt-theme") || "dark";
} catch (_) {
    // Continue without persistent preferences if storage is unavailable.
}

applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
    const nextTheme =
        document.body.classList.contains("light") ? "dark" : "light";

    applyTheme(nextTheme);

    try {
        localStorage.setItem("ttt-theme", nextTheme);
    } catch (_) {
        // The theme still works for this page session.
    }
});

// Audio helpers
function playEffect(audio) {
    if (!effectsEnabled) return;

    try {
        audio.currentTime = 0;
        const playback = audio.play();

        if (playback) playback.catch(() => {});
    } catch (_) {
        // Missing or unsupported audio should not break the game.
    }
}

function updateSoundControls() {
    soundToggle.textContent = effectsEnabled ? "ON" : "OFF";
    soundToggle.setAttribute("aria-pressed", String(effectsEnabled));

    musicToggle.textContent = musicEnabled ? "♫♪" : "♫";
    musicToggle.setAttribute("aria-label",
        musicEnabled ? "Pause background music" : "Play background music");
    musicToggle.title =
        musicEnabled ? "Pause background music" : "Play background music";

    backgroundAudio.volume = Number(volume.value) / 100;
}

async function toggleMusic() {
    if (musicEnabled) {
        backgroundAudio.pause();
        musicEnabled = false;
    } else {
        backgroundAudio.volume = Number(volume.value) / 100;

        try {
            await backgroundAudio.play();
            musicEnabled = true;
        } catch (_) {
            musicEnabled = false;
            instruction.textContent =
                "Music could not start. Check the audio/background.mp3 file.";
        }
    }

    updateSoundControls();
}

musicToggle.addEventListener("click", toggleMusic);

soundToggle.addEventListener("click", () => {
    effectsEnabled = !effectsEnabled;

    if (!effectsEnabled) {
        backgroundAudio.pause();
        musicEnabled = false;
    }

    updateSoundControls();
});

volume.addEventListener("input", () => {
    backgroundAudio.volume = Number(volume.value) / 100;
    volumeValue.textContent = `${volume.value}%`;
});

updateSoundControls();

// Developer profile popup
function openAbout() {
    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    aboutClose.focus();
}

function closeAbout() {
    modal.hidden = true;

    if (lastFocusedElement) {
        lastFocusedElement.focus();
    }
}

aboutOpen.addEventListener("click", openAbout);
aboutClose.addEventListener("click", closeAbout);
aboutDone.addEventListener("click", closeAbout);

modal.addEventListener("click", event => {
    if (event.target.dataset.close === "true") {
        closeAbout();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !modal.hidden) {
        closeAbout();
    }
});

developerPhoto.addEventListener("error", () => {
    developerPhoto.alt = "Developer photo not found";
});

// REST API helpers
async function request(url, options = {}) {
    const response = await fetch(url, options);

    let data;

    try {
        data = await response.json();
    } catch (_) {
        throw new Error("The server returned an invalid response.");
    }

    if (!response.ok) {
        throw new Error(data.error || "Request failed");
    }

    return data;
}

function renderGame(game) {
    gameState = game;

    cells.forEach(cell => {
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);
        const value = game.board[row][col] || "";

        cell.textContent = value.trim();
        cell.classList.toggle("o-mark", value === "O");

        const selected =
            game.mustSelect &&
            row === game.selectedRow &&
            col === game.selectedCol;

        cell.classList.toggle("selected", selected);

        cell.disabled =
            busy || game.status !== "IN_PROGRESS";
    });

    playerX.classList.toggle(
        "active",
        game.currentPlayer === "X" && game.status === "IN_PROGRESS"
    );

    playerO.classList.toggle(
        "active",
        game.currentPlayer === "O" && game.status === "IN_PROGRESS"
    );

    countX.textContent = `${game.xMoves}/3 pieces`;
    countO.textContent = `${game.oMoves}/3 pieces`;

    const gameOver = game.status !== "IN_PROGRESS";

    if (game.status === "WON") {
        statusText.textContent = `Player ${game.winner} wins! 🎉`;
        instruction.textContent = "Amazing move! Start a new game to play again.";
        document.getElementById("turnBadge").textContent =
            `WINNER: ${game.winner}`;
        return;
    }

    statusText.textContent = `Player ${game.currentPlayer}'s turn`;
    document.getElementById("turnBadge").textContent =
        `PLAYER ${game.currentPlayer}`;

    const moves = game.currentPlayer === "X" ? game.xMoves : game.oMoves;

    if (moves < 3) {
        instruction.textContent =
            `Place your ${game.currentPlayer} symbol in an empty cell.`;
    } else if (game.mustSelect) {
        instruction.textContent =
            "Piece selected! Now tap an empty cell to move it.";
    } else {
        instruction.textContent =
            `Select one of your ${game.currentPlayer} pieces to move it.`;
    }
}

async function loadGame() {
    try {
        const game = await request(API);
        renderGame(game);
    } catch (error) {
        statusText.textContent = "Cannot connect to the game server.";
        instruction.textContent =
            "Make sure Spring Boot is running on localhost:8080.";
    }
}

function boardChanged(oldBoard, newBoard) {
    return JSON.stringify(oldBoard) !== JSON.stringify(newBoard);
}

async function clickCell(row, col) {
    if (busy || !gameState || gameState.status !== "IN_PROGRESS") {
        return;
    }

    const previous = gameState;
    const oldBoard = previous.board;
    const previousMoves = previous.currentPlayer === "X"
        ? previous.xMoves : previous.oMoves;

    busy = true;
    cells.forEach(cell => cell.disabled = true);

    let errorMessage = "";

    try {
        const game = await request(`${API}/move`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ row, col })
        });

        const changed = boardChanged(oldBoard, game.board);

        if (changed) {
            if (game.status === "WON") {
                playEffect(winAudio);
            } else if (previousMoves < 3) {
                playEffect(placeAudio);
            } else {
                playEffect(moveAudio);
            }
        } else if (!previous.mustSelect && game.mustSelect) {
            // Optional selection feedback uses the move sound.
            playEffect(moveAudio);
        }

        renderGame(game);
    } catch (error) {
        errorMessage = error.message;
    } finally {
        busy = false;
        await loadGame();

        if (errorMessage) {
            instruction.textContent = errorMessage;
        }
    }
}

cells.forEach(cell => {
    cell.addEventListener("click", () => {
        clickCell(
            Number(cell.dataset.row),
            Number(cell.dataset.col)
        );
    });
});

restartButton.addEventListener("click", async () => {
    if (busy) return;

    busy = true;
    cells.forEach(cell => cell.disabled = true);

    try {
        const game = await request(`${API}/reset`, {
            method: "POST"
        });

        renderGame(game);
    } catch (error) {
        statusText.textContent = error.message;
    } finally {
        busy = false;
        await loadGame();
    }
});

loadGame();
