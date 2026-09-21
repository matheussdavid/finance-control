package br.com.financecontrol.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;

import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class MessageSourceResolutionTest {

    @Autowired
    private MessageSource messageSource;

    @Test
    void resolvesAuthInvalidCredentials() {
        LocaleContextHolder.setLocale(new Locale("pt", "BR"));
        try {
            String msg = messageSource.getMessage("auth.invalidCredentials", null, "[fallback]", LocaleContextHolder.getLocale());
            System.out.println("RESOLVED=[" + msg + "] bean=" + messageSource.getClass().getName());
            assertThat(msg).isEqualTo("Usu\u00e1rio ou senha inv\u00e1lidos");
        } finally {
            LocaleContextHolder.resetLocaleContext();
        }
    }
}