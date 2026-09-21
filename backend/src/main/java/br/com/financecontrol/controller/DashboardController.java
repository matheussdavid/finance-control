package br.com.financecontrol.controller;

import br.com.financecontrol.dto.dashboard.DashboardResponse;
import br.com.financecontrol.security.AuthenticatedUser;
import br.com.financecontrol.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.YearMonth;

@RestController
@RequestMapping("/dashboard")
@Tag(name = "Painel", description = "Agregações do painel financeiro")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    @Operation(summary = "Obter agregações do painel para um mês/ano")
    public ResponseEntity<DashboardResponse> get(@AuthenticationPrincipal AuthenticatedUser user,
                                                 @RequestParam(required = false) Integer month,
                                                 @RequestParam(required = false) Integer year) {
        YearMonth period = YearMonth.now();
        if (month != null && year != null) {
            period = YearMonth.of(year, month);
        } else if (month != null) {
            period = YearMonth.of(YearMonth.now().getYear(), month);
        } else if (year != null) {
            period = YearMonth.of(year, YearMonth.now().getMonthValue());
        }
        return ResponseEntity.ok(dashboardService.get(user.id(), period.getMonthValue(), period.getYear()));
    }
}