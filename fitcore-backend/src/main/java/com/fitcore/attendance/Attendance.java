package com.fitcore.attendance;

import com.fitcore.user.AppUser;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "attendances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private AppUser student;

    @Column(nullable = false, updatable = false)
    private LocalDateTime checkInAt;

    @PrePersist
    public void onCreate() {
        if (this.checkInAt == null) {
            this.checkInAt = LocalDateTime.now();
        }
    }
}