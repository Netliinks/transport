// @filename: Departments.ts
import { deleteEntity, registerEntity, getFilterEntityData, getFilterEntityCount, getEntityData, updateEntity, sendMail, getUserInfo, postNotificationPush, getFile } from "../../endpoints.js";
import { inputObserver, CloseDialog, filterDataByHeaderType, pageNumbers, fillBtnPagination, userPermissions, getNothing, inputSelectType, currentDateTime, eventLog, getSearch, getDetails, getUpdateState } from "../../tools.js";
import { Config } from "../../Configs.js";
import { tableLayout } from "./Layout.js";
import { tableLayoutTemplate } from "./Template.js";
import { Patrols } from "./patrols/Patrols.js";
import { Charges } from "./containers/Containers.js";
import { exportServiceCsv, exportServicePdf, exportServiceXls } from "../../exportFiles/services.js";
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
            offset: infoPage.offset,
            fetchPlan: 'full',
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
        this.export = () => {
            const exportLogs = document.getElementById('export-entities');
            exportLogs.addEventListener('click', async () => {
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
                                    <div class="form_input">
                                        <label class="form_label" for="start-date">Desde:</label>
                                        <input type="date" class="input_date input_date-start" id="start-date" name="start-date">
                                    </div>
                    
                                    <div class="form_input">
                                        <label class="form_label" for="end-date">Hasta:</label>
                                        <input type="date" class="input_date input_date-end" id="end-date" name="end-date">
                                    </div>

                                    <label for="exportCsv">
                                        <input type="radio" id="exportCsv" name="exportOption" value="csv" /> CSV
                                    </label>

                                    <label for="exportXls">
                                        <input type="radio" id="exportXls" name="exportOption" value="xls" checked /> XLS
                                    </label>

                                    <!-- <label for="exportPdf">
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
                let fecha = new Date(); //Fecha actual
                let mes = fecha.getMonth() + 1; //obteniendo mes
                let dia = fecha.getDate(); //obteniendo dia
                let anio = fecha.getFullYear(); //obteniendo año
                if (dia < 10)
                    dia = '0' + dia; //agrega cero si el menor de 10
                if (mes < 10)
                    mes = '0' + mes; //agrega cero si el menor de 10
                // @ts-ignore
                document.getElementById("start-date").value = anio + "-" + mes + "-" + dia;
                // @ts-ignore
                document.getElementById("end-date").value = anio + "-" + mes + "-" + dia;
                inputObserver();
                const _closeButton = document.getElementById('cancel');
                const exportButton = document.getElementById('export-data');
                const _dialog = document.getElementById('dialog-content');
                exportButton.addEventListener('click', async () => {
                    const _values = {
                        exportOption: document.getElementsByName('exportOption'),
                        start: document.getElementById('start-date'),
                        end: document.getElementById('end-date'),
                    };
                    let rawExport = JSON.stringify({
                        "filter": {
                            "conditions": [
                                {
                                    "property": "business.id",
                                    "operator": "=",
                                    "value": `${businessId}`
                                },
                                {
                                    "property": "creationDate",
                                    "operator": ">=",
                                    "value": `${_values.start.value}`
                                },
                                {
                                    "property": "creationDate",
                                    "operator": "<=",
                                    "value": `${_values.end.value}`
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
                                    },
                                    {
                                        "property": "creationDate",
                                        "operator": ">=",
                                        "value": `${_values.start.value}`
                                    },
                                    {
                                        "property": "creationDate",
                                        "operator": "<=",
                                        "value": `${_values.end.value}`
                                    }
                                ]
                            },
                            sort: "-createdDate",
                            fetchPlan: 'full',
                        });
                    }
                    const logs = await getFilterEntityData("Service", rawExport); //await getLogs()
                    for (let i = 0; i < _values.exportOption.length; i++) {
                        let ele = _values.exportOption[i];
                        if (ele.type = "radio") {
                            if (ele.checked) {
                                if (ele.value == "xls") {
                                    // @ts-ignore
                                    exportServiceXls(logs);
                                }
                                else if (ele.value == "csv") {
                                    // @ts-ignore
                                    exportServiceCsv(logs);
                                }
                                else if (ele.value == "pdf") {
                                    // @ts-ignore
                                    //exportServicePdf(logs)
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
                <td>${service?.custodyType ?? ''}</dt>
                <td class="tag"><span>${service?.serviceState?.name ?? ''}</span></td>
                <td class="entity_options">

                    <button class="button" id="get-check" data-entityId="${service.id}">
                        <i class="fa-solid fa-check"></i>
                    </button>

                    <button class="button" id="get-patrols" data-entityId="${service.id}">
                        <i class="fa-solid fa-car"></i>
                    </button>

                    <button class="button" id="get-containers" data-entityId="${service.id}">
                        <i class="fa-solid fa-truck-container"></i>
                    </button>

                    <button class="button" id="edit-entity" data-entityId="${service.id}">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button class="button" id="remove-entity" data-entityId="${service.id}" data-entityName="${service.name}" style="display:${userPermissions().style};">
                        <i class="fa-solid fa-trash"></i>
                    </button>

                    <button class="button" id="print-entity" data-entityId="${service.id}" data-entityName="${service.name}">
                        <i class="fa-solid fa-file-pdf"></i>
                    </button>
                </td>
        `;
                table.appendChild(row);
            }
        }
        this.getVehicles();
        this.getContainers();
        this.register();
        this.edit(this.entityDialogContainer, data);
        this.sendEmail(this.entityDialogContainer);
        this.export();
        this.remove();
        this.print();
    }
    register() {
        // register entity
        const openEditor = document.getElementById('new-entity');
        openEditor.addEventListener('click', () => {
            renderInterface();
        });
        const renderInterface = async () => {
            const nothingConfig = {
                serviceState: await getNothing("name", "Pendiente", "ServiceState"),
            };
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            this.entityDialogContainer.innerHTML = `
        <div class="entity_editor" id="entity-editor">
          <div class="entity_editor_header">
            <div class="user_info">
              <div class="avatar"><i class="fa-solid fa-desktop"></i></div>
              <h1 class="entity_editor_title">Registrar <br><small>Servicio</small></h1>
            </div>

            <button class="btn btn_close_editor" id="close"><i class="fa-regular fa-x"></i></button>
          </div>

          <!-- EDITOR BODY -->
          <div class="entity_editor_body">
            <div class="material_input">
            <input type="text" id="entity-name" autocomplete="none">
            <label for="entity-name"><i class="fa-solid fa-desktop"></i> Solicitante</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-client" autocomplete="none" readonly>
            <label for="entity-client"><i class="fa-solid fa-buildings" readonly></i> Cliente</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-city-origin" autocomplete="none" readonly>
            <label for="entity-city-origin"><i class="fa-solid fa-earth-americas" readonly></i> Ciudad Origen</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-city-destiny" autocomplete="none" readonly>
            <label for="entity-city-destiny"><i class="fa-solid fa-earth-americas" readonly></i> Ciudad Destino</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-place-origin" autocomplete="none">
            <label for="entity-place-origin"><i class="fa-solid fa-location-arrow" readonly></i> Lugar Origen</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-place-destiny" autocomplete="none">
            <label for="entity-place-destiny"><i class="fa-solid fa-location-arrow" readonly></i> Lugar Destino</label>
            </div>

            <div class="material_input">
            <input type="email" id="entity-email" autocomplete="none">
            <label for="entity-place-email"><i class="fa-solid fa-envelope" readonly></i> Correo Electrónico</label>
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
            <br>

            <div class="material_input">
            <input type="text" id="entity-reference" autocomplete="none">
            <label for="entity-place-reference"><i class="fa-solid fa-info" readonly></i> Referencia Cliente</label>
            </div>

            <div class="material_input_select">
            <label for="entity-custody"><i class="fa-solid fa-shield" readonly></i> Tipo de Custodia</label>
            <input type="text" id="entity-custody" class="input_select" readonly placeholder="cargando..." autocomplete="none">
            <div id="input-options" class="input_options">
            </div>
            </div>

            <div class="form_group">
              <div class="material_input">
                <br>
                <select class="input_filled" id="entity-vehicle">
                    <option value="0" selected>0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                </select>
                <label for="entity-vehicle"><i class="fa-solid fa-car" readonly></i> Vehículos</label>
              </div>

              <div class="material_input">
                <br>
                <select class="input_filled" id="entity-containers">
                    <option value="0" selected>0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                </select>
                <label for="entity-containers"><i class="fa-solid fa-truck" readonly></i> Contenedores</label>
              </div>
            </div>

            <div class="material_input">
            <br>
            <textarea id="entity-observation" rows="4" class="input_filled" autocomplete="none"></textarea>
            <label for="entity-observation"><i class="fa-solid fa-memo-circle-info" readonly></i> Observación</label>
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
            this.selectClient();
            this.selectCity();
            inputSelectType('entity-custody', 'SERVICE', '');
            //inputSelect('Customer', 'entity-customer')
            this.close();
            let fecha = new Date(); //Fecha actual
            let mes = fecha.getMonth() + 1; //obteniendo mes
            let dia = fecha.getDate(); //obteniendo dia
            let anio = fecha.getFullYear(); //obteniendo año
            let _hours = fecha.getHours();
            let _minutes = fecha.getMinutes();
            let _fixedHours = ('0' + _hours).slice(-2);
            let _fixedMinutes = ('0' + _minutes).slice(-2);
            if (dia < 10)
                dia = '0' + dia; //agrega cero si el menor de 10
            if (mes < 10)
                mes = '0' + mes; //agrega cero si el menor de 10
            // @ts-ignore
            document.getElementById("output-date").value = anio + "-" + mes + "-" + dia;
            // @ts-ignore
            document.getElementById("output-time").value = `${_fixedHours}:${_fixedMinutes}`;
            const registerButton = document.getElementById('register-entity');
            registerButton.addEventListener('click', async () => {
                const inputsCollection = {
                    name: document.getElementById('entity-name'),
                    client: document.getElementById('entity-client'),
                    cityOrigin: document.getElementById('entity-city-origin'),
                    cityDestiny: document.getElementById('entity-city-destiny'),
                    placeOrigin: document.getElementById('entity-place-origin'),
                    placeDestiny: document.getElementById('entity-place-destiny'),
                    email: document.getElementById('entity-email'),
                    date: document.getElementById('output-date'),
                    time: document.getElementById('output-time'),
                    reference: document.getElementById('entity-reference'),
                    custody: document.getElementById('entity-custody'),
                    vehicle: document.getElementById('entity-vehicle'),
                    containers: document.getElementById('entity-containers'),
                    observation: document.getElementById('entity-observation'),
                };
                const raw = JSON.stringify({
                    "name": `${inputsCollection.name.value.toUpperCase()}`,
                    'creationDate': `${currentDateTime().date}`,
                    'creationTime': `${currentDateTime().time}`,
                    "serviceState": {
                        "id": `${nothingConfig.serviceState.id}`
                    },
                    "business": {
                        "id": `${businessId}`
                    },
                    "customer": {
                        "id": `${inputsCollection.client.dataset.optionid}`
                    },
                    "cityOrigin": {
                        "id": `${inputsCollection.cityOrigin.dataset.optionid}`
                    },
                    "cityDestination": {
                        "id": `${inputsCollection.cityDestiny.dataset.optionid}`
                    },
                    "placeOrigin": `${inputsCollection.placeOrigin.value}`,
                    "placeDestination": `${inputsCollection.placeDestiny.value}`,
                    "email": `${inputsCollection.email.value}`,
                    "outputDate": `${inputsCollection.date.value}`,
                    "outputTime": `${inputsCollection.time.value}`,
                    "reference": `${inputsCollection.reference.value}`,
                    "custodyType": `${inputsCollection.custody.value}`,
                    "quantyVehiculars": `${inputsCollection.vehicle.value}`,
                    "quantyContainers": `${inputsCollection.containers.value}`,
                    "observation": `${inputsCollection.observation.value}`,
                });
                let searchExist = await getSearch("name", inputsCollection.name.value.toUpperCase(), "Service");
                if (inputsCollection.name.value === '' || inputsCollection.name.value === undefined) {
                    alert("¡Nombre vacío!");
                }
                else if (inputsCollection.client.value === '' || inputsCollection.client.value === undefined) {
                    alert("Cliente no seleccionado!");
                }
                else if (inputsCollection.cityOrigin.value === '' || inputsCollection.cityOrigin.value === undefined) {
                    alert("¡Ciudad origen no seleccionada!");
                }
                else if (inputsCollection.cityDestiny.value === '' || inputsCollection.cityDestiny.value === undefined) {
                    alert("¡Ciudad destino no seleccionada!");
                }
                else if (inputsCollection.email.value === '' || inputsCollection.email.value === undefined) {
                    alert("¡Email vacío!");
                }
                else if (searchExist != undefined) {
                    alert("Servicio ya existe!");
                }
                else {
                    registerEntity(raw, 'Service').then((res) => {
                        setTimeout(() => {
                            let parse = JSON.parse(raw);
                            eventLog('INS', 'SERVICIO', `${parse.name}`, '', `${nothingConfig.serviceState.name}`);
                            const container = document.getElementById('entity-editor-container');
                            new CloseDialog().x(container);
                            new Services().render(Config.offset, Config.currentPage, infoPage.search);
                        }, 1000);
                    });
                }
            });
        };
        const reg = async (raw) => {
        };
    }
    edit(container, data) {
        // Edit entity
        const edit = document.querySelectorAll('#edit-entity');
        edit.forEach((edit) => {
            const entityId = edit.dataset.entityid;
            edit.addEventListener('click', () => {
                RInterface('Service', entityId);
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
                  <div class="avatar"><i class="fa-regular fa-desktop"></i></div>
                  <h1 class="entity_editor_title">Editar <br><small>${data.name}</small></h1>
                  </div>

                  <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
              </div>

              <!-- EDITOR BODY -->
              <div class="entity_editor_body">
                  <div class="material_input">
                  <input type="text" id="entity-name" class="input_filled" value="${data.name}">
                  <label for="entity-name">Solicitante</label>
                  </div>

                  <div class="material_input">
                  <input type="text" id="entity-client" class="input_filled" data-optionid="${data.customer?.id ?? ''}" value="${data.customer?.name ?? ''}" readonly>
                  <label for="entity-client"><i class="fa-solid fa-buildings" readonly></i> Cliente</label>
                  </div>

                  <div class="material_input">
                  <input type="text" id="entity-city-origin" class="input_filled" data-optionid="${data.cityOrigin?.id ?? ''}" value="${data.cityOrigin?.name ?? ''}" readonly>
                  <label for="entity-city-origin"><i class="fa-solid fa-earth-americas" readonly></i> Ciudad Origen</label>
                  </div>

                  <div class="material_input">
                  <input type="text" id="entity-city-destiny" class="input_filled" data-optionid="${data.cityDestination?.id ?? ''}" value="${data.cityDestination?.name ?? ''}" readonly>
                  <label for="entity-city-destiny"><i class="fa-solid fa-earth-americas" readonly></i> Ciudad Destino</label>
                  </div>

                  <div class="material_input">
                  <input type="text" id="entity-place-origin" class="input_filled" value="${data?.placeOrigin ?? ''}">
                  <label for="entity-place-origin"><i class="fa-solid fa-location-arrow" readonly></i> Lugar Origen</label>
                  </div>

                  <div class="material_input">
                  <input type="text" id="entity-place-destiny" class="input_filled" value="${data?.placeDestination ?? ''}">
                  <label for="entity-place-destiny"><i class="fa-solid fa-location-arrow" readonly></i> Lugar Destino</label>
                  </div>

                  <div class="material_input">
                  <input type="email" id="entity-email" class="input_filled" value="${data?.email ?? ''}" readonly>
                  <label for="entity-place-email"><i class="fa-solid fa-envelope" readonly></i> Correo Electrónico</label>
                  </div>

                  <div class="form_group">
                      <div class="form_input">
                          <label class="form_label" for="output-date">Fecha Salida:</label>
                          <input type="date" class="input_time input_time-start" id="output-date" name="output-date" value="${data?.outputDate ?? ''}" readonly>
                      </div>

                      <div class="form_input">
                          <label class="form_label" for="output-time">Hora Salida:</label>
                          <input type="time" class="input_time input_time-end" id="output-time" name="output-time" value="${data?.outputTime ?? ''}" readonly>
                      </div>
                  </div>
                  <br>

                  <div class="material_input">
                  <input type="text" id="entity-reference" class="input_filled" value="${data?.reference ?? ''}">
                  <label for="entity-place-reference"><i class="fa-solid fa-info" readonly></i> Referencia Cliente</label>
                  </div>

                  <div class="material_input">
                  <input type="text" id="entity-custody" class="input_filled" value="${data?.custodyType ?? ''}" readonly>
                  <label for="entity-place-custody"><i class="fa-solid fa-shield" readonly></i> Tipo de Custodia</label>
                  </div>

                  <div class="form_group">
                    <div class="material_input">
                      <br>
                      <select class="input_filled" id="entity-vehicle" disabled>
                          <option value="0" selected>0</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                          <option value="6">6</option>
                      </select>
                      <label for="entity-vehicle"><i class="fa-solid fa-car" readonly></i> Vehículos</label>
                    </div>

                    <div class="material_input">
                      <br>
                      <select class="input_filled" id="entity-containers" disabled>
                          <option value="0" selected>0</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                          <option value="6">6</option>
                      </select>
                      <label for="entity-containers"><i class="fa-solid fa-truck" readonly></i> Contenedores</label>
                    </div>
                  </div>

                  <div class="material_input">
                  <br>
                  <textarea id="entity-observation" rows="4" class="input_filled">${data?.observation ?? ''}</textarea>
                  <label for="entity-observation"><i class="fa-solid fa-memo-circle-info" readonly></i> Observación</label>
                  </div>
                  <br>
                  <br>

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
                      <input type="text" id="log-user" class="input_filled" value="${data.createdBy}" readonly>
                  </div>

              </div>
              <!-- END EDITOR BODY -->

              <div class="entity_editor_footer">
                  <button class="btn btn_primary btn_widder" id="update-changes" style="display:${userPermissions().style};">Guardar</button>
              </div>
              </div>
          `;
            inputObserver();
            // @ts-ignore
            document.getElementById("entity-vehicle").value = data.quantyVehiculars;
            // @ts-ignore
            document.getElementById("entity-containers").value = data.quantyContainers;
            this.close();
            UUpdate(entityID, data);
        };
        const UUpdate = async (entityId, service) => {
            const updateButton = document.getElementById('update-changes');
            updateButton.addEventListener('click', async () => {
                const $value = {
                    // @ts-ignore
                    name: document.getElementById('entity-name'),
                    placeOrigin: document.getElementById('entity-place-origin'),
                    placeDestiny: document.getElementById('entity-place-destiny'),
                    reference: document.getElementById('entity-reference'),
                    observation: document.getElementById('entity-observation'),
                };
                let raw = JSON.stringify({
                    // @ts-ignore
                    "name": `${$value.name?.value.toUpperCase()}`,
                    "placeOrigin": `${$value.placeOrigin?.value}`,
                    "placeDestination": `${$value.placeDestiny?.value}`,
                    "reference": `${$value.reference?.value}`,
                    "observation": `${$value.observation?.value}`,
                });
                let searchExist = [];
                searchExist[0] = 'none';
                if ($value.name.value.toUpperCase() != service.name) {
                    searchExist[1] = await getSearch("name", $value.name.value.toUpperCase(), "Service");
                }
                // @ts-ignore
                if ($value.name.value === '' || $value.name.value === undefined) {
                    alert("Nombre vacío!");
                }
                else if (searchExist[1] != undefined || searchExist[0] != 'none') {
                    alert("Servicio ya existe!");
                }
                else {
                    update(raw);
                }
            });
            const update = (raw) => {
                updateEntity('Service', entityId, raw)
                    .then((res) => {
                    setTimeout(async () => {
                        let tableBody;
                        let container;
                        let data;
                        //data = await getWeapons()
                        let parse = JSON.parse(raw);
                        eventLog('UPD', 'SERVICIO', `${parse.name}`, service, `${service.ServiceState.name}`);
                        new CloseDialog()
                            .x(container =
                            document.getElementById('entity-editor-container'));
                        new Services().render(infoPage.offset, infoPage.currentPage, infoPage.search);
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
    getVehicles() {
        const patrols = document.querySelectorAll('#get-patrols');
        patrols.forEach((patrol) => {
            const entityId = patrol.dataset.entityid;
            patrol.addEventListener('click', async () => {
                const data = await getEntityData('Service', entityId);
                //if(data.serviceState.name != 'Terminado')
                new Patrols().render(Config.offset, Config.currentPage, "", entityId);
            });
        });
    }
    getContainers() {
        const containers = document.querySelectorAll('#get-containers');
        containers.forEach((container) => {
            const entityId = container.dataset.entityid;
            container.addEventListener('click', () => {
                new Charges().render(Config.offset, Config.currentPage, "", entityId);
            });
        });
    }
    remove() {
        const remove = document.querySelectorAll('#remove-entity');
        remove.forEach((remove) => {
            const entityId = remove.dataset.entityid;
            const entityName = remove.dataset.entityname;
            remove.addEventListener('click', async () => {
                const data = await getEntityData('Service', entityId);
                const nothingConfig = {
                    vehicularState: await getNothing("name", "Asignado", "VehicularState"),
                    userState: await getNothing("name", "Asignado", "UserState"),
                    weaponState: await getNothing("name", "Asignado", "WeaponState"),
                    nothingWeapon: await getNothing("name", "N/A", "Weapon"),
                    nothingUser: await getNothing("username", "N/A", "User"),
                    crewState: await getNothing("name", "Disponible", "CrewState"),
                    userContainer: await getNothing("name", "Disponible", "UserState"),
                    weaponContainer: await getNothing("name", "Disponible", "WeaponState"),
                };
                this.dialogContainer.style.display = 'flex';
                this.dialogContainer.innerHTML = `
          <div class="dialog_content" id="dialog-content">
            <div class="dialog dialog_danger">
              <div class="dialog_container">
                <div class="dialog_header">
                  <h2>¿Deseas eliminar este servicio?</h2>
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
                deleteButton.onclick = async () => {
                    if (data.serviceState.name == "Pendiente" || data.serviceState.name == "Terminado") {
                        const patrols = await getDetails("service.id", entityId, "ServiceDetailV");
                        const containers = await getDetails("service.id", entityId, "Charge");
                        deleteEntity('Service', entityId)
                            .then(async (res) => {
                            setTimeout(async () => {
                                eventLog('DLT', 'SERVICIO', `${entityName}`, data, `${data.serviceState.name}`);
                                //Patrulla
                                if (patrols != undefined) {
                                    patrols.forEach(async (patrol) => {
                                        let crew = await getEntityData('Crew', patrol.crew.id);
                                        getUpdateState(nothingConfig.crewState.id, 'Crew', patrol.crew.id);
                                        eventLog('UPD', `PATRULLA`, `${patrol.crew.name} disponible`, '');
                                        let dataArray = [];
                                        if (crew?.vehicular?.id) {
                                            dataArray.push({
                                                id: crew.vehicular.id,
                                                value: `${crew.vehicular.type} [${crew.vehicular.licensePlate}]`,
                                                table: "Vehicular",
                                                state: nothingConfig.vehicularState.id,
                                                title: "VEHÍCULO"
                                            });
                                        }
                                        if (crew?.crewOne?.id != nothingConfig.nothingUser.id || crew?.crewOne?.username != 'N/A') {
                                            dataArray.push({
                                                id: crew?.crewOne.id,
                                                value: `${crew?.crewOne.username}`,
                                                table: "User",
                                                state: nothingConfig.userState.id,
                                                title: "SUPERVISOR"
                                            });
                                            if (crew?.weaponOne?.id != nothingConfig.nothingWeapon.id || crew?.weaponOne?.name != 'N/A') {
                                                dataArray.push({
                                                    id: crew?.weaponOne.id,
                                                    value: `${crew?.weaponOne.name} [${crew?.weaponOne.licensePlate}]`,
                                                    table: "Weapon",
                                                    state: nothingConfig.weaponState.id,
                                                    title: "ARMA"
                                                });
                                            }
                                        }
                                        let users = [crew?.crewTwo, crew?.crewThree, crew?.crewFour, crew?.crewFive];
                                        let weapons = [crew?.weaponTwo, crew?.weaponThree, crew?.weaponFour, crew?.weaponFive];
                                        for (let i = 0; i < 4; i++) {
                                            if (users[i]?.id != nothingConfig.nothingUser.id || users[i]?.username != 'N/A') {
                                                dataArray.push({
                                                    id: users[i].id,
                                                    value: `${users[i].username}`,
                                                    table: "User",
                                                    state: nothingConfig.userState.id,
                                                    title: "GUARDIA"
                                                });
                                                if (weapons[i]?.id != nothingConfig.nothingWeapon.id || weapons[i]?.name != 'N/A') {
                                                    dataArray.push({
                                                        id: weapons[i].id,
                                                        value: `${weapons[i].name} [${weapons[i].licensePlate}]`,
                                                        table: "Weapon",
                                                        state: nothingConfig.weaponState.id,
                                                        title: "ARMA"
                                                    });
                                                }
                                            }
                                        }
                                        for (let i = 0; i < dataArray.length; i++) {
                                            getUpdateState(dataArray[i].state, dataArray[i].table, dataArray[i].id);
                                            eventLog('UPD', `${dataArray[i].title}`, `${dataArray[i].value} asignado`, '');
                                        }
                                        eventLog('DLT', 'SERVICIO-PATRULLA', `${patrol.crew.name}, en servicio: ${data.name}`, data, `${data.serviceState.name}`);
                                        deleteEntity('ServiceDetailV', patrol.id);
                                    });
                                }
                                //Contenedor
                                if (containers != undefined) {
                                    containers.forEach((container) => {
                                        let dataArray = [];
                                        if (container.companion?.id != nothingConfig.nothingUser.id || container.companion?.username != 'N/A') {
                                            dataArray.push({
                                                id: container.companion.id,
                                                value: `${container.companion.username}`,
                                                table: "User",
                                                state: nothingConfig.userContainer.id,
                                                title: "GUARDIA"
                                            });
                                            if (container.weapon?.id != nothingConfig.nothingWeapon.id || container.weapon?.name != 'N/A') {
                                                dataArray.push({
                                                    id: container.weapon.id,
                                                    value: `${container.weapon.name} [${container.weapon.licensePlate}]`,
                                                    table: "Weapon",
                                                    state: nothingConfig.weaponContainer.id,
                                                    title: "ARMA"
                                                });
                                            }
                                        }
                                        for (let i = 0; i < dataArray.length; i++) {
                                            getUpdateState(dataArray[i].state, dataArray[i].table, dataArray[i].id);
                                            eventLog('UPD', `${dataArray[i].title}`, `${dataArray[i].value} disponible`, '');
                                        }
                                        eventLog('DLT', 'SERVICIO-CONTENEDOR', `${container.name} [${container.licensePlate}], en servicio: ${data.name}`, data, `${data.serviceState.name}`);
                                        deleteEntity('Charge', container.id);
                                    });
                                }
                                new Services().render(infoPage.offset, infoPage.currentPage, infoPage.search);
                            }, 1000);
                        });
                    }
                    else {
                        alert("No se puede eliminar un servicio en proceso.");
                    }
                    new CloseDialog().x(dialogContent);
                };
                cancelButton.onclick = () => {
                    new CloseDialog().x(dialogContent);
                };
            });
        });
    }
    print() {
        const print = document.querySelectorAll('#print-entity');
        print.forEach((print) => {
            const entityId = print.dataset.entityid;
            const entityName = print.dataset.entityname;
            print.addEventListener('click', async () => {
                const data = await getEntityData('Service', entityId);
                exportServicePdf(data);
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
    selectClient() {
        const element = document.getElementById('entity-client');
        //let offset = 0
        element.addEventListener('click', async () => {
            modalTable(0, "");
        });
        async function modalTable(offset, search) {
            const dialogContainer = document.getElementById('app-dialogs');
            let raw = JSON.stringify({
                "filter": {
                    "conditions": [
                        {
                            "property": "business.id",
                            "operator": "=",
                            "value": `${businessId}`
                        },
                        {
                            "property": "state.name",
                            "operator": "=",
                            "value": `Enabled`
                        }
                    ],
                },
                sort: "-createdDate",
                limit: Config.modalRows,
                offset: offset,
                fetchPlan: 'full',
            });
            if (search != "") {
                raw = JSON.stringify({
                    "filter": {
                        "conditions": [
                            {
                                "group": "OR",
                                "conditions": [
                                    {
                                        "property": "name",
                                        "operator": "contains",
                                        "value": `${search.toLowerCase()}`
                                    },
                                    {
                                        "property": "ruc",
                                        "operator": "contains",
                                        "value": `${search.toLowerCase()}`
                                    }
                                ]
                            },
                            {
                                "property": "business.id",
                                "operator": "=",
                                "value": `${businessId}`
                            },
                            {
                                "property": "state.name",
                                "operator": "=",
                                "value": `Enabled`
                            }
                        ],
                    },
                    sort: "-createdDate",
                    limit: Config.modalRows,
                    offset: offset,
                    fetchPlan: 'full',
                });
            }
            let dataModal = await getFilterEntityData("Customer", raw);
            const FData = dataModal.filter((data) => data.id != element.dataset.optionid);
            dialogContainer.style.display = 'block';
            dialogContainer.innerHTML = `
                  <div class="dialog_content" id="dialog-content">
                      <div class="dialog">
                          <div class="dialog_container padding_8">
                              <div class="dialog_header">
                                  <h2>Clientes disponibles</h2>
                              </div>

                              <div class="dialog_message padding_8">
                                  <div class="datatable_tools">
                                      <input type="search"
                                      class="search_input"
                                      placeholder="Buscar"
                                      id="search-modal">
                                      <button
                                          class="datatable_button add_user"
                                          id="btnSearchModal">
                                          <i class="fa-solid fa-search"></i>
                                      </button>
                                  </div>
                                  <div class="dashboard_datatable">
                                      <table class="datatable_content margin_t_16">
                                      <thead>
                                          <tr>
                                          <th>Nombre</th>
                                          <th>RUC</th>
                                          <th></th>
                                          </tr>
                                      </thead>
                                      <tbody id="datatable-modal-body">
                                      </tbody>
                                      </table>
                                  </div>
                                  <br>
                              </div>

                              <div class="dialog_footer">
                                  <button class="btn btn_primary" id="prevModal"><i class="fa-solid fa-arrow-left"></i></button>
                                  <button class="btn btn_primary" id="nextModal"><i class="fa-solid fa-arrow-right"></i></button>
                                  <button class="btn btn_danger" id="cancel">Cancelar</button>
                              </div>
                          </div>
                      </div>
                  </div>
              `;
            inputObserver();
            const datetableBody = document.getElementById('datatable-modal-body');
            if (FData.length === 0) {
                let row = document.createElement('tr');
                row.innerHTML = `
                      <td>No hay datos</td>
                      <td></td>
                      <td></td>
                  `;
                datetableBody.appendChild(row);
            }
            else {
                for (let i = 0; i < FData.length; i++) {
                    let client = FData[i];
                    let row = document.createElement('tr');
                    row.innerHTML += `
                          <td>${client.name}</dt>
                          <td>${client?.ruc ?? ''}</dt>
                          <td class="entity_options">
                              <button class="button" id="edit-entity" data-entityId="${client.id}" data-entityName="${client.name}">
                                  <i class="fa-solid fa-arrow-up-right-from-square"></i>
                              </button>
                          </td>
                      `;
                    datetableBody.appendChild(row);
                }
            }
            const txtSearch = document.getElementById('search-modal');
            const btnSearchModal = document.getElementById('btnSearchModal');
            const _selectVehicle = document.querySelectorAll('#edit-entity');
            const _closeButton = document.getElementById('cancel');
            const _dialog = document.getElementById('dialog-content');
            const prevModalButton = document.getElementById('prevModal');
            const nextModalButton = document.getElementById('nextModal');
            txtSearch.value = search ?? '';
            _selectVehicle.forEach((edit) => {
                const entityId = edit.dataset.entityid;
                const entityName = edit.dataset.entityname;
                edit.addEventListener('click', () => {
                    element.setAttribute('data-optionid', entityId);
                    element.setAttribute('value', `${entityName}`);
                    element.classList.add('input_filled');
                    new CloseDialog().x(_dialog);
                });
            });
            btnSearchModal.onclick = () => {
                modalTable(0, txtSearch.value);
            };
            _closeButton.onclick = () => {
                new CloseDialog().x(_dialog);
            };
            nextModalButton.onclick = () => {
                offset = Config.modalRows + (offset);
                modalTable(offset, search);
            };
            prevModalButton.onclick = () => {
                offset = Config.modalRows - (offset);
                modalTable(offset, search);
            };
        }
    }
    selectCity() {
        const origin = document.getElementById('entity-city-origin');
        const destiny = document.getElementById('entity-city-destiny');
        //let offset = 0
        origin.addEventListener('click', async () => {
            modalTable(0, "", origin);
        });
        destiny.addEventListener('click', async () => {
            modalTable(0, "", destiny);
        });
        async function modalTable(offset, search, element) {
            const dialogContainer = document.getElementById('app-dialogs');
            let raw = JSON.stringify({
                "filter": {
                    "conditions": [
                        {
                            "property": "name",
                            "operator": "<>",
                            "value": ``
                        }
                    ],
                },
                sort: "+name",
                limit: Config.modalRows,
                offset: offset,
                fetchPlan: 'full',
            });
            if (search != "") {
                raw = JSON.stringify({
                    "filter": {
                        "conditions": [
                            {
                                "group": "OR",
                                "conditions": [
                                    {
                                        "property": "name",
                                        "operator": "contains",
                                        "value": `${search.toLowerCase()}`
                                    }
                                ]
                            }
                        ],
                    },
                    sort: "-createdDate",
                    limit: Config.modalRows,
                    offset: offset,
                    fetchPlan: 'full',
                });
            }
            let dataModal = await getFilterEntityData("City", raw);
            dialogContainer.style.display = 'block';
            dialogContainer.innerHTML = `
                <div class="dialog_content" id="dialog-content">
                    <div class="dialog">
                        <div class="dialog_container padding_8">
                            <div class="dialog_header">
                                <h2>Ciudades disponibles</h2>
                            </div>

                            <div class="dialog_message padding_8">
                                <div class="datatable_tools">
                                    <input type="search"
                                    class="search_input"
                                    placeholder="Buscar"
                                    id="search-modal">
                                    <button
                                        class="datatable_button add_user"
                                        id="btnSearchModal">
                                        <i class="fa-solid fa-search"></i>
                                    </button>
                                </div>
                                <div class="dashboard_datatable">
                                    <table class="datatable_content margin_t_16">
                                    <thead>
                                        <tr>
                                        <th>Nombre</th>
                                        <th></th>
                                        </tr>
                                    </thead>
                                    <tbody id="datatable-modal-body">
                                    </tbody>
                                    </table>
                                </div>
                                <br>
                            </div>

                            <div class="dialog_footer">
                                <button class="btn btn_primary" id="prevModal"><i class="fa-solid fa-arrow-left"></i></button>
                                <button class="btn btn_primary" id="nextModal"><i class="fa-solid fa-arrow-right"></i></button>
                                <button class="btn btn_danger" id="cancel">Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            inputObserver();
            const datetableBody = document.getElementById('datatable-modal-body');
            if (dataModal.length === 0) {
                let row = document.createElement('tr');
                row.innerHTML = `
                    <td>No hay datos</td>
                    <td></td>
                    <td></td>
                `;
                datetableBody.appendChild(row);
            }
            else {
                for (let i = 0; i < dataModal.length; i++) {
                    let client = dataModal[i];
                    let row = document.createElement('tr');
                    row.innerHTML += `
                        <td>${client.name}</dt>
                        <td class="entity_options">
                            <button class="button" id="edit-entity" data-entityId="${client.id}" data-entityName="${client.name}">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                            </button>
                        </td>
                    `;
                    datetableBody.appendChild(row);
                }
            }
            const txtSearch = document.getElementById('search-modal');
            const btnSearchModal = document.getElementById('btnSearchModal');
            const _selectVehicle = document.querySelectorAll('#edit-entity');
            const _closeButton = document.getElementById('cancel');
            const _dialog = document.getElementById('dialog-content');
            const prevModalButton = document.getElementById('prevModal');
            const nextModalButton = document.getElementById('nextModal');
            txtSearch.value = search ?? '';
            _selectVehicle.forEach((edit) => {
                const entityId = edit.dataset.entityid;
                const entityName = edit.dataset.entityname;
                edit.addEventListener('click', () => {
                    element.setAttribute('data-optionid', entityId);
                    element.setAttribute('value', `${entityName}`);
                    element.classList.add('input_filled');
                    new CloseDialog().x(_dialog);
                });
            });
            btnSearchModal.onclick = () => {
                modalTable(0, txtSearch.value, element);
            };
            _closeButton.onclick = () => {
                new CloseDialog().x(_dialog);
            };
            nextModalButton.onclick = () => {
                offset = Config.modalRows + (offset);
                modalTable(offset, search, element);
            };
            prevModalButton.onclick = () => {
                offset = Config.modalRows - (offset);
                modalTable(offset, search, element);
            };
        }
    }
    sendEmail(entityDialogContainer) {
        const check = document.querySelectorAll('#get-check');
        check.forEach((send) => {
            const entityId = send.dataset.entityid;
            send.addEventListener('click', () => {
                modalMail('Service', entityId);
            });
        });
        async function modalMail(entity, entityID) {
            let data = await getEntityData(entity, entityID);
            if (data.serviceState.name == "Asignada") {
                const dialogContainer = document.getElementById('app-dialogs');
                const patrols = await getDetails("service.id", entityID, "ServiceDetailV");
                const serviceState = await getNothing("name", "Confirmado", "ServiceState");
                dialogContainer.style.display = 'block';
                dialogContainer.innerHTML = `
                    <div class="dialog_content" id="dialog-content">
                        <div class="dialog">
                            <div class="dialog_container padding_8">
                                <div class="dialog_header">
                                    <h2>Confirmación</h2>
                                </div>

                                <div class="dialog_message padding_8">
                                    <div class="input_detail">
                                        <label><i class="fa-solid fa-desktop"></i> Código de servicio: ${data.id}</label> 
                                    </div>
                                    <br>
                                    <div class="input_detail">
                                        <label><i class="fa-solid fa-desktop"></i> Solicitante: ${data?.name ?? ''}</label>
                                    </div>
                                    <div class="input_detail">
                                        <label><i class="fa-solid fa-buildings"></i> Cliente: ${data.customer?.name ?? ''}</label>
                                    </div>
                                    <div class="input_detail">
                                        <label><i class="fa-solid fa-envelope"></i> Email: ${data?.email ?? ''}</label>
                                    </div>
                                    <div class="input_detail">
                                        <label><i class="fa-solid fa-earth-americas"></i> Ciudad Origen: ${data.cityOrigin.name}</label>
                                    </div>
                                    <div class="input_detail">
                                        <label><i class="fa-solid fa-earth-americas"></i> Ciudad Destino: ${data.cityDestination.name}</label>
                                    </div>
                                    <div class="input_detail">
                                        <label><i class="fa-solid fa-location-arrow"></i> Lugar Origen: ${data.placeOrigin}</label>
                                    </div>
                                    <div class="input_detail">
                                        <label><i class="fa-solid fa-location-arrow"></i> Lugar Destino: ${data.placeDestination}</label>
                                    </div>
                                    <div class="input_detail">
                                        <label><i class="fa-solid fa-calendar"></i> FH_Servicio: ${data?.outputDate ?? ''} ${data?.outputTime ?? ''}</label>
                                    </div>
                                    <div class="input_detail">
                                        <label><i class="fa-solid fa-info"></i> Referencia Cliente: ${data?.reference ?? ''}</label>
                                    </div>
                                    <div class="input_detail">
                                        <label><i class="fa-solid fa-shield"></i> Tipo de Custodia: ${data?.custodyType ?? ''}</label>
                                    </div>
                                    <div class="input_detail">
                                        <label><i class="fa-solid fa-truck-container"></i> # Contenedores: ${data?.quantyContainers ?? '0'}</label>
                                    </div>
                                    <div class="input_detail">
                                        <label><i class="fa-solid fa-car"></i> # Vehículos: ${data?.quantyVehiculars ?? '0'}</label>
                                    </div>
                                    <div id="listPatrol"></div>
                                </div>

                                <div class="dialog_footer">
                                    <button class="btn btn_danger" id="cancel">Cancelar</button>
                                    <button class="btn btn_primary" id="email">Enviar Correo</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                inputObserver();
                const _closeButton = document.getElementById('cancel');
                const _emailButton = document.getElementById('email');
                const _dialog = document.getElementById('dialog-content');
                if (patrols != undefined) {
                    const _listPatrol = document.getElementById('listPatrol');
                    _listPatrol.innerHTML = `<ul>`;
                    patrols.forEach(async (patrol) => {
                        _listPatrol.innerHTML += `<li>${patrol.crew.name}</li>`;
                    });
                    _listPatrol.innerHTML += `</ul>`;
                }
                _closeButton.onclick = () => {
                    new CloseDialog().x(_dialog);
                };
                _emailButton.onclick = async () => {
                    let mailRaw = JSON.stringify({
                        "address": data?.email,
                        "subject": "Netliinks - Confirmación de Servicio.",
                        "body": `Buen día, se ha confirmado el servicio con los siguientes datos:\n\n
                                Solicitante: ${data?.name ?? ''}\n
                                Cliente: ${data?.customer?.name ?? ''}\n
                                Email: ${data?.email ?? ''}\n
                                Ciudad Origen: ${data.cityOrigin.name}\n
                                Ciudad Destino: ${data.cityDestination.name}\n
                                Lugar Origen: ${data.placeOrigin}\n
                                Lugar Destino: ${data.placeDestination}\n
                                FH_Servicio: ${data?.outputDate ?? ''} ${data?.outputTime ?? ''}\n
                                Referencia Cliente: ${data?.reference ?? ''}\n
                                Tipo de Custodia: ${data?.custodyType ?? ''}\n
                                # Contenedores: ${data?.quantyContainers ?? '0'}\n
                                # Vehículos: ${data?.quantyVehiculars ?? '0'}\n
                                \nNo responder a este correo.\nSaludos.\n\n\nNetliinks S.A.`
                    });
                    getUpdateState(`${serviceState.id}`, "Service", data.id).then((res) => {
                        setTimeout(() => {
                            sendMail(mailRaw);
                            if (patrols != undefined) {
                                patrols.forEach(async (patrol) => {
                                    //console.log(patrol)
                                    const crew = await getEntityData("Crew", patrol.crew.id);
                                    const dataPush = { "token": `${crew.crewOne.token}`, "title": `Inicio de Servicio: ${data?.name ?? ''}`, "body": `Servicio ${data?.name ?? ''} ha sido confirmado.` };
                                    //console.log(dataPush)
                                    await postNotificationPush(dataPush);
                                });
                            }
                            eventLog('UPD', 'SERVICIO', `${data.name} confirmado`, data, `${serviceState.name}`);
                            const raw = JSON.stringify({
                                "service": {
                                    "id": `${entityID}`
                                },
                                "business": {
                                    "id": `${businessId}`
                                },
                                "customer": {
                                    "id": `${data.customer.id}`
                                },
                                'creationDate': `${currentDateTime().date}`,
                                'creationTime': `${currentDateTime().time}`,
                            });
                            registerEntity(raw, 'Control');
                            //eventLog('INS', 'CONTROL-CONFIRMACIÓN', `${data.name}`, data)
                            new CloseDialog().x(_dialog);
                            new Services().render(infoPage.offset, infoPage.currentPage, infoPage.search);
                        }, 1000);
                    });
                };
            }
            else if (data.serviceState.name != "Pendiente") {
                let control = await getSearch("service.id", entityID, "Control");
                let details = await getDetails("service.id", entityID, "DetailsObs");
                let status = {
                    recepcion: await getNothing("name", "Recepción", "ServiceState"),
                    ruta: await getNothing("name", "En ruta", "ServiceState"),
                    entregado: await getNothing("name", "Entregado", "ServiceState"),
                    terminado: await getNothing("name", "Terminado", "ServiceState"),
                    vehicularState: await getNothing("name", "Asignado", "VehicularState"),
                    userState: await getNothing("name", "Asignado", "UserState"),
                    weaponState: await getNothing("name", "Asignado", "WeaponState"),
                    nothingWeapon: await getNothing("name", "N/A", "Weapon"),
                    nothingUser: await getNothing("username", "N/A", "User"),
                    crewState: await getNothing("name", "Disponible", "CrewState"),
                    userContainer: await getNothing("name", "Disponible", "UserState"),
                    weaponContainer: await getNothing("name", "Disponible", "WeaponState"),
                };
                if (control != undefined) {
                    let fecha = new Date(); //Fecha actual
                    let mes = fecha.getMonth() + 1; //obteniendo mes
                    let dia = fecha.getDate(); //obteniendo dia
                    let anio = fecha.getFullYear(); //obteniendo año
                    let _hours = fecha.getHours();
                    let _minutes = fecha.getMinutes();
                    let _fixedHours = ('0' + _hours).slice(-2);
                    let _fixedMinutes = ('0' + _minutes).slice(-2);
                    if (dia < 10)
                        dia = '0' + dia; //agrega cero si el menor de 10
                    if (mes < 10)
                        mes = '0' + mes; //agrega cero si el menor de 10
                    entityDialogContainer.innerHTML = '';
                    entityDialogContainer.style.display = 'flex';
                    entityDialogContainer.innerHTML = `
                        <div class="entity_editor" id="entity-editor">
                        <div class="entity_editor_header">
                            <div class="user_info">
                            <div class="avatar"><i class="fa-regular fa-clock"></i></div>
                            <h1 class="entity_editor_title">Control <br><small>${data.name}</small></h1>
                            </div>

                            <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
                        </div>

                        <!-- EDITOR BODY -->
                        <div class="entity_editor_body">

                            <h3>Arribo Origen</h3>
                            <br>

                            <div class="form_group">
                                <div class="form_input">
                                    <label class="form_label" for="origen-date">Fecha:</label>
                                    <input type="date" class="input_time input_time-start" id="origen-date" name="origen-date" value="${control?.arrivalOriginDate ?? anio + "-" + mes + "-" + dia}">
                                </div>

                                <div class="form_input">
                                    <label class="form_label" for="origen-time">Hora:</label>
                                    <input type="time" class="input_time input_time-end" id="origen-time" name="origen-time" value="${control?.arrivalOriginTime ?? `${_fixedHours}:${_fixedMinutes}`}">
                                </div>
                            </div>
                            <div class="input_detail">
                                <label><i class="fa-solid fa-user"></i></label>
                                <input type="text" class="input_filled" value="${control?.originUser?.username ?? ''}" readonly>
                            </div>
                            <br>

                            <h3>Partida Inicio</h3>
                            <br>

                            <div class="form_group">
                                <div class="form_input">
                                    <label class="form_label" for="start-date">Fecha:</label>
                                    <input type="date" class="input_time input_time-start" id="start-date" name="start-date" value="${control?.startingPointDate ?? ''}">
                                </div>

                                <div class="form_input">
                                    <label class="form_label" for="start-time">Hora:</label>
                                    <input type="time" class="input_time input_time-end" id="start-time" name="start-time" value="${control?.startingPointTime ?? ''}">
                                </div>
                            </div>
                            <div class="input_detail">
                                <label><i class="fa-solid fa-user"></i></label>
                                <input type="text" class="input_filled" value="${control?.startUser?.username ?? ''}" readonly>
                            </div>
                            <br>

                            <h3>Arribo Destino</h3>
                            <br>

                            <div class="form_group">
                                <div class="form_input">
                                    <label class="form_label" for="destination-date">Fecha:</label>
                                    <input type="date" class="input_time input_time-start" id="destination-date" name="destination-date" value="${control?.arrivalDestinationDate ?? ''}">
                                </div>

                                <div class="form_input">
                                    <label class="form_label" for="destination-time">Hora:</label>
                                    <input type="time" class="input_time input_time-end" id="destination-time" name="destination-time" value="${control?.arrivalDestinationTime ?? ''}">
                                </div>
                            </div>
                            <div class="input_detail">
                                <label><i class="fa-solid fa-user"></i></label>
                                <input type="text" class="input_filled" value="${control?.destinationUser?.username ?? ''}" readonly>
                            </div>
                            <br>

                            <h3>Finalización</h3>
                            <br>

                            <div class="form_group">
                                <div class="form_input">
                                    <label class="form_label" for="finish-date">Fecha:</label>
                                    <input type="date" class="input_time input_time-start" id="finish-date" name="finish-date" value="${control?.endServiceDate ?? ''}">
                                </div>

                                <div class="form_input">
                                    <label class="form_label" for="finish-time">Hora:</label>
                                    <input type="time" class="input_time input_time-end" id="finish-time" name="finish-time" value="${control?.endServiceTime ?? ''}">
                                </div>
                            </div>
                            <div class="input_detail">
                                <label><i class="fa-solid fa-user"></i></label>
                                <input type="text" class="input_filled" value="${control?.endUser?.username ?? ''}" readonly>
                            </div>
                            <br>
                            <br>

                            <h3>Observaciones</h3>
                            <br>
                            <div id="containerObservation"></div>
                            <button class="btn btn_primary" id="add-text" style="font-weight:bold; font-size:25px;"> + </button>
                        </div>
                        <!-- END EDITOR BODY -->

                        <div class="entity_editor_footer">
                            <button class="btn btn_primary btn_widder" id="update-changes" style="display:${userPermissions().style};">Guardar</button>
                        </div>
                        </div>
                    `;
                    inputObserver();
                    const inputsCollection = {
                        origenDate: document.getElementById("origen-date"),
                        origenTime: document.getElementById("origen-time"),
                        startDate: document.getElementById("start-date"),
                        startTime: document.getElementById("start-time"),
                        destDate: document.getElementById("destination-date"),
                        destTime: document.getElementById("destination-time"),
                        endDate: document.getElementById("finish-date"),
                        endTime: document.getElementById("finish-time"),
                        containerObservation: document.getElementById("containerObservation"),
                        buttonAdd: document.getElementById("add-text"),
                    };
                    const currentUser = await getUserInfo();
                    if (control?.arrivalOriginTime == undefined) {
                        inputsCollection.startDate.disabled = true;
                        inputsCollection.startTime.disabled = true;
                        inputsCollection.destDate.disabled = true;
                        inputsCollection.destTime.disabled = true;
                        inputsCollection.endDate.disabled = true;
                        inputsCollection.endTime.disabled = true;
                        //inputsCollection.origenDate.focus()
                    }
                    else if (control?.startingPointTime == undefined) {
                        inputsCollection.origenDate.disabled = true;
                        inputsCollection.origenTime.disabled = true;
                        inputsCollection.startDate.value = anio + "-" + mes + "-" + dia;
                        inputsCollection.startTime.value = `${_fixedHours}:${_fixedMinutes}`;
                        inputsCollection.destDate.disabled = true;
                        inputsCollection.destTime.disabled = true;
                        inputsCollection.endDate.disabled = true;
                        inputsCollection.endTime.disabled = true;
                        //inputsCollection.startDate.focus()
                    }
                    else if (control?.arrivalDestinationTime == undefined) {
                        inputsCollection.origenDate.disabled = true;
                        inputsCollection.origenTime.disabled = true;
                        inputsCollection.startDate.disabled = true;
                        inputsCollection.startTime.disabled = true;
                        inputsCollection.destDate.value = anio + "-" + mes + "-" + dia;
                        inputsCollection.destTime.value = `${_fixedHours}:${_fixedMinutes}`;
                        inputsCollection.endDate.disabled = true;
                        inputsCollection.endTime.disabled = true;
                        //inputsCollection.destDate.focus()
                    }
                    else if (control?.endServiceTime == undefined) {
                        inputsCollection.origenDate.disabled = true;
                        inputsCollection.origenTime.disabled = true;
                        inputsCollection.startDate.disabled = true;
                        inputsCollection.startTime.disabled = true;
                        inputsCollection.destDate.disabled = true;
                        inputsCollection.destTime.disabled = true;
                        inputsCollection.endDate.value = anio + "-" + mes + "-" + dia;
                        inputsCollection.endTime.value = `${_fixedHours}:${_fixedMinutes}`;
                        //inputsCollection.endDate.focus()
                    }
                    const closeButton = document.getElementById('close');
                    const saveButton = document.getElementById('update-changes');
                    const editor = document.getElementById('entity-editor-container');
                    let node = 5;
                    if (details != undefined) {
                        node = details.length;
                        for (let i = 0; i < node; i++) {
                            if (details[i]?.image !== undefined) {
                                inputsCollection.containerObservation.innerHTML += `
                                <div class="material_input">
                                    <input type="search" class="input_filled" id="obs${i}" name="${details[i]?.id ?? ''}" value="${details[i]?.content ?? ''}">
                                    <label for="obs${i}"><i class="fa-solid fa-memo-circle-info"></i> Observación ${i + 1}</label>
                                </div>
                                <div class="input_detail">
                                    <label for="date"><i class="fa-solid fa-calendar"></i></label>
                                    <input type="text" id="date" class="input_filled" value="${details[i]?.creationDate} || ${details[i]?.creationTime}" readonly>
                                </div>
                                <div class="input_detail">
                                    <label for="user"><i class="fa-solid fa-user"></i></label>
                                    <input type="text" id="user" class="input_filled" value="${details[i]?.user.username ?? ''}" readonly>
                                </div>
                                <div class="input_detail">
                                    <label for="viewImage"><i class="fa-solid fa-image"></i></label>
                                    <input type="text" id="viewImage" data-entityId="${details[i]?.image ?? ''}" class="input_filled" value="Ver Imagen" readonly>
                                </div>
                                <div style="text-align: right;">
                                    <button id="saveDetail" name="saveDetail${i}" data-index="${i}" style="font-weight:bold; font-size:12px; color: white; background-color: #008CBA;; border: 2px solid #000000; border-radius: 8px; padding: 5px 24px;"><i class="fa-solid fa-floppy-disk" style="color:white; font-size:12px;"></i>. Guardar</button>
                                </div>
                                <!-- <div class="input_detail">
                                    <label for="saveDetail"><i class="fa-solid fa-floppy-disk"></i></label>
                                    <input type="text" id="saveDetail" name="saveDetail${i}" data-index="${i}" class="input_filled" value="Guardar" readonly>
                                </div> -->
                                <br>
                                <br>
                                `;
                            }
                            else {
                                inputsCollection.containerObservation.innerHTML += `
                                <div class="material_input">
                                    <input type="search" class="input_filled" id="obs${i}" name="${details[i]?.id ?? ''}" value="${details[i]?.content ?? ''}">
                                    <label for="obs${i}"><i class="fa-solid fa-memo-circle-info"></i> Observación ${i + 1}</label>
                                </div>
                                <div class="input_detail">
                                    <label for="date"><i class="fa-solid fa-calendar"></i></label>
                                    <input type="text" id="date" class="input_filled" value="${details[i]?.creationDate} || ${details[i]?.creationTime}" readonly>
                                </div>
                                <div class="input_detail">
                                    <label for="user"><i class="fa-solid fa-user"></i></label>
                                    <input type="text" id="user" class="input_filled" value="${details[i]?.user.username ?? ''}" readonly>
                                </div>
                                <div style="text-align: right;">
                                    <button id="saveDetail" name="saveDetail${i}" data-index="${i}" style="font-weight:bold; font-size:12px; color: white; background-color: #008CBA;; border: 2px solid #000000; border-radius: 8px; padding: 5px 24px;"><i class="fa-solid fa-floppy-disk" style="color:white; font-size:12px;"></i>. Guardar</button>
                                </div>
                                <!-- <div class="input_detail">
                                    <label for="saveDetail"><i class="fa-solid fa-floppy-disk"></i></label>
                                    <input type="text" id="saveDetail" name="saveDetail${i}" data-index="${i}" class="input_filled" value="Guardar" readonly>
                                </div> -->
                                <br>
                                <br>
                                `;
                            }
                        }
                    }
                    else {
                        for (let i = 0; i < node; i++) {
                            inputsCollection.containerObservation.innerHTML += `
                            <div class="material_input">
                                <input type="search" class="input_filled" id="obs${i}" name="obs${i}">
                                <label for="obs${i}"><i class="fa-solid fa-memo-circle-info"></i> Observación ${i + 1}</label>
                            </div>
                            <div class="input_detail">
                                <label for="date${i}"><i class="fa-solid fa-calendar" name="date${i}"></i></label>
                                <input type="text" id="date${i}" class="input_filled" readonly>
                            </div>
                            <div style="text-align: right;">
                                <button id="saveDetail" name="saveDetail${i}" data-index="${i}" style="font-weight:bold; font-size:12px; color: white; background-color: #008CBA;; border: 2px solid #000000; border-radius: 8px; padding: 5px 24px;"><i class="fa-solid fa-floppy-disk" style="color:white; font-size:12px;"></i>. Guardar</button>
                            </div>    
                            <!-- <div class="input_detail">
                                <label for="saveDetail"><i class="fa-solid fa-floppy-disk"></i></label>
                                <input type="text" id="saveDetail" name="saveDetail${i}" data-index="${i}" class="input_filled" value="Guardar" readonly>
                            </div> -->
                            <br>
                            <br>
                            `;
                        }
                    }
                    const detailEvent = () => {
                        let saveDetail = document.querySelectorAll('#saveDetail');
                        saveDetail.forEach((obj) => {
                            const index = obj.dataset.index;
                            obj.addEventListener('click', () => {
                                let obs = document.getElementById(`obs${index}`);
                                let date = document.getElementById(`date${index}`);
                                let span = document.getElementsByName(`saveDetail${index}`)[0];
                                if (details != undefined && details[index]?.id == obs.name) {
                                    if (obs.value == "") {
                                        deleteEntity('DetailsObs', details[index].id);
                                        eventLog('DLT', 'SERVICIO-DETALLE', `${obs.value}, en servicio: ${data.name}`, data, `${data.serviceState.name}`);
                                        obs.placeholder = "(Eliminado)";
                                        obs.disabled = true;
                                        span.innerText = "Detalle eliminado";
                                        span.disabled = true;
                                    }
                                    else if (obs.value != details[index].content) {
                                        let raw = JSON.stringify({
                                            "content": `${obs.value.trim()}`,
                                            "user": {
                                                "id": `${currentUser.attributes.id}`
                                            }
                                        });
                                        updateEntity('DetailsObs', details[index].id, raw);
                                        eventLog('UPD', 'SERVICIO-DETALLE', `${obs.value}, en servicio: ${data.name}`, data, `${data.serviceState.name}`);
                                        obs.disabled = true;
                                        span.innerText = "Detalle actualizado";
                                        span.disabled = true;
                                    }
                                }
                                else {
                                    let fecha = currentDateTime().date;
                                    let hora = currentDateTime().time;
                                    if (obs.value != "") {
                                        let raw = JSON.stringify({
                                            "content": `${obs.value.trim()}`,
                                            "business": {
                                                "id": `${businessId}`
                                            },
                                            "customer": {
                                                "id": `${data?.customer?.id}`
                                            },
                                            "service": {
                                                "id": `${entityID}`
                                            },
                                            "user": {
                                                "id": `${currentUser.attributes.id}`
                                            },
                                            'creationDate': `${fecha}`,
                                            'creationTime': `${hora}`,
                                        });
                                        registerEntity(raw, 'DetailsObs');
                                        eventLog('INS', 'SERVICIO-DETALLE', `${obs.value}, en servicio: ${data.name}`, data, `${data.serviceState.name}`);
                                        obs.disabled = true;
                                        date.value = `${fecha} || ${hora}`;
                                        span.innerText = "Detalle guardado";
                                        span.disabled = true;
                                    }
                                }
                            });
                        });
                        const viewZoom = document.querySelectorAll('#viewImage');
                        viewZoom.forEach((image) => {
                            const entityId = image.dataset.entityid;
                            image.addEventListener('click', async () => {
                                const close = document.getElementById("close-modalZoom");
                                const modalZoom = document.getElementById('modalZoom');
                                //this.dialogContainer.style.display = 'block'
                                //this.dialogContainer.innerHTML = modalZoomImage
                                const editor = document.getElementById('entity-editor-container');
                                editor.style.display = 'none';
                                const img01 = document.getElementById('img01');
                                const caption = document.getElementById('caption');
                                modalZoom.style.display = 'block';
                                img01.src = await getFile(entityId);
                                caption.innerHTML = `Imagen`;
                                close.addEventListener('click', () => {
                                    modalZoom.style.display = 'none';
                                    const editor = document.getElementById('entity-editor-container');
                                    editor.style.display = 'flex';
                                });
                            });
                        });
                    };
                    detailEvent();
                    inputsCollection.buttonAdd.addEventListener('click', () => {
                        const br = document.createElement('br');
                        const br1 = document.createElement('br');
                        /*const div2: InterfaceElement = document.createElement('div')
                        div2.classList.add('input_detail')
                        div2.innerHTML = `
                            <label for="saveDetail"><i class="fa-solid fa-floppy-disk"></i></label>
                            <input type="text" id="saveDetail" name="saveDetail${node}" data-index="${node}" class="input_filled" value="Guardar" readonly>
                        `*/
                        const div2 = document.createElement('div');
                        div2.style.textAlign = "right";
                        div2.innerHTML = `
                            <button id="saveDetail" name="saveDetail${node}" data-index="${node}" style="font-weight:bold; font-size:12px; color: white; background-color: #008CBA;; border: 2px solid #000000; border-radius: 8px; padding: 5px 24px;"><i class="fa-solid fa-floppy-disk" style="color:white; font-size:12px;"></i>. Guardar</button>
                        `;
                        const div3 = document.createElement('div');
                        div3.classList.add('input_detail');
                        div3.innerHTML = `
                            <label for="date${node}"><i class="fa-solid fa-calendar"></i></label>
                            <input type="text" id="date${node}" class="input_filled" name="date${node}" readonly>  
                        `;
                        const div = document.createElement('div');
                        div.classList.add('material_input');
                        div.innerHTML = `
                            <input type="search" class="input_filled" id="obs${node}" name="obs${node}">
                            <label for="obs${node}"><i class="fa-solid fa-memo-circle-info"></i> Observación ${node += 1}</label>
                        `;
                        inputsCollection.containerObservation.appendChild(div);
                        inputsCollection.containerObservation.appendChild(div3);
                        inputsCollection.containerObservation.appendChild(div2);
                        inputsCollection.containerObservation.appendChild(br);
                        inputsCollection.containerObservation.appendChild(br1);
                        detailEvent();
                    });
                    closeButton.addEventListener('click', () => {
                        //console.log('close')
                        new CloseDialog().x(editor);
                    });
                    saveButton.addEventListener('click', async () => {
                        if ((Date.parse(`${inputsCollection.origenDate.value} ${inputsCollection.origenTime.value}`) > Date.parse(`${inputsCollection.startDate.value} ${inputsCollection.startTime.value}`)) && (control?.startingPointTime != undefined || inputsCollection.startTime.value != '')) {
                            alert("Fecha origen mayor a la de inicio");
                        }
                        else if ((Date.parse(`${inputsCollection.startDate.value} ${inputsCollection.startTime.value}`) > Date.parse(`${inputsCollection.destDate.value} ${inputsCollection.destTime.value}`)) && (control?.arrivalDestinationTime != undefined || inputsCollection.destTime.value != '')) {
                            alert("Fecha inicio mayor a la de destino");
                        }
                        else if ((Date.parse(`${inputsCollection.destDate.value} ${inputsCollection.destTime.value}`) > Date.parse(`${inputsCollection.endDate.value} ${inputsCollection.endTime.value}`)) && (control?.endServiceTime != undefined || inputsCollection.endTime.value != '')) {
                            alert("Fecha destino mayor a la de finalización");
                        }
                        else {
                            setTimeout(async () => {
                                let raws = [];
                                let rawStatus = '';
                                let events = [];
                                if (inputsCollection.origenTime.value != control?.arrivalOriginTime && inputsCollection.origenTime.value != '') {
                                    raws.push(JSON.stringify({
                                        "arrivalOriginDate": `${inputsCollection.origenDate.value}`,
                                        "arrivalOriginTime": `${inputsCollection.origenTime.value}`,
                                        "originUser": {
                                            "id": `${currentUser.attributes.id}`
                                        },
                                    }));
                                    if (data.serviceState.name == 'Confirmado') {
                                        rawStatus = JSON.stringify({
                                            "serviceState": {
                                                "id": `${status.recepcion.id}`
                                            },
                                        });
                                        events.push({
                                            value: `${data.name} recepción: ${inputsCollection.origenDate.value} ${inputsCollection.origenTime.value}`,
                                            title: `SERVICIO`,
                                            service: data,
                                            aditionalData: {
                                                status: `${status.recepcion.name}`,
                                                statusDate: `${inputsCollection.origenDate.value}`,
                                                statusTime: `${inputsCollection.origenTime.value}`
                                            }
                                        });
                                    }
                                    else {
                                        events.push({
                                            value: `${data.name} recepción actualizado: ${inputsCollection.origenDate.value} ${inputsCollection.origenTime.value}`,
                                            title: `SERVICIO`,
                                            service: data,
                                            aditionalData: {
                                                status: `${status.recepcion.name}`,
                                                statusDate: `${inputsCollection.origenDate.value}`,
                                                statusTime: `${inputsCollection.origenTime.value}`
                                            }
                                        });
                                    }
                                }
                                if (inputsCollection.startTime.value != control?.startingPointTime && inputsCollection.startTime.value != '') {
                                    raws.push(JSON.stringify({
                                        "startingPointDate": `${inputsCollection.startDate.value}`,
                                        "startingPointTime": `${inputsCollection.startTime.value}`,
                                        "startUser": {
                                            "id": `${currentUser.attributes.id}`
                                        },
                                    }));
                                    if (data.serviceState.name == 'Recepción') {
                                        rawStatus = JSON.stringify({
                                            "serviceState": {
                                                "id": `${status.ruta.id}`
                                            },
                                        });
                                        events.push({
                                            value: `${data.name} en ruta: ${inputsCollection.startDate.value} ${inputsCollection.startTime.value}`,
                                            title: `SERVICIO`,
                                            service: data,
                                            aditionalData: {
                                                status: `${status.ruta.name}`,
                                                statusDate: `${inputsCollection.startDate.value}`,
                                                statusTime: `${inputsCollection.startTime.value}`
                                            }
                                        });
                                    }
                                    else {
                                        events.push({
                                            value: `${data.name} en ruta actualizado: ${inputsCollection.startDate.value} ${inputsCollection.startTime.value}`,
                                            title: `SERVICIO`,
                                            service: data,
                                            aditionalData: {
                                                status: `${status.ruta.name}`,
                                                statusDate: `${inputsCollection.startDate.value}`,
                                                statusTime: `${inputsCollection.startTime.value}`
                                            }
                                        });
                                    }
                                }
                                if (inputsCollection.destTime.value != control?.arrivalDestinationTime && inputsCollection.destTime.value != '') {
                                    raws.push(JSON.stringify({
                                        "arrivalDestinationDate": `${inputsCollection.destDate.value}`,
                                        "arrivalDestinationTime": `${inputsCollection.destTime.value}`,
                                        "destinationUser": {
                                            "id": `${currentUser.attributes.id}`
                                        },
                                    }));
                                    if (data.serviceState.name == 'En ruta') {
                                        rawStatus = JSON.stringify({
                                            "serviceState": {
                                                "id": `${status.entregado.id}`
                                            },
                                        });
                                        events.push({
                                            value: `${data.name} entregado: ${inputsCollection.destDate.value} ${inputsCollection.destTime.value}`,
                                            title: `SERVICIO`,
                                            service: data,
                                            aditionalData: {
                                                status: `${status.entregado.name}`,
                                                statusDate: `${inputsCollection.destDate.value}`,
                                                statusTime: `${inputsCollection.destTime.value}`
                                            }
                                        });
                                    }
                                    else {
                                        events.push({
                                            value: `${data.name} entregado actualizado: ${inputsCollection.destDate.value} ${inputsCollection.destTime.value}`,
                                            title: `SERVICIO`,
                                            service: data,
                                            aditionalData: {
                                                status: `${status.entregado.name}`,
                                                statusDate: `${inputsCollection.destDate.value}`,
                                                statusTime: `${inputsCollection.destTime.value}`
                                            }
                                        });
                                    }
                                }
                                if (inputsCollection.endTime.value != control?.endServiceTime && inputsCollection.endTime.value != '') {
                                    raws.push(JSON.stringify({
                                        "endServiceDate": `${inputsCollection.endDate.value}`,
                                        "endServiceTime": `${inputsCollection.endTime.value}`,
                                        "endUser": {
                                            "id": `${currentUser.attributes.id}`
                                        },
                                    }));
                                    if (data.serviceState.name == 'Entregado') {
                                        rawStatus = JSON.stringify({
                                            "serviceState": {
                                                "id": `${status.terminado.id}`
                                            },
                                        });
                                        events.push({
                                            value: `${data.name} terminado: ${inputsCollection.endDate.value} ${inputsCollection.endTime.value}`,
                                            title: `SERVICIO`,
                                            service: data,
                                            aditionalData: {
                                                status: `${status.terminado.name}`,
                                                statusDate: `${inputsCollection.endDate.value}`,
                                                statusTime: `${inputsCollection.endTime.value}`
                                            }
                                        });
                                        const aditionalData = {
                                            status: `${status.terminado.name}`,
                                            statusDate: `${inputsCollection.endDate.value}`,
                                            statusTime: `${inputsCollection.endTime.value}`
                                        };
                                        const patrols = await getDetails("service.id", data.id, "ServiceDetailV");
                                        const containers = await getDetails("service.id", data.id, "Charge");
                                        //Patrulla
                                        if (patrols != undefined) {
                                            patrols.forEach(async (patrol) => {
                                                let crew = await getEntityData('Crew', patrol.crew.id);
                                                getUpdateState(status.crewState.id, 'Crew', patrol.crew.id);
                                                eventLog('UPD', `PATRULLA`, `${patrol.crew.name} disponible`, '');
                                                let dataArray = [];
                                                if (crew?.vehicular?.id) {
                                                    dataArray.push({
                                                        id: crew.vehicular.id,
                                                        value: `${crew.vehicular.type} [${crew.vehicular.licensePlate}]`,
                                                        table: "Vehicular",
                                                        state: status.vehicularState.id,
                                                        title: "VEHÍCULO"
                                                    });
                                                }
                                                if (crew?.crewOne?.id != status.nothingUser.id || crew?.crewOne?.username != 'N/A') {
                                                    dataArray.push({
                                                        id: crew?.crewOne.id,
                                                        value: `${crew?.crewOne.username}`,
                                                        table: "User",
                                                        state: status.userState.id,
                                                        title: "SUPERVISOR"
                                                    });
                                                    if (crew?.weaponOne?.id != status.nothingWeapon.id || crew?.weaponOne?.name != 'N/A') {
                                                        dataArray.push({
                                                            id: crew?.weaponOne.id,
                                                            value: `${crew?.weaponOne.name} [${crew?.weaponOne.licensePlate}]`,
                                                            table: "Weapon",
                                                            state: status.weaponState.id,
                                                            title: "ARMA"
                                                        });
                                                    }
                                                }
                                                let users = [crew?.crewTwo, crew?.crewThree, crew?.crewFour, crew?.crewFive];
                                                let weapons = [crew?.weaponTwo, crew?.weaponThree, crew?.weaponFour, crew?.weaponFive];
                                                for (let i = 0; i < 4; i++) {
                                                    if (users[i]?.id != status.nothingUser.id || users[i]?.username != 'N/A') {
                                                        dataArray.push({
                                                            id: users[i].id,
                                                            value: `${users[i].username}`,
                                                            table: "User",
                                                            state: status.userState.id,
                                                            title: "GUARDIA"
                                                        });
                                                        if (weapons[i]?.id != status.nothingWeapon.id || weapons[i]?.name != 'N/A') {
                                                            dataArray.push({
                                                                id: weapons[i].id,
                                                                value: `${weapons[i].name} [${weapons[i].licensePlate}]`,
                                                                table: "Weapon",
                                                                state: status.weaponState.id,
                                                                title: "ARMA"
                                                            });
                                                        }
                                                    }
                                                }
                                                for (let i = 0; i < dataArray.length; i++) {
                                                    getUpdateState(dataArray[i].state, dataArray[i].table, dataArray[i].id);
                                                    eventLog('UPD', `${dataArray[i].title}`, `${dataArray[i].value} asignado`, '');
                                                }
                                                //eventLog('DLT', 'SERVICIO-PATRULLA', `${patrol.crew.name}, en servicio: ${data.name}`, data, aditionalData)
                                                //deleteEntity('ServiceDetailV', patrol.id)
                                            });
                                        }
                                        //Contenedor
                                        if (containers != undefined) {
                                            containers.forEach((container) => {
                                                let dataArray = [];
                                                if (container.companion?.id != status.nothingUser.id || container.companion?.username != 'N/A') {
                                                    dataArray.push({
                                                        id: container.companion.id,
                                                        value: `${container.companion.username}`,
                                                        table: "User",
                                                        state: status.userContainer.id,
                                                        title: "GUARDIA"
                                                    });
                                                    if (container.weapon?.id != status.nothingWeapon.id || container.weapon?.name != 'N/A') {
                                                        dataArray.push({
                                                            id: container.weapon.id,
                                                            value: `${container.weapon.name} [${container.weapon.licensePlate}]`,
                                                            table: "Weapon",
                                                            state: status.weaponContainer.id,
                                                            title: "ARMA"
                                                        });
                                                    }
                                                    /*const raw = JSON.stringify({
                                                        "companion": {
                                                        "id": `${status.nothingUser.id}`
                                                        },
                                                        "weapon": {
                                                        "id": `${status.nothingWeapon.id}`
                                                        },
                                                    })
                                                    updateEntity('Charge', container.id, raw)*/
                                                    //eventLog('UPD', 'SERVICIO-CONTENEDOR', `${container.name} [${container.licensePlate}], en servicio: ${data.name}`, data, aditionalData)
                                                }
                                                for (let i = 0; i < dataArray.length; i++) {
                                                    getUpdateState(dataArray[i].state, dataArray[i].table, dataArray[i].id);
                                                    eventLog('UPD', `${dataArray[i].title}`, `${dataArray[i].value} disponible`, '');
                                                }
                                                //deleteEntity('Charge', container.id)
                                            });
                                        }
                                    }
                                    else {
                                        events.push({
                                            value: `${data.name} terminado actualizado: ${inputsCollection.endDate.value} ${inputsCollection.endTime.value}`,
                                            title: `SERVICIO`,
                                            service: data,
                                            aditionalData: {
                                                status: `${status.terminado.name}`,
                                                statusDate: `${inputsCollection.endDate.value}`,
                                                statusTime: `${inputsCollection.endTime.value}`
                                            }
                                        });
                                    }
                                }
                                if (rawStatus != '') {
                                    await updateEntity('Service', data.id, rawStatus);
                                }
                                for (let i = 0; i < raws.length; i++) {
                                    let raw = raws[i];
                                    let event = events[i];
                                    updateEntity('Control', control.id, raw);
                                    eventLog('UPD', `${event.title}`, `${event.value}`, event.service, event.aditionalData);
                                }
                                new CloseDialog().x(editor);
                                new Services().render(infoPage.offset, infoPage.currentPage, infoPage.search);
                            }, 1000);
                        }
                    });
                }
            }
        }
    }
}
