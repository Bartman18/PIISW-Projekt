package com.piisw.common.mapper;

import com.piisw.wallet.Wallet;
import com.piisw.wallet.dto.WalletResponse;
import org.springframework.stereotype.Component;

@Component
public class WalletMapper {

    public WalletResponse toDto(Wallet entity) {
        return new WalletResponse(entity.getBalance());
    }
}
