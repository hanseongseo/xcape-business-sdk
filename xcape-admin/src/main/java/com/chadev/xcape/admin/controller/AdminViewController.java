package com.chadev.xcape.admin.controller;

import com.chadev.xcape.admin.service.*;
import com.chadev.xcape.core.domain.dto.AccountDto;
import com.chadev.xcape.core.domain.dto.MerchantDto;
import com.chadev.xcape.core.domain.dto.ThemeDto;
import com.chadev.xcape.core.domain.type.AccountType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Controller
@RequiredArgsConstructor
public class AdminViewController {

    private final MerchantService merchantService;
    private final ReservationService reservationService;
    private final HintService hintService;
    public final SchedulerService schedulerService;
    private final TagService tagService;

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/merchant-settings")
    public String merchant(Model model, Authentication authentication){
        AccountDto accountDto = (AccountDto) authentication.getPrincipal();
        List<MerchantDto> merchantDtoList = new ArrayList<>();
        if (accountDto.getType() == AccountType.MASTER) {
            merchantDtoList = merchantService.getAllMerchantListOrderByOrder();
        }

        if (accountDto.getType() == AccountType.MANAGER) {
            merchantDtoList.add(merchantService.getMerchant(accountDto.getMerchantId()));
        }
        model.addAttribute("merchantList", merchantDtoList);
        return "merchant-settings";
    }

    @GetMapping("/theme-settings")
    public String themeSettings(Model model, Authentication authentication) {
        AccountDto account = (AccountDto) authentication.getPrincipal();
        List<MerchantDto> merchantList = new ArrayList<>();
        if (account.getType() == AccountType.MASTER) {
            merchantList = merchantService.getAllMerchantsWithThemes();
        } else {
            merchantList.add(merchantService.getMerchantWithThemeList(account.getMerchantId()));
        }
        model.addAttribute("merchantList", merchantList);
        return "theme-settings";
    }

    @GetMapping(value = "/reservations")
    public String reservation(
            Model model,
            @RequestParam(required = false, defaultValue = "#{T(java.time.LocalDate).now()}") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date,
            Long merchantId,
            Authentication authentication
    ) {
        AccountDto account = (AccountDto) authentication.getPrincipal();

        if (account.getType() == AccountType.MASTER) {
            merchantId = merchantId == null ? 1L : merchantId;
        } else {
            merchantId = account.getMerchantId();
        }

        MerchantDto merchant = merchantService.getMerchant(merchantId);
        List<ThemeDto> themesWithReservations = reservationService.getThemesWithReservations(merchantId, date);
        merchant.setThemeList(themesWithReservations);

        model.addAttribute("merchant", merchant);

        if (account.getType() == AccountType.MASTER) {
            List<MerchantDto> merchantList = merchantService.getMerchantIdAndNameList();
            model.addAttribute("merchantList", merchantList);
        }

        return "reservation";
    }

    @GetMapping("/hint-settings")
    public String hint(Model model, Authentication authentication) {
        AccountDto accountDto = (AccountDto)authentication.getPrincipal();
        List<MerchantDto> merchantDtoList = new ArrayList<>();
        if (accountDto.getType() == AccountType.MASTER) {
            merchantDtoList = merchantService.getAllMerchantsWithThemes();
        }

        if (accountDto.getType() == AccountType.MANAGER) {
            merchantDtoList.add(merchantService.getMerchantWithThemeList(accountDto.getMerchantId()));
        }

        model.addAttribute("merchantList", merchantDtoList);
        return "hint-settings";
    }

    @GetMapping("/banner-settings")
    public String banner(Model model, Authentication authentication) {
        AccountDto account = (AccountDto) authentication.getPrincipal();
        List<MerchantDto> merchantList = new ArrayList<>();
        if (account.getType() == AccountType.MASTER) {
            merchantList = merchantService.getAllMerchantsWithThemes();
        } else {
            merchantList.add(merchantService.getMerchantWithThemeList(account.getMerchantId()));
        }
        model.addAttribute("merchantList", merchantList);
        return "banner-settings";
    }

    @GetMapping("/mock-reservations")
    public String mockReservations(Model model, Authentication authentication) {
        AccountDto account = (AccountDto) authentication.getPrincipal();
        List<MerchantDto> merchantList = new ArrayList<>();
        if (account.getType() == AccountType.MASTER) {
            merchantList = merchantService.getMerchantList();
        } else {
            merchantList.add(merchantService.getMerchant(account.getMerchantId()));
        }
        model.addAttribute("merchantList", merchantList);
        return "mock-reservations";
    }

    @GetMapping("/file-settings")
    public String fileUpload(Authentication authentication, Model model) {
        AccountDto account = (AccountDto) authentication.getPrincipal();
        List<MerchantDto> merchantList = new ArrayList<>();
        if (account.getType() == AccountType.MASTER) {
            merchantList = merchantService.getAllMerchantsWithThemes();
        } else {
            merchantList.add(merchantService.getMerchantWithThemeList(account.getMerchantId()));
        }
        model.addAttribute("merchantList", merchantList);
        return "file-settings";
    }

    @GetMapping("/tag-settings")
    public String tagSettings(Authentication authentication, Model model) {
        AccountDto account = (AccountDto) authentication.getPrincipal();
        List<MerchantDto> merchantList = new ArrayList<>();
        if (account.getType() == AccountType.MASTER) {
            merchantList = merchantService.getAllMerchantsWithThemes();
        } else {
            merchantList.add(merchantService.getMerchantWithThemeList(account.getMerchantId()));
        }
        model.addAttribute("merchantList", merchantList);
        return "tag-settings";
    }
}
