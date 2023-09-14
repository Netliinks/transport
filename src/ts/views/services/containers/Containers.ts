// @filename: Departments.ts

import { deleteEntity, registerEntity, getFilterEntityData, getFilterEntityCount, getEntityData, updateEntity } from "../../../endpoints.js"
import { inputObserver, inputSelect, CloseDialog, filterDataByHeaderType, pageNumbers, fillBtnPagination, userPermissions, getNothing, inputSelectType, currentDateTime, eventLog, getUpdateState } from "../../../tools.js"
import { Data, InterfaceElement } from "../../../types.js"
import { Config } from "../../../Configs.js"
import { tableLayout } from "./Layout.js"
import { tableLayoutTemplate } from "./Template.js"

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
let serviceId: any
const getContainers = async (idService: any): Promise<void> => {
    //const departmentRaw: any = await getEntitiesData('Department')
    //const department = departmentRaw.filter((data: any) => `${data.customer?.id}` === `${customerId}`)
    serviceId = await getEntityData("Service", idService)
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
                        "property": "transportCompany",
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
        })
    }
    infoPage.count = await getFilterEntityCount("Charge", raw)
    dataPage = await getFilterEntityData("Charge", raw)
    return dataPage

}

export class Charges {
    private dialogContainer: InterfaceElement =
        document.getElementById('app-dialogs')

    private entityDialogContainer: InterfaceElement =
        document.getElementById('entity-editor-container')

    private content: InterfaceElement =
        document.getElementById('datatable-container') 

    public async render(offset: any, actualPage: any, search: any, idService: any): Promise<void> {
        infoPage.offset = offset
        infoPage.currentPage = actualPage
        infoPage.search = search   
        this.content.innerHTML = ''
        this.content.innerHTML = tableLayout
        const tableBody: InterfaceElement = document.getElementById('datatable-body')
        const subtitle: InterfaceElement = document.getElementById('datatable_subtitle')   
        tableBody.innerHTML = '.Cargando...'
        //const service: any = await getEntityData('Service', idService)
        let data: any = await getContainers(idService)
        subtitle.innerText = `Servicio: ${serviceId.name}`
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
                let container = paginatedItems[i]
                let row: InterfaceElement =
                    document.createElement('tr')
                row.innerHTML += `
                <td>${container.name ?? ''}</dt>
                <td>${container?.licensePlate ?? ''}</dt>
                <td>${container?.driver ?? ''}</dt>
                <td>${container?.dniDriver ?? ''}</dt>
                <td>${container?.transportCompany ?? ''}</dt>
                <td class="entity_options">

                    <button class="button" id="remove-entity" data-entityId="${container.id}" data-entityName="${container.name}" data-entityPlate="${container.licensePlate}" style="display:${userPermissions().style};">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
        `
                table.appendChild(row)
            }
        }

        this.register()
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
            new Charges().render(Config.offset , Config.currentPage, search.value.toLowerCase().trim(), serviceId.id)
        })
    }

    public register() {
        // register entity
        const openEditor: InterfaceElement = document.getElementById('new-entity')
        openEditor.addEventListener('click', (): void => {
            if((infoPage.count + 1) <= serviceId.quantyContainers){
                renderInterface()
            }else{
                alert(`El servicio ha sido registrado con ${serviceId.quantyContainers} conetedor(es)`)
            }
            
        })

        const renderInterface = async (): Promise<void> => {
            const nothingConfig = {
              userState: await getNothing("name", "En servicio", "UserState"),
              weaponState: await getNothing("name", "En servicio", "WeaponState"),
              nothingWeapon: await getNothing("name", "N/A", "Weapon"),
              nothingUser: await getNothing("username", "N/A", "User"),
            }
            this.entityDialogContainer.innerHTML = ''
            this.entityDialogContainer.style.display = 'flex'
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
            <label for="entity-name"><i class="fa-solid fa-truck-container"></i> Nombre</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-licensePlate" autocomplete="none">
            <label for="entity-licensePlate"><i class="fa-solid fa-address-card"></i> Placa</label>
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
            <input type="text" id="entity-guard" data-optionid="${nothingConfig.nothingUser.id}" value="${nothingConfig.nothingUser.username}">
            <label for="entity-guard"><i class="fa-solid fa-user-police"></i> Guardia</label>
            </div>

            <div class="material_input">
            <input type="text" id="entity-weapon" data-optionid="${nothingConfig.nothingWeapon.id}" value="${nothingConfig.nothingWeapon.name}">
            <label for="entity-weapon"><i class="fa-solid fa-gun"></i> Arma</label>
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
            this.selectUser()
            this.selectWeapon()
            this.close()

            const registerButton: InterfaceElement = document.getElementById('register-entity')
            registerButton.addEventListener('click', (): void => {
                const inputsCollection: any = {
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
                }

                let dataArray: any = []
                if(inputsCollection.guard.dataset.optionid != nothingConfig.nothingUser.id || inputsCollection.guard.value != "N/A"){
                  dataArray.push({
                      id: inputsCollection.guard.dataset.optionid,
                      value: inputsCollection.guard.value,
                      table: "User",
                      state: nothingConfig.userState.id,
                      title: "GUARDIA"
                  })
                  if(inputsCollection.weapon.dataset.optionid != nothingConfig.nothingWeapon.id || inputsCollection.weapon.value != "N/A"){
                    dataArray.push({
                        id: inputsCollection.weapon.dataset.optionid,
                        value: inputsCollection.weapon.value,
                        table: "Weapon",
                        state: nothingConfig.weaponState.id,
                        title: "ARMA"
                    })
                  }
                }else{
                  inputsCollection.weapon.dataset.optionid = nothingConfig.nothingWeapon.id
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
                    "companion": {
                      "id": `${inputsCollection.guard.dataset.optionid}`
                    },
                    "weapon": {
                      "id": `${inputsCollection.weapon.dataset.optionid}`
                    }
                })
                if(inputsCollection.name.value === '' || inputsCollection.name.value === undefined){
                    alert("¡Nombre vacío!")
                }else if(inputsCollection.licensePlate.value === '' || inputsCollection.licensePlate.value === undefined){
                    alert("¡Placa vacía!")
                }else{
                  registerEntity(raw, 'Charge').then((res) => {
                    setTimeout(async () => {
                        let parse = JSON.parse(raw);
                        eventLog('INS', 'SERVICIO-CONTENEDOR', `${parse.name} [${parse.licensePlate}]`, serviceId)
                        for(let i = 0; i < dataArray.length; i++){
                          getUpdateState(dataArray[i].state, dataArray[i].table, dataArray[i].id)
                          eventLog('UPD', `${dataArray[i].title}`, `${dataArray[i].value} (contenedor)  en servicio: ${serviceId.name}`, serviceId)
                        }
                        const container: InterfaceElement = document.getElementById('entity-editor-container')

                        new CloseDialog().x(container)
                        new Charges().render(Config.offset, Config.currentPage, infoPage.search, serviceId.id)
                    }, 1000)
                  })
                }
            })

        }

        const reg = async (raw: any) => {
        }
    }

    public remove() {
        const remove: InterfaceElement = document.querySelectorAll('#remove-entity')
        remove.forEach((remove: InterfaceElement) => {

            const entityId = remove.dataset.entityid
            const entityName = remove.dataset.entityname
            const entityPlate = remove.dataset.entityplate

            remove.addEventListener('click', async (): Promise<void> => {
              const nothingConfig = {
                userState: await getNothing("name", "Disponible", "UserState"),
                weaponState: await getNothing("name", "Disponible", "WeaponState"),
                nothingWeapon: await getNothing("name", "N/A", "Weapon"),
                nothingUser: await getNothing("username", "N/A", "User"),
              }
                this.dialogContainer.style.display = 'flex'
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
        `

                // delete button
                // cancel button
                // dialog content
                const deleteButton: InterfaceElement = document.getElementById('delete')
                const cancelButton: InterfaceElement = document.getElementById('cancel')
                const dialogContent: InterfaceElement = document.getElementById('dialog-content')

                deleteButton.onclick = async () => {
                    const data: any = await getEntityData('Charge', entityId)
                    if(serviceId.serviceState.name == "Pendiente" || serviceId.serviceState.name == "Finalizado"){
                      deleteEntity('Charge', entityId)
                        .then(async res => {
                          eventLog('DLT', 'SERVICIO-CONTENEDOR', `${entityName} [${entityPlate}]`, serviceId)
                        
                          let dataArray = []
                
                          if(data.companion?.id != nothingConfig.nothingUser.id || data.companion?.username != 'N/A'){
                            dataArray.push({
                                id: data.companion.id,
                                value: `${data.companion.username}`,
                                table: "User",
                                state: nothingConfig.userState.id,
                                title: "GUARDIA"
                            })

                          if(data.weapon?.id != nothingConfig.nothingWeapon.id || data.weapon?.name != 'N/A'){
                              dataArray.push({
                                  id: data.weapon.id,
                                  value: `${data.weapon.name} [${data.weapon.licensePlate}]`,
                                  table: "Weapon",
                                  state: nothingConfig.weaponState.id,
                                  title: "ARMA"
                              })
                            }
                          }
                          

                          for(let i = 0; i < dataArray.length; i++){
                            getUpdateState(dataArray[i].state, dataArray[i].table, dataArray[i].id)
                            eventLog('UPD', `${dataArray[i].title}`, `${dataArray[i].value} disponible`, '')
                          }
                          new Charges().render(infoPage.offset, infoPage.currentPage, infoPage.search, serviceId.id)
                        })
                    }else{
                      alert("No se puede eliminar una patrulla en servicio.")
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
                new Charges().render(infoPage.offset, currentPage, infoPage.search, serviceId.id)
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
            new Charges().render(Config.offset, Config.currentPage, infoPage.search, serviceId.id)
          })

          nextButton.addEventListener('click', (): void => {
            infoPage.offset = Config.tableRows * (pageCount - 1)
            new Charges().render(infoPage.offset, pageCount, infoPage.search, serviceId.id)
          })
      }
    }

    private selectWeapon(): void {
        
      const waepon: InterfaceElement = document.getElementById('entity-weapon')

          waepon.addEventListener('click', async (): Promise<void> => {
              modalTable(0, "", waepon)
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
                      
                  })
              }
              let dataModal = await getFilterEntityData("Weapon", raw)
              const Fwaepon: Data = dataModal.filter((data: any) => data.id != waepon.dataset.optionid)
              dialogContainer.style.display = 'block'
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
              `
              inputObserver()
              const datetableBody: InterfaceElement = document.getElementById('datatable-modal-body')
              if (Fwaepon.length === 0) {
                  let row: InterfaceElement = document.createElement('tr')
                  row.innerHTML = `
                      <td>No hay datos</td>
                      <td></td>
                      <td></td>
                  `
                  datetableBody.appendChild(row)
              }
              else {
                  for (let i = 0; i < Fwaepon.length; i++) {
                      let client = Fwaepon[i]
                      let row: InterfaceElement =
                          document.createElement('tr')
                      row.innerHTML += `
                          <td>${client?.name ?? ''}</dt>
                          <td>${client?.licensePlate ?? ''}</dt>
                          <td>${client?.nroSerie ?? ''}</dt>
                          <td class="entity_options">
                              <button class="button" id="edit-entity" data-entityId="${client.id}" data-entityName="${client.name}" data-entityPlate="${client.licensePlate}">
                                  <i class="fa-solid fa-arrow-up-right-from-square"></i>
                              </button>
                          </td>
                      `
                      datetableBody.appendChild(row)
                  }
              }
              const txtSearch: InterfaceElement = document.getElementById('search-modal')
              const btnSearchModal: InterfaceElement = document.getElementById('btnSearchModal')
              const _selectUser: InterfaceElement = document.querySelectorAll('#edit-entity')
              const _closeButton: InterfaceElement = document.getElementById('cancel')
              const _dialog: InterfaceElement = document.getElementById('dialog-content')
              const prevModalButton: InterfaceElement = document.getElementById('prevModal')
              const nextModalButton: InterfaceElement = document.getElementById('nextModal')
              txtSearch.value = search ?? ''


              _selectUser.forEach((edit: InterfaceElement) => {
                  const entityId = edit.dataset.entityid
                  const entityName = edit.dataset.entityname
                  const entityPlate = edit.dataset.entityplate
                  edit.addEventListener('click', (): void => {
                      element.setAttribute('data-optionid', entityId)
                      element.setAttribute('value', `${entityName} [${entityPlate}]`)
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

  private selectUser(): void {
      
      const guard: InterfaceElement = document.getElementById('entity-guard')


          guard.addEventListener('click', async (): Promise<void> => {
              modalTable(0, "", guard)
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
                          "property": "userState.name",
                          "operator": "=",
                          "value": `Disponible`
                        },
                        {
                          "property": "userType",
                          "operator": "=",
                          "value": `GUARD`
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
                            }
                          ],
                          
                      }, 
                      sort: "-createdDate",
                      limit: Config.modalRows,
                      offset: offset,
                      fetchPlan: 'full',
                      
                  })
              }
              let dataModal = await getFilterEntityData("User", raw)
              const FGuard: Data = dataModal.filter((data: any) => data.id != guard.dataset.optionid)
              dialogContainer.style.display = 'block'
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
              `
              inputObserver()
              const datetableBody: InterfaceElement = document.getElementById('datatable-modal-body')
              if (FGuard.length === 0) {
                  let row: InterfaceElement = document.createElement('tr')
                  row.innerHTML = `
                      <td>No hay datos</td>
                      <td></td>
                      <td></td>
                  `
                  datetableBody.appendChild(row)
              }
              else {
                  for (let i = 0; i < FGuard.length; i++) {
                      let client = FGuard[i]
                      let row: InterfaceElement =
                          document.createElement('tr')
                      row.innerHTML += `
                          <td>${client?.firstName ?? ''} ${client?.lastName ?? ''} ${client?.secondLastName ?? ''}</dt>
                          <td>${client?.username ?? ''}</dt>
                          <td>${client?.dni ?? ''}</dt>
                          <td class="entity_options">
                              <button class="button" id="edit-entity" data-entityId="${client.id}" data-entityName="${client.username}" data-entityType="${client.type}">
                                  <i class="fa-solid fa-arrow-up-right-from-square"></i>
                              </button>
                          </td>
                      `
                      datetableBody.appendChild(row)
                  }
              }
              const txtSearch: InterfaceElement = document.getElementById('search-modal')
              const btnSearchModal: InterfaceElement = document.getElementById('btnSearchModal')
              const _selectUser: InterfaceElement = document.querySelectorAll('#edit-entity')
              const _closeButton: InterfaceElement = document.getElementById('cancel')
              const _dialog: InterfaceElement = document.getElementById('dialog-content')
              const prevModalButton: InterfaceElement = document.getElementById('prevModal')
              const nextModalButton: InterfaceElement = document.getElementById('nextModal')
              txtSearch.value = search ?? ''


              _selectUser.forEach((edit: InterfaceElement) => {
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
}