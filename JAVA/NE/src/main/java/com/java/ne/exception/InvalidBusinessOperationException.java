package com.java.ne.exception;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
public class InvalidBusinessOperationException extends RuntimeException {
    public InvalidBusinessOperationException(String message) {
        super(message);
    }
}
