package br.com.financecontrol.exception;

public class BusinessRuleException extends RuntimeException {

    private final String code;
    private final Object[] args;

    public BusinessRuleException(String code) {
        this(code, new Object[0]);
    }

    public BusinessRuleException(String code, Object... args) {
        super(code);
        this.code = code;
        this.args = args != null ? args : new Object[0];
    }

    public String getCode() {
        return code;
    }

    public Object[] getArgs() {
        return args;
    }
}