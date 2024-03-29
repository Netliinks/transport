// @filename: Departments.ts

import { deleteEntity, registerEntity, getFilterEntityData, getFilterEntityCount, getEntityData, updateEntity, sendMail, getUserInfo, postNotificationPush, getFile, getEntitiesData } from "../../endpoints.js"
import { inputObserver, inputSelect, CloseDialog, filterDataByHeaderType, pageNumbers, fillBtnPagination, userPermissions, getNothing, inputSelectType, currentDateTime, eventLog, getSearch, getDetails, getUpdateState } from "../../tools.js"
import { Data, InterfaceElement } from "../../types.js"
import { Config } from "../../Configs.js"
import { tableLayout } from "./Layout.js"
import { tableLayoutTemplate } from "./Template.js"
import { Patrols } from "./patrols/Patrols.js"
import { Charges } from "./containers/Containers.js"
import { exportServiceCsv, exportServicePdf, exportServiceXls } from "../../exportFiles/services.js"
import { exportContainerCsv, exportContainerXls } from "../../exportFiles/container.js"

const tableRows = Config.tableRows
const currentPage = Config.currentPage
const businessId = localStorage.getItem('business_id');
let infoPage = {
    count: 0,
    offset: Config.offset,
    currentPage: currentPage,
    search: ""
}
let dataPage: any
const getServices = async (): Promise<void> => {
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
    })
    if(infoPage.search != ""){
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
        })
    }
    infoPage.count = await getFilterEntityCount("Service", raw)
    dataPage = await getFilterEntityData("Service", raw)
    return dataPage

}

export class Services {
    private dialogContainer: InterfaceElement =
        document.getElementById('app-dialogs')

    private entityDialogContainer: InterfaceElement =
        document.getElementById('entity-editor-container')

    private content: InterfaceElement =
        document.getElementById('datatable-container')

    public async render(offset: any, actualPage: any, search: any): Promise<void> {
        infoPage.offset = offset
        infoPage.currentPage = actualPage
        infoPage.search = search   
        this.content.innerHTML = ''
        this.content.innerHTML = tableLayout
        const tableBody: InterfaceElement = document.getElementById('datatable-body')
        tableBody.innerHTML = '.Cargando...'
        
        let data: any = await getServices()
        tableBody.innerHTML = tableLayoutTemplate.repeat(tableRows)
        this.load(tableBody, currentPage, data)
        new filterDataByHeaderType().filter()
        this.searchEntity(tableBody/*, data*/)
        this.pagination(data, tableRows, infoPage.currentPage)
    }

    public load(table: InterfaceElement, currentPage: number, data?: any) {
        table.innerHTML = ''
        currentPage--
        let start: number = tableRows * currentPage
        let end: number = start + tableRows
        let paginatedItems: any = data.slice(start, end)
        if (data.length === 0) {
            let row: InterfaceElement = document.createElement('tr')
            row.innerHTML = `
        <td>No hay datos</td>
        <td></td>
        <td></td>
      `
            table.appendChild(row)
        }
        else {
            for (let i = 0; i < paginatedItems.length; i++) {
                let service = paginatedItems[i]
                let row: InterfaceElement =
                    document.createElement('tr')
                row.innerHTML += `
                <td>${service.name}</dt>
                <td>${service?.customer?.name ?? ''}</dt>
                <td>${service?.creationDate ?? ''}</dt>
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
        `
                table.appendChild(row)
            }
        }
        
        this.getVehicles()
        this.getContainers()
        this.register()
        this.edit(this.entityDialogContainer, data)
        this.sendEmail(this.entityDialogContainer)
        this.export()
        this.remove()
        this.print()
    }

    public searchEntity = async (tableBody: InterfaceElement /*, data: any*/) => {
        const search: InterfaceElement = document.getElementById('search')
        const btnSearch: InterfaceElement = document.getElementById('btnSearch')
        search.value = infoPage.search
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
        })
        btnSearch.addEventListener('click', async () => {
            new Services().render(Config.offset , Config.currentPage, search.value.toLowerCase().trim())
        })
    }

    public register() {
        // register entity
        const openEditor: InterfaceElement = document.getElementById('new-entity')
        openEditor.addEventListener('click', (): void => {
            renderInterface()
        })

        const renderInterface = async (): Promise<void> => {
            const nothingConfig = {
              serviceState: await getNothing("name", "Pendiente", "ServiceState"),
            }
            this.entityDialogContainer.innerHTML = ''
            this.entityDialogContainer.style.display = 'flex'
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
            <input type="text" id="entity-client" autocomplete="none" disabled>
            <label for="entity-client"><i class="fa-solid fa-buildings" readonly></i> Cliente <button style="background-color:white; color:#808080; font-size:12px;" id="btn-select-client"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:12px; color:blue;"></i></button></label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-city-origin" autocomplete="none" disabled>
            <label for="entity-city-origin"><i class="fa-solid fa-earth-americas" readonly></i> Ciudad Origen <button style="background-color:white; color:#808080; font-size:12px;" id="btn-select-city-origin"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:12px; color:blue;"></i></button></label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-city-destiny" autocomplete="none" disabled>
            <label for="entity-city-destiny"><i class="fa-solid fa-earth-americas" readonly></i> Ciudad Destino <button style="background-color:white; color:#808080; font-size:12px;" id="btn-select-city-destiny"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:12px; color:blue;"></i></button></label>
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
      `

            // @ts-ignore
            inputObserver()
            this.selectClient()
            this.selectCity()
            inputSelectType('entity-custody', 'SERVICE', '');
            //inputSelect('Customer', 'entity-customer')
            this.close()
            let fecha = new Date(); //Fecha actual
            let mes: any = fecha.getMonth()+1; //obteniendo mes
            let dia: any = fecha.getDate(); //obteniendo dia
            let anio = fecha.getFullYear(); //obteniendo año
            let _hours = fecha.getHours();
            let _minutes = fecha.getMinutes();
            let _fixedHours = ('0' + _hours).slice(-2);
            let _fixedMinutes = ('0' + _minutes).slice(-2);
            if(dia<10)
                dia='0'+dia; //agrega cero si el menor de 10
            if(mes<10)
                mes='0'+mes //agrega cero si el menor de 10
            // @ts-ignore
            document.getElementById("output-date").value = anio+"-"+mes+"-"+dia;
            // @ts-ignore
            document.getElementById("output-time").value = `${_fixedHours}:${_fixedMinutes}`;


            const registerButton: InterfaceElement = document.getElementById('register-entity')
            registerButton.addEventListener('click', async (): Promise<void> => {
                const inputsCollection: any = {
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
                }

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
                })
                let searchExist = await getSearch("name", inputsCollection.name.value.toUpperCase(), "Service")
                if(inputsCollection.name.value === '' || inputsCollection.name.value === undefined){
                    alert("¡Nombre vacío!")
                }else if(inputsCollection.client.value === '' || inputsCollection.client.value === undefined){
                    alert("Cliente no seleccionado!")
                }else if(inputsCollection.cityOrigin.value === '' || inputsCollection.cityOrigin.value === undefined){
                    alert("¡Ciudad origen no seleccionada!")
                }else if(inputsCollection.cityDestiny.value === '' || inputsCollection.cityDestiny.value === undefined){
                    alert("¡Ciudad destino no seleccionada!")
                }else if(inputsCollection.email.value === '' || inputsCollection.email.value === undefined){
                    alert("¡Email vacío!")
                }else if(searchExist != undefined){
                    alert("Servicio ya existe!")
                }else{

                  registerEntity(raw, 'Service').then((res) => {
                    setTimeout(() => {
                        let parse = JSON.parse(raw);
                        eventLog('INS', 'SERVICIO', `${parse.name}`, '', `${nothingConfig.serviceState.name}`)
                        const container: InterfaceElement = document.getElementById('entity-editor-container')

                        new CloseDialog().x(container)
                        new Services().render(Config.offset, Config.currentPage, infoPage.search)
                    }, 1000)
                  })
                }
            })

        }

        const reg = async (raw: any) => {
        }
    }

    private edit(container: InterfaceElement, data: Data) {
      // Edit entity
      const edit: InterfaceElement = document.querySelectorAll('#edit-entity')
      edit.forEach((edit: InterfaceElement) => {
          const entityId = edit.dataset.entityid
          edit.addEventListener('click', (): void => {
              RInterface('Service', entityId)
          })
      })

      const RInterface = async (entities: string, entityID: string): Promise<void> => {
          const data: any = await getEntityData(entities, entityID)
          this.entityDialogContainer.innerHTML = ''
          this.entityDialogContainer.style.display = 'flex'
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
          `

          inputObserver()
          // @ts-ignore
          document.getElementById("entity-vehicle").value = data.quantyVehiculars
          // @ts-ignore
          document.getElementById("entity-containers").value = data.quantyContainers
          this.close()
          UUpdate(entityID, data)
      }

      const UUpdate = async (entityId: any, service: any): Promise<void> => {
          const updateButton: InterfaceElement =
              document.getElementById('update-changes')
          updateButton.addEventListener('click', async () => {
              const $value: InterfaceElement = {
                  // @ts-ignore
                  name: document.getElementById('entity-name'),
                  placeOrigin: document.getElementById('entity-place-origin'),
                  placeDestiny: document.getElementById('entity-place-destiny'),
                  reference: document.getElementById('entity-reference'),
                  observation: document.getElementById('entity-observation'),
              }
              let raw = JSON.stringify({
                  // @ts-ignore
                  "name": `${$value.name?.value.toUpperCase()}`,
                  "placeOrigin": `${$value.placeOrigin?.value}`,
                  "placeDestination": `${$value.placeDestiny?.value}`,
                  "reference": `${$value.reference?.value}`,
                  "observation": `${$value.observation?.value}`,
              })
              let searchExist = [] 
                searchExist[0] = 'none'
                if($value.name.value.toUpperCase() != service.name){
                    searchExist[1] = await getSearch("name", $value.name.value.toUpperCase(), "Service")
                }
              // @ts-ignore
              if ($value.name.value === '' || $value.name.value === undefined) {
                  alert("Nombre vacío!");
              }else if(searchExist[1] != undefined || searchExist[0] != 'none'){
                  alert("Servicio ya existe!")
              }
              else{
                  update(raw)
              }
          })
          const update = (raw: any) => {
              updateEntity('Service', entityId, raw)
                  .then((res) => {
                      setTimeout(async () => {
                          let tableBody: InterfaceElement
                          let container: InterfaceElement
                          let data: any
                          
                          //data = await getWeapons()
                          let parse = JSON.parse(raw);
                          eventLog('UPD', 'SERVICIO', `${parse.name}`, service, `${service.ServiceState.name}`)
                          new CloseDialog()
                              .x(container =
                                  document.getElementById('entity-editor-container')
                              )
                          new Services().render(infoPage.offset, infoPage.currentPage, infoPage.search)
                         /* new Clients().load(tableBody
                              = document.getElementById('datatable-body'),
                              currentPage,
                              data
                          )*/

                      }, 100)
                  })
          }
      }
    }
    public getVehicles(){
        const patrols: InterfaceElement = document.querySelectorAll('#get-patrols')
        patrols.forEach((patrol: InterfaceElement) => {

            const entityId = patrol.dataset.entityid

            patrol.addEventListener('click', async (): Promise<void> => {
                const data: any = await getEntityData('Service', entityId)
                //if(data.serviceState.name != 'Terminado')
                    new Patrols().render(Config.offset, Config.currentPage, "", entityId)
            })
        })
    }

    public getContainers(){
        const containers: InterfaceElement = document.querySelectorAll('#get-containers')
        containers.forEach((container: InterfaceElement) => {

            const entityId = container.dataset.entityid

            container.addEventListener('click', (): void => {
                new Charges().render(Config.offset, Config.currentPage, "", entityId)
            })
        })
    }

    public remove() {
        const remove: InterfaceElement = document.querySelectorAll('#remove-entity')
        remove.forEach((remove: InterfaceElement) => {

            const entityId = remove.dataset.entityid
            const entityName = remove.dataset.entityname

            remove.addEventListener('click', async (): Promise<void> => {
                const data: any = await getEntityData('Service', entityId)
                const nothingConfig = {
                    vehicularState: await getNothing("name", "Asignado", "VehicularState"),
                    userState: await getNothing("name", "Asignado", "UserState"),
                    weaponState: await getNothing("name", "Asignado", "WeaponState"),
                    nothingWeapon: await getNothing("name", "N/A", "Weapon"),
                    nothingUser: await getNothing("username", "N/A", "User"),
                    crewState: await getNothing("name", "Disponible", "CrewState"),
                    userContainer: await getNothing("name", "Disponible", "UserState"),
                    weaponContainer: await getNothing("name", "Disponible", "WeaponState"),
                }
                this.dialogContainer.style.display = 'flex'
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
        `

                // delete button
                // cancel button
                // dialog content
                const deleteButton: InterfaceElement = document.getElementById('delete')
                const cancelButton: InterfaceElement = document.getElementById('cancel')
                const dialogContent: InterfaceElement = document.getElementById('dialog-content')

                deleteButton.onclick = async () => {
                    
                    if(data.serviceState.name == "Pendiente" || data.serviceState.name == "Terminado"){
                      const patrols: any = await getDetails("service.id", entityId, "ServiceDetailV")
                      const containers: any = await getDetails("service.id", entityId, "Charge")
                      deleteEntity('Service', entityId)
                        .then(async res => {
                            setTimeout(async () => {
                                eventLog('DLT', 'SERVICIO', `${entityName}`, data, `${data.serviceState.name}`)
                                //Patrulla
                                if(patrols != undefined){
                                    patrols.forEach(async (patrol: any) => {
                                        let crew: any = await getEntityData('Crew', patrol.crew.id)
                                        getUpdateState(nothingConfig.crewState.id, 'Crew', patrol.crew.id)
                                        eventLog('UPD', `PATRULLA`, `${patrol.crew.name} disponible`, '')
                                        let dataArray = []
                                        if(crew?.vehicular?.id){
                                        dataArray.push({
                                            id: crew.vehicular.id,
                                            value: `${crew.vehicular.type} [${crew.vehicular.licensePlate}]`,
                                            table: "Vehicular",
                                            state: nothingConfig.vehicularState.id,
                                            title: "VEHÍCULO"
                                        })
                                        }
                                        if(crew?.crewOne?.id != nothingConfig.nothingUser.id || crew?.crewOne?.username != 'N/A'){
                                            dataArray.push({
                                                id: crew?.crewOne.id,
                                                value: `${crew?.crewOne.username}`,
                                                table: "User",
                                                state: nothingConfig.userState.id,
                                                title: "SUPERVISOR"
                                            })
            
                                            if(crew?.weaponOne?.id != nothingConfig.nothingWeapon.id || crew?.weaponOne?.name != 'N/A'){
                                                dataArray.push({
                                                    id: crew?.weaponOne.id,
                                                    value: `${crew?.weaponOne.name} [${crew?.weaponOne.licensePlate}]`,
                                                    table: "Weapon",
                                                    state: nothingConfig.weaponState.id,
                                                    title: "ARMA"
                                                })
                                            }
                                        }
                                        let users = [crew?.crewTwo, crew?.crewThree, crew?.crewFour, crew?.crewFive]
                                        let weapons = [crew?.weaponTwo, crew?.weaponThree, crew?.weaponFour, crew?.weaponFive]
                                        for(let i = 0; i < 4; i++){
                                            if(users[i]?.id != nothingConfig.nothingUser.id || users[i]?.username != 'N/A'){
                                                dataArray.push({
                                                    id: users[i].id,
                                                    value: `${users[i].username}`,
                                                    table: "User",
                                                    state: nothingConfig.userState.id,
                                                    title: "GUARDIA"
                                                })
                
                                                if(weapons[i]?.id != nothingConfig.nothingWeapon.id || weapons[i]?.name != 'N/A'){
                                                    dataArray.push({
                                                        id: weapons[i].id,
                                                        value: `${weapons[i].name} [${weapons[i].licensePlate}]`,
                                                        table: "Weapon",
                                                        state: nothingConfig.weaponState.id,
                                                        title: "ARMA"
                                                    })
                                                }
                                            }
                                        }
            
                                        for(let i = 0; i < dataArray.length; i++){
                                        getUpdateState(dataArray[i].state, dataArray[i].table, dataArray[i].id)
                                        eventLog('UPD', `${dataArray[i].title}`, `${dataArray[i].value} asignado`, '')
                                        }

                                        eventLog('DLT', 'SERVICIO-PATRULLA', `${patrol.crew.name}, en servicio: ${data.name}`, data, `${data.serviceState.name}`)
                                        deleteEntity('ServiceDetailV', patrol.id)
                                    
                                    })
                                    
                                }

                                //Contenedor
                                if(containers != undefined){
                                    containers.forEach((container: any) => {
                                        let dataArray = []
                                
                                        if(container.companion?.id != nothingConfig.nothingUser.id || container.companion?.username != 'N/A'){
                                            dataArray.push({
                                                id: container.companion.id,
                                                value: `${container.companion.username}`,
                                                table: "User",
                                                state: nothingConfig.userContainer.id,
                                                title: "GUARDIA"
                                            })

                                        if(container.weapon?.id != nothingConfig.nothingWeapon.id || container.weapon?.name != 'N/A'){
                                            dataArray.push({
                                                id: container.weapon.id,
                                                value: `${container.weapon.name} [${container.weapon.licensePlate}]`,
                                                table: "Weapon",
                                                state: nothingConfig.weaponContainer.id,
                                                title: "ARMA"
                                            })
                                            }
                                        }
                                        

                                        for(let i = 0; i < dataArray.length; i++){
                                            getUpdateState(dataArray[i].state, dataArray[i].table, dataArray[i].id)
                                            eventLog('UPD', `${dataArray[i].title}`, `${dataArray[i].value} disponible`, '')
                                        }

                                        eventLog('DLT', 'SERVICIO-CONTENEDOR', `${container.name} [${container.licensePlate}], en servicio: ${data.name}`, data, `${data.serviceState.name}`)
                                        deleteEntity('Charge', container.id)
                                    })
                                }
                                    
                                new Services().render(infoPage.offset, infoPage.currentPage, infoPage.search)
                            },1000)
                        })
                    }else{
                      alert("No se puede eliminar un servicio en proceso.")
                    }
                    

                    new CloseDialog().x(dialogContent)
                }

                cancelButton.onclick = () => {
                    new CloseDialog().x(dialogContent)
                }
            })
        })

    }

    public print() {
        const print: InterfaceElement = document.querySelectorAll('#print-entity')
        print.forEach((print: InterfaceElement) => {

            const entityId = print.dataset.entityid
            const entityName = print.dataset.entityname

            print.addEventListener('click', async (): Promise<void> => {
                const data: any = await getEntityData('Service', entityId)
                exportServicePdf(data)
            })
        })

    }

    public close(): void {
        const closeButton: InterfaceElement = document.getElementById('close')
        const editor: InterfaceElement = document.getElementById('entity-editor-container')

        closeButton.addEventListener('click', () => {
            //console.log('close')
            new CloseDialog().x(editor)
        })
    }

    private export = (): void => {
        const exportLogs: InterfaceElement = document.getElementById('export-entities');
        exportLogs.addEventListener('click', async() => {
            this.dialogContainer.style.display = 'block';
            this.dialogContainer.innerHTML = `
                <div class="dialog_content" id="dialog-content">
                    <div class="dialog">
                        <div class="dialog_container padding_8">
                            <div class="dialog_header">
                                <h2>Filtrar por fecha de servicio</h2>
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
                                </div>
                                <br>
                                <h3>Servicios</h3>
                                <div class="form_group">
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
                                <br>
                                <h3>Contenedores</h3>
                                <div class="form_group">
                                    <label for="exportContainerCsv">
                                        <input type="radio" id="exportContainerCsv" name="exportOption" value="csv" /> CSV
                                    </label>

                                    <label for="exportContainerXls">
                                        <input type="radio" id="exportContainerXls" name="exportOption" value="xls" /> XLS
                                    </label>

                                    <!-- <label for="exportPdf">
                                        <input type="radio" id="exportContainerPdf" name="exportOption" value="pdf" /> PDF
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
            let mes: any = fecha.getMonth()+1; //obteniendo mes
            let dia: any = fecha.getDate(); //obteniendo dia
            let anio: any = fecha.getFullYear(); //obteniendo año
            if(dia<10)
                dia='0'+dia; //agrega cero si el menor de 10
            if(mes<10)
                mes='0'+mes //agrega cero si el menor de 10

            // @ts-ignore
            document.getElementById("start-date").value = anio+"-"+mes+"-"+dia;
            // @ts-ignore
            document.getElementById("end-date").value = anio+"-"+mes+"-"+dia;
            inputObserver();
            const _closeButton: InterfaceElement = document.getElementById('cancel');
            const exportButton: InterfaceElement = document.getElementById('export-data');
            const _dialog: InterfaceElement = document.getElementById('dialog-content');
            exportButton.addEventListener('click', async() => {
                const _values: any = {
                    exportOption: document.getElementsByName('exportOption'),
                    start: document.getElementById('start-date'),
                    end: document.getElementById('end-date'),
                }
                
                
                for (let i = 0; i < _values.exportOption.length; i++) {
                    let ele: any = _values.exportOption[i]
                    if (ele.type = "radio") {
    
                        if (ele.checked){
                            if(ele.id == "exportXls"){
                                const logs: any = await this.exportDetails(_values, "SERVICIO") //await getLogs()
                                // @ts-ignore
                                exportServiceXls(logs)
                            }else if(ele.id == "exportCsv"){
                                const logs: any = await this.exportDetails(_values, "SERVICIO")
                                // @ts-ignore
                                exportServiceCsv(logs)
                            }else if(ele.id == "exportPdf"){
                                // @ts-ignore
                                //exportServicePdf(logs)
                            }else if(ele.id == "exportContainerXls"){
                                const logs: any = await this.exportDetails(_values, "CONTENEDOR")
                                // @ts-ignore
                                exportContainerXls(logs)
                            }else if(ele.id == "exportContainerCsv"){
                                const logs: any = await this.exportDetails(_values, "CONTENEDOR")
                                // @ts-ignore
                                exportContainerCsv(logs)
                            }
                        }
                    }
                }
            })
            _closeButton.onclick = () => {
                new CloseDialog().x(_dialog);
            };
        });
    };

    private exportDetails = async (elements: InterfaceElement, mode: string) => {
        let response;
        if(mode == "SERVICIO"){
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
                        "value": `${elements.start.value}`
                      },
                      {
                        "property": "creationDate",
                        "operator": "<=",
                        "value": `${elements.end.value}`
                      }
                    ],
                    
                }, 
                sort: "-createdDate",
                fetchPlan: 'full',
                
            })
            if(infoPage.search != ""){
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
                            "value": `${elements.start.value}`
                          },
                          {
                            "property": "creationDate",
                            "operator": "<=",
                            "value": `${elements.end.value}`
                          }
                        ]
                      },
                    sort: "-createdDate",
                    fetchPlan: 'full',
                    
                })
            }
            response = await getFilterEntityData("Service", rawExport)
        }else if(mode == "CONTENEDOR"){
            let rawExport = JSON.stringify({
                "filter": {
                    "conditions": [
                      {
                        "property": "business.id",
                        "operator": "=",
                        "value": `${businessId}`
                      },
                      {
                        "property": "service.creationDate",
                        "operator": ">=",
                        "value": `${elements.start.value}`
                      },
                      {
                        "property": "service.creationDate",
                        "operator": "<=",
                        "value": `${elements.end.value}`
                      }
                    ],
                    
                }, 
                sort: "-createdDate",
                fetchPlan: 'full',
                
            })
            if(infoPage.search != ""){
                rawExport = JSON.stringify({
                    "filter": {
                        "conditions": [
                          {
                            "group": "OR",
                            "conditions": [
                                {
                                    "property": "service.name",
                                    "operator": "contains",
                                    "value": `${infoPage.search.toLowerCase()}`
                                  },
                                  {
                                    "property": "customer.name",
                                    "operator": "contains",
                                    "value": `${infoPage.search.toLowerCase()}`
                                  },
                                  {
                                    "property": "service.serviceState.name",
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
                            "property": "service.creationDate",
                            "operator": ">=",
                            "value": `${elements.start.value}`
                          },
                          {
                            "property": "service.creationDate",
                            "operator": "<=",
                            "value": `${elements.end.value}`
                          }
                        ]
                      },
                    sort: "-createdDate",
                    fetchPlan: 'full',
                    
                })
            }
            response = await getFilterEntityData("Charge", rawExport)
        }
        return response;
    }

    private pagination(items: [], limitRows: number, currentPage: number) {
        const tableBody: InterfaceElement = document.getElementById('datatable-body')
        const paginationWrapper: InterfaceElement = document.getElementById('pagination-container')
        paginationWrapper.innerHTML = ''

        let pageCount: number
        pageCount = Math.ceil(infoPage.count / limitRows)

        let button: InterfaceElement

        if(pageCount <= Config.maxLimitPage){
          for (let i = 1; i < pageCount + 1; i++) {
              button = setupButtons(
                  i /*, items, currentPage, tableBody, limitRows*/
              )

              paginationWrapper.appendChild(button)
          }
          fillBtnPagination(currentPage, Config.colorPagination)
        }else{
            pagesOptions(items, currentPage)  
        }

        function setupButtons(page: any /*, items: any, currentPage: number, tableBody: InterfaceElement, limitRows: number*/) {
            const button: InterfaceElement = document.createElement('button')
            button.classList.add('pagination_button')
            button.setAttribute("name", "pagination-button")
            button.setAttribute("id", "btnPag"+page)
            button.innerText = page

            button.addEventListener('click', (): void => {
                infoPage.offset = Config.tableRows * (page - 1)
                currentPage = page
                new Services().render(infoPage.offset, currentPage, infoPage.search)
            })

            return button
        }

      function pagesOptions(items: any, currentPage: any) {
          paginationWrapper.innerHTML = ''
          let pages = pageNumbers(items, Config.maxLimitPage, currentPage)
          
          const prevButton: InterfaceElement = document.createElement('button')
          prevButton.classList.add('pagination_button')
          prevButton.innerText = "<<"     
          paginationWrapper.appendChild(prevButton)

          const nextButton: InterfaceElement = document.createElement('button')
          nextButton.classList.add('pagination_button')
          nextButton.innerText = ">>"
  
          for (let i = 0; i < pages.length; i++) {
              if(pages[i] > 0 && pages[i] <= pageCount){
                  button = setupButtons(
                      pages[i]
                  )
                  paginationWrapper.appendChild(button)
              }
          }
          paginationWrapper.appendChild(nextButton)
          fillBtnPagination(currentPage, Config.colorPagination)
          setupButtonsEvents(prevButton, nextButton)
      }

      function setupButtonsEvents(prevButton: InterfaceElement, nextButton: InterfaceElement) {
          prevButton.addEventListener('click', (): void => {
            new Services().render(Config.offset, Config.currentPage, infoPage.search)
          })

          nextButton.addEventListener('click', (): void => {
            infoPage.offset = Config.tableRows * (pageCount - 1)
            new Services().render(infoPage.offset, pageCount, infoPage.search)
          })
      }
    }

    private selectClient(): void {

      const elementBtn: InterfaceElement = document.getElementById('btn-select-client')
      const elementText: InterfaceElement = document.getElementById('entity-client')
      //let offset = 0

          elementBtn.addEventListener('click', async (): Promise<void> => {
              modalTable(0, "", elementText)
          })

          async function modalTable(offset: any, search: any, element: InterfaceElement){
              const dialogContainer: InterfaceElement =
              document.getElementById('app-dialogs')
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
                  
              })
              if(search != ""){
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
                      
                  })
              }
              let dataModal = await getFilterEntityData("Customer", raw)
              const FData: Data = dataModal.filter((data: any) => data.id != element.dataset.optionid)
              dialogContainer.style.display = 'block'
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
              `
              inputObserver()
              const datetableBody: InterfaceElement = document.getElementById('datatable-modal-body')
              if (FData.length === 0) {
                  let row: InterfaceElement = document.createElement('tr')
                  row.innerHTML = `
                      <td>No hay datos</td>
                      <td></td>
                      <td></td>
                  `
                  datetableBody.appendChild(row)
              }
              else {
                  for (let i = 0; i < FData.length; i++) {
                      let client = FData[i]
                      let row: InterfaceElement =
                          document.createElement('tr')
                      row.innerHTML += `
                          <td>${client.name}</dt>
                          <td>${client?.ruc ?? ''}</dt>
                          <td class="entity_options">
                              <button class="button" id="edit-entity" data-entityId="${client.id}" data-entityName="${client.name}">
                                  <i class="fa-solid fa-arrow-up-right-from-square"></i>
                              </button>
                          </td>
                      `
                      datetableBody.appendChild(row)
                  }
              }
              const txtSearch: InterfaceElement = document.getElementById('search-modal')
              const btnSearchModal: InterfaceElement = document.getElementById('btnSearchModal')
              const _selectVehicle: InterfaceElement = document.querySelectorAll('#edit-entity')
              const _closeButton: InterfaceElement = document.getElementById('cancel')
              const _dialog: InterfaceElement = document.getElementById('dialog-content')
              const prevModalButton: InterfaceElement = document.getElementById('prevModal')
              const nextModalButton: InterfaceElement = document.getElementById('nextModal')

              txtSearch.value = search ?? ''


              _selectVehicle.forEach((edit: InterfaceElement) => {
                  const entityId = edit.dataset.entityid
                  const entityName = edit.dataset.entityname
                  edit.addEventListener('click', (): void => {
                      element.setAttribute('data-optionid', entityId)
                      element.setAttribute('value', `${entityName}`)
                      element.classList.add('input_filled')
                      new CloseDialog().x(_dialog)
                  })
              
              })

              btnSearchModal.onclick = () => {
                  modalTable(0, txtSearch.value, element)
              }

              _closeButton.onclick = () => {
                  new CloseDialog().x(_dialog)
              }

              nextModalButton.onclick = () => {
                  offset = Config.modalRows + (offset)
                  modalTable(offset, search, element)
              }

              prevModalButton.onclick = () => {
                if(offset > 0){
                  offset = (offset) - Config.modalRows
                  modalTable(offset, search, element)
                }
              }
          }

  }
  private selectCity(): void {
       
    const btnOrigin: InterfaceElement = document.getElementById('btn-select-city-origin')
    const btnDestiny: InterfaceElement = document.getElementById('btn-select-city-destiny') 
    //let offset = 0

        btnOrigin.addEventListener('click', async (): Promise<void> => {
            const origin: InterfaceElement = document.getElementById('entity-city-origin')
            modalTable(0, "", origin)
        })

        btnDestiny.addEventListener('click', async (): Promise<void> => {
            const destiny: InterfaceElement = document.getElementById('entity-city-destiny')
            modalTable(0, "", destiny)
        })

        async function modalTable(offset: any, search: any, element: InterfaceElement){
            const dialogContainer: InterfaceElement =
            document.getElementById('app-dialogs')
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
                
            })
            if(search != ""){
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
                    
                })
            }
            let dataModal = await getFilterEntityData("City", raw)
            dialogContainer.style.display = 'block'
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
            `
            inputObserver()
            const datetableBody: InterfaceElement = document.getElementById('datatable-modal-body')
            if (dataModal.length === 0) {
                let row: InterfaceElement = document.createElement('tr')
                row.innerHTML = `
                    <td>No hay datos</td>
                    <td></td>
                    <td></td>
                `
                datetableBody.appendChild(row)
            }
            else {
                for (let i = 0; i < dataModal.length; i++) {
                    let client = dataModal[i]
                    let row: InterfaceElement =
                        document.createElement('tr')
                    row.innerHTML += `
                        <td>${client.name}</dt>
                        <td class="entity_options">
                            <button class="button" id="edit-entity" data-entityId="${client.id}" data-entityName="${client.name}">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                            </button>
                        </td>
                    `
                    datetableBody.appendChild(row)
                }
            }
            const txtSearch: InterfaceElement = document.getElementById('search-modal')
            const btnSearchModal: InterfaceElement = document.getElementById('btnSearchModal')
            const _selectVehicle: InterfaceElement = document.querySelectorAll('#edit-entity')
            const _closeButton: InterfaceElement = document.getElementById('cancel')
            const _dialog: InterfaceElement = document.getElementById('dialog-content')
            const prevModalButton: InterfaceElement = document.getElementById('prevModal')
            const nextModalButton: InterfaceElement = document.getElementById('nextModal')

            txtSearch.value = search ?? ''


            _selectVehicle.forEach((edit: InterfaceElement) => {
                const entityId = edit.dataset.entityid
                const entityName = edit.dataset.entityname
                edit.addEventListener('click', (): void => {
                    element.setAttribute('data-optionid', entityId)
                    element.setAttribute('value', `${entityName}`)
                    element.classList.add('input_filled')
                    new CloseDialog().x(_dialog)
                })
            
            })

            btnSearchModal.onclick = () => {
                modalTable(0, txtSearch.value, element)
            }

            _closeButton.onclick = () => {
                new CloseDialog().x(_dialog)
            }

            nextModalButton.onclick = () => {
                offset = Config.modalRows + (offset)
                modalTable(offset, search, element)
            }

            prevModalButton.onclick = () => {
                if(offset > 0){
                    offset = (offset) - Config.modalRows
                    modalTable(offset, search, element)
                }
            }
        }

    }
    private sendEmail(entityDialogContainer: InterfaceElement): void {
       
        const check: InterfaceElement = document.querySelectorAll('#get-check')
        check.forEach((send: InterfaceElement) => {
            const entityId = send.dataset.entityid
            send.addEventListener('click', (): void => {
                modalMail('Service', entityId)
            })
        })
    
        async function modalMail(entity: any, entityID: any){
            let data = await getEntityData(entity, entityID)
            if(data.serviceState.name == "Asignada"){
                const dialogContainer: InterfaceElement =
                document.getElementById('app-dialogs')
                const patrols: any = await getDetails("service.id", entityID, "ServiceDetailV")
                const serviceState = await getNothing("name", "Confirmado", "ServiceState")
                dialogContainer.style.display = 'block'
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
                `
                inputObserver()
                
                const _closeButton: InterfaceElement = document.getElementById('cancel')
                const _emailButton: InterfaceElement = document.getElementById('email')
                const _dialog: InterfaceElement = document.getElementById('dialog-content')
                if(patrols != undefined){
                    const _listPatrol: InterfaceElement = document.getElementById('listPatrol')
                    _listPatrol.innerHTML = `<ul>`
                    patrols.forEach(async (patrol: any) => {
                        _listPatrol.innerHTML += `<li>${patrol.crew.name}</li>`
                    })
                    _listPatrol.innerHTML += `</ul>`
                }

                _closeButton.onclick = () => {
                    new CloseDialog().x(_dialog)
                }

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
                                sendMail(mailRaw)
                                if(patrols != undefined){
                                    patrols.forEach(async (patrol: any) => {
                                        //console.log(patrol)
                                        const crew: any = await getEntityData("Crew", patrol.crew.id)
                                        const dataPush = {"token": `${crew.crewOne.token}`, "title": `Inicio de Servicio: ${data?.name ?? ''}`, "body":`Servicio ${data?.name ?? ''} ha sido confirmado.`}
                                        //console.log(dataPush)
                                        await postNotificationPush(dataPush)
                                    })
                                }
                                eventLog('UPD', 'SERVICIO', `${data.name} confirmado`, data, `${serviceState.name}`)
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
                                })
                                registerEntity(raw, 'Control')
                                //eventLog('INS', 'CONTROL-CONFIRMACIÓN', `${data.name}`, data)
                                new CloseDialog().x(_dialog)
                                new Services().render(infoPage.offset, infoPage.currentPage, infoPage.search)
                            },1000)
                        });
                        
                    
                }
            }else if(data.serviceState.name != "Pendiente"){
                let control = await getSearch("service.id", entityID, "Control")
                let details = await getDetails("service.id", entityID, "DetailsObs")
                const allStatus: any = await getEntitiesData('ServiceState')
                let status: any = {
                    recepcion: allStatus.filter((data: any) => data.name === "Recepción"), //await getNothing("name", "Recepción", "ServiceState"),
                    ruta: allStatus.filter((data: any) => data.name === "En ruta"), //await getNothing("name", "En ruta", "ServiceState"),
                    entregado: allStatus.filter((data: any) => data.name === "Entregado"), //await getNothing("name", "Entregado", "ServiceState"),
                    terminado: allStatus.filter((data: any) => data.name === "Terminado"), //await getNothing("name", "Terminado", "ServiceState"),
                }
                
                if(control != undefined){
                    let fecha = new Date(); //Fecha actual
                    let mes: any = fecha.getMonth()+1; //obteniendo mes
                    let dia: any = fecha.getDate(); //obteniendo dia
                    let anio = fecha.getFullYear(); //obteniendo año
                    let _hours = fecha.getHours();
                    let _minutes = fecha.getMinutes();
                    let _fixedHours = ('0' + _hours).slice(-2);
                    let _fixedMinutes = ('0' + _minutes).slice(-2);
                    if(dia<10)
                        dia='0'+dia; //agrega cero si el menor de 10
                    if(mes<10)
                        mes='0'+mes //agrega cero si el menor de 10
                    
                    entityDialogContainer.innerHTML = ''
                    entityDialogContainer.style.display = 'flex'
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
                                    <input type="date" class="input_time input_time-start" id="origen-date" name="origen-date" value="${control?.arrivalOriginDate ?? anio+"-"+mes+"-"+dia}">
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
                    `

                    inputObserver()
                    const saveButton: InterfaceElement = document.getElementById('update-changes')
                    const inputsCollection: InterfaceElement = {
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
                    }
                    const currentUser = await getUserInfo()
                    
                    if(control?.arrivalOriginTime == undefined){
                        inputsCollection.startDate.disabled = true
                        inputsCollection.startTime.disabled = true
                        inputsCollection.destDate.disabled = true
                        inputsCollection.destTime.disabled = true
                        inputsCollection.endDate.disabled = true
                        inputsCollection.endTime.disabled = true
                        //inputsCollection.origenDate.focus()
                    }else if(control?.startingPointTime == undefined){
                        inputsCollection.origenDate.disabled = true
                        inputsCollection.origenTime.disabled = true
                        inputsCollection.startDate.value = anio+"-"+mes+"-"+dia
                        inputsCollection.startTime.value = `${_fixedHours}:${_fixedMinutes}`
                        inputsCollection.destDate.disabled = true
                        inputsCollection.destTime.disabled = true
                        inputsCollection.endDate.disabled = true
                        inputsCollection.endTime.disabled = true
                       //inputsCollection.startDate.focus()
                    }else if(control?.arrivalDestinationTime == undefined){
                        inputsCollection.origenDate.disabled = true
                        inputsCollection.origenTime.disabled = true
                        inputsCollection.startDate.disabled = true
                        inputsCollection.startTime.disabled = true
                        inputsCollection.destDate.value = anio+"-"+mes+"-"+dia
                        inputsCollection.destTime.value = `${_fixedHours}:${_fixedMinutes}`
                        inputsCollection.endDate.disabled = true
                        inputsCollection.endTime.disabled = true
                        //inputsCollection.destDate.focus()
                    }else if(control?.endServiceTime == undefined){

                        inputsCollection.origenDate.disabled = true
                        inputsCollection.origenTime.disabled = true
                        inputsCollection.startDate.disabled = true
                        inputsCollection.startTime.disabled = true
                        inputsCollection.destDate.disabled = true
                        inputsCollection.destTime.disabled = true
                        inputsCollection.endDate.value = anio+"-"+mes+"-"+dia
                        inputsCollection.endTime.value = `${_fixedHours}:${_fixedMinutes}`
                        saveButton.disabled = true
                        saveButton.innerHTML = "Espere un momento" 
                        status["vehicularState"] = await getNothing("name", "Asignado", "VehicularState")
                        status["userState"] = await getNothing("name", "Asignado", "UserState")
                        status["weaponState"] = await getNothing("name", "Asignado", "WeaponState")
                        status["nothingWeapon"] = await getNothing("name", "N/A", "Weapon")
                        status["nothingUser"] = await getNothing("username", "N/A", "User")
                        status["crewState"] = await getNothing("name", "Disponible", "CrewState")
                        status["userContainer"] = await getNothing("name", "Disponible", "UserState")
                        status["weaponContainer"] = await getNothing("name", "Disponible", "WeaponState")
                        //inputsCollection.endDate.focus()
                        saveButton.disabled = false
                        saveButton.innerHTML = "Guardar"
                    }
                    //console.log(status)
                    const closeButton: InterfaceElement = document.getElementById('close')
                    const editor: InterfaceElement = document.getElementById('entity-editor-container')
                    let node = 5
                    if(details != undefined){
                        node = details.length
                        for(let i=0; i<node; i++){
                            if(details[i]?.image !== undefined){
                                inputsCollection.containerObservation.innerHTML += `
                                <div class="material_input">
                                    <input type="search" class="input_filled" id="obs${i}" name="${details[i]?.id ?? ''}" value="${details[i]?.content ?? ''}">
                                    <label for="obs${i}"><i class="fa-solid fa-memo-circle-info"></i> Observación ${i+1}</label>
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
                                ` 
                            }else{
                                inputsCollection.containerObservation.innerHTML += `
                                <div class="material_input">
                                    <input type="search" class="input_filled" id="obs${i}" name="${details[i]?.id ?? ''}" value="${details[i]?.content ?? ''}">
                                    <label for="obs${i}"><i class="fa-solid fa-memo-circle-info"></i> Observación ${i+1}</label>
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
                                ` 
                            }
                        }
                    }else{
                        for(let i=0; i<node; i++){
                            inputsCollection.containerObservation.innerHTML += `
                            <div class="material_input">
                                <input type="search" class="input_filled" id="obs${i}" name="obs${i}">
                                <label for="obs${i}"><i class="fa-solid fa-memo-circle-info"></i> Observación ${i+1}</label>
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
                            ` 
                        }
                    }

                    const detailEvent = () => {
                        let saveDetail: InterfaceElement = document.querySelectorAll('#saveDetail')
                        saveDetail.forEach((obj: InterfaceElement) => {
                            const index = obj.dataset.index
                            obj.addEventListener('click', (): void => {
                                let obs: InterfaceElement = document.getElementById(`obs${index}`)
                                let date: InterfaceElement = document.getElementById(`date${index}`)
                                let span: InterfaceElement = document.getElementsByName(`saveDetail${index}`)[0]
                                if(details != undefined && details[index]?.id == obs.name){
                                    if(obs.value == ""){
                                        deleteEntity('DetailsObs', details[index].id)
                                        eventLog('DLT', 'SERVICIO-DETALLE', `${obs.value}, en servicio: ${data.name}`, data, `${data.serviceState.name}`)
                                        obs.placeholder = "(Eliminado)"
                                        obs.disabled = true
                                        span.innerText  = "Detalle eliminado"
                                        span.disabled = true
                                    }else if(obs.value != details[index].content){
                                        let raw = JSON.stringify({
                                            "content": `${obs.value.trim()}`,
                                            "user": {
                                                "id": `${currentUser.attributes.id}`
                                            }
                                        })
                                        updateEntity('DetailsObs', details[index].id, raw)
                                        eventLog('UPD', 'SERVICIO-DETALLE', `${obs.value}, en servicio: ${data.name}`, data, `${data.serviceState.name}`)
                                        obs.disabled = true
                                        span.innerText  = "Detalle actualizado"
                                        span.disabled = true
                                    }
                                }else{
                                    let fecha = currentDateTime().date
                                    let hora = currentDateTime().time
                                    if(obs.value != ""){
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
                                        })
                                        registerEntity(raw, 'DetailsObs')
                                        eventLog('INS', 'SERVICIO-DETALLE', `${obs.value}, en servicio: ${data.name}`, data, `${data.serviceState.name}`)
                                        obs.disabled = true
                                        date.value=`${fecha} || ${hora}`
                                        span.innerText  = "Detalle guardado"
                                        span.disabled = true
                                    }
                                }
                            })
                        })
                        const viewZoom: InterfaceElement = document.querySelectorAll('#viewImage')
                        viewZoom.forEach((image: InterfaceElement) => {
                            const entityId = image.dataset.entityid
                            image.addEventListener('click', async (): Promise<void> => {
                                const close: InterfaceElement = document.getElementById("close-modalZoom");
                                const modalZoom: InterfaceElement = document.getElementById('modalZoom')
                                //this.dialogContainer.style.display = 'block'
                                //this.dialogContainer.innerHTML = modalZoomImage
                                const editor: InterfaceElement = document.getElementById('entity-editor-container')
                                editor.style.display = 'none'
                                const img01: InterfaceElement = document.getElementById('img01')
                                const caption: InterfaceElement = document.getElementById('caption')
                                modalZoom.style.display = 'block'
                                img01.src = await getFile(entityId);
                                caption.innerHTML = `Imagen`

                                close.addEventListener('click', (): void => {
                                    modalZoom.style.display = 'none'
                                    const editor: InterfaceElement = document.getElementById('entity-editor-container')
                                    editor.style.display = 'flex'
                                })
                            })
                        })
                    }
                        
                    detailEvent()
                    inputsCollection.buttonAdd.addEventListener('click', () => {
                        const br: InterfaceElement = document.createElement('br')
                        const br1: InterfaceElement = document.createElement('br')
                        /*const div2: InterfaceElement = document.createElement('div')
                        div2.classList.add('input_detail')
                        div2.innerHTML = `
                            <label for="saveDetail"><i class="fa-solid fa-floppy-disk"></i></label>
                            <input type="text" id="saveDetail" name="saveDetail${node}" data-index="${node}" class="input_filled" value="Guardar" readonly>
                        `*/
                        const div2: InterfaceElement = document.createElement('div')
                        div2.style.textAlign = "right"
                        div2.innerHTML = `
                            <button id="saveDetail" name="saveDetail${node}" data-index="${node}" style="font-weight:bold; font-size:12px; color: white; background-color: #008CBA;; border: 2px solid #000000; border-radius: 8px; padding: 5px 24px;"><i class="fa-solid fa-floppy-disk" style="color:white; font-size:12px;"></i>. Guardar</button>
                        `
                        const div3: InterfaceElement = document.createElement('div')
                        div3.classList.add('input_detail')
                        div3.innerHTML = `
                            <label for="date${node}"><i class="fa-solid fa-calendar"></i></label>
                            <input type="text" id="date${node}" class="input_filled" name="date${node}" readonly>  
                        `  
                        const div: InterfaceElement = document.createElement('div')
                        div.classList.add('material_input')
                        div.innerHTML = `
                            <input type="search" class="input_filled" id="obs${node}" name="obs${node}">
                            <label for="obs${node}"><i class="fa-solid fa-memo-circle-info"></i> Observación ${node+=1}</label>
                        `  
                        inputsCollection.containerObservation.appendChild(div)
                        inputsCollection.containerObservation.appendChild(div3)
                        inputsCollection.containerObservation.appendChild(div2)
                        
                        inputsCollection.containerObservation.appendChild(br)
                        inputsCollection.containerObservation.appendChild(br1)

                        detailEvent()
                    })

                    
                    
                     
                    closeButton.addEventListener('click', () => {
                        //console.log('close')
                        new CloseDialog().x(editor)
                    })

                    saveButton.addEventListener('click', async () => {
                        if((Date.parse(`${inputsCollection.origenDate.value} ${inputsCollection.origenTime.value}`) > Date.parse(`${inputsCollection.startDate.value} ${inputsCollection.startTime.value}`)) && (control?.startingPointTime != undefined || inputsCollection.startTime.value != '')){
                            alert("Fecha origen mayor a la de inicio")
                        }else if((Date.parse(`${inputsCollection.startDate.value} ${inputsCollection.startTime.value}`) > Date.parse(`${inputsCollection.destDate.value} ${inputsCollection.destTime.value}`)) && (control?.arrivalDestinationTime != undefined || inputsCollection.destTime.value != '')){
                            alert("Fecha inicio mayor a la de destino")
                        }else if((Date.parse(`${inputsCollection.destDate.value} ${inputsCollection.destTime.value}`) > Date.parse(`${inputsCollection.endDate.value} ${inputsCollection.endTime.value}`)) && (control?.endServiceTime != undefined || inputsCollection.endTime.value != '')){
                            alert("Fecha destino mayor a la de finalización")
                        }else{
                            setTimeout(async () => {
                                let raws = []
                                let rawStatus = ''
                                let events = []
                                if(inputsCollection.origenTime.value != control?.arrivalOriginTime && inputsCollection.origenTime.value != ''){       
                                    raws.push(
                                        JSON.stringify({
                                            "arrivalOriginDate": `${inputsCollection.origenDate.value}`,
                                            "arrivalOriginTime": `${inputsCollection.origenTime.value}`,
                                            "originUser": {
                                                "id": `${currentUser.attributes.id}`
                                            },
                                        })
                                    )
                                    if(data.serviceState.name == 'Confirmado'){
                                        rawStatus = JSON.stringify({
                                            "serviceState": {
                                                "id": `${status.recepcion[0].id}`
                                            },
                                        })  
                                        events.push({
                                            value: `${data.name} recepción: ${inputsCollection.origenDate.value} ${inputsCollection.origenTime.value}`,
                                            title: `SERVICIO`,
                                            service: data,
                                            aditionalData: {
                                                status: `${status.recepcion[0].name}`,
                                                statusDate: `${inputsCollection.origenDate.value}`,
                                                statusTime: `${inputsCollection.origenTime.value}`
                                            }
                                        })
                                    }else{
                                        events.push({
                                            value: `${data.name} recepción actualizado: ${inputsCollection.origenDate.value} ${inputsCollection.origenTime.value}`,
                                            title: `SERVICIO`,
                                            service: data,
                                            aditionalData: {
                                                status: `${status.recepcion[0].name}`,
                                                statusDate: `${inputsCollection.origenDate.value}`,
                                                statusTime: `${inputsCollection.origenTime.value}`
                                            }
                                        })
                                    }
                                }

                                if(inputsCollection.startTime.value != control?.startingPointTime && inputsCollection.startTime.value != ''){
                                    raws.push(
                                        JSON.stringify({
                                            "startingPointDate": `${inputsCollection.startDate.value}`,
                                            "startingPointTime": `${inputsCollection.startTime.value}`,
                                            "startUser": {
                                                "id": `${currentUser.attributes.id}`
                                            },
                                        })
                                    )
                                    if(data.serviceState.name == 'Recepción'){
                                        rawStatus = JSON.stringify({
                                            "serviceState": {
                                                "id": `${status.ruta[0].id}`
                                            },
                                        })  
                                        events.push({
                                            value: `${data.name} en ruta: ${inputsCollection.startDate.value} ${inputsCollection.startTime.value}`,
                                            title: `SERVICIO`,
                                            service: data,
                                            aditionalData: {
                                                status: `${status.ruta[0].name}`,
                                                statusDate: `${inputsCollection.startDate.value}`,
                                                statusTime: `${inputsCollection.startTime.value}`
                                            }
                                        })
                                    }else{
                                        events.push({
                                            value: `${data.name} en ruta actualizado: ${inputsCollection.startDate.value} ${inputsCollection.startTime.value}`,
                                            title: `SERVICIO`,
                                            service: data,
                                            aditionalData: {
                                                status: `${status.ruta[0].name}`,
                                                statusDate: `${inputsCollection.startDate.value}`,
                                                statusTime: `${inputsCollection.startTime.value}`
                                            }
                                        })
                                    }
                                }
                                
                                if(inputsCollection.destTime.value != control?.arrivalDestinationTime && inputsCollection.destTime.value != ''){
                                    raws.push(
                                        JSON.stringify({
                                            "arrivalDestinationDate": `${inputsCollection.destDate.value}`,
                                            "arrivalDestinationTime": `${inputsCollection.destTime.value}`,
                                            "destinationUser": {
                                                "id": `${currentUser.attributes.id}`
                                            },
                                        })
                                    )
                                    if(data.serviceState.name == 'En ruta'){
                                        rawStatus = JSON.stringify({
                                            "serviceState": {
                                                "id": `${status.entregado[0].id}`
                                            },
                                        })  
                                        events.push({
                                            value: `${data.name} entregado: ${inputsCollection.destDate.value} ${inputsCollection.destTime.value}`,
                                            title: `SERVICIO`,
                                            service: data,
                                            aditionalData: {
                                                status: `${status.entregado[0].name}`,
                                                statusDate: `${inputsCollection.destDate.value}`,
                                                statusTime: `${inputsCollection.destTime.value}`
                                            }
                                        })
                                    }else{
                                        events.push({
                                            value: `${data.name} entregado actualizado: ${inputsCollection.destDate.value} ${inputsCollection.destTime.value}`,
                                            title: `SERVICIO`,
                                            service: data,
                                            aditionalData: {
                                                status: `${status.entregado[0].name}`,
                                                statusDate: `${inputsCollection.destDate.value}`,
                                                statusTime: `${inputsCollection.destTime.value}`
                                            }
                                        })
                                    }
                                }

                                if(inputsCollection.endTime.value != control?.endServiceTime && inputsCollection.endTime.value != ''){
                                    raws.push(
                                        JSON.stringify({
                                            "endServiceDate": `${inputsCollection.endDate.value}`,
                                            "endServiceTime": `${inputsCollection.endTime.value}`,
                                            "endUser": {
                                                "id": `${currentUser.attributes.id}`
                                            },
                                        })
                                    )
                                    if(data.serviceState.name == 'Entregado'){
                                        rawStatus = JSON.stringify({
                                            "serviceState": {
                                                "id": `${status.terminado[0].id}`
                                            },
                                        })  
                                        events.push({
                                            value: `${data.name} terminado: ${inputsCollection.endDate.value} ${inputsCollection.endTime.value}`,
                                            title: `SERVICIO`,
                                            service: data,
                                            aditionalData: {
                                                status: `${status.terminado[0].name}`,
                                                statusDate: `${inputsCollection.endDate.value}`,
                                                statusTime: `${inputsCollection.endTime.value}`
                                            }
                                        })

                                        /*const aditionalData = {
                                            status: `${status.terminado[0].name}`,
                                            statusDate: `${inputsCollection.endDate.value}`,
                                            statusTime: `${inputsCollection.endTime.value}`
                                        }*/
                                        const patrols: any = await getDetails("service.id", data.id, "ServiceDetailV")
                                        const containers: any = await getDetails("service.id", data.id, "Charge")

                                        //Patrulla
                                        if(patrols != undefined){
                                            patrols.forEach(async (patrol: any) => {
                                                let crew: any = await getEntityData('Crew', patrol.crew.id)
                                                getUpdateState(status.crewState.id, 'Crew', patrol.crew.id)
                                                eventLog('UPD', `PATRULLA`, `${patrol.crew.name} disponible`, '')
                                                let dataArray = []
                                                if(crew?.vehicular?.id){
                                                    dataArray.push({
                                                        id: crew.vehicular.id,
                                                        value: `${crew.vehicular.type} [${crew.vehicular.licensePlate}]`,
                                                        table: "Vehicular",
                                                        state: status.vehicularState.id,
                                                        title: "VEHÍCULO"
                                                    })
                                                }
                                                if(crew?.crewOne?.id != status.nothingUser.id || crew?.crewOne?.username != 'N/A'){
                                                    dataArray.push({
                                                        id: crew?.crewOne.id,
                                                        value: `${crew?.crewOne.username}`,
                                                        table: "User",
                                                        state: status.userState.id,
                                                        title: "SUPERVISOR"
                                                    })
                    
                                                    if(crew?.weaponOne?.id != status.nothingWeapon.id || crew?.weaponOne?.name != 'N/A'){
                                                        dataArray.push({
                                                            id: crew?.weaponOne.id,
                                                            value: `${crew?.weaponOne.name} [${crew?.weaponOne.licensePlate}]`,
                                                            table: "Weapon",
                                                            state: status.weaponState.id,
                                                            title: "ARMA"
                                                        })
                                                    }
                                                }
                                                let users = [crew?.crewTwo, crew?.crewThree, crew?.crewFour, crew?.crewFive]
                                                let weapons = [crew?.weaponTwo, crew?.weaponThree, crew?.weaponFour, crew?.weaponFive]
                                                for(let i = 0; i < 4; i++){
                                                    if(users[i]?.id != status.nothingUser.id || users[i]?.username != 'N/A'){
                                                        dataArray.push({
                                                            id: users[i].id,
                                                            value: `${users[i].username}`,
                                                            table: "User",
                                                            state: status.userState.id,
                                                            title: "GUARDIA"
                                                        })
                        
                                                        if(weapons[i]?.id != status.nothingWeapon.id || weapons[i]?.name != 'N/A'){
                                                            dataArray.push({
                                                                id: weapons[i].id,
                                                                value: `${weapons[i].name} [${weapons[i].licensePlate}]`,
                                                                table: "Weapon",
                                                                state: status.weaponState.id,
                                                                title: "ARMA"
                                                            })
                                                        }
                                                    }
                                                }
                                                for(let i = 0; i < dataArray.length; i++){
                                                getUpdateState(dataArray[i].state, dataArray[i].table, dataArray[i].id)
                                                eventLog('UPD', `${dataArray[i].title}`, `${dataArray[i].value} asignado`, '')
                                                }
                                                //eventLog('DLT', 'SERVICIO-PATRULLA', `${patrol.crew.name}, en servicio: ${data.name}`, data, aditionalData)
                                                //deleteEntity('ServiceDetailV', patrol.id)
                                            })
                                        }

                                        //Contenedor
                                        if(containers != undefined){
                                            containers.forEach((container: any) => {
                                                let dataArray = []
                                        
                                                if(container.companion?.id != status.nothingUser.id || container.companion?.username != 'N/A'){
                                                    dataArray.push({
                                                        id: container.companion.id,
                                                        value: `${container.companion.username}`,
                                                        table: "User",
                                                        state: status.userContainer.id,
                                                        title: "GUARDIA"
                                                    })

                                                    if(container.weapon?.id != status.nothingWeapon.id || container.weapon?.name != 'N/A'){
                                                        dataArray.push({
                                                            id: container.weapon.id,
                                                            value: `${container.weapon.name} [${container.weapon.licensePlate}]`,
                                                            table: "Weapon",
                                                            state: status.weaponContainer.id,
                                                            title: "ARMA"
                                                        })
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
                                                

                                                for(let i = 0; i < dataArray.length; i++){
                                                    getUpdateState(dataArray[i].state, dataArray[i].table, dataArray[i].id)
                                                    eventLog('UPD', `${dataArray[i].title}`, `${dataArray[i].value} disponible`, '')
                                                }
                                                
                                                //deleteEntity('Charge', container.id)
                                            })
                                        }
    
                                    }else{
                                        events.push({
                                            value: `${data.name} terminado actualizado: ${inputsCollection.endDate.value} ${inputsCollection.endTime.value}`,
                                            title: `SERVICIO`,
                                            service: data,
                                            aditionalData: {
                                                status: `${status.terminado[0].name}`,
                                                statusDate: `${inputsCollection.endDate.value}`,
                                                statusTime: `${inputsCollection.endTime.value}`
                                            }
                                        })
                                    }
                                }

                                if(rawStatus != ''){
                                    await updateEntity('Service', data.id, rawStatus)
                                }
                                for(let i= 0; i < raws.length; i++){
                                    let raw = raws[i]
                                    let event = events[i]
                                    updateEntity('Control', control.id, raw)
                                    eventLog('UPD', `${event.title}`, `${event.value}`, event.service, event.aditionalData)
                                }
                                
                                new CloseDialog().x(editor)
                                new Services().render(infoPage.offset, infoPage.currentPage, infoPage.search)
                            },1000)
                        }
                    })
                }
            }
            
        }
    
    }
}