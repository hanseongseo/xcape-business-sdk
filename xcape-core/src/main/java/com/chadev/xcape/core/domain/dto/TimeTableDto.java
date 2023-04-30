package com.chadev.xcape.core.domain.dto;

import com.chadev.xcape.core.domain.entity.Timetable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.format.DateTimeFormatter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TimeTableDto {

    private Long id;

    private String time;

    private String type;

    private Long merchantId;

    private Long themeId;

    public TimeTableDto(Timetable entity) {
        this.id = entity.getId();
        this.time = entity.getTime().format(DateTimeFormatter.ofPattern("HH:mm"));
        this.type = entity.getType();
        this.merchantId = entity.getMerchant().getId();
        this.themeId = entity.getTheme().getId();
    }
}
