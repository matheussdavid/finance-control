package br.com.financecontrol.exception;

public class InvalidCredentialsException extends RuntimeException {

    public static final String CODE = "auth.invalidCredentials";

    public InvalidCredentialsException() {
        super(CODE);
    }
}