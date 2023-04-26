package com.chadev.xcape.core.domain.dto.history;

import com.chadev.xcape.core.domain.entity.history.ReservationHistory;
import com.chadev.xcape.core.domain.type.HistoryType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservationHistoryDto {

    private Long seq;

    private String id;

    private String reservationId;

    private HistoryType type;

    private String reservedBy;

    private String phoneNumber;

    private Integer participantCount;

    private String roomType;

    private Integer price;

    private String themeName;

    private LocalDate date;

    private LocalTime time;

    public ReservationHistoryDto(ReservationHistory entity){
        this.seq = entity.getSeq();
        this.id = entity.getId();
        this.type = entity.getType();
        this.reservedBy = entity.getReservedBy();
        this.phoneNumber = entity.getPhoneNumber();
        this.participantCount = entity.getParticipantCount();
        this.roomType = entity.getRoomType();
        this.price = entity.getPrice();
        this.themeName = entity.getThemeName();
        this.date = entity.getDate();
        this.time = entity.getTime();
    }
}
