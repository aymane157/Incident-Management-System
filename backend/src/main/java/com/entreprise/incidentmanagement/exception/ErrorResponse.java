package com.entreprise.incidentmanagement.exception;

import java.time.LocalDateTime;

public class ErrorResponse {
    private String msg;
    private LocalDateTime  timestamp;
    private String errorMsg;
    private int HttpStatus;

    public ErrorResponse(String msg, LocalDateTime timestamp, String errorMsg, int httpStatus) {
        this.msg = msg;
        this.timestamp = timestamp;
        this.errorMsg = errorMsg;
        HttpStatus = httpStatus;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getErrorMsg() {
        return errorMsg;
    }

    public void setErrorMsg(String errorMsg) {
        this.errorMsg = errorMsg;
    }

    public int getHttpStatus() {
        return HttpStatus;
    }

    public void setHttpStatus(int httpStatus) {
        HttpStatus = httpStatus;
    }

    @Override
    public String toString() {
        return "ExceptionResponse{" +
                "msg='" + msg + '\'' +
                ", timestamp=" + timestamp +
                ", errorMsg='" + errorMsg + '\'' +
                ", HttpStatus='" + HttpStatus + '\'' +
                '}';
    }
}
