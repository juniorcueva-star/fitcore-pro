package com.fitcore.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


import java.util.List;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<AppUser> findByDni(String dni);

    boolean existsByDni(String dni);

    List<AppUser> findByRoleOrderByFullNameAsc(Role role);

    List<AppUser> findByCoachAndRoleOrderByFullNameAsc(AppUser coach, Role role);

    @Query("""
            SELECT user
            FROM AppUser user
            LEFT JOIN FETCH user.coach
            WHERE user.id = :id
            """)
    Optional<AppUser> findByIdWithCoach(Long id);
}