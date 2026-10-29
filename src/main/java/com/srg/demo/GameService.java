package com.srg.demo;

import org.springframework.stereotype.Service;

@Service
public class GameService {

    private char[][] board = new char[3][3];

    private char currentPlayer = 'X';
    private String status = "IN_PROGRESS";
    private String winner = "";

    private int xMoves = 0;
    private int oMoves = 0;

    private boolean mustSelect = false;
    private int selectedRow = -1;
    private int selectedCol = -1;

    public GameService() {
        clearBoard();
    }

    public synchronized GameState getState() {
        return createState();
    }

    public synchronized GameState clickCell(int row, int col) {

        if (row < 0 || row > 2 || col < 0 || col > 2) {
            throw new IllegalArgumentException("Invalid cell position");
        }

        if (!"IN_PROGRESS".equals(status)) {
            throw new IllegalStateException("Game is over. Restart to play.");
        }

        int moves = currentPlayer == 'X' ? xMoves : oMoves;

        // First three moves: place symbols in empty cells.
        if (moves < 3) {

            if (board[row][col] != ' ') {
                throw new IllegalArgumentException("Cell is occupied");
            }

            board[row][col] = currentPlayer;
            increaseMoves();

            finishMove();
            return createState();
        }

        // After three moves, select an existing own symbol.
        if (!mustSelect) {

            if (board[row][col] != currentPlayer) {
                throw new IllegalArgumentException(
                    "Select your own symbol: " + currentPlayer
                );
            }

            mustSelect = true;
            selectedRow = row;
            selectedCol = col;

            return createState();
        }

        // Clicking the selected symbol again cancels selection.
        if (row == selectedRow && col == selectedCol) {
            mustSelect = false;
            selectedRow = -1;
            selectedCol = -1;

            return createState();
        }

        // Destination must be empty.
        if (board[row][col] != ' ') {
            throw new IllegalArgumentException(
                "Choose an empty cell to move your symbol"
            );
        }

        // Move the selected symbol.
        board[row][col] = currentPlayer;
        board[selectedRow][selectedCol] = ' ';

        mustSelect = false;
        selectedRow = -1;
        selectedCol = -1;

        finishMove();

        return createState();
    }

    private void increaseMoves() {
        if (currentPlayer == 'X') {
            xMoves++;
        } else {
            oMoves++;
        }
    }

    private void finishMove() {

        if (hasWon(currentPlayer)) {
            status = "WON";
            winner = String.valueOf(currentPlayer);
            return;
        }

        // No draw condition: the game continues until someone wins.
        currentPlayer = currentPlayer == 'X' ? 'O' : 'X';

        mustSelect = false;
        selectedRow = -1;
        selectedCol = -1;
    }

    private boolean hasWon(char player) {

        // Check rows and columns.
        for (int i = 0; i < 3; i++) {

            if (board[i][0] == player
                    && board[i][1] == player
                    && board[i][2] == player) {
                return true;
            }

            if (board[0][i] == player
                    && board[1][i] == player
                    && board[2][i] == player) {
                return true;
            }
        }

        // Check diagonals.
        return (board[0][0] == player
                    && board[1][1] == player
                    && board[2][2] == player)
                || (board[0][2] == player
                    && board[1][1] == player
                    && board[2][0] == player);
    }

    public synchronized GameState reset() {

        clearBoard();

        currentPlayer = 'X';
        status = "IN_PROGRESS";
        winner = "";

        xMoves = 0;
        oMoves = 0;

        mustSelect = false;
        selectedRow = -1;
        selectedCol = -1;

        return createState();
    }

    private void clearBoard() {

        board = new char[3][3];

        for (int row = 0; row < 3; row++) {
            for (int col = 0; col < 3; col++) {
                board[row][col] = ' ';
            }
        }
    }

    private GameState createState() {

        char[][] copy = new char[3][3];

        for (int row = 0; row < 3; row++) {
            copy[row] = board[row].clone();
        }

        return new GameState(
            copy,
            currentPlayer,
            status,
            winner,
            xMoves,
            oMoves,
            mustSelect,
            selectedRow,
            selectedCol
        );
    }
}