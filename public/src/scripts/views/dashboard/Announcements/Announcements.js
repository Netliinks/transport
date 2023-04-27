// @filename: announcements
import { deleteEntity, getEntitiesData, getUserInfo, registerEntity, getEntityData, setFile } from "../../../endpoints.js";
import { CloseDialog, inputObserver, userInfo } from "../../../tools.js";
import { announcementCreatorController } from "./AnnouncementsCreatorControllers.js";
export class Announcements {
    constructor() {
        this._newAnnouncementButton = document.getElementById('new-announcement');
        this._announcementCardContainer = document.getElementById('cards-container');
        this._announcementCardControlsContainers = document.getElementById('cards-controls-container');
    }
    async render() {
        this._announcementCardContainer.innerHTML = '';
        this._announcementCardControlsContainers.innerHTML = '';
        const customerId = localStorage.getItem('customer_id');
        const announcements = await getEntitiesData('Announcement');
        const announcementsList = announcements.filter((data) => `${data.customer?.id}` === `${customerId}`);
        let _userinfo = await getUserInfo();
        console.log(_userinfo);
        let prop;
        announcementsList.forEach(async (announcement) => {
            const _card = document.createElement('DIV');
            _card.classList.add('card');
            _card.innerHTML = `
                <button class="btn btn_remove_announcement" data-announcementid="${announcement.id}" id="remove-announcement"><i class="fa-solid fa-trash"></i></button>
                <h3 class="card_title">${announcement.title}</h3>
                <p class="card_content">${announcement.content}</p>
            `;
            let _currentUserId = _userinfo.attributes.id;
            this._announcementCardContainer.appendChild(_card);
            const _dotButton = document.createElement('BUTTON');
            _dotButton.classList.add('card_dotbutton');
            this._announcementCardControlsContainers.appendChild(_dotButton);
        }); // End Rendering
        this._newAnnouncementButton.addEventListener('click', () => {
            this.publish();
        });
        const container = document.querySelector('.cards_container');
        container.style.transform = 'translatex(0%)';
        // BUTTONS
        const _controlButtons = document.querySelectorAll('.card_dotbutton');
        _controlButtons[0].classList.add('card_dotbutton-active');
        _controlButtons.forEach((_controlButton) => {
            let index = 0;
            _controlButton.addEventListener('click', (e) => {
                const parent = _controlButton.parentNode;
                const grantParent = parent.parentNode;
                const container = grantParent.querySelector('.cards_container');
                const childrenList = Array.from(parent.children);
                index = childrenList.indexOf(_controlButton);
                container.style.transform = `translatex(-${index * 100}%)`;
                // Remove active status
                _controlButtons.forEach((_controlButton) => _controlButton.classList.remove('card_dotbutton-active'));
                // Add active status
                _controlButton.classList.add('card_dotbutton-active');
            });
        });
        this.remove();
    }
    async publish() {
        const _sidebarRightcontainer = document.getElementById('entity-editor-container');
        _sidebarRightcontainer.innerHTML = '';
        _sidebarRightcontainer.style.display = 'flex';
        _sidebarRightcontainer.innerHTML = announcementCreatorController;
        this.post();
        this.close();
        inputObserver();
    }
    async post() {
        const formData = new FormData();
        const _buttonPostAnnouncement = document.getElementById('post-announcement');
        const _announcementTitle = document.getElementById('announcement-title');
        const _announcementContent = document.getElementById('announcement-content');
        const _announcementPicture = document.getElementById('announcement-picture');
        let image;
        _announcementPicture.onchange = async (event) => {
            /*let rawImage: File = _announcementPicture.files[0]
            console.log(rawImage)
            let nameImage = rawImage.name
            console.log(nameImage)
            //let pathImage = (window.URL || window.webkitURL).createObjectURL(rawImage);
            image = await setFile(rawImage);
            let body = JSON.stringify(image);
            console.log(body)*/
        };
        _buttonPostAnnouncement.addEventListener('click', async () => {
            let _userInfo = await userInfo;
            let currentUserInfo = await getEntityData('User', `${_userInfo.attributes.id}`);
            const _date = new Date();
            // TIME
            const _hours = _date.getHours();
            const _minutes = _date.getMinutes();
            const _seconds = _date.getSeconds();
            const _fixedHours = ('0' + _hours).slice(-2);
            const _fixedMinutes = ('0' + _minutes).slice(-2);
            const _fixedSeconds = ('0' + _seconds).slice(-2);
            const currentTime = `${_fixedHours}:${_fixedMinutes}:${_fixedSeconds}`;
            // DATE
            const _day = _date.getDate();
            const _month = _date.getMonth() + 1;
            const _year = _date.getFullYear();
            const date = `${_year}-${('0' + _month).slice(-2)}-${('0' + _day).slice(-2)}`;
            const customerId = localStorage.getItem('customer_id');
            let rawImage = _announcementPicture.files[0];
            formData.append("file", _announcementPicture);
            image = await setFile(formData, rawImage.name);
            let body = JSON.stringify(image);
            let parse = JSON.parse(body);
            console.log(body);
            console.log(parse);
            //let obtainUrl = await getFile(parse.fileRef)
            // RAW
            const announcementRaw = JSON.stringify({
                "title": `${_announcementTitle.value}`,
                "content": `${_announcementContent.value}`,
                "user": {
                    "id": `${_userInfo.attributes.id}`
                },
                "business": {
                    "id": `${currentUserInfo.business.id}`
                },
                "customer": {
                    "id": `${customerId}`
                },
                "creationTime": `${currentTime}`,
                "creationDate": `${date}`,
                "attachment": `${parse.fileRef}`,
            });
            //console.log(image)
            if (_announcementTitle.value === '') {
                alert('El campo "título" no puede estar vacío');
            }
            else if (_announcementContent.value === '') {
                alert('El campo "Contenido" no puede estar vacío');
            }
            else {
                await registerEntity(announcementRaw, 'Announcement')
                    .then(res => {
                    setTimeout(() => {
                        const container = document.getElementById('entity-editor-container');
                        new CloseDialog().x(container);
                        this.render();
                    }, 1000);
                });
            }
        });
    }
    async remove() {
        // Remove Announcement
        const _removeAnnouncementButtons = document.querySelectorAll('#remove-announcement');
        _removeAnnouncementButtons.forEach((button) => {
            button.addEventListener('click', () => {
                let announcementId = button.dataset.announcementid;
                deleteEntity('Announcement', announcementId)
                    .then(res => {
                    setTimeout(() => {
                        this.render();
                    }, 100);
                });
            });
        });
    }
    close() {
        const closeButton = document.getElementById('close');
        const editor = document.getElementById('entity-editor-container');
        closeButton.addEventListener('click', () => {
            new CloseDialog().x(editor);
        }, false);
    }
}
