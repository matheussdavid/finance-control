package br.com.financecontrol.service;

import br.com.financecontrol.dto.auth.AuthResponse;
import br.com.financecontrol.dto.auth.LoginRequest;
import br.com.financecontrol.dto.auth.RegisterRequest;
import br.com.financecontrol.dto.auth.UserSummary;
import br.com.financecontrol.entity.User;
import br.com.financecontrol.exception.BusinessRuleException;
import br.com.financecontrol.exception.InvalidCredentialsException;
import br.com.financecontrol.repository.UserRepository;
import br.com.financecontrol.security.AuthenticatedUser;
import br.com.financecontrol.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessRuleException("auth.emailAlreadyRegistered");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new BusinessRuleException("auth.usernameAlreadyRegistered");
        }
        if (!request.password().equals(request.confirmPassword())) {
            throw new BusinessRuleException("auth.passwordMismatch");
        }
        User user = new User();
        user.setName(request.name());
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        User saved = userRepository.save(user);
        return buildResponse(saved);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailOrUsername(request.identifier(), request.identifier())
                .orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        return buildResponse(user);
    }

    private AuthResponse buildResponse(User user) {
        AuthenticatedUser principal = new AuthenticatedUser(user.getId(), user.getEmail());
        String token = jwtService.generateToken(principal);
        return new AuthResponse(token, new UserSummary(user.getId(), user.getName(), user.getEmail()));
    }
}