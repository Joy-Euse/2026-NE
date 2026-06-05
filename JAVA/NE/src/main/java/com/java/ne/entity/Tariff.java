package com.java.ne.entity;

import com.java.ne.enums.MeterType;
import com.java.ne.enums.TariffType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Tariff extends BaseAuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MeterType meterType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TariffType tariffType;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal ratePerUnit;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal fixedCharge;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal vatPercentage;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal penaltyPercentage;

    @Column(nullable = false)
    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    @Column(nullable = false)
    private boolean active;

    @Builder.Default
    @OneToMany(mappedBy = "tariff", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TariffTier> tiers = new ArrayList<>();
}
