package com.fitcore.routine;

import com.fitcore.user.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RoutineExerciseRepository extends JpaRepository<RoutineExercise, Long> {

    @Query("""
            SELECT exercise
            FROM RoutineExercise exercise
            JOIN FETCH exercise.student
            JOIN FETCH exercise.trainer
            WHERE exercise.id = :id
            """)
    Optional<RoutineExercise> findByIdWithStudentAndTrainer(Long id);

    @Query("""
            SELECT exercise
            FROM RoutineExercise exercise
            JOIN FETCH exercise.student
            JOIN FETCH exercise.trainer
            WHERE exercise.student = :student
            ORDER BY exercise.createdAt DESC
            """)
    List<RoutineExercise> findByStudentOrderByCreatedAtDesc(AppUser student);

    @Query("""
            SELECT exercise
            FROM RoutineExercise exercise
            JOIN FETCH exercise.student
            JOIN FETCH exercise.trainer
            WHERE exercise.trainer = :trainer
            ORDER BY exercise.createdAt DESC
            """)
    List<RoutineExercise> findByTrainerOrderByCreatedAtDesc(AppUser trainer);
}