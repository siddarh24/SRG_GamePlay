package com.srg.demo;


public class GameState {

    private final char[][] board;
    private final char currentPlayer;
    private final String status;
    private final String winner;
    private final int xMoves;
    private final int oMoves;
    private final boolean mustSelect;
    private final int selectedRow;
    private final int selectedCol;

    public GameState(
            char[][] board,
            char currentPlayer,
            String status,
            String winner,
            int xMoves,
            int oMoves,
            boolean mustSelect,
            int selectedRow,
            int selectedCol) {

        this.board = board;
        this.currentPlayer = currentPlayer;
        this.status = status;
        this.winner = winner;
        this.xMoves = xMoves;
        this.oMoves = oMoves;
        this.mustSelect = mustSelect;
        this.selectedRow = selectedRow;
        this.selectedCol = selectedCol;
    }

    public char[][] getBoard() {
        return board;
    }

    public char getCurrentPlayer() {
        return currentPlayer;
    }

    public String getStatus() {
        return status;
    }

    public String getWinner() {
        return winner;
    }

    public int getXMoves() {
        return xMoves;
    }

    public int getOMoves() {
        return oMoves;
    }

    public boolean isMustSelect() {
        return mustSelect;
    }

    public int getSelectedRow() {
        return selectedRow;
    }

    public int getSelectedCol() {
        return selectedCol;
    }
}