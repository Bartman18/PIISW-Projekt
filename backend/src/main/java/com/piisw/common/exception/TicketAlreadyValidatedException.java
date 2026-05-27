package com.piisw.common.exception;

import org.springframework.http.HttpStatus;

public class TicketAlreadyValidatedException extends ApiException {

    public TicketAlreadyValidatedException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
