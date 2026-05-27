package com.piisw.wallet;

import com.piisw.common.exception.InsufficientFundsException;
import com.piisw.common.exception.ResourceNotFoundException;
import java.math.BigDecimal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WalletService {

    private final WalletRepository walletRepository;

    public WalletService(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    @Transactional(readOnly = true)
    public Wallet getByUserId(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfel nie istnieje"));
    }

    @Transactional
    public Wallet topUp(Long userId, BigDecimal amount) {
        Wallet wallet = walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfel nie istnieje"));
        wallet.setBalance(wallet.getBalance().add(amount));
        return wallet;
    }

    @Transactional
    public void debit(Long userId, BigDecimal amount) {
        Wallet wallet = walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfel nie istnieje"));
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException("Niewystarczające saldo");
        }
        wallet.setBalance(wallet.getBalance().subtract(amount));
    }
}
