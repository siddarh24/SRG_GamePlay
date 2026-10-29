package com.srg.demo;


import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/game")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping
    public GameState getGame() {
        return gameService.getState();
    }

    @PostMapping("/move")
    public GameState move(@RequestBody Map<String, Integer> request) {

        Integer row = request.get("row");
        Integer col = request.get("col");

        if (row == null || col == null) {
            throw new IllegalArgumentException(
                "Row and column are required"
            );
        }

        return gameService.clickCell(row, col);
    }

    @PostMapping("/reset")
    public GameState reset() {
        return gameService.reset();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> invalidMove(
            IllegalArgumentException ex) {

        return ResponseEntity.badRequest()
            .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> gameOver(
            IllegalStateException ex) {

        return ResponseEntity.status(409)
            .body(Map.of("error", ex.getMessage()));
    }
}
