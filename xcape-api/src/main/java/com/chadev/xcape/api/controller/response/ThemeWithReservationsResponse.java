package com.chadev.xcape.api.controller.response;

import com.chadev.xcape.core.domain.dto.PriceDto;
import com.chadev.xcape.core.domain.dto.ReservationDto;
import com.chadev.xcape.core.domain.dto.ThemeDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ThemeWithReservationsResponse {

    private Long themeId;
    private String themeNameKo;
    private String themeNameEn;
    private String mainImagePath;
    private Integer minParticipantCount;
    private Integer maxParticipantCount;
    private Integer difficulty;

    private List<PriceDto> priceList;

    private List<ReservationDto> reservationList;

    public static ThemeWithReservationsResponse from(ThemeDto themeDto, List<ReservationDto> reservationList) {
        return new ThemeWithReservationsResponse(
                themeDto.getId(),
                themeDto.getNameKo(),
                themeDto.getNameEn(),
                themeDto.getMainImagePath(),
                themeDto.getMinParticipantCount(),
                themeDto.getMaxParticipantCount(),
                themeDto.getDifficulty(),
                themeDto.getPriceList(),
                reservationList
        );
    }
}
