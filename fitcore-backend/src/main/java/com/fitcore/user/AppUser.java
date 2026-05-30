package com.fitcore.user;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(nullable = false)
    private Boolean active;

    @Column(unique = true, length = 8)
    private String dni;

    @Column(length = 9)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private MembershipPlan membershipPlan;

    @Column(precision = 10, scale = 2)
    private BigDecimal membershipAmount;

    private LocalDate membershipStartDate;

    private LocalDate membershipEndDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coach_id")
    private AppUser coach;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        if (this.active == null) {
            this.active = true;
        }

        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}