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
        ErrorResponse err = new ErrorResponse(
                ex.getMessage(),
                LocalDateTime.now(),
                "Resource Not Found",
                HttpStatus.NOT_FOUND.value()
        );
        return new ResponseEntity<>(err, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(AlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleAlreadyExists(AlreadyExistsException ex) {
        ErrorResponse err = new ErrorResponse(
                ex.getMessage(),
                LocalDateTime.now(),
                "Already Exists",
                HttpStatus.CONFLICT.value()
        );
        return new ResponseEntity<>(err, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        ErrorResponse err = new ErrorResponse(
                ex.getMessage(),
                LocalDateTime.now(),
                "Bad Request",
                HttpStatus.BAD_REQUEST.value()
        );
        return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex) {
        ErrorResponse err = new ErrorResponse(
                ex.getMessage(),
                LocalDateTime.now(),
                "Bad Request",
                HttpStatus.BAD_REQUEST.value()
        );
        return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadableBody(org.springframework.http.converter.HttpMessageNotReadableException ex) {
        String message = ex.getMostSpecificCause() != null && ex.getMostSpecificCause().getMessage() != null
                ? ex.getMostSpecificCause().getMessage()
                : ex.getMessage();
        ErrorResponse err = new ErrorResponse(
                message,
                LocalDateTime.now(),
                "Bad Request",
                HttpStatus.BAD_REQUEST.value()
        );
        return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
    }
}
