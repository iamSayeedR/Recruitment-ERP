package com.recruitmenterp.candidate.domain.model;

import com.recruitmenterp.common.multitenancy.TenantAwareBaseEntity;
import com.recruitmenterp.common.crypto.FieldEncryptionConverter;
import com.recruitmenterp.common.crypto.LocalDateEncryptionConverter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "candidates")
@Getter
@Setter
public class Candidate extends TenantAwareBaseEntity {

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private String nationality;
    private LocalDate dateOfBirth;
    private String email;
    private String phone;
    private String whatsappNumber;

    @Convert(converter = FieldEncryptionConverter.class)
    private String passportNumber;

    @Convert(converter = FieldEncryptionConverter.class)
    private String nationalId;

    @Convert(converter = LocalDateEncryptionConverter.class)
    private LocalDate passportExpiry;

    private LocalDate expiryAlertDate;

    public void setPassportExpiry(LocalDate date) {
        this.passportExpiry = date;
        this.expiryAlertDate = date;
    }

    @PrePersist
    @PreUpdate
    public void syncExpiryAlertDate() {
        this.expiryAlertDate = this.passportExpiry;
    }

    private String skills;
    private String certifications;
    private String workExperience;

    @Enumerated(EnumType.STRING)
    private Source source;

    @Enumerated(EnumType.STRING)
    private CandidateStatus status;

    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id")
    private List<CandidateDocument> documents = new ArrayList<>();
}
