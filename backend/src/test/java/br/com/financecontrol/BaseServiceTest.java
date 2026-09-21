package br.com.financecontrol;

import br.com.financecontrol.dto.account.AccountRequest;
import br.com.financecontrol.dto.account.AccountResponse;
import br.com.financecontrol.dto.category.CategoryRequest;
import br.com.financecontrol.dto.category.CategoryResponse;
import br.com.financecontrol.entity.User;
import br.com.financecontrol.entity.enums.AccountType;
import br.com.financecontrol.entity.enums.CategoryType;
import br.com.financecontrol.repository.UserRepository;
import br.com.financecontrol.service.AccountService;
import br.com.financecontrol.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.UUID;

@SpringBootTest
@Transactional
public abstract class BaseServiceTest {

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected AccountService accountService;

    @Autowired
    protected CategoryService categoryService;

    protected User createUser(String email) {
        User user = new User();
        user.setName("Test User");
        user.setEmail(email);
        user.setUsername(email.split("@")[0]);
        user.setPasswordHash("$2a$10$abcdefghijklmnopqrstuv");
        return userRepository.save(user);
    }

    protected AccountResponse createAccount(UUID userId, String name, String initialBalance) {
        return accountService.create(userId,
                new AccountRequest(name, AccountType.CHECKING, new BigDecimal(initialBalance)));
    }

    protected CategoryResponse createCategory(UUID userId, String name, CategoryType type) {
        return categoryService.create(userId, new CategoryRequest(name, type));
    }

    protected LocalDate dayOf(YearMonth month, int day) {
        return LocalDate.of(month.getYear(), month.getMonth(), day);
    }
}