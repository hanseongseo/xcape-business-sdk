let merchantId = document.getElementById('merchantId');

const deletedPriceArr = [];
const deletedTimetableArr = [];

const getThemeInformation = (e) => {
    const id = e.currentTarget.dataset.themeId;
    axios.get(`/themes/${id}`).then((res) => {
        const {resultCode} = res.data;
        const theme = res.data.result;
        if (resultCode === SUCCESS) {
            document.themeInfo.action = `/themes/${theme.id}`;
            document.querySelector('#merchantId').value = theme.merchantId;
            document.querySelector('#themeId').value = theme.id;
            document.querySelector('#themeNameKo').value = theme.nameKo;
            document.querySelector('#themeNameEn').value = theme.nameEn;
            document.querySelector('#difficulty').value = theme.difficulty;
            document.querySelector('#description').value = theme.description;
            document.querySelector('#minParticipantCount').value = theme.minParticipantCount;
            document.querySelector('#maxParticipantCount').value = theme.maxParticipantCount;
            document.querySelector('#genre').value = theme.genre;
            document.querySelector('#point').value = theme.point;
            document.querySelector('#mainImagePreview').src = theme.mainImagePath || '/images/noPhoto.jpg';
            document.querySelector('#bgImagePreview').src = theme.bgImagePath || '/images/noPhoto.jpg';
            document.querySelector('#youtubeLink').value = theme.youtubeLink;
            document.querySelector('#colorCode').value = theme.colorCode || '#242424';
            document.querySelector('#runningTime').value = theme.runningTime;

            document.querySelector(`input[name="hasXKit"][value="${theme.hasXKit}"]`).checked = true;
            document.querySelector(`input[name="isCrimeScene"][value="${theme.isCrimeScene}"]`).checked = true;
            document.querySelector(`input[name="useYn"][value="${theme.useYn}"]`).checked = true;

            bindAbility(theme.abilityList);
            // bindTimetableInputs(theme.timetable);
        }
    });
}

document.querySelectorAll('#treeArea .accordion-body button').forEach((button) => {
    button.addEventListener('click', getThemeInformation);
});

document.querySelector('#saveThemeButton').addEventListener('click', () => {
    const form = document.querySelector('form[name="themeInfo"]');

    if (form.checkValidity()) {
        const formData = new FormData(form);
        const themeImageFormData = new FormData(document.themeImage);

        const abilityList = makeAbilityParameter();
        abilityList.forEach((ability, index) => {
            formData.append(`abilityList[${index}].id`, ability.id);
            formData.append(`abilityList[${index}].code`, ability.code);
            formData.append(`abilityList[${index}].name`, ability.name);
            formData.append(`abilityList[${index}].value`, ability.value);
        });

        if (document.themeImage.mainImage.value !== '') {
            formData.append('mainImage', themeImageFormData.get('mainImage'));
        }
        if (document.themeImage.bgImage.value !== '') {
            formData.append('bgImage', themeImageFormData.get('bgImage'));
        }

        const saveThemeButton = document.getElementById('saveThemeButton');
        const spinner = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                         <span>저장 중입니다...</span>`;
        saveThemeButton.disabled = true;
        saveThemeButton.innerHTML = spinner;
        const themeId = document.querySelector('#themeId').value

        axios.put(`/themes/${themeId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then((res) => {
            if (res.data.resultCode === SUCCESS) {
                alert('성공적으로 저장했습니다. 👏');
            } else {
                alert('저장 중 에러가 발생했습니다. 😭')
            }
        }).catch((e) => {
            const {status} = e.response;
            if (status === 413) {
                alert('파일 사이즈가 큽니다.');
            }
        }).finally(() => {
            saveThemeButton.disabled = false;
            saveThemeButton.innerHTML = '저장';
        });
    }

    form.classList.add('was-validated');
});

// 테마 클릭 이벤트
const addClickEventToAccordion = () => {
    const listGroup = document.querySelectorAll('.list-group button');
    listGroup.forEach((list) => {
        list.addEventListener('click', () => {
            clearValidity();
            clearDeletedPriceArr();
            clearImageInputs();
            document.querySelector('.list-group .active')?.classList.remove('active');
            list.classList.add('active');
        });
    });
}

document.querySelector('#addPriceButton').addEventListener('click', () => {
    createPriceInputs();
});

const createPriceInputs = () => {
    const priceTemplate = document.querySelector('#priceTemplate').innerHTML;
    const priceDomCount = document.querySelectorAll('.person').length;
    const priceAreaId = `priceAreaId-${priceDomCount}`;
    const priceId = '';
    const personValue = '1';
    const priceValue = '10000';

    const priceInput = interpolate(priceTemplate, {priceAreaId, priceId, personValue, priceValue});
    const priceArea = document.querySelector(`#priceArea`);

    priceArea.insertAdjacentHTML('beforeend', priceInput);

    document.querySelector(`#${priceAreaId} .price-input`).addEventListener('change', formattingNumber);
    document.querySelector(`#${priceAreaId} .price-i=nput`).addEventListener('input', onlyNumber);
    document.querySelector(`#${priceAreaId} .delete-price-button`).addEventListener('click', () => deletePrice(`${priceAreaId}`));
}

const deletePrice = (priceAreaId) => {
    const priceDom = document.querySelector(`#${priceAreaId}`);
    if (priceDom.dataset.priceId) {
        deletedPriceArr.push({
            id: priceDom.dataset.priceId,
            person: document.querySelector(`#${priceAreaId} .person`).value,
            price: document.querySelector(`#${priceAreaId} .price`).value.replace(/,/g, ""),
            themeId: document.querySelector('#themeId').value,

        });
    }
    priceDom.remove();
}

const bindPriceInputs = (priceList) => {
    let priceInputs = '';
    const priceTemplate = document.querySelector('#priceTemplate').innerHTML;
    document.querySelector('#priceArea').innerHTML = '';

    priceList.forEach((priceItem) => {
        const {id, person, price} = priceItem;
        const priceAreaId = `priceArea-${id}`;
        const priceId = id;
        const personValue = person;
        const priceValue = formattingNumber(price);
        priceInputs += interpolate(priceTemplate, {priceAreaId, priceId, personValue, priceValue});
    });

    document.querySelector(`#priceArea`).innerHTML = priceInputs;

    document.querySelectorAll('.price-input').forEach((input) => {
        input.addEventListener('change', formattingNumber);
    });

    document.querySelectorAll('.price-input').forEach((input) => {
        input.addEventListener('input', onlyNumber);
    });

    document.querySelectorAll('.delete-price-button').forEach((deleteButton) => {
        const {priceAreaId} = deleteButton.dataset;
        deleteButton.addEventListener('click', () => deletePrice(priceAreaId));
    });
}

const bindPriceDetail = () => {
    deletedPriceArr.length = 0;
    const themeId = document.querySelector('#themeId').value;

    axios.get(`/themes/${themeId}/price`).then(res => {
        const {resultCode, result} = res.data;
        if (resultCode === SUCCESS) {
            bindPriceInputs(result);
        }
    });
};

const savePrice = () => {
    const params = makePriceParameter();
    const themeId = document.querySelector('#themeId').value;

    if (params.length > 0) {
        axios.put(`/themes/${themeId}/price`, params).then(res => {
            const {resultCode} = res.data;
            if (resultCode === SUCCESS) {
                const priceDetailModal = document.querySelector('#priceDetailModal');
                const modal = bootstrap.Modal.getInstance(priceDetailModal);
                modal.hide();
                alert('성공적으로 저장했습니다.');
            } else {
                alert('저장에 실패했습니다.');
            }
        });
    } else {
        alert('저장할 가격이 없습니다.')
    }
}

const createTimetableInputs = () => {
    const timetableChildElementCount = document.querySelector('#timetableArea').childElementCount;
    let timetableCount = 1;
    if (timetableChildElementCount > 0) {
        const timetableChildElements = document.querySelectorAll('#timetableArea > div');
        timetableCount = timetableChildElements[timetableChildElements.length - 1].id.split('-')[1];
        timetableCount++;
    }
    const timetableAreaId = `timetableArea-${timetableCount}`;
    const timetableId = '';
    const hourId = `hour-${timetableCount}`;
    const minuteId = `minute-${timetableCount}`;
    const priceTemplate = document.querySelector('#timetableTemplate').innerHTML;
    const timetableInput = interpolate(priceTemplate, {timetableAreaId, timetableId, hourId, minuteId});
    document.querySelector(`#timetableArea`).insertAdjacentHTML('beforeend', timetableInput);
}

document.querySelector('#addTimetableButton').addEventListener('click', createTimetableInputs);

document.querySelector('#priceDetailButton').addEventListener('click', bindPriceDetail);

document.querySelector('#priceSaveButton').addEventListener('click', savePrice);

const bindTimetableInputs = (timetableList) => {
    let timetableInputs = '';
    const timetableTemplate = document.querySelector('#timetableTemplate').innerHTML;

    timetableList.forEach((timetable) => {
        const {id, time} = timetable;
        const timetableAreaId = `timetableArea-${id}`;
        const timetableId = id;
        const hour = time.split(':')[0];
        const hourId = `hour-${id}`;
        const minute = time.split(':')[1];
        const minuteId = `minute-${id}`;
        timetableInputs += interpolate(timetableTemplate, {
            timetableAreaId,
            timetableId,
            hour,
            hourId,
            minute,
            minuteId
        });
    });

    document.querySelector(`#timetableArea`).innerHTML = timetableInputs;

    timetableList.forEach((timetable) => {
        const {id} = timetable;
        const hour = timetable.time.split(':')[0];
        const minute = timetable.time.split(':')[1];
        document.querySelector(`#hour-${id}`).value = hour;
        document.querySelector(`#minute-${id}`).value = minute;
    });
}

const bindTimetableDetail = () => {
    deletedTimetableArr.length = 0;
    const themeId = document.querySelector('#themeId').value;

    axios.get(`/themes/${themeId}/timetable`).then(res => {
        const {resultCode, result} = res.data;
        if (resultCode === SUCCESS) {
            result.sort((a, b) => {
                return a.time.localeCompare(b.time);
            });
            bindTimetableInputs(result);
        }
    });
}

document.querySelector('#timetableDetailButton').addEventListener('click', bindTimetableDetail);

const deleteTimetable = (timetableId) => {
    const timetableDom = document.querySelector(`#${timetableId}`);
    if (timetableDom.dataset.timetableId) {
        const hour = document.querySelector(`#${timetableId} .hour`).value;
        const minute = document.querySelector(`#${timetableId} .minute`).value
        deletedTimetableArr.push({
            id: timetableDom.dataset.timetableId,
            time: `${hour}:${minute}`,
        });
    }
    timetableDom.remove();
}

const clearValidity = () => {
    document.themeInfo.classList.remove('was-validated');
}

document.getElementById('youtubeLink').addEventListener('change', () => {
    const youtubeArea = document.getElementById('youtubeArea');
    let urlParams;
    try {
        const youtubeLink = document.querySelector('#youtubeLink').value;
        urlParams = new URL(youtubeLink).searchParams;
    } catch (e) {
        youtubeArea.innerHTML = '';
        return;
    }
    const youtubeTemplate = document.getElementById('youtube-template').innerHTML;
    youtubeArea.innerHTML = youtubeTemplate.replace('{viewKey}', urlParams.get('v'));
});

const selectFirstTheme = () => {
    const firstTheme = document.querySelector('.accordion .list-group-item');
    if (firstTheme) {
        firstTheme.classList.add('active');
        firstTheme.click();
    }
}

const clearDeletedPriceArr = () => {
    deletedPriceArr.length = 0;
}

const clearImageInputs = () => {
    const mainImageInput = document.querySelector('#mainImage');
    const mainImagePreview = document.querySelector('#mainImagePreview');
    const bgImageInput = document.querySelector('#bgImage');
    const bgImagePreview = document.querySelector('#bgImagePreview');

    mainImageInput.value = '';
    mainImagePreview.src = '/images/noPhoto.jpg';
    bgImageInput.value = '';
    bgImagePreview.src = '/images/noPhoto.jpg';
}

const displayedPriceToParameter = () => {
    const priceParamArr = [];
    const priceArea = document.querySelector('#priceArea');
    const priceList = document.querySelectorAll('#priceArea .price');
    const personList = document.querySelectorAll('#priceArea .person');

    for (let i = 0; i < priceArea.childElementCount; i++) {
        priceParamArr.push({
            id: priceArea.children[i].dataset.priceId,
            person: personList[i].value,
            price: priceList[i].value.replace(/,/g, ""),
            isUsed: true
        });
    }

    return priceParamArr;
}

const makePriceParameter = () => {
    const priceParamArr = displayedPriceToParameter();

    deletedPriceArr.forEach(price => {
        priceParamArr.push({
            id: price.id,
            person: price.person,
            price: price.price,
            isUsed: false
        });
    });

    return priceParamArr;
}

const bindAbility = (abilityList) => {
    const abilityTemplate = document.querySelector('#abilityTemplate').innerHTML;
    const abilityArea = document.querySelector('#abilityArea');
    abilityArea.innerHTML = '';
    abilityList.forEach((ability) => {
        const abilityDom = abilityTemplate
            .replaceAll('{abilityCode}', ability.code)
            .replaceAll('{abilityName}', ability.name)
            .replace('{abilityId}', ability.id);

        abilityArea.insertAdjacentHTML('beforeend', abilityDom);
        document.querySelector(`#${ability.code}`).value = ability.value;
    });
}

const makeAbilityParameter = () => {
    const abilityParameter = [];
    document.querySelectorAll('form[name="themeInfo"] .ability').forEach((ability) => {
        abilityParameter.push({
            id: ability.dataset.abilityId,
            code: ability.id,
            name: ability.dataset.abilityName,
            value: ability.value
        });
    });
    return abilityParameter;
}

const displayedTimetableToParameter = () => {
    const timetableParamArr = [];
    const timetableArea = document.querySelector('#timetableArea');
    const hourList = document.querySelectorAll('#timetableArea .hour');
    const minuteList = document.querySelectorAll('#timetableArea .minute');

    for (let i = 0; i < timetableArea.childElementCount; i++) {
        const hour = hourList[i].value;
        const minute = minuteList[i].value;
        const time = `${hour}:${minute}`;
        timetableParamArr.push({
            id: timetableArea.children[i].dataset.timetableId,
            time: time,
            isUsed: true
        });
    }

    return timetableParamArr;
}

const makeTimetableParameter = () => {
    const timetableParamArr = displayedTimetableToParameter();

    deletedTimetableArr.forEach(timetable => {
        timetableParamArr.push({
            id: timetable.id,
            time: timetable.time,
            isUsed: false
        });
    });

    return timetableParamArr;
}

document.querySelector('#timetableSaveButton').addEventListener('click', () => {
    const params = makeTimetableParameter();

    if (params.length > 0) {
        const themeId = document.querySelector('#themeId').value
        axios.put(`/themes/${themeId}/timetable`, params).then(res => {
            const {resultCode} = res.data;
            if (resultCode === SUCCESS) {
                const timetableModal = document.querySelector('#timetableDetailModal');
                const modal = bootstrap.Modal.getInstance(timetableModal);
                modal.hide();
                alert('성공적으로 저장했습니다.');
            } else {
                alert('저장에 실패했습니다');
            }
        });
    } else {
        alert('저장할 타임테이블이 없습니다.')
    }
});

document.querySelector('#jsonPublishButton').addEventListener('click', async () => {
    try {
        const responses = await axios.all([
            axios.get('/themes'),
            axios.get('/abilities')
        ]);

        const [themeResponse, abilityResponse] = responses;

        const {resultCode: themeResultCode, result: themeResult} = themeResponse.data;
        const {resultCode: abilityResultCode, result: abilityResult} = abilityResponse.data;

        if (themeResultCode !== SUCCESS || abilityResultCode !== SUCCESS) {
            throw new Error('조회 실패');
        }

        const themeForm = new FormData();
        themeForm.append('file', new File([JSON.stringify(themeResult)], JSON_FILE_NAME));
        themeForm.append('type', JSON_FILE_TYPE.THEME);

        const themeUploadResponse = await axios.put('/json', themeForm);


        const abilityForm = new FormData();
        abilityForm.append('file', new File([JSON.stringify(abilityResult)], JSON_FILE_NAME));
        abilityForm.append('type', JSON_FILE_TYPE.ABILITY);

        const abilityUploadResponse = await axios.put('/json', abilityForm);

        const tagPath = themeUploadResponse.data;
        const viewPath = abilityUploadResponse.data;

        if (!tagPath || !viewPath) {
            throw new Error('파일 업로드 실패');
        }
        alert(`태그 : ${tagPath} 및 뷰 : ${viewPath}\n 발행이 완료되었습니다.`);

    } catch (error) {
        alert('발행에 실패했습니다.');
    }
});

const removeRow = element => {
    element.closest('.create-row').remove();
};

document.querySelector('#themeCreateButton').addEventListener('click', () => {
    const themeCreateModal = document.querySelector('#themeCreateModal');
    const form = document.querySelector('form[name="theme"]');
    const formData = new FormData(themeCreateModal.querySelector('form[name="theme"]'));
    const _merchantId = themeCreateModal.querySelector('select[name=merchantId]').value;

    if (!_merchantId) {
        alert('지점을 선택해주세요');
        return;
    }

    // image
    const mainImage = themeCreateModal.querySelector('input[name=mainImage]').files[0];
    const bgImage = themeCreateModal.querySelector('input[name=bgImage]').files[0];
    if (!mainImage || !bgImage) {
        alert('이미지가 누락되었습니다.')
        return;
    }
    formData.append('mainImage', mainImage);
    formData.append('bgImage', bgImage);


    if (form.checkValidity()) {
        // theme > abilityList
        const abilityList = [];
        themeCreateModal.querySelectorAll('#abilityList select[data-code]').forEach(select => {
            const ability = {...select.dataset, value: select.value};
            abilityList.push(ability);
        });
        abilityList.forEach((ability, index) => {
            formData.append(`abilityList[${index}].code`, ability.code);
            formData.append(`abilityList[${index}].name`, ability.name);
            formData.append(`abilityList[${index}].value`, ability.value);
        });

        // theme > priceList
        // const priceList = [];
        // themeCreateModal.querySelectorAll('#createPriceArea .create-row').forEach(row => {
        //     priceList.push({
        //         price: row.querySelector('.price').value,
        //         person: row.querySelector('.person').value
        //     });
        // });
        // theme.priceList = [...priceList];
        //
        // // theme > timetable
        // const timetableList = [];
        // themeCreateModal.querySelectorAll('#createTimeTableArea .create-row').forEach(row => {
        //     const hour = row.querySelector('select.hour').value;
        //     const minute = row.querySelector('select.minute').value;
        //     timetableList.push({
        //         type: GENERAL,
        //         time: `${hour}:${minute}`
        //     });
        // });
        // theme.timetableList = [...timetableList];

        // console.log('form', Object.fromEntries(form));
        axios.post(
            `/merchants/${_merchantId}/themes`,
            formData,
            {headers: {"Content-Type": "multipart/form-data"}}
        ).then(res => {
            const {resultCode} = res.data;
            if (SUCCESS === resultCode) {
                alert(SAVE_SUCCESS);
                location.reload();
            } else {
                alert(SAVE_FAIL)
            }
        });
    } else {
        form.classList.add('was-validated')
    }
});

const init = () => {
    addClickEventToAccordion();
    selectFirstTheme();
}

init();
