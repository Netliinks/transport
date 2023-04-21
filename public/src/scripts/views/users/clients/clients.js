//
//  Clients.ts
//
//  Generated by Poll Castillo on 15/02/2023
//
import { deleteEntity, getEntitiesData, getEntityData, getUserInfo, registerEntity, setPassword, setUserRole, updateEntity, sendMail } from "../../../endpoints.js";
import { drawTagsIntoTables, inputObserver, inputSelect, CloseDialog, filterDataByHeaderType, getVerifyEmail } from "../../../tools.js";
import { Config } from "../../../Configs.js";
import { UIConvertToSU, tableLayout } from "./Layout.js";
import { tableLayoutTemplate } from "./Templates.js";
const tableRows = Config.tableRows;
const currentPage = Config.currentPage;
const customerId = localStorage.getItem('customer_id');
let currentUserInfo;
const getUsers = async () => {
    const currentUser = await getUserInfo();
    currentUserInfo = await getEntityData('User', `${currentUser.attributes.id}`);
    const users = await getEntitiesData('User');
    const FSuper = users.filter((data) => data.isSuper === false);
    const FCustomer = FSuper.filter((data) => `${data.customer.id}` === `${customerId}`);
    const data = FCustomer.filter((data) => `${data.userType}`.includes('CUSTOMER'));
    return data;
};
export class Clients {
    constructor() {
        this.dialogContainer = document.getElementById('app-dialogs');
        this.entityDialogContainer = document.getElementById('entity-editor-container');
        this.datatableContainer = document.getElementById('datatable-container');
        this.searchEntity = async (tableBody, data) => {
            const search = document.getElementById('search');
            await search.addEventListener('keyup', async () => {
                const arrayData = await data.filter((user) => `${user.id}
                ${user.firstName}
                 ${user.lastName}
                 ${user.username}`
                    .toLowerCase()
                    .includes(search.value.toLowerCase()));
                let filteredResult = arrayData.length;
                let result = arrayData;
                if (filteredResult >= tableRows)
                    filteredResult = tableRows;
                this.load(tableBody, currentPage, result);
                this.pagination(result, tableRows, currentPage);
            });
        };
        this.generateUserName = async () => {
            const firstName = document.getElementById('entity-firstname');
            const secondName = document.getElementById('');
            const lastName = document.getElementById('entity-lastname');
            const secondLastName = document.getElementById('entity-secondlastname');
            const clientName = document.getElementById('entity-customer');
            const userName = document.getElementById('entity-username');
            let UserNameFFragment = '';
            let UserNameLNFragment = '';
            let UserNameSLNFragment = '';
            firstName.addEventListener('keyup', (e) => {
                UserNameFFragment = firstName.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                userName.setAttribute('value', `${UserNameFFragment.trim()}.${UserNameLNFragment}${UserNameSLNFragment}`);
            });
            lastName.addEventListener('keyup', (e) => {
                UserNameLNFragment = lastName.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                userName.setAttribute('value', `${UserNameFFragment.trim()}.${UserNameLNFragment}${UserNameSLNFragment}`);
            });
            secondLastName.addEventListener('keyup', (e) => {
                UserNameSLNFragment = secondLastName.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                if (secondLastName.value.length > 0) {
                    UserNameFFragment[0];
                    userName.setAttribute('value', `${UserNameFFragment}.${UserNameLNFragment}${UserNameSLNFragment[0]}`);
                }
                else {
                    userName.setAttribute('value', `${UserNameFFragment}.${UserNameLNFragment}${UserNameSLNFragment}`);
                }
            });
        };
    }
    async render() {
        let data = await getUsers();
        this.datatableContainer.innerHTML = '';
        this.datatableContainer.innerHTML = tableLayout;
        const tableBody = document.getElementById('datatable-body');
        tableBody.innerHTML = tableLayoutTemplate.repeat(tableRows);
        this.load(tableBody, currentPage, data);
        this.searchEntity(tableBody, data);
        new filterDataByHeaderType().filter();
        this.pagination(data, tableRows, currentPage);
    }
    load(table, currentPage, data) {
        setUserPassword();
        setRole();
        table.innerHTML = '';
        currentPage--;
        let start = tableRows * currentPage;
        let end = start + tableRows;
        let paginatedItems = data.slice(start, end);
        if (data.length === 0) {
            let row = document.createElement('tr');
            row.innerHTML = `
                <td>los datos no coinciden con su búsqueda</td>
                <td></td>
                <td></td>
            `;
            table.appendChild(row);
        }
        else {
            for (let i = 0; i < paginatedItems.length; i++) {
                let client = paginatedItems[i];
                let row = document.createElement('tr');
                row.innerHTML += `
                    <td>${client.firstName} ${client.lastName}</dt>
                    <td>${client.username}</dt>
                    <td class="key"><button class="button" data-userid="${client.id}" id="change-user-password"><i class="fa-regular fa-key"></i></button></td>
                    <td class="tag"><span>${client.state.name}</span></td>
                    <td>${client.citadel.description}</dt>
                    <td class="entity_options">
                        <button class="button" id="edit-entity" data-entityId="${client.id}">
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button class="button" id="remove-entity" data-entityId="${client.id}">
                            <i class="fa-solid fa-trash"></i>
                        </button>

                        <button class="button" id="convert-entity" data-entityId="${client.id}">
                            <i class="fa-solid fa-shield"></i>
                        </button>
                    </td>
                `;
                table.appendChild(row);
                drawTagsIntoTables();
            }
        }
        this.register();
        this.import();
        this.edit(this.entityDialogContainer, data);
        this.remove();
        this.convertToSuper();
        this.changeUserPassword();
    }
    register() {
        // register entity
        const openEditor = document.getElementById('new-entity');
        openEditor.addEventListener('click', () => {
            renderInterface('User');
        });
        const renderInterface = async (entities) => {
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            this.entityDialogContainer.innerHTML = `
                <div class="entity_editor" id="entity-editor">
                <div class="entity_editor_header">
                    <div class="user_info">
                    <div class="avatar"><i class="fa-regular fa-user"></i></div>
                    <h1 class="entity_editor_title">Registrar <br><small>Cliente</small></h1>
                    </div>

                    <button class="btn btn_close_editor" id="close"><i class="fa-regular fa-x"></i></button>
                </div>

                <!-- EDITOR BODY -->
                <div class="entity_editor_body">
                    <div class="material_input">
                    <input type="text" id="entity-firstname" autocomplete="none">
                    <label for="entity-firstname"><i class="fa-solid fa-user"></i> Nombre</label>
                    </div>

                    <div class="material_input">
                    <input type="text" id="entity-lastname" autocomplete="none">
                    <label for="entity-lastname"><i class="fa-solid fa-user"></i> Apellido</label>
                    </div>

                    <div class="material_input">
                    <input type="text" id="entity-secondlastname" autocomplete="none">
                    <label for="entity-secondlastname"><i class="fa-solid fa-user"></i> 2do Apellido</label>
                    </div>

                    <div class="material_input">
                    <input type="text"
                        id="entity-phone"
                        maxlength="10" autocomplete="none">
                    <label for="entity-phone"><i class="fa-solid fa-phone"></i> Teléfono</label>
                    </div>

                    <div class="material_input">
                    <input type="text" id="entity-username" class="input_filled" placeholder="john.doe@ejemplo.com" readonly>
                    <label for="entity-username"><i class="input_locked fa-solid fa-lock"></i> Nombre de usuario</label>
                    </div>

                    <div class="material_input_select">
                    <label for="entity-state">Estado</label>
                    <input type="text" id="entity-state" class="input_select" readonly placeholder="cargando..." autocomplete="none">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>

                    <div class="material_input_select" style="display: none">
                        <label for="entity-business"><i class="fa-solid fa-building"></i> Empresa</label>
                        <input type="text" id="entity-business" class="input_select" readonly placeholder="cargando..." autocomplete="none">
                        <div id="input-options" class="input_options">
                        </div>
                    </div>

                    <div class="material_input_select">
                    <label for="entity-citadel"><i class="fa-solid fa-buildings"></i> Ciudadela</label>
                    <input type="text" id="entity-citadel" class="input_select" readonly placeholder="cargando...">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>

                    <div class="material_input_select" style="display: none">
                    <label for="entity-customer">Cliente</label>
                    <input type="text" id="entity-customer" class="input_select" readonly placeholder="cargando...">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>

                    <div class="material_input_select" style="display: none">
                    <label for="entity-department">Departamento</label>
                    <input type="text" id="entity-department" class="input_select" readonly placeholder="cargando...">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>

                    <br>
                    <div class="material_input">
                    <input type="password" id="tempPass" autocomplete="false">
                    <label for="tempPass">Contraseña</label>
                    </div>

                </div>
                <!-- END EDITOR BODY -->

                <div class="entity_editor_footer">
                    <button class="btn btn_primary btn_widder" id="register-entity">Guardar</button>
                </div>
                </div>
            `;
            inputObserver();
            inputSelect('Citadel', 'entity-citadel');
            inputSelect('Customer', 'entity-customer');
            inputSelect('State', 'entity-state');
            inputSelect('Department', 'entity-department');
            inputSelect('Business', 'entity-business');
            this.close();
            this.generateUserName();
            const registerButton = document.getElementById('register-entity');
            registerButton.addEventListener('click', () => {
                const inputsCollection = {
                    firstName: document.getElementById('entity-firstname'),
                    lastName: document.getElementById('entity-lastname'),
                    secondLastName: document.getElementById('entity-secondlastname'),
                    phoneNumer: document.getElementById('entity-phone'),
                    state: document.getElementById('entity-state'),
                    customer: document.getElementById('entity-customer'),
                    username: document.getElementById('entity-username'),
                    citadel: document.getElementById('entity-citadel'),
                    temporalPass: document.getElementById('tempPass')
                };
                const raw = JSON.stringify({
                    "lastName": `${inputsCollection.lastName.value}`,
                    "secondLastName": `${inputsCollection.secondLastName.value}`,
                    "isSuper": false,
                    "email": "",
                    "temp": `${inputsCollection.temporalPass.value}`,
                    "isWebUser": false,
                    "active": true,
                    "firstName": `${inputsCollection.firstName.value}`,
                    "state": {
                        "id": `${inputsCollection.state.dataset.optionid}`
                    },
                    "contractor": {
                        "id": `${currentUserInfo.contractor.id}`,
                    },
                    "customer": {
                        "id": `${customerId}`
                    },
                    "citadel": {
                        "id": `${currentUserInfo.citadel.id}}`
                    },
                    "phone": `${inputsCollection.phoneNumer.value}`,
                    "userType": "CUSTOMER",
                    "username": `${inputsCollection.username.value}@${currentUserInfo.contractor.name.toLowerCase()}.com`
                });
                reg(raw);
            });
        };
        const reg = async (raw) => {
            registerEntity(raw, 'User')
                .then((res) => {
                setTimeout(async () => {
                    let data = await getUsers();
                    const tableBody = document.getElementById('datatable-body');
                    const container = document.getElementById('entity-editor-container');
                    new CloseDialog().x(container);
                    this.load(tableBody, currentPage, data);
                }, 1000);
            });
        };
    }
    import() {
        const importButton = document.getElementById('import-entities');
        importButton.addEventListener('click', () => {
        });
    }
    edit(container, data) {
        // Edit entity
        const edit = document.querySelectorAll('#edit-entity');
        edit.forEach((edit) => {
            const entityId = edit.dataset.entityid;
            edit.addEventListener('click', () => {
                RInterface('User', entityId);
            });
        });
        const RInterface = async (entities, entityID) => {
            const data = await getEntityData(entities, entityID);
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            this.entityDialogContainer.innerHTML = `
                <div class="entity_editor" id="entity-editor">
                <div class="entity_editor_header">
                    <div class="user_info">
                    <div class="avatar"><i class="fa-regular fa-user"></i></div>
                    <h1 class="entity_editor_title">Editar <br><small>${data.firstName} ${data.lastName}</small></h1>
                    </div>

                    <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
                </div>

                <!-- EDITOR BODY -->
                <div class="entity_editor_body">
                    <div class="material_input">
                    <input type="text" id="entity-firstname" class="input_filled" value="${data.firstName}" readonly>
                    <label for="entity-firstname">Nombre</label>
                    </div>

                    <div class="material_input">
                    <input type="text" id="entity-lastname" class="input_filled" value="${data.lastName}" readonly>
                    <label for="entity-lastname">Apellido</label>
                    </div>

                    <div class="material_input">
                    <input type="text" id="entity-secondlastname" class="input_filled" value="${data.secondLastName}" readonly>
                    <label for="entity-secondlastname">2do Apellido</label>
                    </div>

                    <div class="material_input">
                    <input type="text"
                        id="entity-phone"
                        class="input_filled"
                        maxlength="10"
                        value="${data.phone}">
                    <label for="entity-phone">Teléfono</label>
                    </div>

                    <div class="material_input">
                    <input type="text" id="entity-username" class="input_filled" value="${data.username}" readonly>
                    <label for="entity-username">Nombre de usuario</label>
                    </div>

                    <div class="material_input_select">
                    <label for="entity-state">Estado</label>
                    <input type="text" id="entity-state" class="input_select" readonly placeholder="cargando...">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>

                    <div class="material_input_select" style="display: none">
                    <label for="entity-business">Empresa</label>
                    <input type="text" id="entity-business" class="input_select" readonly placeholder="cargando...">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>

                    <div class="material_input_select">
                    <label for="entity-citadel">Ciudadela</label>
                    <input type="text" id="entity-citadel" class="input_select" readonly placeholder="cargando...">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>

                    <div class="material_input_select" style="display: none">
                    <label for="entity-customer">Cliente</label>
                    <input type="text" id="entity-customer" class="input_select" readonly placeholder="cargando...">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>

                    <div class="material_input_select" style="display: none">
                    <label for="entity-department">Departamento</label>
                    <input type="text" id="entity-department" class="input_select" readonly placeholder="cargando...">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>

                    <br><br><br>
                    <div class="material_input">
                    <input type="password" id="tempPass" >
                    <label for="tempPass">Contraseña</label>
                    </div>

                </div>
                <!-- END EDITOR BODY -->

                <div class="entity_editor_footer">
                    <button class="btn btn_primary btn_widder" id="update-changes">Guardar</button>
                </div>
                </div>
            `;
            inputObserver();
            inputSelect('Business', 'entity-citadel');
            inputSelect('Customer', 'entity-customer');
            inputSelect('State', 'entity-state', data.state.name);
            inputSelect('Department', 'entity-department');
            inputSelect('Business', 'entity-business');
            this.close();
            UUpdate(entityID);
        };
        const UUpdate = async (entityId) => {
            const updateButton = document.getElementById('update-changes');
            const $value = {
                // @ts-ignore
                firstName: document.getElementById('entity-firstname'),
                // @ts-ignore
                lastName: document.getElementById('entity-lastname'),
                // @ts-ignore
                secondLastName: document.getElementById('entity-secondlastname'),
                // @ts-ignore
                phone: document.getElementById('entity-phone'),
                // @ts-ignore
                status: document.getElementById('entity-state'),
                // @ts-ignore
                business: document.getElementById('entity-business'),
                // @ts-ignore
                client: document.getElementById('entity-customer'),
                // @ts-ignore
                department: document.getElementById('entity-department'),
                // @ts-ignore
                customer: document.getElementById('entity-customer')
            };
            updateButton.addEventListener('click', () => {
                let raw = JSON.stringify({
                    // @ts-ignore
                    "lastName": `${$value.lastName?.value}`,
                    // @ts-ignore
                    "secondLastName": `${$value.secondLastName?.value}`,
                    "active": true,
                    // @ts-ignore
                    "firstName": `${$value.firstName?.value}`,
                    "state": {
                        "id": `${$value.status?.dataset.optionid}`
                    },
                    "customer": {
                        "id": `${$value.customer?.dataset.optionid}`
                    },
                    // @ts-ignore
                    "phone": `${$value.phone?.value}`
                });
                update(raw);
            });
            const update = (raw) => {
                updateEntity('User', entityId, raw)
                    .then((res) => {
                    setTimeout(async () => {
                        let tableBody;
                        let container;
                        let data;
                        data = await getUsers();
                        new CloseDialog()
                            .x(container =
                            document.getElementById('entity-editor-container'));
                        this.load(tableBody
                            = document.getElementById('datatable-body'), currentPage, data);
                    }, 100);
                });
            };
        };
    }
    changeUserPassword() {
        const changeUserPasswordKeys = document.querySelectorAll('#change-user-password');
        changeUserPasswordKeys.forEach((buttonKey) => {
            buttonKey.addEventListener('click', async () => {
                let userId = buttonKey.dataset.userid;
                this.dialogContainer.style.display = 'block';
                this.dialogContainer.innerHTML = `
                    <div class="dialog_content" id="dialog-content">
                        <div class="dialog">
                            <div class="dialog_container padding_8">
                                <div class="dialog_header">
                                    <h2>Actualizar contraseña</h2>
                                </div>

                                <div class="dialog_message padding_8">
                                    <div class="material_input">
                                        <input type="password" id="password" autocomplete="none">
                                        <label for="entity-lastname"><i class="fa-solid fa-lock"></i> Nueva contraseña</label>
                                    </div>

                                    <div class="material_input">
                                        <input type="password" id="re-password" autocomplete="none">
                                        <label for="entity-lastname"><i class="fa-solid fa-lock"></i> Repetir contraseña</label>
                                    </div>
                                </div>

                                <div class="dialog_footer">
                                    <button class="btn btn_primary" id="cancel">Cancelar</button>
                                    <button class="btn btn_danger" id="update-password">Actualizar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                inputObserver();
                const _password = document.getElementById('password');
                const _repassword = document.getElementById('re-password');
                const _updatePasswordButton = document.getElementById('update-password');
                const _closeButton = document.getElementById('cancel');
                const _dialog = document.getElementById('dialog-content');
                _updatePasswordButton.addEventListener('click', () => {
                    if (_password.value === '') {
                        alert('El campo "Contraseña" no puede estar vacío.');
                    }
                    else if (_repassword.value === ' ') {
                        alert('Debe repetir la contraseña para continuar');
                    }
                    else if (_password.value === _repassword.value) {
                        let raw = JSON.stringify({
                            "id": `${userId}`,
                            "newPassword": `${_password.value}`
                        });
                        setPassword(raw)
                            .then(() => {
                            setTimeout(() => {
                                alert('Se ha cambiado la contraseña');
                                new CloseDialog().x(_dialog);
                            }, 1000);
                        });
                    }
                    else {
                        console.log('Las contraseñas no coinciden');
                    }
                });
                _closeButton.onclick = () => {
                    new CloseDialog().x(_dialog);
                };
            });
        });
    }
    remove() {
        const remove = document.querySelectorAll('#remove-entity');
        remove.forEach((remove) => {
            const entityId = remove.dataset.entityid;
            // BOOKMARK: MODAL
            remove.addEventListener('click', () => {
                this.dialogContainer.style.display = 'block';
                this.dialogContainer.innerHTML = `
                    <div class="dialog_content" id="dialog-content">
                        <div class="dialog dialog_danger">
                        <div class="dialog_container">
                            <div class="dialog_header">
                            <h2>¿Deseas eliminar este cliente?</h2>
                            </div>

                            <div class="dialog_message">
                            <p>Esta acción no se puede revertir</p>
                            </div>

                            <div class="dialog_footer">
                            <button class="btn btn_primary" id="cancel">Cancelar</button>
                            <button class="btn btn_danger" id="delete">Eliminar</button>
                            </div>
                        </div>
                        </div>
                    </div>`;
                const deleteButton = document.getElementById('delete');
                const cancelButton = document.getElementById('cancel');
                const dialogContent = document.getElementById('dialog-content');
                deleteButton.onclick = () => {
                    deleteEntity('User', entityId);
                    new CloseDialog().x(dialogContent);
                    this.render();
                };
                cancelButton.onclick = () => {
                    new CloseDialog().x(dialogContent);
                };
            });
        });
    }
    convertToSuper() {
        const convert = document.querySelectorAll('#convert-entity');
        convert.forEach((convert) => {
            const entityId = convert.dataset.entityid;
            convert.addEventListener('click', async () => {
                const user = await getEntityData('User', entityId);
                this.dialogContainer.style.display = 'block';
                this.dialogContainer.innerHTML = UIConvertToSU;
                const modalUsername = document.getElementById('username');
                modalUsername.innerHTML = user.firstName;
                inputObserver();
                // modal functionality
                const nextButton = document.getElementById('button-next-userconverter');
                const cancelButton = document.getElementById('button-cancel');
                const buttonBack = document.getElementById('button-back');
                const buttonSubmit = document.getElementById('button-submit');
                const modalViews = document.querySelectorAll('.modal_view');
                const buttonGroups = document.querySelectorAll('.modal_button_group');
                const stepCount = document.getElementById('stepCount');
                const resultMail = document.getElementById('result-mail');
                const inputMail = document.getElementById('input-email');
                const confirmationCode = document.getElementById('confirmation-code');
                const modalContainer = document.getElementById('modal_container');
                let mailRaw = [];
                let updateRaw = [];
                let roleRaw = [];
                inputMail.value = user.email;
                nextButton.addEventListener('click', async () => {
                    const randomKey = { key: Math.floor(Math.random() * 999999) };
                    const existEmail = await getVerifyEmail(inputMail.value);
                    if (inputMail.value === '' || inputMail.value == null) {
                        alert('Debe ingresar un correo para continuar.');
                    }
                    else if (inputMail.value != user.email && existEmail == true) {
                        alert("¡Correo electrónico ya existe!");
                    }
                    else {
                        modalViews.forEach((modalView) => {
                            modalView.classList.toggle('modal_view-isHidden');
                            stepCount.innerText = '2';
                        });
                        buttonGroups.forEach((buttonGroup) => {
                            buttonGroup.classList.toggle('modal_button_group-isHidden');
                        });
                        resultMail.innerText = inputMail.value;
                        confirmationCode.innerText = randomKey.key;
                        mailRaw = JSON.stringify({
                            "adress": inputMail.value,
                            "subject": "Netliinks - Clave de validación.",
                            "body": `Estimado ${user.firstName}, el código de confirmación para ingresar a la plataforma de Netvisitors es: \n
                                                                        ${randomKey.key}\nNo responder a este correo.\nSaludos.\n\n\nNetliinks S.A.`
                        });
                        updateRaw = JSON.stringify({
                            "username": inputMail.value,
                            "isSuper": true,
                            "hashSuper": randomKey.key,
                            "verifiedSuper": false
                        });
                        roleRaw = JSON.stringify({
                            "id": `${user.id}`,
                            "roleCode": `app_web_clientes`
                        });
                        sendMail(mailRaw);
                        updateEntity('User', entityId, updateRaw);
                        setUserRole(roleRaw);
                        setTimeout(async () => {
                            let data = await getUsers();
                            const tableBody = document.getElementById('datatable-body');
                            new CloseDialog().x(modalContainer);
                            this.load(tableBody, currentPage, data);
                        }, 100);
                    }
                });
                cancelButton.onclick = () => {
                    new CloseDialog().x(modalContainer);
                };
            });
        });
    }
    pagination(items, limitRows, currentPage) {
        const tableBody = document.getElementById('datatable-body');
        const paginationWrapper = document.getElementById('pagination-container');
        paginationWrapper.innerHTML = '';
        let pageCount;
        pageCount = Math.ceil(items.length / limitRows);
        let button;
        for (let i = 1; i < pageCount + 1; i++) {
            button = setupButtons(i, items, currentPage, tableBody, limitRows);
            paginationWrapper.appendChild(button);
        }
        function setupButtons(page, items, currentPage, tableBody, limitRows) {
            const button = document.createElement('button');
            button.classList.add('pagination_button');
            button.innerText = page;
            button.addEventListener('click', () => {
                currentPage = page;
                new Clients().load(tableBody, page, items);
            });
            return button;
        }
    }
    close() {
        const closeButton = document.getElementById('close');
        const editor = document.getElementById('entity-editor-container');
        closeButton.addEventListener('click', () => {
            console.log('close');
            new CloseDialog().x(editor);
        }, false);
    }
}
export const setUserPassword = async () => {
    const users = await getEntitiesData('User');
    const filterBySuperUsers = users.filter((data) => data.isSuper === false);
    const filterByUserType = filterBySuperUsers.filter((data) => `${data.userType}`.includes('CUSTOMER'));
    const data = filterByUserType;
    data.forEach((newUser) => {
        let raw = JSON.stringify({
            "id": `${newUser.id}`,
            "newPassword": `${newUser.temp}`
        });
        if (newUser.newUser === true && newUser.temp !== undefined)
            setPassword(raw);
    });
};
export async function setRole() {
    const users = await getEntitiesData('User');
    const filterByNewUsers = users.filter((data) => data.newUser === true);
    const filterByUserType = filterByNewUsers.filter((data) => `${data.userType}`.includes('CUSTOMER'));
    const data = filterByUserType;
    data.forEach((newUser) => {
        let raw = JSON.stringify({
            "id": `${newUser.id}`,
            "roleCode": 'app_clientes'
        });
        let updateNewUser = JSON.stringify({
            "newUser": false
        });
        if (newUser.newUser === true) {
            setUserRole(raw);
            setTimeout(() => {
                updateEntity('User', newUser.id, updateNewUser);
            }, 1000);
        }
    });
}
