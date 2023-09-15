// @filename: Departments.ts

import { deleteEntity, registerEntity, getFilterEntityData, getFilterEntityCount, getEntityData, updateEntity } from "../../endpoints.js"
import { inputObserver, inputSelect, CloseDialog, filterDataByHeaderType, pageNumbers, fillBtnPagination, userPermissions, getNothing, inputSelectType, currentDateTime, eventLog, getSearch, getDetails, getUpdateState } from "../../tools.js"
import { Data, InterfaceElement } from "../../types.js"
import { Config } from "../../Configs.js"
import { tableLayout } from "./Layout.js"
import { tableLayoutTemplate } from "./Template.js"
import { Patrols } from "./patrols/Patrols.js"
import { Charges } from "./containers/Containers.js"

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
                <td>${service?.outputDate ?? ''} ${service?.outputTime ?? ''}</dt>
                <td>${service?.custodyType ?? ''}</dt>
                <td class="tag"><span>${service?.serviceState?.name ?? ''}</span></td>
                <td class="entity_options">

                    <button class="button" id="get-email" data-entityId="${service.id}">
                        <i class="fa-solid fa-envelope"></i>
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
                </td>
        `
                table.appendChild(row)
            }
        }
        
        this.getVehicles()
        this.getContainers()
        this.register()
        this.edit(this.entityDialogContainer, data)
        this.sendEmail()
        this.remove()
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
                        eventLog('INS', 'SERVICIO', `${parse.name}`, '')
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
                          eventLog('UPD', 'SERVICIO', `${parse.name}`, service)
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

            patrol.addEventListener('click', (): void => {
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
                    
                    if(data.serviceState.name == "Pendiente" || data.serviceState.name == "Finalizado"){
                      const patrols: any = await getDetails("service.id", entityId, "ServiceDetailV")
                      const containers: any = await getDetails("service.id", entityId, "Charge")
                      deleteEntity('Service', entityId)
                        .then(async res => {
                          eventLog('DLT', 'SERVICIO', `${entityName}`, data)
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
                                let users = [crew?.crewOne, crew?.crewTwo, crew?.crewThree, crew?.crewFour, crew?.crewFive]
                                let weapons = [crew?.weaponOne, crew?.weaponTwo, crew?.weaponThree, crew?.weaponFour, crew?.weaponFive]
                                for(let i = 0; i < 5; i++){
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
                                eventLog('UPD', `${dataArray[i].title}`, `${dataArray[i].value} disponible`, '')
                                }
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
                            })
                          }
                          
                          new Services().render(infoPage.offset, infoPage.currentPage, infoPage.search)
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

    public close(): void {
        const closeButton: InterfaceElement = document.getElementById('close')
        const editor: InterfaceElement = document.getElementById('entity-editor-container')

        closeButton.addEventListener('click', () => {
            //console.log('close')
            new CloseDialog().x(editor)
        })
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
        
      const element: InterfaceElement = document.getElementById('entity-client')
      //let offset = 0

          element.addEventListener('click', async (): Promise<void> => {
              modalTable(0, "")
          })

          async function modalTable(offset: any, search: any){
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
                  modalTable(0, txtSearch.value)
              }

              _closeButton.onclick = () => {
                  new CloseDialog().x(_dialog)
              }

              nextModalButton.onclick = () => {
                  offset = Config.modalRows + (offset)
                  modalTable(offset, search)
              }

              prevModalButton.onclick = () => {
                  offset = Config.modalRows - (offset)
                  modalTable(offset, search)
              }
          }

  }
  private selectCity(): void {
       
    const origin: InterfaceElement = document.getElementById('entity-city-origin')
    const destiny: InterfaceElement = document.getElementById('entity-city-destiny')
    //let offset = 0

        origin.addEventListener('click', async (): Promise<void> => {
            modalTable(0, "", origin)
        })

        destiny.addEventListener('click', async (): Promise<void> => {
            modalTable(0, "", destiny)
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
                                }
                            ]
                          },
                          {
                            "property": "business.id",
                            "operator": "=",
                            "value": `${businessId}`
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
                offset = Config.modalRows - (offset)
                modalTable(offset, search, element)
            }
        }

    }
    private sendEmail(): void {
       
        const email: InterfaceElement = document.querySelectorAll('#get-email')
        email.forEach((send: InterfaceElement) => {
            const entityId = send.dataset.entityid
            send.addEventListener('click', (): void => {
                modalMail('Service', entityId)
            })
        })
    
        async function modalMail(entity: any, entityID: any){
            const dialogContainer: InterfaceElement =
            document.getElementById('app-dialogs')
            let data = await getEntityData(entity, entityID)
            const patrols: any = await getDetails("service.id", entityID, "ServiceDetailV")
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
                                    <label for="creation-date"><i class="fa-solid fa-desktop"></i> Código de servicio: ${data.id}</label> 
                                </div>
                                <br>
                                <div class="input_detail">
                                    <label for="creation-date"><i class="fa-solid fa-earth-americas"></i> Ciudad Origen: ${data.cityOrigin.name}</label>
                                </div>
                                <div class="input_detail">
                                    <label for="creation-date"><i class="fa-solid fa-earth-americas"></i> Ciudad Destino: ${data.cityDestination.name}</label>
                                </div>
                                <div class="input_detail">
                                    <label for="creation-date"><i class="fa-solid fa-location-arrow"></i> Lugar Origen: ${data.placeOrigin}</label>
                                </div>
                                <div class="input_detail">
                                    <label for="creation-date"><i class="fa-solid fa-location-arrow"></i> Lugar Destino: ${data.placeDestination}</label>
                                </div>
                                <div class="input_detail">
                                    <label for="creation-date"><i class="fa-solid fa-buildings"></i> Cliente: ${data.customer?.name ?? ''}</label>
                                </div>
                                <div class="input_detail">
                                    <label for="creation-date"><i class="fa-solid fa-desktop"></i> Solicitante: ${data?.name ?? ''}</label>
                                </div>
                                <div class="input_detail">
                                    <label for="creation-date"><i class="fa-solid fa-calendar"></i> FH_Servicio: ${data?.outputDate ?? ''} ${data?.outputTime ?? ''}</label>
                                </div>
                                <div class="input_detail">
                                    <label for="creation-date"><i class="fa-solid fa-info"></i> Referencia Cliente: ${data?.reference ?? ''}</label>
                                </div>
                                <div class="input_detail">
                                    <label for="creation-date"><i class="fa-solid fa-shield"></i> Tipo de Custodia: ${data?.custodyType ?? ''}</label>
                                </div>
                                <div class="input_detail">
                                    <label for="creation-date"><i class="fa-solid fa-truck-container"></i> # Contenedores: ${data?.quantyContainers ?? '0'}</label>
                                </div>
                                <div class="input_detail">
                                    <label for="creation-date"><i class="fa-solid fa-car"></i> # Vehículos: ${data?.quantyVehiculars ?? '0'}</label>
                                </div>
                                <div id="listPatrol"></div>
                            </div>

                            <div class="dialog_footer">
                                <button class="btn btn_danger" id="cancel">Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `
            inputObserver()
            
            const _closeButton: InterfaceElement = document.getElementById('cancel')
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

            
        }
    
    }
}