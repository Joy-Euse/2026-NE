package com.java.ne.exception;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
