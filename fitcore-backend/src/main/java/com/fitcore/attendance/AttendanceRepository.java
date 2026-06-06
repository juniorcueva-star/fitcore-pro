package com.fitcore.attendance;

import com.fitcore.user.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    @Query("""
            SELECT attendance
            FROM Attendance attendance
            JOIN FETCH attendance.student
            ORDER BY attendance.checkInAt DESC
            """)
    List<Attendance> findAllWithStudentOrderByCheckInAtDesc();

    Long countByStudent(AppUser student);

    List<Attendance> findByStudentAndCheckInAtBetweenOrderByCheckInAtAsc(
            AppUser student,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime
    );
}