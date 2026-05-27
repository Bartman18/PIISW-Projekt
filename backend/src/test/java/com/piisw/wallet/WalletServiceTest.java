package com.piisw.wallet;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.piisw.common.exception.InsufficientFundsException;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @InjectMocks
    private WalletService walletService;

    @Test
    void topUpAddsAmountToBalance() {
        Wallet wallet = new Wallet(null, new BigDecimal("50.00"));
        when(walletRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(wallet));

        Wallet result = walletService.topUp(1L, new BigDecimal("20.00"));

        assertThat(result.getBalance()).isEqualByComparingTo("70.00");
    }

    @Test
    void debitSubtractsAmountWhenSufficient() {
        Wallet wallet = new Wallet(null, new BigDecimal("50.00"));
        when(walletRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(wallet));

        walletService.debit(1L, new BigDecimal("4.00"));

        assertThat(wallet.getBalance()).isEqualByComparingTo("46.00");
    }

    @Test
    void debitThrowsWhenBalanceTooLow() {
        Wallet wallet = new Wallet(null, new BigDecimal("3.00"));
        when(walletRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(wallet));

        assertThatThrownBy(() -> walletService.debit(1L, new BigDecimal("4.00")))
                .isInstanceOf(InsufficientFundsException.class);

        assertThat(wallet.getBalance()).isEqualByComparingTo("3.00");
    }
}
