package br.com.financecontrol.exception;

import java.time.Instant;
import java.util.Map;

public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fields
) {
    public ApiError(int status, String error, String message, String path) {
        this(Instant.now(), status, error, message, path, null);
    }

    public ApiError withFields(Map<String, String> fields) {
        return new ApiError(this.timestamp(), this.status(), this.error(), this.message(), this.path(), fields);
    }
}