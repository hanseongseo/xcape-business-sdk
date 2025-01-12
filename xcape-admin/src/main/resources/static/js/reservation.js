const fakeReservedBy = ['엑스케이프', 'XCAPE', 'xcape', '엑스크라임']
const merchantId = document.querySelector("#reservationList").getAttribute("value");
const modalTemplate = document.querySelector('#modalTemplate').innerHTML;
const loadingSpinner = "<span class='spinner-border spinner-border-sm' role='status' aria-hidden='true'>"
const toastType = {
    start: '시작',
    end: '종료',
    timeOver: '시간 초과'
}

const gameStatus = {};

const numbering = () => {
    const numberArea = document.querySelector('#numberArea');
    let maxLength = 0;
    document.querySelectorAll(".theme").forEach((theme) => {
        maxLength = Math.max(maxLength, theme.querySelectorAll(".reservation").length);
    });
    for (let i = 0; i < maxLength; i++) {
        const numberDiv = document.createElement("div");
        numberDiv.style.width = "60px";
        numberDiv.style.height = "78px";
        ['text-center', 'bg-dark', 'mb-1', 'align-items-center', 'd-flex', 'justify-content-center'].forEach((className) => {
            numberDiv.classList.add(className);
        });
        numberDiv.textContent = 'Time' + (i + 1);
        numberArea.appendChild(numberDiv);
    }
}

document.querySelector('#datePicker').value = location.search.includes('date=') ? location.search.split('date=')[1].substring(0, 10) : formatDateToIso(new Date());
const date = document.querySelector('#datePicker').value;

const datePickerSet = (element) => {
    location.href = "/reservations?date=" + element.value + "&merchantId=" + merchantId
};

const onMouseOver = (element) => {
    element.classList.add("text-primary");
}
const onMouseOut = (element) => {
    element.classList.remove("text-primary");
}

// 예약 조회 후 모달 띄우기
const openModal = (element) => {
    element.classList.add('disabled');

    const prevHTML = element.innerHTML;
    element.innerHTML = loadingSpinner;
    const reservationId = element.getAttribute("value");

    axios.get("/reservations/" + reservationId).then((res) => {
        if (res.data.resultCode === SUCCESS) {
            const reservation = res.data.result;

            const themeId = reservation.themeId;
            const themeName = reservation.themeName;
            const datetime = `${reservation.date} ${reservation.time}`;
            const reservedBy = reservation.isReserved ? reservation.reservedBy : '';
            const phoneNumber = reservation.isReserved ?
                reservation.roomType === 'OPEN_ROOM' ? ''
                    : reservation.phoneNumber : '';

            const reservationHtml = interpolate(modalTemplate, {
                themeId,
                phoneNumber,
                themeName,
                datetime,
                reservedBy,
            });

            document.querySelector('#modal').innerHTML = reservationHtml;

            makeReservationHistoryTable(reservation.seq).then((reservationHistoryTable) => {
                if (reservationHistoryTable) {
                    document.querySelector('#reservationHistoryTable').insertAdjacentHTML('beforeend', reservationHistoryTable);
                }
            });

            const participantSelect = document.querySelector('#participantCount');
            const {
                minParticipantCount,
                maxParticipantCount
            } = document.querySelector(`#theme_${reservation.themeId}`).dataset;

            document.querySelectorAll('input[name="roomType"]').forEach((roomType) => {
                roomType.addEventListener('click', (e) => {
                    let options = '';
                    if (e.currentTarget.value === 'GENERAL') {
                        for (let i = parseInt(minParticipantCount); i <= parseInt(maxParticipantCount); i++) {
                            options += `<option value="${i}">${i}</option>`;
                        }
                    } else {
                        for (let i = 1; i <= Number(maxParticipantCount); i++) {
                            options += `<option value="${i}">${i}</option>`;
                        }
                    }
                    participantSelect.innerHTML = options;
                });
            });

            if (reservation.isReserved) {
                makeParticipantCountOptions(reservation.roomType, reservation.themeId);
                if (reservation.roomType === 'GENERAL') {
                    document.querySelector('#generalType').checked = true;
                } else if (reservation.roomType === 'OPEN_ROOM') {
                    document.querySelector('#openRoomType').checked = true;
                }
                participantSelect.value = reservation.participantCount.toString();
            } else {
                makeParticipantCountOptions('GENERAL', reservation.themeId);
            }

            // 적용 취소 버튼에 reservationId 셋팅

            document.querySelector("#modal #cancelBtn").dataset.reservationId = reservationId;
            document.querySelector("#modal #confirmBtn").dataset.reservationId = reservationId;

            if (reservation.isReserved) {
                document.querySelector("#modal #cancelBtn").classList.remove('d-none');
            }

            $('#modal').modal('show');
        } else {
            popAlert('error', '실패', '요청에 실패했습니다.', 1500);
        }
    }).then(() => {
        element.innerHTML = prevHTML;
        element.classList.remove('disabled');
    });
}

const makeReservationHistoryTable = async (reservationSeq) => {
    let reservationHistoryTableBodyHtml = '';

    await axios.get('/reservation-histories', {params: {reservationSeq}}).then((res) => {
        const {result, resultCode, resultMessage} = res.data;
        if (resultCode === SUCCESS) {
            const reservationHistoryTableBodyTemplate = document.querySelector('#reservationHistoryTableBodyTemplate').innerHTML;

            result.forEach((reservationHistory) => {
                let {roomType, reservedBy, phoneNumber, type: reservationType, registeredAt} = reservationHistory;

                if (!roomType) {
                    roomType = '-';
                } else if (roomType === 'GENERAL') {
                    roomType = '일반';
                } else if (roomType === 'OPEN_ROOM') {
                    roomType = '오픈룸';
                }

                if (reservationType === 'REGISTER') {
                    reservationType = '등록';
                } else if (reservationType === 'MODIFY') {
                    reservationType = '변경';
                } else if (reservationType === 'CANCEL') {
                    reservationType = '취소';
                }

                reservationHistoryTableBodyHtml += interpolate(reservationHistoryTableBodyTemplate, {
                    roomType,
                    reservedBy,
                    phoneNumber,
                    reservationType,
                    registeredAt
                });
            });
        } else {
            popAlert('error', '실패', resultMessage, 1500);
        }
    });

    return reservationHistoryTableBodyHtml;
}

const makeParticipantCountOptions = (roomType, themeId) => {
    const participantSelect = document.querySelector('#participantCount');
    const {minParticipantCount, maxParticipantCount} = document.querySelector(`#theme_${themeId}`).dataset;
    let participantCountOptions = '';

    if (roomType === 'GENERAL') {
        for (let i = Number(minParticipantCount); i <= Number(maxParticipantCount); i++) {
            participantCountOptions += `<option value="${i}">${i}</option>`;
        }
    } else if (roomType === 'OPEN_ROOM') {
        for (let i = 1; i <= Number(maxParticipantCount); i++) {
            participantCountOptions += `<option value="${i}">${i}</option>`;
        }
    }
    participantSelect.innerHTML = participantCountOptions;
}

// 예약 등록/수정
const confirmEdit = (btn) => {
    const form = document.querySelector('.needs-validation');

    if (form.checkValidity()) {
        btn.classList.add('disabled');
        const reservationId = btn.dataset.reservationId;

        const reservation = {
            reservedBy: document.getElementById("reservedBy").value,
            phoneNumber: document.getElementById("phoneNumber").value,
            participantCount: parseInt(document.getElementById("participantCount").value),
            roomType: document.querySelector('input[name="roomType"]:checked').value
        };

        btn.innerHTML = loadingSpinner;
        axios.put("/reservations/" + reservationId, reservation)
            .then((res) => {
                if (res.data.resultCode === SUCCESS) {
                    popAlert('success', '성공', '정상적으로 등록되었습니다.', 1500)
                        .then(() => {
                            location.reload();
                        });
                } else {
                    popAlert('error', '실패', '요청에 실패했습니다.', 1500);
                }
            })
            .then(() => {
                btn.classList.remove('disabled');
            });
    }

    form.classList.add('was-validated');
}

// 예약 취소
const cancelReservation = (btn) => {
    btn.classList.add('disabled');

    const prevHTML = btn.innerHTML;
    btn.innerHTML = loadingSpinner;
    const reservationId = btn.dataset.reservationId;
    axios.delete("/reservations/" + reservationId).then((res) => {
        if (res.data.resultCode === SUCCESS) {
            popAlert('success', '성공', '정상적으로 취소되었습니다.', 1500)
                .then(() => {
                    location.reload();
                });
        } else {
            popAlert('error', '실패', '요청에 실패했습니다.', 1500);
        }
    })
        .then(() => {
            btn.innerHTML = prevHTML;
            btn.classList.remove('disabled');
        });
}

// 일괄 선택 스위치 on/off 시
const changeBatchSwitch = (batchSwitch) => {
    if (batchSwitch.checked) {
        document.querySelectorAll('.not-reserved').forEach((element) => {
            element.onmouseover = () => {
                element.classList.add('opacity-25');
            }
            element.onmouseout = () => {
                element.classList.remove('opacity-25');
            }
            element.onclick = () => {
                const isChecked = element.querySelector('input[type=checkbox]').checked;
                element.querySelector('input[type=checkbox]').checked = !isChecked;
                element.querySelector("input[type=checkbox]").checked ? element.classList.replace('bg-dark', 'bg-success') : element.classList.replace('bg-success', 'bg-dark');
            }
        });

        document.querySelectorAll('.reservation-btn').forEach((element) => {
            element.classList.add('d-none');
        });

        document.querySelector('#bookFakeBtn').classList.remove('d-none');
        document.querySelector('#unreservedTimeArea').classList.remove('d-none');
    } else {
        document.querySelectorAll('.not-reserved').forEach((element) => {
            element.onmouseover = null;
            element.onmouseout = null;
            element.onclick = null;
            element.querySelector("input[type=checkbox]").checked = false;
            element.classList.replace('bg-success', 'bg-dark');
        });

        document.querySelectorAll('.reservation-btn').forEach((element) => {
            element.classList.remove('d-none');
        });

        document.querySelector('#bookFakeBtn').classList.add('d-none');
        document.querySelector('#unreservedTimeArea').classList.add('d-none');
    }
}

// 일괄 가예약
const bookFake = (btn) => {
    const unreservedTime = document.querySelector('#unreservedTime').value;
    const reservationIdList = [...document.querySelectorAll('.fake-reservation-checkbox input:checked')].map(reservation => reservation.getAttribute('value'));
    if (reservationIdList.length === 0) {        //      선택한 예약이 없을 때
        popAlert("warning", "선택한 예약이 없습니다.", "예약을 선택 후 가예약 버튼을 클릭해주세요.", 2000);
        return false;
    } else if (!unreservedTime) {   //      자동해제시간이 설정되지 않았을 때
        popAlert("warning", "자동해제시간이 설정되지 않았습니다.", "계속하시겠습니까?")
            .then((res) => {
                if (res) {
                    btn.classList.add('disabled');
                    btn.innerHTML = loadingSpinner;
                    fakeReserve(reservationIdList, unreservedTime)
                        .then(() => location.reload());
                } else {
                    return false;
                }
            });
    } else {
        btn.classList.add('disabled');
        btn.innerHTML = loadingSpinner;
        fakeReserve(reservationIdList, unreservedTime)
            .then(() => location.reload());
    }
}

const fakeReserve = (reservationIdList, unreservedTime) => {
    return axios.put("/mock-reservations",
        {
            reservationIdList: reservationIdList,
            unreservedTime: unreservedTime
        })
        .then(res => {
            if (res.data.resultCode !== SUCCESS) {
                popAlert('error', '실패', '요청에 실패했습니다.', 1500).then(() => location.reload());
            }
        });
}

$('#datePicker')
    .datepicker({
        format: 'yyyy-mm-dd', //데이터 포맷 형식(yyyy : 년 mm : 월 dd : 일 )
        startDate: '', //달력에서 선택 할 수 있는 가장 빠른 날짜. 이전으로는 선택 불가능 ( d : 일 m : 달 y : 년 w : 주)
        endDate: '', //달력에서 선택 할 수 있는 가장 느린 날짜. 이후로 선택 불가 ( d : 일 m : 달 y : 년 w : 주)
        autoclose: true, //사용자가 날짜를 클릭하면 자동 캘린더가 닫히는 옵션
        calendarWeeks: false, //캘린더 옆에 몇 주차인지 보여주는 옵션 기본값 false 보여주려면 true
        clearBtn: false, //날짜 선택한 값 초기화 해주는 버튼 보여주는 옵션 기본값 false 보여주려면 true
        datesDisabled: [], //선택 불가능한 일 설정 하는 배열 위에 있는 format 과 형식이 같아야함.
        daysOfWeekDisabled: [], //선택 불가능한 요일 설정 0 : 일요일 ~ 6 : 토요일
        daysOfWeekHighlighted: [], //강조 되어야 하는 요일 설정
        disableTouchKeyboard: false, //모바일에서 플러그인 작동 여부 기본값 false 가 작동 true가 작동 안함.
        immediateUpdates: false, //사용자가 보는 화면으로 바로바로 날짜를 변경할지 여부 기본값 :false
        multidate: false, //여러 날짜 선택할 수 있게 하는 옵션 기본값 :false
        multidateSeparator: ',', //여러 날짜를 선택했을 때 사이에 나타나는 글짜 2019-05-01,2019-06-01
        templates: {
            leftArrow: '&laquo;',
            rightArrow: '&raquo;',
        }, //다음달 이전달로 넘어가는 화살표 모양 커스텀 마이징
        showWeekDays: true, // 위에 요일 보여주는 옵션 기본값 : true
        title: '', //캘린더 상단에 보여주는 타이틀
        todayHighlight: true, //오늘 날짜에 하이라이팅 기능 기본값 :false
        toggleActive: true, //이미 선택된 날짜 선택하면 기본값 : false인경우 그대로 유지 true인 경우 날짜 삭제
        weekStart: 0, //달력 시작 요일 선택하는 것 기본값은 0인 일요일
        language: 'ko', //달력의 언어 선택, 그에 맞는 js로 교체해줘야한다.
    })
    .on('changeDate', function (e) {
    });

// 1분마다 타이머
setInterval(() => {
    document.querySelectorAll('.reservedBy').forEach(reservedBy => {
        if (reservedBy.getAttribute('fake') === 'Y') {
            const time = parseInt(reservedBy.textContent.replace('분전', ''));
            if (time <= 1) {
                location.reload();
            } else {
                const unreservedTime = reservedBy.getAttribute('unreserved-time');
                const date = new Date();
                const compared = new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(unreservedTime.split(':')[0]), parseInt(unreservedTime.split(':')[1]));

                if ((compared.getTime() - date.getTime()) > 0) {
                    reservedBy.setAttribute('fake', 'Y');
                    reservedBy.textContent = parseInt((compared.getTime() - date.getTime()) / 1000 / 60) + '분전';
                }
            }
        }
    });
}, 10000);

// 게임시작 토스트 팝업
// option.type => start: 시작팝업, end: 종료팝업, timeOver: 타임오버
const showToasts = option => {
    const toastContainer = document.querySelector('#toastContainer');


    let html = document.querySelector('#timerToastTemplate').innerHTML;
    Object.keys(option).forEach(key => {
        if (key === 'type') {
            html = html.replaceAll(`{${key}}`, toastType[option[key]]);
        }
        html = html.replaceAll(`{${key}}`, option[key]);
    });

    toastContainer.innerHTML = html + toastContainer.innerHTML;

    const toast = toastContainer.querySelector(`.toast:last-child`);
    const toastOption = {
        animation: true,
        autohide: false
    }
    new bootstrap.Toast(toast, toastOption).show();

    toastContainer.querySelectorAll('.toast').forEach(toast => {
        toast.addEventListener('hidden.bs.toast', (e) => {
            e.currentTarget.remove();
        });
    });
}

// 지점 이동 버튼 클릭 이벤트
document.querySelectorAll('.merchant-button').forEach(button => {
    button.addEventListener('click', () => {
        location.href = '/reservations?merchantId=' + button.getAttribute('value');
    });
});

const formatTimeString = (time) => {
    let status = 'decrease';
    if (time < 0) {
        time = Math.abs(time);
        status = 'increase';
    }

    let seconds = Math.floor(time / 1000);
    let minutes = Math.floor(time / 60000);
    seconds = seconds - minutes * 60;

    return {
        status,
        time: `${minutes < 10 ? 0 : ''}${minutes}:${
            seconds < 10 ? 0 : ''
        }${seconds}`
    }
};

numbering();

document.querySelectorAll('.merchant-button').forEach(merchantButton => {
    if (merchantId === merchantButton.value) {
        merchantButton.classList.add("active");
    }
})

document.querySelectorAll('.reservedBy').forEach(reservedBy => {
    let isFake = false;
    fakeReservedBy.forEach(keyword => {
        if (reservedBy.textContent.includes(keyword)) {
            isFake = true;
        }
    });
    const unreservedTime = reservedBy.getAttribute('unreserved-time');
    if (isFake) {
        reservedBy.textContent = 'X';
    }
    if (reservedBy.getAttribute('unreserved-time') !== null) {
        const date = new Date();
        const compared = new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(unreservedTime.split(':')[0]), parseInt(unreservedTime.split(':')[1]));

        if ((compared.getTime() - date.getTime()) > 0) {
            reservedBy.setAttribute('fake', 'Y');
            reservedBy.textContent = parseInt((compared.getTime() - date.getTime()) / 1000 / 60) + '분전';
        }
    }
});

const getTimerStatus = ({isPlayingPrevious, isPlayingCurrent}) => {
    if (!isPlayingPrevious && isPlayingCurrent) {
        return 'start';
    } else if (isPlayingPrevious && !isPlayingCurrent) {
        return 'end';
    }
}

firebase
    .database()
    .ref('/gameStatus')
    .get()
    .then((snapshot) => {
        Object.values(snapshot.val()).forEach((value) => {
            const {id, isPlaying, endTime, nameKo} = value;
            gameStatus[`theme-${id}`] = value;

            const targetThemeTimer = document.querySelector(`.running-time[data-theme-id="${id}"]`);
            if (targetThemeTimer && isPlaying) {
                targetThemeTimer.innerHTML = loadingSpinner;

                if (endTime === new Date().getTime()) {
                    showToasts({
                        themeName: nameKo,
                        recentStartTime: formatDateTimeToKr(new Date(endTime)),
                        type: 'timeOver'
                    });
                }
            }
        });

        setInterval(() => {
            document.querySelectorAll('.running-time').forEach((e) => {
                const {themeId} = e.dataset;
                const themeStatus = gameStatus[`theme-${themeId}`];
                if (themeStatus) {
                    const {isPlaying, endTime, runningTime} = themeStatus;
                    if (isPlaying) {
                        const {status, time} = formatTimeString(endTime - new Date().getTime());
                        if (status === 'increase') {
                            e.classList.add('text-danger');
                            e.classList.remove('text-primary', 'text-warning');
                            e.innerHTML = `+ ${time}`;
                        } else {
                            e.classList.add('text-warning');
                            e.classList.remove('text-primary', 'text-danger');
                            e.innerHTML = time;
                        }
                    } else {
                        e.classList.add('text-primary');
                        e.classList.remove('text-warning', 'text-danger');
                        e.innerHTML = `${runningTime} : 00`;
                    }
                }
            });
        }, 1000)
    });

firebase
    .database()
    .ref('/gameStatus')
    .on('child_changed', snapShot => {
        const {id, isPlaying, endTime, nameKo} = snapShot.val();

        const targetThemeTimer = document.querySelector(`.running-time[data-theme-id="${id}"]`);
        const param = {
            isPlayingPrevious: gameStatus[`theme-${id}`].isPlaying,
            isPlayingCurrent: isPlaying,
        }
        const status = getTimerStatus(param);

        if (targetThemeTimer) {
            if (status === 'start') {
                showToasts({
                    themeName: nameKo,
                    recentStartTime: formatDateTimeToKr(new Date()),
                    type: 'start'
                });
            } else if (status === 'end') {
                showToasts({
                    themeName: nameKo,
                    recentStartTime: formatDateTimeToKr(new Date()),
                    type: 'end'
                });
            }
        }

        gameStatus[`theme-${id}`].isPlaying = isPlaying;
        gameStatus[`theme-${id}`].endTime = endTime;
    });
