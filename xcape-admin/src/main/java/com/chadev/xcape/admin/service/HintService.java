package com.chadev.xcape.admin.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chadev.xcape.core.domain.converter.DtoConverter;
import com.chadev.xcape.core.domain.dto.HintDto;
import com.chadev.xcape.core.domain.entity.Hint;
import com.chadev.xcape.core.domain.entity.Theme;
import com.chadev.xcape.core.exception.XcapeException;
import com.chadev.xcape.core.repository.HintRepository;
import com.chadev.xcape.core.repository.ThemeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HintService {

	private final HintRepository hintRepository;
	private final ThemeRepository themeRepository;
	private final DtoConverter dtoConverter;

	public List<HintDto> getHintList() {
		return hintRepository.findAll()
			.stream()
			.filter(hint -> hint.getTheme() != null)
			.map(dtoConverter::toHintDto)
			.toList();
	}

	public List<HintDto> getHintListByThemeId(Long themeId) {
		return hintRepository.findAllByThemeId(themeId)
			.stream()
			.map(dtoConverter::toHintDto)
			.toList();
	}

	@Transactional
	public void createHint(HintDto hintDto) {

		if (checkHintCode(hintDto.getCode())) {
			throw XcapeException.EXISTENT_HINT_CODE();
		}

		Theme theme = themeRepository.findById(hintDto.getThemeId()).orElseThrow();

		Hint hint = Hint.builder()
			.theme(theme)
			.code(hintDto.getCode())
			.message1(hintDto.getMessage1())
			.message2(hintDto.getMessage2())
			.isUsed(hintDto.getIsUsed())
			.build();

		hintRepository.save(hint);
	}

	// 힌트 코드 중복 체크
	public boolean checkHintCode(String code) {

		return hintRepository.findByCode(code).isPresent();

	}
}
