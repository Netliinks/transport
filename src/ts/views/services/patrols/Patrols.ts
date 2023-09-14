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
const getPatrols = async (idService: any): Promise<void> => {
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
                        "property": "crew.name",
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
    infoPage.count = await getFilterEntityCount("ServiceDetailV", raw)
    dataPage = await getFilterEntityData("ServiceDetailV", raw)
    return dataPage

}

export class Patrols {
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
        let data: any = await getPatrols(idService)
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
                let patrol = paginatedItems[i]
                let row: InterfaceElement =
                    document.createElement('tr')
                row.innerHTML += `
                <td>${patrol.crew?.name ?? ''}</dt>
                <td>${patrol?.category ?? ''}</dt>
                <td class="entity_options">

                    <button class="button" id="remove-entity" data-entityId="${patrol.id}" data-entityName="${patrol.crew.name}" style="display:${userPermissions().style};">
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
            new Patrols().render(Config.offset , Config.currentPage, search.value.toLowerCase().trim(), serviceId.id)
        })
    }

    public register() {
        // register entity
        const openEditor: InterfaceElement = document.getElementById('new-entity')
        openEditor.addEventListener('click', (): void => {
            if((infoPage.count + 1) <= serviceId.quantyVehiculars){
                renderInterface()
            }else{
                alert(`El servicio ha sido registrado con ${serviceId.quantyVehiculars} vehículo(s)`)
            }
            
        })

        const renderInterface = async (): Promise<void> => {
            const nothingConfig = {
              crewState: await getNothing("name", "En servicio", "CrewState"),
              vehicularState: await getNothing("name", "En servicio", "VehicularState"),
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
              <div class="avatar"><i class="fa-solid fa-car"></i></div>
              <h1 class="entity_editor_title">Registrar <br><small>Patrulla</small></h1>
            </div>

            <button class="btn btn_close_editor" id="close"><i class="fa-regular fa-x"></i></button>
          </div>

          <!-- EDITOR BODY -->
          <div class="entity_editor_body">
            <div class="material_input_select">
            <label for="entity-category"><i class="fa-solid fa-users" readonly></i> Categoría</label>
            <input type="text" id="entity-category" class="input_select" readonly placeholder="cargando..." autocomplete="none">
            <div id="input-options" class="input_options">
            </div>
            </div>

            <div class="material_input">
            <input type="text" id="entity-patrol" autocomplete="none">
            <label for="entity-patrol"><i class="fa-solid fa-car"></i> Patrulla</label>
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
            this.selectCrew()
            inputSelectType('entity-category', 'CATEGORY', '');
            //inputSelect('Customer', 'entity-customer')
            this.close()

            const registerButton: InterfaceElement = document.getElementById('register-entity')
            registerButton.addEventListener('click', (): void => {
                const inputsCollection: any = {
                    category: document.getElementById('entity-category'),
                    patrol: document.getElementById('entity-patrol'),
                }

                const raw = JSON.stringify({
                    "category": `${inputsCollection.category.value}`,
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
                    "crew": {
                      "id": `${inputsCollection.patrol.dataset.optionid}`
                    }
                })
                if(inputsCollection.patrol.value === '' || inputsCollection.patrol.value === undefined){
                    alert("¡Patrulla no seleccionada!")
                }else{
                    let dataCrew = {
                        id: inputsCollection.patrol.dataset.optionid,
                        value: inputsCollection.patrol.value,
                        table: "Crew",
                        state: nothingConfig.crewState.id,
                        title: "PATRULLA"
                    }

                  registerEntity(raw, 'ServiceDetailV').then((res) => {
                    setTimeout(async () => {
                        //let parse = JSON.parse(raw);
                        eventLog('INS', 'SERVICIO-PATRULLA', `${dataCrew.value}`, serviceId)
                        getUpdateState(dataCrew.state, dataCrew.table, dataCrew.id)
                        eventLog('UPD', `${dataCrew.title}`, `${dataCrew.value} en servicio: ${serviceId.name}`, '')
                        const crew: any = await getEntityData('Crew', dataCrew.id)
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
                          eventLog('UPD', `${dataArray[i].title}`, `${dataArray[i].value} en servicio: ${serviceId.name}`, serviceId)
                        }
                        const container: InterfaceElement = document.getElementById('entity-editor-container')

                        new CloseDialog().x(container)
                        new Patrols().render(Config.offset, Config.currentPage, infoPage.search, serviceId.id)
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

            remove.addEventListener('click', async (): Promise<void> => {
              const nothingConfig = {
                vehicularState: await getNothing("name", "Asignado", "VehicularState"),
                userState: await getNothing("name", "Asignado", "UserState"),
                weaponState: await getNothing("name", "Asignado", "WeaponState"),
                nothingWeapon: await getNothing("name", "N/A", "Weapon"),
                nothingUser: await getNothing("username", "N/A", "User"),
                crewState: await getNothing("name", "Disponible", "CrewState")
              }
                this.dialogContainer.style.display = 'flex'
                this.dialogContainer.innerHTML = `
          <div class="dialog_content" id="dialog-content">
            <div class="dialog dialog_danger">
              <div class="dialog_container">
                <div class="dialog_header">
                  <h2>¿Deseas eliminar esta patrulla?</h2>
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
                    const data: any = await getEntityData('ServiceDetailV', entityId)
                    if(serviceId.serviceState.name == "Pendiente" || serviceId.serviceState.name == "Terminado"){
                      deleteEntity('ServiceDetailV', entityId)
                        .then(async res => {
                          eventLog('DLT', 'SERVICIO-PATRULLA', `${entityName}`, serviceId)
                          getUpdateState(nothingConfig.crewState.id, 'Crew', data.crew.id)
                          eventLog('UPD', `PATRULLA`, `${data.crew.name} disponible`, '')
                          const crew: any = await getEntityData('Crew', data.crew.id)
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
                          new Patrols().render(infoPage.offset, infoPage.currentPage, infoPage.search, serviceId.id)
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
                new Patrols().render(infoPage.offset, currentPage, infoPage.search, serviceId.id)
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
            new Patrols().render(Config.offset, Config.currentPage, infoPage.search, serviceId.id)
          })

          nextButton.addEventListener('click', (): void => {
            infoPage.offset = Config.tableRows * (pageCount - 1)
            new Patrols().render(infoPage.offset, pageCount, infoPage.search, serviceId.id)
          })
      }
    }

    private selectCrew(): void {
        
        const element: InterfaceElement = document.getElementById('entity-patrol')
        const category: InterfaceElement = document.getElementById('entity-category')
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
                            "property": "crewState.name",
                            "operator": "=",
                            "value": `Disponible`
                          },
                          {
                            "property": "category",
                            "operator": "=",
                            "value": `${category.value}`
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
                                    "property": "vehicular.licensePlate",
                                    "operator": "contains",
                                    "value": `${search.toLowerCase()}`
                                    },
                                    {
                                    "property": "crewOne.username",
                                    "operator": "contains",
                                    "value": `${search.toLowerCase()}`
                                    },
                                ]
                              },
                              {
                                "property": "business.id",
                                "operator": "=",
                                "value": `${businessId}`
                              },
                              {
                                "property": "crewState.name",
                                "operator": "=",
                                "value": `Disponible`
                              },
                              {
                                "property": "category",
                                "operator": "=",
                                "value": `${category.value}`
                              }
                            ],
                            
                        }, 
                        sort: "-createdDate",
                        limit: Config.modalRows,
                        offset: offset,
                        fetchPlan: 'full',
                        
                    })
                }
                let dataModal = await getFilterEntityData("Crew", raw)
                const FData: Data = dataModal.filter((data: any) => data.id != element.dataset.optionid)
                dialogContainer.style.display = 'block'
                dialogContainer.innerHTML = `
                    <div class="dialog_content" id="dialog-content">
                        <div class="dialog">
                            <div class="dialog_container padding_8">
                                <div class="dialog_header">
                                    <h2>Patrullas disponibles</h2>
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
                                            <th>Categoría</th>
                                            <th>Vehículo</th>
                                            <th>Supervisor</th>
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
                            <td>${client?.category ?? ''}</dt>
                            <td>${client?.vehicular?.type ?? ''} [${client?.vehicular?.licensePlate ?? ''}]</dt>
                            <td>${client?.crewOne?.username ?? ''}</dt>
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
}