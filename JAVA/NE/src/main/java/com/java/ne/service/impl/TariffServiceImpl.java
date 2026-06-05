package com.java.ne.service.impl;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.dto.request.TariffRequest;
import com.java.ne.dto.response.TariffResponse;
import com.java.ne.entity.Tariff;
import com.java.ne.entity.TariffTier;
import com.java.ne.exception.InvalidBusinessOperationException;
import com.java.ne.exception.ResourceNotFoundException;
import com.java.ne.mapper.BillingMapper;
import com.java.ne.repository.TariffRepository;
import com.java.ne.service.TariffService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class TariffServiceImpl implements TariffService {

    private final TariffRepository tariffRepository;
    private final BillingMapper mapper;

    @Override
    public TariffResponse create(TariffRequest request) {
        validateTariffPeriod(request, null);
        Tariff tariff = Tariff.builder()
                .meterType(request.meterType())
                .tariffType(request.tariffType())
                .ratePerUnit(request.ratePerUnit())
                .fixedCharge(request.fixedCharge())
                .vatPercentage(request.vatPercentage())
                .penaltyPercentage(request.penaltyPercentage())
                .effectiveFrom(request.effectiveFrom())
                .effectiveTo(request.effectiveTo())
                .active(request.active())
                .tiers(new ArrayList<>())
                .build();
        if (request.tiers() != null) {
            request.tiers().forEach(tierRequest -> {
                TariffTier tier = TariffTier.builder()
                        .tariff(tariff)
                        .minUnit(tierRequest.minUnit())
                        .maxUnit(tierRequest.maxUnit())
                        .ratePerUnit(tierRequest.ratePerUnit())
                        .build();
                tariff.getTiers().add(tier);
            });
        }
        return mapper.toTariffResponse(tariffRepository.save(tariff));
    }

    @Override
    public Page<TariffResponse> getAll(Pageable pageable) {
        return tariffRepository.findAll(pageable).map(mapper::toTariffResponse);
    }

    @Override
    public TariffResponse getById(Long id) {
        return mapper.toTariffResponse(tariffRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Tariff not found")));
    }

    @Override
    @Transactional
    public TariffResponse update(Long id, TariffRequest request) {
        Tariff tariff = tariffRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Tariff not found"));
        validateTariffPeriod(request, id);

        tariff.setMeterType(request.meterType());
        tariff.setTariffType(request.tariffType());
        tariff.setRatePerUnit(request.ratePerUnit());
        tariff.setFixedCharge(request.fixedCharge());
        tariff.setVatPercentage(request.vatPercentage());
        tariff.setPenaltyPercentage(request.penaltyPercentage());
        tariff.setEffectiveFrom(request.effectiveFrom());
        tariff.setEffectiveTo(request.effectiveTo());
        tariff.setActive(request.active());

        tariff.getTiers().clear();
        if (request.tiers() != null) {
            request.tiers().forEach(tierRequest -> tariff.getTiers().add(TariffTier.builder()
                    .tariff(tariff)
                    .minUnit(tierRequest.minUnit())
                    .maxUnit(tierRequest.maxUnit())
                    .ratePerUnit(tierRequest.ratePerUnit())
                    .build()));
        }

        return mapper.toTariffResponse(tariffRepository.save(tariff));
    }

    private void validateTariffPeriod(TariffRequest request, Long tariffIdToIgnore) {
        if (request.effectiveTo() != null && request.effectiveTo().isBefore(request.effectiveFrom())) {
            throw new InvalidBusinessOperationException("Tariff effectiveTo cannot be before effectiveFrom");
        }
        if (request.active()) {
            boolean overlaps = tariffRepository.findByMeterTypeAndActiveTrue(request.meterType()).stream()
                    .filter(existing -> tariffIdToIgnore == null || !existing.getId().equals(tariffIdToIgnore))
                    .anyMatch(existing -> periodsOverlap(request, existing));
            if (overlaps) {
                throw new InvalidBusinessOperationException("An active tariff already exists for this meter type and period");
            }
        }
    }

    private boolean periodsOverlap(TariffRequest request, Tariff existing) {
        var newEnd = request.effectiveTo() == null ? java.time.LocalDate.MAX : request.effectiveTo();
        var existingEnd = existing.getEffectiveTo() == null ? java.time.LocalDate.MAX : existing.getEffectiveTo();
        return !request.effectiveFrom().isAfter(existingEnd) && !existing.getEffectiveFrom().isAfter(newEnd);
    }
}
