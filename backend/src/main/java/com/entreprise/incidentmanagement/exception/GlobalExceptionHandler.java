package com.entreprise.incidentmanagement.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        ErrorResponse err= new ErrorResponse(
                ex.getMessage(),
                LocalDateTime.now(),
                "Resource Not Found",
                HttpStatus.NOT_FOUND.value()
        );
        return new ResponseEntity<>(err,HttpStatus.NOT_FOUND);
    }
    @ExceptionHandler(AlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleAlreadyExists(AlreadyExistsException ex) {
        ErrorResponse err= new ErrorResponse(
                ex.getMessage(),
                LocalDateTime.now(),
                "Already Exists",
                HttpStatus.CONFLICT.value()
        );
        return new ResponseEntity<>(err,HttpStatus.NOT_FOUND);
    }

}
