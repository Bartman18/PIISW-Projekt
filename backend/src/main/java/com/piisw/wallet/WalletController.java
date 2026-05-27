package com.piisw.wallet;

import com.piisw.auth.AuthenticatedUser;
import com.piisw.common.mapper.WalletMapper;
import com.piisw.wallet.dto.TopUpRequest;
import com.piisw.wallet.dto.WalletResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/passenger/wallet")
public class WalletController {

    private final WalletService walletService;
    private final WalletMapper walletMapper;

    public WalletController(WalletService walletService, WalletMapper walletMapper) {
        this.walletService = walletService;
        this.walletMapper = walletMapper;
    }

    @GetMapping
    public WalletResponse getWallet(@AuthenticationPrincipal AuthenticatedUser principal) {
        return walletMapper.toDto(walletService.getByUserId(principal.id()));
    }

    @PostMapping("/topup")
    public WalletResponse topUp(@AuthenticationPrincipal AuthenticatedUser principal,
                                @Valid @RequestBody TopUpRequest request) {
        return walletMapper.toDto(walletService.topUp(principal.id(), request.amount()));
    }
}
