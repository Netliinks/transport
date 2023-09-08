// @filename: Departments.ts
import { deleteEntity, registerEntity, getFilterEntityData, getFilterEntityCount } from "../../endpoints.js";
import { inputObserver, CloseDialog, filterDataByHeaderType, pageNumbers, fillBtnPagination, userPermissions, getNothing } from "../../tools.js";
import { Config } from "../../Configs.js";
import { tableLayout } from "./Layout.js";
import { tableLayoutTemplate } from "./Template.js";
const tableRows = Config.tableRows;
const currentPage = Config.currentPage;
const businessId = localStorage.getItem('business_id');
let infoPage = {
    count: 0,
    offset: Config.offset,
    currentPage: currentPage,
    search: ""
};
let dataPage;
const getServices = async () => {
    //const departmentRaw: any = await getEntitiesData('Department')
    //const department = departmentRaw.filter((data: any) => `${data.customer?.id}` === `${customerId}`)
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
    });
    if (infoPage.search != "") {
        raw = JSON.stringify({
            "filter": {
                "conditions": [
                    {
                        "group": "OR",
                        "conditions": [
                            {
                                "property": "name",
                                "operator": "contains",
                                "value": `${infoPage.search.toLowerCase()}`
                            },
                            {
                                "property": "customer.name",
                                "operator": "contains",
                                "value": `${infoPage.search.toLowerCase()}`
                            },
                            {
                                "property": "serviceState.name",
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
            offset: infoPage.offset
        });
    }
    infoPage.count = await getFilterEntityCount("Service", raw);
    dataPage = await getFilterEntityData("Service", raw);
    return dataPage;
};
export class Services {
    constructor() {
        this.dialogContainer = document.getElementById('app-dialogs');
        this.entityDialogContainer = document.getElementById('entity-editor-container');
        this.content = document.getElementById('datatable-container');
        this.searchEntity = async (tableBody /*, data: any*/) => {
            const search = document.getElementById('search');
            const btnSearch = document.getElementById('btnSearch');
            search.value = infoPage.search;
            await search.addEventListener('keyup', () => {
                /*const arrayData: any = data.filter((user: any) =>
                    `${user.firstName}
                     ${user.lastName}
                     ${user.username}`
                        .toLowerCase()
                        .includes(search.value.toLowerCase())
                )
    
                let filteredResult = arrayData.length
                let result = arrayData
                if (filteredResult >= tableRows) filteredResult = tableRows
    
                this.load(tableBody, currentPage, result)
                */
            });
            btnSearch.addEventListener('click', async () => {
                new Services().render(Config.offset, Config.currentPage, search.value.toLowerCase().trim());
            });
        };
    }
    async render(offset, actualPage, search) {
        infoPage.offset = offset;
        infoPage.currentPage = actualPage;
        infoPage.search = search;
        this.content.innerHTML = '';
        this.content.innerHTML = tableLayout;
        const tableBody = document.getElementById('datatable-body');
        tableBody.innerHTML = '.Cargando...';
        let data = await getServices();
        tableBody.innerHTML = tableLayoutTemplate.repeat(tableRows);
        this.load(tableBody, currentPage, data);
        new filterDataByHeaderType().filter();
        this.searchEntity(tableBody /*, data*/);
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
                let service = paginatedItems[i];
                let row = document.createElement('tr');
                row.innerHTML += `
                <td>${service.name}</dt>
                <td>${service?.customer?.name ?? ''}</dt>
                <td>${service?.outputDate ?? ''} ${service?.outputTime ?? ''}</dt>
                <td class="tag"><span>${service?.serviceState.name ?? ''}</span></td>
                <td class="entity_options">
                    <button class="button" id="edit-entity" data-entityId="${service.id}">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button class="button" id="remove-entity" data-entityId="${service.id}" data-entityName="${service.name}" style="display:${userPermissions().style};">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
        `;
                table.appendChild(row);
            }
        }
        this.register();
        this.remove();
    }
    register() {
        // register entity
        const openEditor = document.getElementById('new-entity');
        openEditor.addEventListener('click', () => {
            renderInterface();
        });
        const renderInterface = async () => {
            const nothingConfig = {
                nothingUser: await getNothing("username", "N/A", "User"),
                nothingWeapon: await getNothing("name", "N/A", "Weapon"),
                userState: await getNothing("name", "Asignado", "UserState"),
                weaponState: await getNothing("name", "Asignado", "WeaponState"),
                vehicularState: await getNothing("name", "Asignado", "VehicularState"),
                userEnable: await getNothing("name", "Disponible", "UserState"),
                vehicularEnable: await getNothing("name", "Disponible", "VehicularState"),
                weaponEnable: await getNothing("name", "Disponible", "WeaponState")
            };
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            this.entityDialogContainer.innerHTML = `
        <div class="entity_editor" id="entity-editor">
          <div class="entity_editor_header">
            <div class="user_info">
              <div class="avatar"><i class="fa-solid fa-building"></i></div>
              <h1 class="entity_editor_title">Registrar <br><small>Servicio</small></h1>
            </div>

            <button class="btn btn_close_editor" id="close"><i class="fa-regular fa-x"></i></button>
          </div>

          <!-- EDITOR BODY -->
          <div class="entity_editor_body">
            <div class="material_input">
            <input type="text" id="entity-name" autocomplete="none">
            <label for="entity-name"><i class="fa-solid fa-users"></i> Nombre</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-client" autocomplete="none" readonly>
            <label for="entity-client"><i class="fa-solid fa-car" readonly></i> Cliente</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-city-origin" autocomplete="none" readonly>
            <label for="entity-city-origin"><i class="fa-solid fa-car" readonly></i> Ciudad Origen</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-city-destiny" autocomplete="none" readonly>
            <label for="entity-city-destiny"><i class="fa-solid fa-car" readonly></i> Ciudad Destino</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-place-origin" autocomplete="none" readonly>
            <label for="entity-place-origin"><i class="fa-solid fa-car" readonly></i> Lugar Origen</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-place-destiny" autocomplete="none" readonly>
            <label for="entity-place-destiny"><i class="fa-solid fa-car" readonly></i> Lugar Destino</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-place-destiny" autocomplete="none" readonly>
            <label for="entity-place-destiny"><i class="fa-solid fa-car" readonly></i> Lugar Destino</label>
            </div>

            <div class="material_input">
            <input type="email" id="entity-email" autocomplete="none" readonly>
            <label for="entity-place-email"><i class="fa-solid fa-car" readonly></i> Correo Electrónico</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-reference" autocomplete="none" readonly>
            <label for="entity-place-reference"><i class="fa-solid fa-car" readonly></i> Referencia Cliente</label>
            </div>

            <div class="form_group">
              <div class="material_input">
                <select id="select">
                    <option value="1" selected>1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                </select>
                <label for="entity-place-reference"><i class="fa-solid fa-car" readonly></i> Referencia Cliente</label>
              </div>

              <div class="material_input">
                <select id="select">
                    <option value="1" selected>1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                </select>
                <label for="entity-place-reference"><i class="fa-solid fa-car" readonly></i> Referencia Cliente</label>
              </div>
            </div>

            <div class="form_group">
                <div class="form_input">
                    <label class="form_label" for="output-date">Fecha Salida:</label>
                    <input type="date" class="input_time input_time-start" id="output-date" name="output-date">
                </div>

                <div class="form_input">
                    <label class="form_label" for="output-time">Hora Salida:</label>
                    <input type="time" class="input_time input_time-end" id="output-time" name="output-time">
                </div>
            </div>

            <div class="material_input">
            <textarea id="entity-observation" rows="4" autocomplete="none"></textarea>
            <label for="entity-observation"><i class="fa-solid fa-car" readonly></i> Observación</label>
            </div>
          </div>
          <!-- END EDITOR BODY -->

          <div class="entity_editor_footer">
            <button class="btn btn_primary btn_widder" id="register-entity">Guardar</button>
          </div>
        </div>
      `;
            // @ts-ignore
            inputObserver();
            //inputSelect('Customer', 'entity-customer')
            this.close();
            const registerButton = document.getElementById('register-entity');
            registerButton.addEventListener('click', () => {
                const inputsCollection = {
                    name: document.getElementById('entity-name'),
                    customer: document.getElementById('entity-customer'),
                };
                const raw = JSON.stringify({
                    "name": `${inputsCollection.name.value}`,
                    "customer": {
                        "id": `${businessId}`
                    }
                });
                registerEntity(raw, 'Department');
                setTimeout(() => {
                    const container = document.getElementById('entity-editor-container');
                    new CloseDialog().x(container);
                    new Services().render(Config.offset, Config.currentPage, infoPage.search);
                }, 1000);
            });
        };
        const reg = async (raw) => {
        };
    }
    remove() {
        const remove = document.querySelectorAll('#remove-entity');
        remove.forEach((remove) => {
            const entityId = remove.dataset.entityid;
            remove.addEventListener('click', () => {
                this.dialogContainer.style.display = 'flex';
                this.dialogContainer.innerHTML = `
          <div class="dialog_content" id="dialog-content">
            <div class="dialog dialog_danger">
              <div class="dialog_container">
                <div class="dialog_header">
                  <h2>¿Deseas eliminar este departamento?</h2>
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
          </div>
        `;
                // delete button
                // cancel button
                // dialog content
                const deleteButton = document.getElementById('delete');
                const cancelButton = document.getElementById('cancel');
                const dialogContent = document.getElementById('dialog-content');
                deleteButton.onclick = () => {
                    deleteEntity('Department', entityId)
                        .then(res => new Services().render(infoPage.offset, infoPage.currentPage, infoPage.search));
                    new CloseDialog().x(dialogContent);
                };
                cancelButton.onclick = () => {
                    new CloseDialog().x(dialogContent);
                };
            });
        });
    }
    close() {
        const closeButton = document.getElementById('close');
        const editor = document.getElementById('entity-editor-container');
        closeButton.addEventListener('click', () => {
            //console.log('close')
            new CloseDialog().x(editor);
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
                new Services().render(infoPage.offset, currentPage, infoPage.search);
            });
            return button;
        }
        function pagesOptions(items, currentPage) {
            paginationWrapper.innerHTML = '';
            let pages = pageNumbers(items, Config.maxLimitPage, currentPage);
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
                new Services().render(Config.offset, Config.currentPage, infoPage.search);
            });
            nextButton.addEventListener('click', () => {
                infoPage.offset = Config.tableRows * (pageCount - 1);
                new Services().render(infoPage.offset, pageCount, infoPage.search);
            });
        }
    }
}
