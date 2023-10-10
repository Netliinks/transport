//
//  Clients.ts
//
//  Generated by Poll Castillo on 15/02/2023
//
import { deleteEntity, getEntityData, registerEntity, updateEntity, getFilterEntityData, getFilterEntityCount } from "../../endpoints.js";
import { drawTagsIntoTables, inputObserver, inputSelect, CloseDialog, filterDataByHeaderType, pageNumbers, fillBtnPagination, userPermissions, currentDateTime, eventLog, getSearch } from "../../tools.js";
import { Config } from "../../Configs.js";
import { tableLayout } from "./Layout.js";
import { tableLayoutTemplate } from "./Templates.js";
import { exportClientCsv, exportClientXls } from "../../exportFiles/clients.js";
const tableRows = Config.tableRows;
const currentPage = Config.currentPage;
const businessId = localStorage.getItem('business_id');
let currentUserInfo;
let infoPage = {
    count: 0,
    offset: Config.offset,
    currentPage: currentPage,
    search: ""
};
let dataPage;
const getCustomers = async () => {
    //const users: Data = await getEntitiesData('User')
    //const FSuper: Data = users.filter((data: any) => data.isSuper === false)
    //const FCustomer: Data = FSuper.filter((data: any) => `${data.customer?.id}` === `${customerId}`)
    //const data: Data = FCustomer.filter((data: any) => `${data.userType}`.includes('CUSTOMER'))
    let raw = JSON.stringify({
        "filter": {
            "conditions": [
                {
                    "property": "business.id",
                    "operator": "=",
                    "value": `${businessId}`
                }
            ],
        },
        sort: "-createdDate",
        limit: Config.tableRows,
        offset: infoPage.offset,
        fetchPlan: 'full',
    });
    if (infoPage.search != "") {
        raw = JSON.stringify({
            "filter": {
                "conditions": [
                    {
                        "group": "OR",
                        "conditions": [
                            {
                                "property": "ruc",
                                "operator": "contains",
                                "value": `${infoPage.search.toLowerCase()}`
                            },
                            {
                                "property": "name",
                                "operator": "contains",
                                "value": `${infoPage.search.toLowerCase()}`
                            }
                        ]
                    },
                    {
                        "property": "business.id",
                        "operator": "=",
                        "value": `${businessId}`
                    }
                ]
            },
            sort: "-createdDate",
            limit: Config.tableRows,
            offset: infoPage.offset,
            fetchPlan: 'full',
        });
    }
    infoPage.count = await getFilterEntityCount("Customer", raw);
    dataPage = await getFilterEntityData("Customer", raw);
    return dataPage;
};
export class Customers {
    constructor() {
        this.dialogContainer = document.getElementById('app-dialogs');
        this.entityDialogContainer = document.getElementById('entity-editor-container');
        this.datatableContainer = document.getElementById('datatable-container');
        this.searchEntity = async (tableBody /*, data: any*/) => {
            const search = document.getElementById('search');
            const btnSearch = document.getElementById('btnSearch');
            search.value = infoPage.search;
            await search.addEventListener('keyup', async () => {
                /********const arrayData: any = await data.filter((user: any) =>
                    `${user.id}
                    ${user.firstName}
                     ${user.lastName}
                     ${user.username}`
                        .toLowerCase()
                        .includes(search.value.toLowerCase())
                )
    
                let filteredResult = arrayData.length
                let result = arrayData
                if (filteredResult >= tableRows) filteredResult = tableRows
    
                this.load(tableBody, currentPage, result)
    
                this.pagination(result, tableRows, currentPage)*/
            });
            btnSearch.addEventListener('click', async () => {
                new Customers().render(Config.offset, Config.currentPage, search.value.toLowerCase().trim());
            });
        };
        this.export = () => {
            const exportUsers = document.getElementById('export-entities');
            exportUsers.addEventListener('click', async () => {
                this.dialogContainer.style.display = 'block';
                this.dialogContainer.innerHTML = `
                <div class="dialog_content" id="dialog-content">
                    <div class="dialog">
                        <div class="dialog_container padding_8">
                            <div class="dialog_header">
                                <h2>Seleccione un tipo</h2>
                            </div>

                            <div class="dialog_message padding_8">
                                <div class="form_group">
                                    <label for="exportCsv">
                                        <input type="radio" id="exportCsv" name="exportOption" value="csv" /> CSV
                                    </label>

                                    <label for="exportXls">
                                        <input type="radio" id="exportXls" name="exportOption" value="xls" checked /> XLS
                                    </label>
                                    <!--
                                    <label for="exportPdf">
                                        <input type="radio" id="exportPdf" name="exportOption" value="pdf" /> PDF
                                    </label> -->
                                </div>
                            </div>

                            <div class="dialog_footer">
                                <button class="btn btn_primary" id="cancel">Cancelar</button>
                                <button class="btn btn_danger" id="export-data">Exportar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
                inputObserver();
                const _closeButton = document.getElementById('cancel');
                const exportButton = document.getElementById('export-data');
                const _dialog = document.getElementById('dialog-content');
                exportButton.addEventListener('click', async () => {
                    const _values = {
                        exportOption: document.getElementsByName('exportOption')
                    };
                    let rawExport = JSON.stringify({
                        "filter": {
                            "conditions": [
                                {
                                    "property": "business.id",
                                    "operator": "=",
                                    "value": `${businessId}`
                                }
                            ],
                        },
                        sort: "-createdDate",
                        fetchPlan: 'full',
                    });
                    if (infoPage.search != "") {
                        rawExport = JSON.stringify({
                            "filter": {
                                "conditions": [
                                    {
                                        "group": "OR",
                                        "conditions": [
                                            {
                                                "property": "ruc",
                                                "operator": "contains",
                                                "value": `${infoPage.search.toLowerCase()}`
                                            },
                                            {
                                                "property": "name",
                                                "operator": "contains",
                                                "value": `${infoPage.search.toLowerCase()}`
                                            }
                                        ]
                                    },
                                    {
                                        "property": "business.id",
                                        "operator": "=",
                                        "value": `${businessId}`
                                    }
                                ]
                            },
                            sort: "-createdDate",
                            fetchPlan: 'full',
                        });
                    }
                    const customers = await getFilterEntityData("Customer", rawExport); //await getUsers()
                    for (let i = 0; i < _values.exportOption.length; i++) {
                        let ele = _values.exportOption[i];
                        if (ele.type = "radio") {
                            if (ele.checked) {
                                if (ele.value == "xls") {
                                    // @ts-ignore
                                    exportClientXls(customers);
                                }
                                else if (ele.value == "csv") {
                                    // @ts-ignore
                                    exportClientCsv(customers);
                                }
                                else if (ele.value == "pdf") {
                                    // @ts-ignore
                                    exportClientPdf(users);
                                }
                            }
                        }
                    }
                });
                _closeButton.onclick = () => {
                    new CloseDialog().x(_dialog);
                };
            });
        };
    }
    async render(offset, actualPage, search) {
        infoPage.offset = offset;
        infoPage.currentPage = actualPage;
        infoPage.search = search;
        this.datatableContainer.innerHTML = '';
        this.datatableContainer.innerHTML = tableLayout;
        const tableBody = document.getElementById('datatable-body');
        tableBody.innerHTML = '.Cargando...';
        let data = await getCustomers();
        tableBody.innerHTML = tableLayoutTemplate.repeat(tableRows);
        this.load(tableBody, currentPage, data);
        this.searchEntity(tableBody /*, data*/);
        new filterDataByHeaderType().filter();
        this.pagination(data, tableRows, infoPage.currentPage);
    }
    load(table, currentPage, data) {
        table.innerHTML = '';
        currentPage--;
        let start = tableRows * currentPage;
        let end = start + tableRows;
        let paginatedItems = data.slice(start, end);
        if (data.length === 0) {
            let row = document.createElement('tr');
            row.innerHTML = `
                <td>No hay datos</td>
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
                    <td>${client.name}</dt>
                    <td>${client?.ruc ?? ''}</dt>
                    <td class="tag"><span>${client.state.name}</span></td>
                    <td class="entity_options">
                        <button class="button" id="edit-entity" data-entityId="${client.id}">
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button class="button" id="remove-entity" data-entityId="${client.id}" data-entityName="${client.name}" style="display:${userPermissions().style};">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `;
                table.appendChild(row);
                drawTagsIntoTables();
            }
        }
        this.register();
        this.import();
        this.export();
        this.edit(this.entityDialogContainer, data);
        this.remove();
        //this.changeUserPassword()
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
                    <div class="avatar"><i class="fa-regular fa-buildings"></i></div>
                    <h1 class="entity_editor_title">Registrar <br><small>Cliente</small></h1>
                    </div>

                    <button class="btn btn_close_editor" id="close"><i class="fa-regular fa-x"></i></button>
                </div>

                <!-- EDITOR BODY -->
                <div class="entity_editor_body">
                    <div class="material_input">
                    <input type="text" id="entity-name" autocomplete="none">
                    <label for="entity-name"><i class="fa-solid fa-buildings"></i> Nombre</label>
                    </div>



                    <div class="material_input">
                    <input type="text"
                        id="entity-ruc"
                        maxlength="13" autocomplete="none">
                    <label for="entity-ruc"><i class="fa-solid fa-id-card"></i> RUC</label>
                    </div>

                    <div class="material_input_select">
                    <label for="entity-state">Estado</label>
                    <input type="text" id="entity-state" class="input_select" readonly placeholder="cargando..." autocomplete="none">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>

                </div>
                <!-- END EDITOR BODY -->

                <div class="entity_editor_footer">
                    <button class="btn btn_primary btn_widder" id="register-entity">Guardar</button>
                </div>
                </div>
            `;
            inputObserver();
            //inputSelect('Citadel', 'entity-citadel')
            //inputSelect('Customer', 'entity-customer')
            inputSelect('State', 'entity-state', 'Enabled');
            //inputSelect('Department', 'entity-department')
            //inputSelect('Business', 'entity-business')
            this.close();
            const registerButton = document.getElementById('register-entity');
            registerButton.addEventListener('click', async () => {
                const inputsCollection = {
                    name: document.getElementById('entity-name'),
                    ruc: document.getElementById('entity-ruc'),
                    state: document.getElementById('entity-state'),
                };
                const raw = JSON.stringify({
                    "name": `${inputsCollection.name.value.toUpperCase()}`,
                    "ruc": `${inputsCollection.ruc.value}`,
                    "state": {
                        "id": `${inputsCollection.state.dataset.optionid}`
                    },
                    "business": {
                        "id": `${businessId}`
                    },
                    'creationDate': `${currentDateTime().date}`,
                    'creationTime': `${currentDateTime().time}`,
                });
                let searchExist = await getSearch("name", inputsCollection.name.value.toUpperCase(), "Customer");
                if (inputsCollection.name.value === '' || inputsCollection.name.value === undefined) {
                    alert("¡Nombre vacío!");
                }
                else if (searchExist != undefined) {
                    alert("Cliente ya existe!");
                }
                else {
                    reg(raw);
                }
            });
        };
        const reg = async (raw) => {
            registerEntity(raw, 'Customer')
                .then((res) => {
                setTimeout(async () => {
                    //let data = await getUsers()
                    let parse = JSON.parse(raw);
                    eventLog('INS', 'CLIENTE', `${parse.name}`, '');
                    const tableBody = document.getElementById('datatable-body');
                    const container = document.getElementById('entity-editor-container');
                    new CloseDialog().x(container);
                    new Customers().render(Config.offset, Config.currentPage, infoPage.search);
                    //new Clients().load(tableBody, currentPage, data)
                }, 1000);
            });
        };
    }
    import() {
        const importClients = document.getElementById('import-entities');
        importClients.addEventListener('click', () => {
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            this.entityDialogContainer.innerHTML = `
            <div class="entity_editor" id="entity-editor">
              <div class="entity_editor_header">
                <div class="user_info">
                  <div class="avatar"><i class="fa-regular fa-up-from-line"></i></div>
                  <h1 class="entity_editor_title">Importar <br><small>Clientes</small></h1>
                </div>

                <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
              </div>

              <!-- EDITOR BODY -->
              <div class="entity_editor_body padding_t_8_important">
                <div class="sidebar_section">
                    <div class="file_template">
                        <i class="fa-solid fa-file-csv"></i>
                        <div class="description">
                            <p class="filename">Plantilla de Clientes</p>
                            <a
                            href="./public/src/templates/Clients.csv"
                            download="./public/src/templates/Clients.csv"
                            rel="noopener"
                            target="_self" class="filelink">Descargar</a>
                        </div>
                    </div>
                </div>

                <div class="sidebar_section" style="display: none">
                    <label class="drop_zone" id="drop-zone" draggable="true">
                        Seleccione o arrastre <br>su archivo aquí
                    </label>
                </div>

                <div class="sidebar_section">
                    <input type="file" id="file-handler">
                </div>
              </div>
              <!-- END EDITOR BODY -->

              <div class="entity_editor_footer">
                <button class="btn btn_primary btn_widder" id="button-import">Importar</button>
              </div>
            </div>
          `;
            const _fileHandler = document.getElementById('file-handler');
            _fileHandler.addEventListener('change', () => {
                readFile(_fileHandler.files[0]);
            });
            async function readFile(file) {
                //const customer = await getEntitiesData('Customer');
                //const citadel = await getEntitiesData('Citadel');
                //const deparment = await getEntitiesData('Department');
                //const contractor = await getEntitiesData('Contractor');
                const fileReader = new FileReader();
                fileReader.readAsText(file);
                fileReader.addEventListener('load', async (e) => {
                    let result = e.srcElement.result;
                    let resultSplit = result.split('\r');
                    let rawFile;
                    let elem = [];
                    for (let i = 1; i < resultSplit.length - 1; i++) {
                        let userData = resultSplit[i].split(';');
                        let searchExist = await getSearch("name", userData[0]?.replace(/\n/g, '').toUpperCase(), "Customer");
                        rawFile = JSON.stringify({
                            "name": `${userData[0]?.replace(/\n/g, '')}`,
                            "ruc": `${userData[1]?.replace(/\n/g, '')}`,
                            "state": {
                                "id": "60885987-1b61-4247-94c7-dff348347f93"
                            },
                            "business": {
                                "id": `${businessId}`
                            },
                            'creationDate': `${currentDateTime().date}`,
                            'creationTime': `${currentDateTime().time}`,
                        });
                        if (searchExist == undefined) {
                            elem.push(rawFile);
                        }
                    }
                    const importToBackend = document.getElementById('button-import');
                    importToBackend.addEventListener('click', () => {
                        elem.forEach((el) => {
                            registerEntity(el, 'User')
                                .then((res) => {
                                setTimeout(async () => {
                                    //let data = await getUsers()
                                    let parse = JSON.parse(el);
                                    eventLog('INS', 'CLIENTE', `${parse.name}, importación`, '');
                                    const tableBody = document.getElementById('datatable-body');
                                    const container = document.getElementById('entity-editor-container');
                                    new CloseDialog().x(container);
                                    new Customers().render(Config.offset, Config.currentPage, '');
                                    //new Clients().load(tableBody, currentPage, data)
                                }, 1000);
                            });
                        });
                    });
                });
            }
            this.close();
        });
    }
    edit(container, data) {
        // Edit entity
        const edit = document.querySelectorAll('#edit-entity');
        edit.forEach((edit) => {
            const entityId = edit.dataset.entityid;
            edit.addEventListener('click', () => {
                RInterface('Customer', entityId);
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
                    <div class="avatar"><i class="fa-regular fa-buildings"></i></div>
                    <h1 class="entity_editor_title">Editar <br><small>${data.name}</small></h1>
                    </div>

                    <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
                </div>

                <!-- EDITOR BODY -->
                <div class="entity_editor_body">
                    <div class="material_input">
                    <input type="text" id="entity-name" class="input_filled" value="${data.name}" readonly>
                    <label for="entity-name">Nombre</label>
                    </div>

                    <div class="material_input">
                    <input type="text"
                        id="entity-ruc"
                        class="input_filled"
                        maxlength="13"
                        value="${data?.ruc ?? ''}">
                    <label for="entity-ruc">RUC</label>
                    </div>

                    <div class="material_input_select">
                    <label for="entity-state">Estado</label>
                    <input type="text" id="entity-state" class="input_select" readonly placeholder="cargando...">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>

                    <div class="input_detail">
                        <label for="creation-date"><i class="fa-solid fa-calendar"></i></label>
                        <input type="date" id="creation-date" class="input_filled" value="${data.creationDate}" readonly>
                    </div>
                    <br>
                    <div class="input_detail">
                        <label for="creation-time"><i class="fa-solid fa-clock"></i></label>
                        <input type="time" id="creation-time" class="input_filled" value="${data.creationTime}" readonly>
                    </div>
                    <br>
                    <div class="input_detail">
                        <label for="log-user"><i class="fa-solid fa-user"></i></label>
                        <input type="text" id="log-user" class="input_filled"value="${data.createdBy}" readonly>
                    </div>

                </div>
                <!-- END EDITOR BODY -->

                <div class="entity_editor_footer">
                    <button class="btn btn_primary btn_widder" id="update-changes" style="display:${userPermissions().style};">Guardar</button>
                </div>
                </div>
            `;
            inputObserver();
            //inputSelect('Business', 'entity-citadel')
            //inputSelect('Customer', 'entity-customer')
            inputSelect('State', 'entity-state', data.state.name);
            //inputSelect('Department', 'entity-department')
            //inputSelect('Business', 'entity-business')
            this.close();
            UUpdate(entityID, data);
        };
        const UUpdate = async (entityId, data) => {
            const updateButton = document.getElementById('update-changes');
            updateButton.addEventListener('click', async () => {
                const $value = {
                    // @ts-ignore
                    name: document.getElementById('entity-name'),
                    // @ts-ignore
                    ruc: document.getElementById('entity-ruc'),
                    // @ts-ignore
                    status: document.getElementById('entity-state'),
                };
                let raw = JSON.stringify({
                    // @ts-ignore
                    "name": `${$value.name?.value.toUpperCase()}`,
                    // @ts-ignore
                    "ruc": `${$value.ruc?.value}`,
                    "state": {
                        "id": `${$value.status?.dataset.optionid}`
                    }
                });
                let searchExist = [];
                searchExist[0] = 'none';
                if ($value.name.value.toUpperCase() != data.name) {
                    searchExist[1] = await getSearch("name", $value.name.value.toUpperCase(), "Customer");
                }
                // @ts-ignore
                if ($value.name.value === '' || $value.name.value === undefined) {
                    alert("Nombre vacío!");
                }
                else if (searchExist[1] != undefined || searchExist[0] != 'none') {
                    alert("Cliente ya existe!");
                }
                else {
                    update(raw);
                }
            });
            const update = (raw) => {
                updateEntity('Customer', entityId, raw)
                    .then((res) => {
                    setTimeout(async () => {
                        let tableBody;
                        let container;
                        let data;
                        //data = await getUsers()
                        let parse = JSON.parse(raw);
                        eventLog('UPD', 'CLIENTE', `${parse.name}`, '');
                        new CloseDialog()
                            .x(container =
                            document.getElementById('entity-editor-container'));
                        new Customers().render(infoPage.offset, infoPage.currentPage, infoPage.search);
                        /* new Clients().load(tableBody
                             = document.getElementById('datatable-body'),
                             currentPage,
                             data
                         )*/
                    }, 100);
                });
            };
        };
    }
    remove() {
        const remove = document.querySelectorAll('#remove-entity');
        remove.forEach((remove) => {
            const entityId = remove.dataset.entityid;
            const entityName = remove.dataset.entityname;
            // BOOKMARK: MODAL
            remove.addEventListener('click', () => {
                this.dialogContainer.style.display = 'block';
                this.dialogContainer.innerHTML = `
                    <div class="dialog_content" id="dialog-content">
                        <div class="dialog dialog_danger">
                        <div class="dialog_container">
                            <div class="dialog_header">
                            <h2>¿Deseas eliminar esta cliente?</h2>
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
                    deleteEntity('Customer', entityId)
                        .then((res) => {
                        setTimeout(async () => {
                            //let data = await getUsers();
                            eventLog('DLT', 'CLIENTE', `${entityName}`, '');
                            const tableBody = document.getElementById('datatable-body');
                            new CloseDialog().x(dialogContent);
                            new Customers().render(infoPage.offset, infoPage.currentPage, infoPage.search);
                            //new Clients().load(tableBody, currentPage, data);
                        }, 1000);
                    });
                };
                cancelButton.onclick = () => {
                    new CloseDialog().x(dialogContent);
                    //this.render()
                };
            });
        });
    }
    pagination(items, limitRows, currentPage) {
        const tableBody = document.getElementById('datatable-body');
        const paginationWrapper = document.getElementById('pagination-container');
        paginationWrapper.innerHTML = '';
        let pageCount;
        pageCount = Math.ceil(infoPage.count / limitRows);
        let button;
        if (pageCount <= Config.maxLimitPage) {
            for (let i = 1; i < pageCount + 1; i++) {
                button = setupButtons(i /*, items, currentPage, tableBody, limitRows*/);
                paginationWrapper.appendChild(button);
            }
            fillBtnPagination(currentPage, Config.colorPagination);
        }
        else {
            pagesOptions(items, currentPage);
        }
        function setupButtons(page /*, items: any, currentPage: number, tableBody: InterfaceElement, limitRows: number*/) {
            const button = document.createElement('button');
            button.classList.add('pagination_button');
            button.setAttribute("name", "pagination-button");
            button.setAttribute("id", "btnPag" + page);
            button.innerText = page;
            button.addEventListener('click', () => {
                infoPage.offset = Config.tableRows * (page - 1);
                currentPage = page;
                new Customers().render(infoPage.offset, currentPage, infoPage.search);
                //new Clients().load(tableBody, page, items)
            });
            return button;
        }
        function pagesOptions(items, currentPage) {
            paginationWrapper.innerHTML = '';
            let pages = pageNumbers(pageCount, Config.maxLimitPage, currentPage);
            const prevButton = document.createElement('button');
            prevButton.classList.add('pagination_button');
            prevButton.innerText = "<<";
            paginationWrapper.appendChild(prevButton);
            const nextButton = document.createElement('button');
            nextButton.classList.add('pagination_button');
            nextButton.innerText = ">>";
            for (let i = 0; i < pages.length; i++) {
                if (pages[i] > 0 && pages[i] <= pageCount) {
                    button = setupButtons(pages[i]);
                    paginationWrapper.appendChild(button);
                }
            }
            paginationWrapper.appendChild(nextButton);
            fillBtnPagination(currentPage, Config.colorPagination);
            setupButtonsEvents(prevButton, nextButton);
        }
        function setupButtonsEvents(prevButton, nextButton) {
            prevButton.addEventListener('click', () => {
                new Customers().render(Config.offset, Config.currentPage, infoPage.search);
            });
            nextButton.addEventListener('click', () => {
                infoPage.offset = Config.tableRows * (pageCount - 1);
                new Customers().render(infoPage.offset, pageCount, infoPage.search);
            });
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
