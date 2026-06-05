package com.java.ne.exception;

public class InvalidBusinessOperationException extends RuntimeException {
    public InvalidBusinessOperationException(String message) {
        super(message);
    }
}
