let storageList = [];

const getStorageList = async () => {
    await axios.get('/storage').then((res) => {
        storageList = res.data.result.filter((storage) => storage.isUsed);
    });
}

document.querySelectorAll('button.list-group-item').forEach(merchant => {
    merchant.addEventListener('click', (e) => {
        const {classList, dataset} = e.currentTarget;

        document.querySelectorAll('button.list-group-item').forEach(merchant => merchant.classList.remove('active'));
        classList.add('active');
        getStorageItemList();
    });
});

document.querySelector('#file').addEventListener('change', (e) => {
    const [file] = e.target.files;

    if (file) {
        const type = file.type;
        let previewDom;

        if (type.startsWith('image')) {
            previewDom = document.querySelector('#imagePreview').innerHTML;
        } else if (type.startsWith('audio')) {
            previewDom = document.querySelector('#audioPreview').innerHTML;
        } else if (type.startsWith('video')) {
            previewDom = document.querySelector('#videoPreview').innerHTML;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = interpolate(previewDom, {src: e.target.result})
            document.querySelector('#filePreview').style.display = 'none';
            document.querySelector('#previewArea').innerHTML = '';
            document.querySelector('#previewArea').innerHTML = preview;
        }
        reader.readAsDataURL(file);
    }
});

document.querySelector('#uploadButton').addEventListener('click', () => {
    const [file] = document.querySelector('#file').files

    if (!file) {
        alert('업로드 할 파일이 없습니다.');
        return;
    }

    const selectedTheme = document.querySelector('button.list-group-item.active');

    if (!selectedTheme) {
        alert('선택된 테마가 없습니다.');
        return;
    }

    const {merchantId, themeId} = selectedTheme.dataset;

    const formData = new FormData();
    formData.append('file', file)
    formData.append('merchantId', merchantId)
    formData.append('themeId', themeId)

    const config = {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }

    axios.post('/files', formData, config)
        .then((res) => {
            const {resultCode} = res.data;
            if (resultCode === SUCCESS) {
                alert('업로드 완료👏');
                getStorageList().then(() => {
                    getStorageItemList();
                });
            } else {
                alert('업로드 실패😭');
            }
        })
        .catch((error) => {
            console.error(error);
            const {status} = error.response;
            if (status === 413) {
                alert('파일 사이즈가 큽니다.');
            }
        });
});

getStorageList();

const getStorageItemList = () => {
    const themeButton = document.querySelector('.list-group-item.list-group-item-action.active');

    if (!themeButton) {
        alert('테마를 선택해주세요.');
        return;
    }

    const {themeId} = themeButton.dataset;
    const fileType = document.querySelector('input[name="viewType"]:checked').value;


    const itemList = storageList.filter((item) => item.themeId === parseInt(themeId) && item.fileType === fileType);

    let previewDom;
    let previewListHtml = '';
    if (fileType === 'IMAGE') {
        previewDom = document.querySelector('#imageCard').innerHTML;
    } else if (fileType === 'AUDIO') {
        previewDom = document.querySelector('#audioCard').innerHTML;
    } else if (fileType === 'VIDEO') {
        previewDom = document.querySelector('#videoCard').innerHTML;
    }

    if (itemList.length > 0) {
        itemList.forEach(({url, filename, id}) => {
            previewListHtml += interpolate(previewDom, {url, filename, storageId: id});
        });
    } else {
        previewListHtml = document.querySelector('#emptyTemplate').innerHTML;
    }

    document.querySelector('#storageItemList').innerHTML = previewListHtml;

    removeButtonEvent();
}

document.querySelectorAll('input[name="viewType"]').forEach((button) => {
    button.addEventListener('click', () => {
        getStorageItemList();
    });
});

const removeButtonEvent = () => {
    document.querySelectorAll('.removeStorageButton').forEach((button) => {
        button.addEventListener('click', (e) => {
            const {storageId} = e.target.dataset;

            axios.delete(`/storage/${storageId}`).then((res) => {
                const {resultCode} = res.data;
                if (resultCode) {
                    alert('삭제되었습니다.');
                    getStorageList().then(() => {
                        getStorageItemList();
                    });
                } else {
                    alert('삭제실패');
                }
            });
        });
    });
}
