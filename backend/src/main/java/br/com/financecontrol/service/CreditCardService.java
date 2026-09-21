package br.com.financecontrol.service;

import br.com.financecontrol.dto.creditcard.CreditCardRequest;
import br.com.financecontrol.dto.creditcard.CreditCardResponse;
import br.com.financecontrol.dto.creditcard.CreditCardUpdateRequest;
import br.com.financecontrol.entity.CreditCard;
import br.com.financecontrol.entity.User;
import br.com.financecontrol.entity.enums.InstallmentStatus;
import br.com.financecontrol.entity.enums.Status;
import br.com.financecontrol.exception.BusinessRuleException;
import br.com.financecontrol.exception.ResourceNotFoundException;
import br.com.financecontrol.mapper.CreditCardMapper;
import br.com.financecontrol.repository.CreditCardRepository;
import br.com.financecontrol.repository.InstallmentRepository;
import br.com.financecontrol.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class CreditCardService {

    private final CreditCardRepository creditCardRepository;
    private final InstallmentRepository installmentRepository;
    private final UserRepository userRepository;

    public CreditCardService(CreditCardRepository creditCardRepository,
                             InstallmentRepository installmentRepository,
                             UserRepository userRepository) {
        this.creditCardRepository = creditCardRepository;
        this.installmentRepository = installmentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CreditCardResponse create(UUID userId, CreditCardRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("user.notFound"));
        CreditCard card = new CreditCard();
        card.setUser(user);
        card.setName(request.name());
        card.setCreditLimit(request.creditLimit());
        card.setClosingDay(request.closingDay());
        card.setDueDay(request.dueDay());
        card.setStatus(Status.ACTIVE);
        return CreditCardMapper.toResponse(creditCardRepository.save(card), BigDecimal.ZERO);
    }

    @Transactional(readOnly = true)
    public List<CreditCardResponse> list(UUID userId) {
        return creditCardRepository.findByUser_IdOrderByName(userId).stream()
                .map(card -> CreditCardMapper.toResponse(card, usedLimit(card.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public CreditCardResponse get(UUID userId, UUID id) {
        CreditCard card = findOwned(userId, id);
        return CreditCardMapper.toResponse(card, usedLimit(card.getId()));
    }

    @Transactional
    public CreditCardResponse update(UUID userId, UUID id, CreditCardUpdateRequest request) {
        CreditCard card = findOwned(userId, id);
        card.setName(request.name());
        card.setCreditLimit(request.creditLimit());
        card.setClosingDay(request.closingDay());
        card.setDueDay(request.dueDay());
        creditCardRepository.save(card);
        return CreditCardMapper.toResponse(card, usedLimit(card.getId()));
    }

    @Transactional
    public void deactivate(UUID userId, UUID id) {
        CreditCard card = findOwned(userId, id);
        if (card.getStatus() == Status.INACTIVE) {
            throw new BusinessRuleException("creditCard.alreadyInactive");
        }
        card.setStatus(Status.INACTIVE);
        creditCardRepository.save(card);
    }

    public CreditCard findOwned(UUID userId, UUID id) {
        return creditCardRepository.findByUser_IdAndId(userId, id)
                .orElseThrow(() -> new ResourceNotFoundException("creditCard.notFound"));
    }

    public BigDecimal usedLimit(UUID cardId) {
        return installmentRepository.sumByCardAndStatus(cardId, InstallmentStatus.OPEN);
    }
}