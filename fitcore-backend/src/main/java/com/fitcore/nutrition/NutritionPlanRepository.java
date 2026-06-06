package com.fitcore.nutrition;

import com.fitcore.user.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface NutritionPlanRepository extends JpaRepository<NutritionPlan, Long> {

    @Query("""
            SELECT nutritionPlan
            FROM NutritionPlan nutritionPlan
            JOIN FETCH nutritionPlan.student
            JOIN FETCH nutritionPlan.trainer
            WHERE nutritionPlan.trainer = :trainer
            ORDER BY nutritionPlan.updatedAt DESC
            """)
    List<NutritionPlan> findByTrainerOrderByUpdatedAtDesc(AppUser trainer);

    @Query("""
            SELECT nutritionPlan
            FROM NutritionPlan nutritionPlan
            JOIN FETCH nutritionPlan.student
            JOIN FETCH nutritionPlan.trainer
            WHERE nutritionPlan.student = :student
            ORDER BY nutritionPlan.updatedAt DESC
            """)
    List<NutritionPlan> findByStudentOrderByUpdatedAtDesc(AppUser student);

    @Query("""
            SELECT nutritionPlan
            FROM NutritionPlan nutritionPlan
            JOIN FETCH nutritionPlan.student
            JOIN FETCH nutritionPlan.trainer
            WHERE nutritionPlan.student = :student
            AND nutritionPlan.trainer = :trainer
            ORDER BY nutritionPlan.updatedAt DESC
            """)
    List<NutritionPlan> findAllByStudentAndTrainerOrderByUpdatedAtDesc(
            AppUser student,
            AppUser trainer
    );
}