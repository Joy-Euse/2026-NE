package com.java.ne.exception;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}
