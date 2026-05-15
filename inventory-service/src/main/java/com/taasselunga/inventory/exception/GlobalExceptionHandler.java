package com.taasselunga.inventory.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

// Gestione centralizzata delle eccezioni REST
@RestControllerAdvice
public class GlobalExceptionHandler {

    //Gestisce gli errori di business (stock insufficiente ecc.)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "timestamp", LocalDateTime.now(),    //Data e ora dell'errore
                "status", 400,                       //Codice HTTP restituito
                "error", "Bad Request",              //Tipologia d'errore
                "message", ex.getMessage()               //Messaggio specifico dell'eccezione
        ));
    }

    //Gestisce gli errori generici (es. prodotto non trovato)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND).body(Map.of(
                        "timestamp", LocalDateTime.now(),    //Data e ora dell'errore
                        "status", 404,                       //Codice HTTP restituito
                        "error", "Not Found",                //Tipologia d'errore
                        "message", ex.getMessage()               //Messaggio specifico dell'eccezione
                ));
    }
}