package com.chadev.xcape.core.domain.dto;

import com.chadev.xcape.core.domain.entity.Reservation;
import com.chadev.xcape.core.domain.type.RoomType;
import lombok.*;

import java.time.format.DateTimeFormatter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class ReservationDto {

    private String id;

    private Long seq;

    private String merchantName;

    private Long themeId;

    private String themeName;

    private String date;

    private String time;

    private Boolean isReserved;

    private Integer participantCount;

    private RoomType roomType;

    public ReservationDto(Reservation entity) {
        this.id = entity.getId();
        this.seq = entity.getSeq();
        this.merchantName = entity.getMerchantName();
        this.themeId = entity.getThemeId();
        this.themeName = entity.getThemeName();
        this.date = entity.getDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        this.time = entity.getTime().format(DateTimeFormatter.ofPattern("HH:mm"));
        this.isReserved = entity.getIsReserved();
        this.participantCount = entity.getParticipantCount();
        this.roomType = entity.getRoomType();
    }
}
