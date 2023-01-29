package com.chadev.xcape.api.repository;

import com.chadev.xcape.core.domain.entity.Reservation;
import com.chadev.xcape.core.domain.entity.Theme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findReservationsByTheme(Theme theme);

    List<Reservation> findReservationsByStartTimeBetweenAndTheme(LocalDateTime start, LocalDateTime end, Theme theme);
}