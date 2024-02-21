// @filename: Departments.ts
import { deleteEntity, registerEntity, getFilterEntityData, getFilterEntityCount, getEntityData, updateEntity } from "../../../endpoints.js";
import { inputObserver, CloseDialog, filterDataByHeaderType, pageNumbers, fillBtnPagination, userPermissions, getNothing, currentDateTime, eventLog, getUpdateState } from "../../../tools.js";
import { Config } from "../../../Configs.js";
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
let serviceId;
const getContainers = async (idService) => {
    //const departmentRaw: any = await getEntitiesData('Department')
    //const department = departmentRaw.filter((data: any) => `${data.customer?.id}` === `${customerId}`)
    serviceId = await getEntityData("Service", idService);
    let raw = JSON.stringify({
        "filter": {
            "conditions": [
                {
                    "property": "business.id",
                    "operator": "=",
                    "value": `${businessId}`
                },
                {
                    "property": "service.id",
                    "operator": "=",
                    "value": `${idService}`
                },
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
                                "property": "licensePlate",
                                "operator": "contains",
                                "value": `${infoPage.search.toLowerCase()}`
                            },
                            {
                                "property": "driver",
                                "operator": "contains",
                                "value": `${infoPage.search.toLowerCase()}`
                            },
                            {
                                "property": "dniDriver",
                                "operator": "contains",
                                "value": `${infoPage.search.toLowerCase()}`
                            },
                            {
                                "property": "companion.username",
                                "operator": "contains",
                                "value": `${infoPage.search.toLowerCase()}`
                            },
                            {
                                "property": "weapon.name",
                                "operator": "contains",
                                "value": `${infoPage.search.toLowerCase()}`
                            },
                            {
                                "property": "weapon.licensePlate",
                                "operator": "contains",
                                "value": `${infoPage.search.toLowerCase()}`
                            },
                        ]
                    },
                    {
                        "property": "business.id",
                        "operator": "=",
                        "value": `${businessId}`
                    },
                    {
                        "property": "service.id",
                        "operator": "=",
                        "value": `${idService}`
                    },
                ]
            },
            sort: "-createdDate",
            limit: Config.tableRows,
            offset: infoPage.offset,
            fetchPlan: 'full',
        });
    }
    infoPage.count = await getFilterEntityCount("Charge", raw);
    dataPage = await getFilterEntityData("Charge", raw);
    return dataPage;
};
export class Charges {
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
                new Charges().render(Config.offset, Config.currentPage, search.value.toLowerCase().trim(), serviceId.id);
            });
        };
    }
    async render(offset, actualPage, search, idService) {
        infoPage.offset = offset;
        infoPage.currentPage = actualPage;
        infoPage.search = search;
        this.content.innerHTML = '';
        this.content.innerHTML = tableLayout;
        const tableBody = document.getElementById('datatable-body');
        const subtitle = document.getElementById('datatable_subtitle');
        tableBody.innerHTML = '.Cargando...';
        //const service: any = await getEntityData('Service', idService)
        let data = await getContainers(idService);
        subtitle.innerText = `Servicio: ${serviceId.name}`;
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
                let container = paginatedItems[i];
                let row = document.createElement('tr');
                row.innerHTML += `
                <td>${container.name ?? ''}</td>
                <td>${container?.licensePlate ?? ''}</td>
                <td>${container?.driver ?? ''}</td>
                <td>${container?.dniDriver ?? ''}</td>
                <td>${container?.companion?.username ?? ''}</td>
                <td>${container?.weapon?.name ?? ''} [${container?.weapon?.licensePlate ?? ''}]</td>
                <td class="entity_options">

                    <button class="button" id="edit-entity" data-entityId="${container.id}">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button class="button" id="remove-entity" data-entityId="${container.id}" data-entityName="${container.name}" data-entityPlate="${container.licensePlate}" style="display:${userPermissions().style};">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
        `;
                table.appendChild(row);
            }
        }
        this.register();
        this.edit(this.entityDialogContainer, data);
        this.remove();
    }
    register() {
        // register entity
        const openEditor = document.getElementById('new-entity');
        openEditor.addEventListener('click', () => {
            if (serviceId.serviceState.name == 'Terminado') {
                alert(`El servicio ha terminado`);
            }
            else if ((infoPage.count + 1) <= serviceId.quantyContainers) {
                renderInterface();
            }
            else {
                alert(`El servicio ha sido registrado con ${serviceId.quantyContainers} conetedor(es)`);
            }
        });
        const renderInterface = async () => {
            const nothingConfig = {
                userState: await getNothing("name", "En servicio", "UserState"),
                weaponState: await getNothing("name", "En servicio", "WeaponState"),
                nothingWeapon: await getNothing("name", "N/A", "Weapon"),
                nothingUser: await getNothing("username", "N/A", "User"),
            };
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            this.entityDialogContainer.innerHTML = `
        <div class="entity_editor" id="entity-editor">
          <div class="entity_editor_header">
            <div class="user_info">
              <div class="avatar"><i class="fa-solid fa-truck-container"></i></div>
              <h1 class="entity_editor_title">Registrar <br><small>Contenedor</small></h1>
            </div>

            <button class="btn btn_close_editor" id="close"><i class="fa-regular fa-x"></i></button>
          </div>

          <!-- EDITOR BODY -->
          <div class="entity_editor_body">
            <div class="material_input">
            <input type="text" id="entity-name" autocomplete="none">
            <label for="entity-name"><i class="fa-solid fa-truck-container"></i> ID. Contenedor</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-licensePlate" autocomplete="none">
            <label for="entity-licensePlate"><i class="fa-solid fa-address-card"></i> Placa Vehicular</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-driver" autocomplete="none">
            <label for="entity-driver"><i class="fa-solid fa-user"></i> Conductor</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-dni" maxlength="10" autocomplete="none">
            <label for="entity-dni"><i class="fa-solid fa-id-card"></i> DNI</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-company" autocomplete="none">
            <label for="entity-company"><i class="fa-solid fa-building"></i> Compañía de Transporte</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-plate" autocomplete="none">
            <label for="entity-plate"><i class="fa-solid fa-credit-card-front"></i> Placa de Transporte</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-head-color" autocomplete="none">
            <label for="entity-head-color"><i class="fa-solid fa-fill-drip"></i> Color cabezal</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-satellite" autocomplete="none">
            <label for="entity-satellite"><i class="fa-solid fa-satellite"></i> Bloqueo Satelital</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-stamp" autocomplete="none">
            <label for="entity-stamp"><i class="fa-solid fa-stamp"></i> Estampilla</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-guard" data-optionid="${nothingConfig.nothingUser.id}" value="${nothingConfig.nothingUser.username}" disabled>
            <label for="entity-guard"><i class="fa-solid fa-user-police"></i> Guardia <button style="background-color:white; color:#808080; font-size:12px;" id="btn-select-guard"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:12px; color:blue;"></i></button></label>
            <button id="delete-guard"><i class="fa-solid fa-trash"></i></button>
            </div>

            <div class="material_input">
            <input type="text" id="entity-weapon" data-optionid="${nothingConfig.nothingWeapon.id}" value="${nothingConfig.nothingWeapon.name} [${nothingConfig.nothingWeapon.licensePlate}]" disabled>
            <label for="entity-weapon"><i class="fa-solid fa-gun"></i> Arma <button style="background-color:white; color:#808080; font-size:12px;" id="btn-select-weapon"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:12px; color:blue;"></i></button></label>
            <button id="delete-weapon"><i class="fa-solid fa-trash"></i></button>
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
            this.selectUser();
            this.selectWeapon();
            this.selectDelete(nothingConfig);
            this.close();
            const registerButton = document.getElementById('register-entity');
            registerButton.addEventListener('click', () => {
                const inputsCollection = {
                    name: document.getElementById('entity-name'),
                    licensePlate: document.getElementById('entity-licensePlate'),
                    driver: document.getElementById('entity-driver'),
                    dni: document.getElementById('entity-dni'),
                    company: document.getElementById('entity-company'),
                    plate: document.getElementById('entity-plate'),
                    color: document.getElementById('entity-head-color'),
                    satellite: document.getElementById('entity-satellite'),
                    stamp: document.getElementById('entity-stamp'),
                    guard: document.getElementById('entity-guard'),
                    weapon: document.getElementById('entity-weapon'),
                    observation: document.getElementById('entity-observation'),
                };
                let dataArray = [];
                if (inputsCollection.guard.dataset.optionid != nothingConfig.nothingUser.id || inputsCollection.guard.value != "N/A") {
                    dataArray.push({
                        id: inputsCollection.guard.dataset.optionid,
                        value: inputsCollection.guard.value,
                        table: "User",
                        state: nothingConfig.userState.id,
                        title: "GUARDIA"
                    });
                    if (inputsCollection.weapon.dataset.optionid != nothingConfig.nothingWeapon.id || inputsCollection.weapon.value != "N/A [N/A]") {
                        dataArray.push({
                            id: inputsCollection.weapon.dataset.optionid,
                            value: inputsCollection.weapon.value,
                            table: "Weapon",
                            state: nothingConfig.weaponState.id,
                            title: "ARMA"
                        });
                    }
                }
                else {
                    inputsCollection.weapon.dataset.optionid = nothingConfig.nothingWeapon.id;
                }
                const raw = JSON.stringify({
                    'creationDate': `${currentDateTime().date}`,
                    'creationTime': `${currentDateTime().time}`,
                    "business": {
                        "id": `${businessId}`
                    },
                    "service": {
                        "id": `${serviceId.id}`
                    },
                    "customer": {
                        "id": `${serviceId.customer.id}`
                    },
                    "name": `${inputsCollection.name.value.toUpperCase()}`,
                    "licensePlate": `${inputsCollection.licensePlate.value.toUpperCase()}`,
                    "driver": `${inputsCollection.driver.value}`,
                    "dniDriver": `${inputsCollection.dni.value}`,
                    "transportCompany": `${inputsCollection.company.value}`,
                    "transportPlate": `${inputsCollection.plate.value}`,
                    "headColor": `${inputsCollection.color.value}`,
                    "satelliteLock": `${inputsCollection.satellite.value}`,
                    "stamp": `${inputsCollection.stamp.value}`,
                    "observation": `${inputsCollection.observation.value}`,
                    "companion": {
                        "id": `${inputsCollection.guard.dataset.optionid}`
                    },
                    "weapon": {
                        "id": `${inputsCollection.weapon.dataset.optionid}`
                    }
                });
                if (inputsCollection.name.value === '' || inputsCollection.name.value === undefined) {
                    alert("¡Nombre vacío!");
                }
                else if (inputsCollection.licensePlate.value === '' || inputsCollection.licensePlate.value === undefined) {
                    alert("¡Placa Vehicular vacía!");
                }
                else {
                    registerEntity(raw, 'Charge').then((res) => {
                        setTimeout(async () => {
                            let parse = JSON.parse(raw);
                            eventLog('INS', 'SERVICIO-CONTENEDOR', `${parse.name} [${parse.licensePlate}], en servicio: ${serviceId.name}`, serviceId, `${serviceId.serviceState.name}`);
                            for (let i = 0; i < dataArray.length; i++) {
                                getUpdateState(dataArray[i].state, dataArray[i].table, dataArray[i].id);
                                eventLog('UPD', `${dataArray[i].title}`, `${dataArray[i].value} (contenedor) en servicio: ${serviceId.name}`, serviceId, `${serviceId.serviceState.name}`);
                            }
                            const container = document.getElementById('entity-editor-container');
                            new CloseDialog().x(container);
                            new Charges().render(Config.offset, Config.currentPage, infoPage.search, serviceId.id);
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
                if (serviceId.serviceState.name == 'Terminado') {
                    alert(`El servicio ha terminado`);
                }
                else {
                    RInterface('Charge', entityId);
                }
            });
        });
        const RInterface = async (entities, entityID) => {
            const nothingConfig = {
                userState: await getNothing("name", "En servicio", "UserState"),
                weaponState: await getNothing("name", "En servicio", "WeaponState"),
                userEnable: await getNothing("name", "Disponible", "UserState"),
                weaponEnable: await getNothing("name", "Disponible", "WeaponState"),
                nothingWeapon: await getNothing("name", "N/A", "Weapon"),
                nothingUser: await getNothing("username", "N/A", "User"),
            };
            const data = await getEntityData(entities, entityID);
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            this.entityDialogContainer.innerHTML = `
              <div class="entity_editor" id="entity-editor">
              <div class="entity_editor_header">
                  <div class="user_info">
                  <div class="avatar"><i class="fa-regular fa-truck-container"></i></div>
                  <h1 class="entity_editor_title">Editar <br><small>${data.name}</small></h1>
                  </div>

                  <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
              </div>

              <!-- EDITOR BODY -->
              <div class="entity_editor_body">
                  <div class="material_input">
                  <input type="text" id="entity-name" class="input_filled" value="${data.name}">
                  <label for="entity-name"><i class="fa-solid fa-truck-container"></i> ID. Contenedor</label>
                  </div>
      
                  <div class="material_input">
                  <input type="text" id="entity-licensePlate" class="input_filled" value="${data.licensePlate}">
                  <label for="entity-licensePlate"><i class="fa-solid fa-address-card"></i> Placa Vehicular</label>
                  </div>
      
                  <div class="material_input">
                  <input type="text" id="entity-driver" class="input_filled" value="${data?.driver ?? ''}">
                  <label for="entity-driver"><i class="fa-solid fa-user"></i> Conductor</label>
                  </div>
      
                  <div class="material_input">
                  <input type="text" id="entity-dni" maxlength="10" class="input_filled" value="${data?.dniDriver ?? ''}">
                  <label for="entity-dni"><i class="fa-solid fa-id-card"></i> DNI</label>
                  </div>
      
                  <div class="material_input">
                  <input type="text" id="entity-company" class="input_filled" value="${data?.transportCompany ?? ''}">
                  <label for="entity-company"><i class="fa-solid fa-building"></i> Compañía de Transporte</label>
                  </div>
      
                  <div class="material_input">
                  <input type="text" id="entity-plate" class="input_filled" value="${data?.transportPlate ?? ''}">
                  <label for="entity-plate"><i class="fa-solid fa-credit-card-front"></i> Placa de Transporte</label>
                  </div>
      
                  <div class="material_input">
                  <input type="text" id="entity-head-color" class="input_filled" value="${data?.headColor ?? ''}">
                  <label for="entity-head-color"><i class="fa-solid fa-fill-drip"></i> Color cabezal</label>
                  </div>
      
                  <div class="material_input">
                  <input type="text" id="entity-satellite" class="input_filled" value="${data?.satelliteLock ?? ''}">
                  <label for="entity-satellite"><i class="fa-solid fa-satellite"></i> Bloqueo Satelital</label>
                  </div>
      
                  <div class="material_input">
                  <input type="text" id="entity-stamp" class="input_filled" value="${data?.stamp ?? ''}">
                  <label for="entity-stamp"><i class="fa-solid fa-stamp"></i> Estampilla</label>
                  </div>
      
                  <div class="material_input">
                  <input type="text" id="entity-guard" class="input_filled" data-optionid="${data.companion.id}" value="${data?.companion.username ?? ''}" disabled>
                  <label for="entity-guard"><i class="fa-solid fa-user-police"></i> Guardia <button style="background-color:white; color:#808080; font-size:12px;" id="btn-select-guard"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:12px; color:blue;"></i></button></label>
                  <button id="delete-guard"><i class="fa-solid fa-trash"></i></button>
                  </div>
      
                  <div class="material_input">
                  <input type="text" id="entity-weapon" class="input_filled" data-optionid="${data.weapon.id}" value="${data?.weapon.name ?? ''} [${data?.weapon.licensePlate ?? ''}]" disabled>
                  <label for="entity-weapon"><i class="fa-solid fa-gun"></i> Arma <button style="background-color:white; color:#808080; font-size:12px;" id="btn-select-weapon"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:12px; color:blue;"></i></button></label>
                  <button id="delete-weapon"><i class="fa-solid fa-trash"></i></button>
                  </div>

                  <br>
                  <div class="material_input">
                  <br>
                  <textarea id="entity-observation" rows="4" class="input_filled" autocomplete="none">${data?.observation ?? ''}</textarea>
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
            this.selectDelete(nothingConfig);
            this.selectUser();
            this.selectWeapon();
            this.close();
            UUpdate(entityID, data, nothingConfig);
        };
        const UUpdate = async (entityId, data, nothingConfig) => {
            const updateButton = document.getElementById('update-changes');
            updateButton.addEventListener('click', async () => {
                const $value = {
                    // @ts-ignore
                    name: document.getElementById('entity-name'),
                    licensePlate: document.getElementById('entity-licensePlate'),
                    driver: document.getElementById('entity-driver'),
                    dni: document.getElementById('entity-dni'),
                    company: document.getElementById('entity-company'),
                    plate: document.getElementById('entity-plate'),
                    color: document.getElementById('entity-head-color'),
                    satellite: document.getElementById('entity-satellite'),
                    stamp: document.getElementById('entity-stamp'),
                    guard: document.getElementById('entity-guard'),
                    weapon: document.getElementById('entity-weapon'),
                    observation: document.getElementById('entity-observation'),
                };
                let dataArray = [];
                let dataChangesArray = [];
                if ($value.guard.dataset.optionid != nothingConfig.nothingUser.id || $value.guard.value != "N/A") {
                    if ($value.guard.dataset.optionid != data.companion.id) {
                        dataArray.push({
                            id: $value.guard.dataset.optionid,
                            value: $value.guard.value,
                            table: "User",
                            state: nothingConfig.userState.id,
                            title: "GUARDIA"
                        });
                        if (data.companion.id != nothingConfig.nothingUser.id) {
                            dataChangesArray.push({
                                id: data.companion.id,
                                value: data.companion.username,
                                table: "User",
                                state: nothingConfig.userEnable.id,
                                title: "GUARDIA"
                            });
                        }
                    }
                    if ($value.weapon.dataset.optionid != data.weapon.id) {
                        if ($value.weapon.dataset.optionid != nothingConfig.nothingWeapon.id || $value.weapon.value != "N/A [N/A]") {
                            dataArray.push({
                                id: $value.weapon.dataset.optionid,
                                value: $value.weapon.value,
                                table: "Weapon",
                                state: nothingConfig.weaponState.id,
                                title: "ARMA"
                            });
                            if (data.weapon.id != nothingConfig.nothingWeapon.id) {
                                dataChangesArray.push({
                                    id: data.weapon.id,
                                    value: `${data.weapon.name} [${data.weapon.licensePlate}]`,
                                    table: "Weapon",
                                    state: nothingConfig.weaponEnable.id,
                                    title: "ARMA"
                                });
                            }
                        }
                        else {
                            if (data.weapon.id != nothingConfig.nothingWeapon.id) {
                                dataChangesArray.push({
                                    id: data.weapon.id,
                                    value: `${data.weapon.name} [${data.weapon.licensePlate}]`,
                                    table: "Weapon",
                                    state: nothingConfig.weaponEnable.id,
                                    title: "ARMA"
                                });
                            }
                        }
                    }
                }
                else {
                    if (data.companion.id != nothingConfig.nothingUser.id) {
                        dataChangesArray.push({
                            id: data.companion.id,
                            value: data.companion.username,
                            table: "User",
                            state: nothingConfig.userEnable.id,
                            title: "GUARDIA"
                        });
                    }
                    if (data.weapon.id != nothingConfig.nothingWeapon.id) {
                        dataChangesArray.push({
                            id: data.weapon.id,
                            value: `${data.weapon.name} [${data.weapon.licensePlate}]`,
                            table: "Weapon",
                            state: nothingConfig.weaponEnable.id,
                            title: "ARMA"
                        });
                    }
                    $value.weapon.dataset.optionid = nothingConfig.nothingWeapon.id;
                    $value.weapon.value = "N/A [N/A]";
                }
                let raw = JSON.stringify({
                    "name": `${$value.name.value.toUpperCase()}`,
                    "licensePlate": `${$value.licensePlate.value.toUpperCase()}`,
                    "driver": `${$value.driver.value}`,
                    "dniDriver": `${$value.dni.value}`,
                    "transportCompany": `${$value.company.value}`,
                    "transportPlate": `${$value.plate.value}`,
                    "headColor": `${$value.color.value}`,
                    "satelliteLock": `${$value.satellite.value}`,
                    "stamp": `${$value.stamp.value}`,
                    "observation": `${$value.observation.value}`,
                    "companion": {
                        "id": `${$value.guard.dataset.optionid}`
                    },
                    "weapon": {
                        "id": `${$value.weapon.dataset.optionid}`
                    },
                });
                // @ts-ignore
                if ($value.name.value === '' || $value.name.value === undefined) {
                    alert("Nombre vacío!");
                }
                else {
                    update(raw, dataArray, dataChangesArray);
                }
            });
            const update = (raw, dataArray, dataChangesArray) => {
                updateEntity('Charge', entityId, raw)
                    .then((res) => {
                    setTimeout(async () => {
                        let tableBody;
                        let container;
                        let data;
                        //data = await getWeapons()
                        let parse = JSON.parse(raw);
                        eventLog('UPD', 'SERVICIO-CONTENEDOR', `${parse.name} [${parse.licensePlate}], en servicio: ${serviceId.name}`, serviceId, `${serviceId.serviceState.name}`);
                        dataArray.forEach((container) => {
                            getUpdateState(container.state, container.table, container.id);
                            eventLog('UPD', `${container.title}`, `${container.value} (contenedor) en servicio: ${serviceId.name}`, serviceId, `${serviceId.serviceState.name}`);
                        });
                        dataChangesArray.forEach((container) => {
                            getUpdateState(container.state, container.table, container.id);
                            eventLog('UPD', `${container.title}`, `${container.value} disponible`, '');
                        });
                        new CloseDialog()
                            .x(container =
                            document.getElementById('entity-editor-container'));
                        new Charges().render(infoPage.offset, infoPage.currentPage, infoPage.search, serviceId.id);
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
            const entityPlate = remove.dataset.entityplate;
            remove.addEventListener('click', async () => {
                const nothingConfig = {
                    userState: await getNothing("name", "Disponible", "UserState"),
                    weaponState: await getNothing("name", "Disponible", "WeaponState"),
                    nothingWeapon: await getNothing("name", "N/A", "Weapon"),
                    nothingUser: await getNothing("username", "N/A", "User"),
                };
                this.dialogContainer.style.display = 'flex';
                this.dialogContainer.innerHTML = `
          <div class="dialog_content" id="dialog-content">
            <div class="dialog dialog_danger">
              <div class="dialog_container">
                <div class="dialog_header">
                  <h2>¿Deseas eliminar este contenedor?</h2>
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
                    const data = await getEntityData('Charge', entityId);
                    if (serviceId.serviceState.name == 'Terminado') {
                        alert(`El servicio ha terminado`);
                    }
                    else {
                        deleteEntity('Charge', entityId)
                            .then(async (res) => {
                            setTimeout(async () => {
                                eventLog('DLT', 'SERVICIO-CONTENEDOR', `${entityName} [${entityPlate}], en servicio: ${serviceId.name}`, serviceId, `${serviceId.serviceState.name}`);
                                let dataArray = [];
                                if (data.companion?.id != nothingConfig.nothingUser.id || data.companion?.username != 'N/A') {
                                    dataArray.push({
                                        id: data.companion.id,
                                        value: `${data.companion.username}`,
                                        table: "User",
                                        state: nothingConfig.userState.id,
                                        title: "GUARDIA"
                                    });
                                    if (data.weapon?.id != nothingConfig.nothingWeapon.id || data.weapon?.name != 'N/A') {
                                        dataArray.push({
                                            id: data.weapon.id,
                                            value: `${data.weapon.name} [${data.weapon.licensePlate}]`,
                                            table: "Weapon",
                                            state: nothingConfig.weaponState.id,
                                            title: "ARMA"
                                        });
                                    }
                                }
                                for (let i = 0; i < dataArray.length; i++) {
                                    getUpdateState(dataArray[i].state, dataArray[i].table, dataArray[i].id);
                                    eventLog('UPD', `${dataArray[i].title}`, `${dataArray[i].value} disponible`, '');
                                }
                                new Charges().render(infoPage.offset, infoPage.currentPage, infoPage.search, serviceId.id);
                            }, 1000);
                        });
                    }
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
                new Charges().render(infoPage.offset, currentPage, infoPage.search, serviceId.id);
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
                new Charges().render(Config.offset, Config.currentPage, infoPage.search, serviceId.id);
            });
            nextButton.addEventListener('click', () => {
                infoPage.offset = Config.tableRows * (pageCount - 1);
                new Charges().render(infoPage.offset, pageCount, infoPage.search, serviceId.id);
            });
        }
    }
    selectWeapon() {
        const btnWeapon = document.getElementById('btn-select-weapon');
        btnWeapon.addEventListener('click', async () => {
            const weapon = document.getElementById('entity-weapon');
            modalTable(0, "", weapon);
        });
        async function modalTable(offset, search, element) {
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
                            "property": "weaponState.name",
                            "operator": "=",
                            "value": `Disponible`
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
                                        "property": "licensePlate",
                                        "operator": "contains",
                                        "value": `${search.toLowerCase()}`
                                    },
                                    {
                                        "property": "nroSerie",
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
                                "property": "weaponState.name",
                                "operator": "=",
                                "value": `Disponible`
                            }
                        ],
                    },
                    sort: "-createdDate",
                    limit: Config.modalRows,
                    offset: offset,
                    fetchPlan: 'full',
                });
            }
            let dataModal = await getFilterEntityData("Weapon", raw);
            const Fwaepon = dataModal.filter((data) => data.id != element.dataset.optionid);
            dialogContainer.style.display = 'block';
            dialogContainer.innerHTML = `
                  <div class="dialog_content" id="dialog-content">
                      <div class="dialog">
                          <div class="dialog_container padding_8">
                              <div class="dialog_header">
                                  <h2>Armas disponibles</h2>
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
                                          <th>Placa</th>
                                          <th>Serie</th>
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
            if (Fwaepon.length === 0) {
                let row = document.createElement('tr');
                row.innerHTML = `
                      <td>No hay datos</td>
                      <td></td>
                      <td></td>
                  `;
                datetableBody.appendChild(row);
            }
            else {
                for (let i = 0; i < Fwaepon.length; i++) {
                    let client = Fwaepon[i];
                    let row = document.createElement('tr');
                    row.innerHTML += `
                          <td>${client?.name ?? ''}</td>
                          <td>${client?.licensePlate ?? ''}</td>
                          <td>${client?.nroSerie ?? ''}</td>
                          <td class="entity_options">
                              <button class="button" id="edit-entity" data-entityId="${client.id}" data-entityName="${client.name}" data-entityPlate="${client.licensePlate}">
                                  <i class="fa-solid fa-arrow-up-right-from-square"></i>
                              </button>
                          </td>
                      `;
                    datetableBody.appendChild(row);
                }
            }
            const txtSearch = document.getElementById('search-modal');
            const btnSearchModal = document.getElementById('btnSearchModal');
            const _selectUser = document.querySelectorAll('#edit-entity');
            const _closeButton = document.getElementById('cancel');
            const _dialog = document.getElementById('dialog-content');
            const prevModalButton = document.getElementById('prevModal');
            const nextModalButton = document.getElementById('nextModal');
            txtSearch.value = search ?? '';
            _selectUser.forEach((edit) => {
                const entityId = edit.dataset.entityid;
                const entityName = edit.dataset.entityname;
                const entityPlate = edit.dataset.entityplate;
                edit.addEventListener('click', () => {
                    element.setAttribute('data-optionid', entityId);
                    element.setAttribute('value', `${entityName} [${entityPlate}]`);
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
                if (offset > 0) {
                    offset = (offset) - Config.modalRows;
                    modalTable(offset, search, element);
                }
            };
        }
    }
    selectUser() {
        const btnGuard = document.getElementById('btn-select-guard');
        btnGuard.addEventListener('click', async () => {
            const guard = document.getElementById('entity-guard');
            modalTable(0, "", guard);
        });
        async function modalTable(offset, search, element) {
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
                            "property": "userState.name",
                            "operator": "=",
                            "value": `Disponible`
                        },
                        {
                            "property": "userType",
                            "operator": "=",
                            "value": `GUARD`
                        },
                        {
                            "property": "isSupervisor",
                            "operator": "=",
                            "value": `${false}`
                        },
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
                                        "property": "firstName",
                                        "operator": "contains",
                                        "value": `${search.toLowerCase()}`
                                    },
                                    {
                                        "property": "lastName",
                                        "operator": "contains",
                                        "value": `${search.toLowerCase()}`
                                    },
                                    {
                                        "property": "secondLastName",
                                        "operator": "contains",
                                        "value": `${search.toLowerCase()}`
                                    },
                                    {
                                        "property": "username",
                                        "operator": "contains",
                                        "value": `${search.toLowerCase()}`
                                    },
                                    {
                                        "property": "dni",
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
                                "property": "userState.name",
                                "operator": "=",
                                "value": `Disponible`
                            },
                            {
                                "property": "userType",
                                "operator": "=",
                                "value": `GUARD`
                            },
                            {
                                "property": "isSupervisor",
                                "operator": "=",
                                "value": `${false}`
                            },
                        ],
                    },
                    sort: "-createdDate",
                    limit: Config.modalRows,
                    offset: offset,
                    fetchPlan: 'full',
                });
            }
            let dataModal = await getFilterEntityData("User", raw);
            const FGuard = dataModal.filter((data) => data.id != element.dataset.optionid);
            dialogContainer.style.display = 'block';
            dialogContainer.innerHTML = `
                  <div class="dialog_content" id="dialog-content">
                      <div class="dialog">
                          <div class="dialog_container padding_8">
                              <div class="dialog_header">
                                  <h2>Guardias disponibles</h2>
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
                                          <th>Usuario</th>
                                          <th>DNI</th>
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
            if (FGuard.length === 0) {
                let row = document.createElement('tr');
                row.innerHTML = `
                      <td>No hay datos</td>
                      <td></td>
                      <td></td>
                  `;
                datetableBody.appendChild(row);
            }
            else {
                for (let i = 0; i < FGuard.length; i++) {
                    let client = FGuard[i];
                    let row = document.createElement('tr');
                    row.innerHTML += `
                          <td>${client?.firstName ?? ''} ${client?.lastName ?? ''} ${client?.secondLastName ?? ''}</td>
                          <td>${client?.username ?? ''}</td>
                          <td>${client?.dni ?? ''}</td>
                          <td class="entity_options">
                              <button class="button" id="edit-entity" data-entityId="${client.id}" data-entityName="${client.username}" data-entityType="${client.type}">
                                  <i class="fa-solid fa-arrow-up-right-from-square"></i>
                              </button>
                          </td>
                      `;
                    datetableBody.appendChild(row);
                }
            }
            const txtSearch = document.getElementById('search-modal');
            const btnSearchModal = document.getElementById('btnSearchModal');
            const _selectUser = document.querySelectorAll('#edit-entity');
            const _closeButton = document.getElementById('cancel');
            const _dialog = document.getElementById('dialog-content');
            const prevModalButton = document.getElementById('prevModal');
            const nextModalButton = document.getElementById('nextModal');
            txtSearch.value = search ?? '';
            _selectUser.forEach((edit) => {
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
                if (offset > 0) {
                    offset = (offset) - Config.modalRows;
                    modalTable(offset, search, element);
                }
            };
        }
    }
    selectDelete(nothingConfig) {
        const inputs = {
            guard: document.getElementById('entity-guard'),
            weapon: document.getElementById('entity-weapon'),
        };
        const deletes = {
            guard: document.getElementById('delete-guard'),
            weapon: document.getElementById('delete-weapon'),
        };
        deletes.weapon.addEventListener('click', async () => {
            inputs.weapon.value = `${nothingConfig.nothingWeapon.name} [${nothingConfig.nothingWeapon.licensePlate}]`;
            inputs.weapon.dataset.optionid = nothingConfig.nothingWeapon.id;
        });
        deletes.guard.addEventListener('click', async () => {
            inputs.guard.value = nothingConfig.nothingUser.username;
            inputs.guard.dataset.optionid = nothingConfig.nothingUser.id;
        });
    }
}
