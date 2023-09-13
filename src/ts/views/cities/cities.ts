//
//  Clients.ts
//
//  Generated by Poll Castillo on 15/02/2023
//
import { deleteEntity, getEntityData, registerEntity, setPassword, updateEntity, sendMail, getFilterEntityData, getFilterEntityCount } from "../../endpoints.js"
import { drawTagsIntoTables, inputObserver, inputSelect, CloseDialog, filterDataByHeaderType, getVerifyEmail, pageNumbers, fillBtnPagination, userPermissions, currentDateTime, eventLog, getSearch } from "../../tools.js"
import { Data, InterfaceElement } from "../../types.js"
import { Config } from "../../Configs.js"
import { UIConvertToSU, tableLayout } from "./Layout.js"
import { tableLayoutTemplate } from "./Templates.js"
import { exportClientCsv, exportClientPdf, exportClientXls } from "../../exportFiles/clients.js"

const tableRows = Config.tableRows
const currentPage = Config.currentPage
const businessId = localStorage.getItem('business_id')
let currentWeaponInfo : any
let infoPage = {
    count: 0,
    offset: Config.offset,
    currentPage: currentPage,
    search: ""
}
let dataPage: any
const getCities = async (): Promise<void> => {
    //const users: Data = await getEntitiesData('City')
    //const FSuper: Data = users.filter((data: any) => data.isSuper === false)
    //const FWeapon: Data = FSuper.filter((data: any) => `${data.customer?.id}` === `${customerId}`)
    //const data: Data = FWeapon.filter((data: any) => `${data.userType}`.includes('CUSTOMER'))
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
    infoPage.count = await getFilterEntityCount("City", raw)
    dataPage = await getFilterEntityData("City", raw)
    return dataPage
}

export class Cities {
    private readonly dialogContainer: InterfaceElement =
        document.getElementById('app-dialogs')

    private readonly entityDialogContainer: InterfaceElement =
        document.getElementById('entity-editor-container')

    private readonly datatableContainer: InterfaceElement =
        document.getElementById('datatable-container')

    public async render(offset: any, actualPage: any, search: any): Promise<void> {
        infoPage.offset = offset
        infoPage.currentPage = actualPage
        infoPage.search = search
        this.datatableContainer.innerHTML = ''
        this.datatableContainer.innerHTML = tableLayout
        const tableBody: InterfaceElement = document.getElementById('datatable-body')
        tableBody.innerHTML = '.Cargando...'

        let data: any = await getCities()
        tableBody.innerHTML = tableLayoutTemplate.repeat(tableRows)
        this.load(tableBody, currentPage, data)

        this.searchEntity(tableBody/*, data*/)
        new filterDataByHeaderType().filter()
        this.pagination(data, tableRows, infoPage.currentPage)
    }

    private load(table: InterfaceElement, currentPage: number, data: Data) {
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
                let client = paginatedItems[i]
                let row: InterfaceElement =
                    document.createElement('tr')
                row.innerHTML += `
                    <td>${client.name}</dt>
                    <td class="entity_options">
                        <button class="button" id="edit-entity" data-entityId="${client.id}">
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button class="button" id="remove-entity" data-entityId="${client.id}" data-entityName="${client.name}" style="display:${userPermissions().style};">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `
                table.appendChild(row)
                drawTagsIntoTables()
            }
        }

        this.register()
        this.import()
        this.export()
        this.edit(this.entityDialogContainer, data)
        this.remove()
        //this.changeWeaponPassword()
    }

    public searchEntity = async (tableBody: InterfaceElement/*, data: any*/) => {
        const search: InterfaceElement = document.getElementById('search')
        const btnSearch: InterfaceElement = document.getElementById('btnSearch')
        search.value = infoPage.search
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

        })
        btnSearch.addEventListener('click', async () => {
            new Cities().render(Config.offset , Config.currentPage, search.value.toLowerCase().trim())
        })
    }

    private register() {
        // register entity
        const openEditor: InterfaceElement = document.getElementById('new-entity')
        openEditor.addEventListener('click', (): void => {
            renderInterface('City')
        })

        const renderInterface = async (entities: string): Promise<void> => {
            this.entityDialogContainer.innerHTML = ''
            this.entityDialogContainer.style.display = 'flex'
            this.entityDialogContainer.innerHTML = `
                <div class="entity_editor" id="entity-editor">
                <div class="entity_editor_header">
                    <div class="user_info">
                    <div class="avatar"><i class="fa-regular fa-earth-americas"></i></div>
                    <h1 class="entity_editor_title">Registrar <br><small>Ciudad</small></h1>
                    </div>

                    <button class="btn btn_close_editor" id="close"><i class="fa-regular fa-x"></i></button>
                </div>

                <!-- EDITOR BODY -->
                <div class="entity_editor_body">

                    <div class="material_input">
                    <input type="text" id="entity-name" autocomplete="none">
                    <label for="entity-name"><i class="fa-solid fa-earth-americas"></i> Ciudad</label>
                    </div>

                </div>
                <!-- END EDITOR BODY -->

                <div class="entity_editor_footer">
                    <button class="btn btn_primary btn_widder" id="register-entity">Guardar</button>
                </div>
                </div>
            `

            inputObserver()
            this.close()

            const registerButton: InterfaceElement = document.getElementById('register-entity')
            registerButton.addEventListener('click', async() => {
                const inputsCollection: any = {
                    name: document.getElementById('entity-name'),
                }

                const raw = JSON.stringify({
                    "name": `${inputsCollection.name.value.toUpperCase()}`,
                    "business":{
                        "id": `${businessId}`
                    },
                    'creationDate': `${currentDateTime().date}`,
                    'creationTime': `${currentDateTime().time}`,
                })
                let searchExist = await getSearch("name", inputsCollection.name.value.toUpperCase(), "City")
                if(inputsCollection.name.value === '' || inputsCollection.name.value === undefined){
                    alert("¡Nombre vacío!")
                }else if(searchExist != undefined){
                    alert("¡Ciudad ya existe!")
                }else{
                    reg(raw)
                }
            })

        }

        const reg = async (raw: any) => {
            registerEntity(raw, 'City')
                .then((res) => {
                    setTimeout(async () => {
                        //let data = await getWeapons()
                        let parse = JSON.parse(raw);
                        eventLog('INS', 'CIUDAD', `${parse.name}`, '')
                        const tableBody: InterfaceElement = document.getElementById('datatable-body')
                        const container: InterfaceElement = document.getElementById('entity-editor-container')

                        new CloseDialog().x(container)
                        new Cities().render(Config.offset, Config.currentPage, infoPage.search)
                        //new Clients().load(tableBody, currentPage, data)
                    }, 1000)
                })
        }
    }

    public import() {
        const importClients: InterfaceElement = document.getElementById('import-entities');
        importClients.addEventListener('click', () => {
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            this.entityDialogContainer.innerHTML = `
            <div class="entity_editor" id="entity-editor">
              <div class="entity_editor_header">
                <div class="user_info">
                  <div class="avatar"><i class="fa-regular fa-up-from-line"></i></div>
                  <h1 class="entity_editor_title">Importar <br><small>Ciudades</small></h1>
                </div>

                <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
              </div>

              <!-- EDITOR BODY -->
              <div class="entity_editor_body padding_t_8_important">
                <div class="sidebar_section">
                    <div class="file_template">
                        <i class="fa-solid fa-file-csv"></i>
                        <div class="description">
                            <p class="filename">Plantilla de Guardias</p>
                            <a
                            href="./public/src/templates/NetvisitorsClients.csv"
                            download="./public/src/templates/NetvisitorsClients.csv"
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
            const _fileHandler: InterfaceElement = document.getElementById('file-handler');
            _fileHandler.addEventListener('change', () => {
                readFile(_fileHandler.files[0]);
            });
            async function readFile(file: any) {
                //const customer = await getEntitiesData('City');
                //const citadel = await getEntitiesData('Citadel');
                //const deparment = await getEntitiesData('Department');
                //const contractor = await getEntitiesData('Contractor');
                const fileReader = new FileReader()
                fileReader.readAsText(file)
                fileReader.addEventListener('load', (e: any) => {
                    let result = e.srcElement.result
                    let resultSplit = result.split('\r')
                    let rawFile: string
                    let elem: any = []
                    for (let i = 1; i < resultSplit.length-1; i++) {
                        let userData = resultSplit[i].split(';')
                        rawFile = JSON.stringify({
                            "name": `${userData[0]?.replace(/\n/g, '')}`,
                            "licensePlate": `${userData[1]?.replace(/\n/g, '')}`,
                            "nroSerie": `${userData[2]?.replace(/\n/g, '')}`,
                            "weaponState": {
                                "id": "60885987-1b61-4247-94c7-dff348347f93"
                            },
                            "business": {
                                "id": `${businessId}`
                            },
                            'creationDate': `${currentDateTime().date}`,
                            'creationTime': `${currentDateTime().time}`,
                        });
                        elem.push(rawFile)
                    }
                    const importToBackend: InterfaceElement = document.getElementById('button-import');
                    importToBackend.addEventListener('click', () => {
                        elem.forEach((el: any) => {
                            registerEntity(el, 'City')
                                .then((res) => {
                                setTimeout(async () => {
                                    //let data = await getWeapons()
                                    let parse = JSON.parse(el);
                                    eventLog('INS', 'CIUDAD', `${parse.name}, importación`, '')
                                    const tableBody = document.getElementById('datatable-body')
                                    const container = document.getElementById('entity-editor-container')
                                    new CloseDialog().x(container)
                                    new Cities().render(Config.offset, Config.currentPage, '')
                                    //new Clients().load(tableBody, currentPage, data)
                                }, 1000)
                            });
                        });
                    });
                });
            }
            this.close();
        });
    }

    private edit(container: InterfaceElement, data: Data) {
        // Edit entity
        const edit: InterfaceElement = document.querySelectorAll('#edit-entity')
        edit.forEach((edit: InterfaceElement) => {
            const entityId = edit.dataset.entityid
            edit.addEventListener('click', (): void => {
                RInterface('City', entityId)
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
                    <div class="avatar"><i class="fa-regular fa-earth-americas"></i></div>
                    <h1 class="entity_editor_title">Editar <br><small>${data.name}</small></h1>
                    </div>

                    <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
                </div>

                <!-- EDITOR BODY -->
                <div class="entity_editor_body">
                    <div class="material_input">
                    <input type="text" id="entity-name" class="input_filled" value="${data.name}">
                    <label for="entity-name">Nombre</label>
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
            `

            inputObserver()
            this.close()
            UUpdate(entityID, data)
        }

        const UUpdate = async (entityId: any, data: any): Promise<void> => {
            const updateButton: InterfaceElement =
                document.getElementById('update-changes')
            updateButton.addEventListener('click', async () => {
                const $value: InterfaceElement = {
                    // @ts-ignore
                    name: document.getElementById('entity-name'),
                }
                let raw = JSON.stringify({
                    // @ts-ignore
                    "name": `${$value.name?.value.toUpperCase()}`,
                })
                let searchExist = [] 
                searchExist[0] = 'none'
                if($value.name.value.toUpperCase() != data.name){
                    searchExist[1] = await getSearch("name", $value.name.value.toUpperCase(), "City")
                }
                // @ts-ignore
                if ($value.name.value === '' || $value.name.value === undefined) {
                    alert("Nombre vacío!");
                }else if(searchExist[1] != undefined || searchExist[0] != 'none'){
                    alert("¡Ciudad ya existe!")
                }
                else{
                    update(raw)
                }
            })
            const update = (raw: any) => {
                updateEntity('City', entityId, raw)
                    .then((res) => {
                        setTimeout(async () => {
                            let tableBody: InterfaceElement
                            let container: InterfaceElement
                            let data: any
                            
                            //data = await getWeapons()
                            let parse = JSON.parse(raw);
                            eventLog('UPD', 'CIUDAD', `${parse.name}`, '')
                            new CloseDialog()
                                .x(container =
                                    document.getElementById('entity-editor-container')
                                )
                            new Cities().render(infoPage.offset, infoPage.currentPage, infoPage.search)
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

    private remove() {
        const remove: InterfaceElement = document.querySelectorAll('#remove-entity')
        remove.forEach((remove: InterfaceElement) => {

            const entityId = remove.dataset.entityid
            const entityName = remove.dataset.entityname
            // BOOKMARK: MODAL
            remove.addEventListener('click', (): void => {
                this.dialogContainer.style.display = 'block'
                this.dialogContainer.innerHTML = `
                    <div class="dialog_content" id="dialog-content">
                        <div class="dialog dialog_danger">
                        <div class="dialog_container">
                            <div class="dialog_header">
                            <h2>¿Deseas eliminar esta ciudad?</h2>
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
                    </div>`

                const deleteButton: InterfaceElement = document.getElementById('delete')
                const cancelButton: InterfaceElement = document.getElementById('cancel')
                const dialogContent: InterfaceElement = document.getElementById('dialog-content')

                deleteButton.onclick = () => {
                    deleteEntity('City', entityId)
                    .then((res) => {
                        setTimeout(async () => {
                            //let data = await getWeapons();
                            eventLog('DLT', 'CIUDAD', `${entityName}`, '')
                            const tableBody = document.getElementById('datatable-body');
                            new CloseDialog().x(dialogContent);
                            new Cities().render(infoPage.offset, infoPage.currentPage, infoPage.search)
                            //new Clients().load(tableBody, currentPage, data);
                        }, 1000);
                    })
                }

                cancelButton.onclick = () => {
                    new CloseDialog().x(dialogContent)
                    //this.render()
                }
            })
        })

    }

    private export = (): void => {
        const exportWeapons: InterfaceElement = document.getElementById('export-entities');
        exportWeapons.addEventListener('click', async() => {
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

                                    <label for="exportPdf">
                                        <input type="radio" id="exportPdf" name="exportOption" value="pdf" /> PDF
                                    </label>
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
            const _closeButton: InterfaceElement = document.getElementById('cancel');
            const exportButton: InterfaceElement = document.getElementById('export-data');
            const _dialog: InterfaceElement = document.getElementById('dialog-content');
            exportButton.addEventListener('click', async() => {
                const _values: any = {
                    exportOption: document.getElementsByName('exportOption')
                }
                let rawExport = JSON.stringify({
                    "filter": {
                        "conditions": [
                          {
                            "property": "business.id",
                            "operator": "=",
                            "value": `${businessId}`
                          },
                          {
                            "property": "userType",
                            "operator": "=",
                            "value": `GUARD`
                          },
                          {
                            "property": "isSuper",
                            "operator": "=",
                            "value": `${false}`
                          }
                        ],
                        
                    }, 
                    sort: "-createdDate",
                    fetchPlan: 'full',
                    
                })
                const users: any = await getFilterEntityData("City", rawExport) //await getWeapons()
                for (let i = 0; i < _values.exportOption.length; i++) {
                    let ele: any = _values.exportOption[i]
                    if (ele.type = "radio") {
    
                        if (ele.checked){
                            if(ele.value == "xls"){
                                // @ts-ignore
                                exportClientXls(users)
                            }else if(ele.value == "csv"){
                                // @ts-ignore
                                exportClientCsv(users)
                            }else if(ele.value == "pdf"){
                                // @ts-ignore
                                exportClientPdf(users)
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
                new Cities().render(infoPage.offset, currentPage, infoPage.search)
                //new Clients().load(tableBody, page, items)
            })

            return button
        }

        function pagesOptions(items: any, currentPage: any) {
            paginationWrapper.innerHTML = ''
            let pages = pageNumbers(pageCount, Config.maxLimitPage, currentPage)
            
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
                new Cities().render(Config.offset, Config.currentPage, infoPage.search)
            })

            nextButton.addEventListener('click', (): void => {
                infoPage.offset = Config.tableRows * (pageCount - 1)
                new Cities().render(infoPage.offset, pageCount, infoPage.search)
            })
        }
    }

    private close(): void {
        const closeButton: InterfaceElement = document.getElementById('close')
        const editor: InterfaceElement = document.getElementById('entity-editor-container')

        closeButton.addEventListener('click', () => {
            console.log('close')
            new CloseDialog().x(editor)
        }, false)
    }
}