package com.recruitmenterp.iam.domain.model;

import com.recruitmenterp.common.multitenancy.TenantAwareBaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "client_contracts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientContract extends TenantAwareBaseEntity {

    private LocalDate startDate;
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String terms;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContractStatus status;

    private BigDecimal contractValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;
}
