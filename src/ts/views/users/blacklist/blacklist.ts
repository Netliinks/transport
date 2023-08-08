// @filename: Departments.ts

import { deleteEntity, registerEntity, updateEntity, getEntityData, getFilterEntityData, getFilterEntityCount } from "../../../endpoints.js"
import { inputObserver, inputSelect, CloseDialog, filterDataByHeaderType, pageNumbers, fillBtnPagination } from "../../../tools.js"
import { InterfaceElement } from "../../../types.js"
import { Config } from "../../../Configs.js"
import { tableLayout } from "./Layout.js"
import { tableLayoutTemplate } from "./Template.js"
import { exportBlackListCsv, exportBlackListPdf, exportBlackListXls } from "../../../exportFiles/blacklist.js";

const tableRows = Config.tableRows
const currentPage = Config.currentPage
const customerId = localStorage.getItem('customer_id');
let infoPage = {
    count: 0,
    offset: Config.offset,
    currentPage: currentPage,
    search: ""
}
let dataPage: any
const getUsers = async () => {
    //const users = await getEntitiesData('BlacklistedUser');
    //const FCustomer = users.filter((data: any) => `${data.customer?.id}` === `${customerId}`);
    let raw = JSON.stringify({
        "filter": {
            "conditions": [
              {
                "property": "customer.id",
                "operator": "=",
                "value": `${customerId}`
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
                        "property": "dni",
                        "operator": "contains",
                        "value": `${infoPage.search.toLowerCase()}`
                      },
                      {
                        "property": "firstName",
                        "operator": "contains",
                        "value": `${infoPage.search.toLowerCase()}`
                      },
                      {
                        "property": "firstLastName",
                        "operator": "contains",
                        "value": `${infoPage.search.toLowerCase()}`
                      },
                      {
                        "property": "secondLastName",
                        "operator": "contains",
                        "value": `${infoPage.search.toLowerCase()}`
                      }
                    ]
                  },
                  {
                    "property": "customer.id",
                    "operator": "=",
                    "value": `${customerId}`
                  }
                ]
              },
            sort: "-createdDate",
            limit: Config.tableRows,
            offset: infoPage.offset,
            fetchPlan: 'full',
            
        })
    }
    infoPage.count = await getFilterEntityCount("BlacklistedUser", raw)
    dataPage = await getFilterEntityData("BlacklistedUser", raw)
    return dataPage;
};

export class Blacklist {
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
        
        let data: any = await getUsers()
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
        <td>los datos no coinciden con su búsqueda</td>
        <td></td>
        <td></td>
      `
            table.appendChild(row)
        }
        else {
            for (let i = 0; i < paginatedItems.length; i++) {
                let blacklist = paginatedItems[i];
                let row = document.createElement('tr');
                row.innerHTML += `
          <td>${blacklist.dni}</dt>
          <td>${blacklist.firstName}</dt>
          <td>${blacklist.firstLastName}</dt>
          <td>${blacklist.secondLastName}</dt>
          <td class="entity_options">
            <button class="button" id="edit-entity" data-entityId="${blacklist.id}">
              <i class="fa-solid fa-pen"></i>
            </button>

            <button class="button" id="remove-entity" data-entityId="${blacklist.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </dt>
        `
                table.appendChild(row)
            }
        }

        this.register()
        this.import();
        this.export();
        this.edit(this.entityDialogContainer, data);
        this.remove();
    }

    public searchEntity = async (tableBody: InterfaceElement/*, data: any*/) => {
        const search: InterfaceElement = document.getElementById('search')
        const btnSearch: InterfaceElement = document.getElementById('btnSearch')
        search.value = infoPage.search
        await search.addEventListener('keyup', () => {
            /*const arrayData: any = data.filter((user: any) =>
                `${user.dni}
                ${user.firstName}
                ${user.firstLastName}
                ${user.secondLastName}`
                    .toLowerCase()
                    .includes(search.value.toLowerCase())
            )

            let filteredResult = arrayData.length
            let result = arrayData
            if (filteredResult >= tableRows) filteredResult = tableRows

            this.load(tableBody, currentPage, result)*/

        })
        btnSearch.addEventListener('click', async () => {
            new Blacklist().render(Config.offset , Config.currentPage, search.value.toLowerCase().trim())
        })
    }

    public register() {
        // register entity
        const openEditor: InterfaceElement = document.getElementById('new-entity')
        openEditor.addEventListener('click', (): void => {
            renderInterface()
        })

        const renderInterface = async (): Promise<void> => {
            this.entityDialogContainer.innerHTML = ''
            this.entityDialogContainer.style.display = 'flex'
            this.entityDialogContainer.innerHTML = `
            <div class="entity_editor" id="entity-editor">
            <div class="entity_editor_header">
              <div class="user_info">
                <div class="avatar"><i class="fa-regular fa-user"></i></div>
                <h1 class="entity_editor_title">Registrar <br><small>Persona</small></h1>
              </div>
  
              <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
            </div>
  
            <!-- EDITOR BODY -->
            <div class="entity_editor_body">
              <div class="material_input">
                <input type="text" id="entity-firstname" autocomplete="none">
                <label for="entity-firstname">Nombre</label>
              </div>
  
              <div class="material_input">
                <input type="text" id="entity-firstLastName" autocomplete="none">
                <label for="entity-firstLastName">Apellido</label>
              </div>
  
              <div class="material_input">
                <input type="text" id="entity-secondlastname" autocomplete="none">
                <label for="entity-secondlastname">2do Apellido</label>
              </div>
  
              <div class="material_input">
                <input type="text"
                  id="entity-dni"
                  maxlength="10" autocomplete="none">
                <label for="entity-dni">Cédula</label>
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
            //inputSelect('Customer', 'entity-customer')
            this.close()


            const registerButton: InterfaceElement = document.getElementById('register-entity')
            registerButton.addEventListener('click', (): void => {
                let _values: any;
                _values = {
                    firstName: document.getElementById('entity-firstname'),
                    firstLastName: document.getElementById('entity-firstLastName'),
                    secondLastName: document.getElementById('entity-secondlastname'),
                    dni: document.getElementById('entity-dni'),
                }

                const blackuserRaw = JSON.stringify({
                    "firstLastName": `${_values.firstLastName.value}`,
                    "secondLastName": `${_values.secondLastName.value}`,
                    "firstName": `${_values.firstName.value}`,
                    "customer": {
                        "id": `${customerId}`
                    },
                    "dni": `${_values.dni.value}`
                })
                if (_values.firstName.value === '' || _values.firstName.value === undefined) {
                    alert("¡Nombre vacío!");
                }
                else if (_values.firstLastName.value === '' || _values.firstLastName.value === undefined) {
                    alert("¡Primer apellido vacío!");
                }
                else if (_values.secondLastName.value === '' || _values.secondLastName.value === undefined) {
                    alert("¡Segundo apellido vacío!");
                }
                else if (_values.dni.value === '' || _values.dni.value === undefined) {
                    alert("DNI vacío!");
                }
                else {
                    reg(blackuserRaw);
                }
            })

        }

        const reg = async (raw: any) => {
            registerEntity(raw, 'BlacklistedUser')
                .then((res) => {
                setTimeout(async () => {
                    let data = await getUsers();
                    const tableBody = document.getElementById('datatable-body');
                    const container = document.getElementById('entity-editor-container');
                    new CloseDialog().x(container);
                    //new Blacklist().load(tableBody, currentPage, data);
                    new Blacklist().render(Config.offset, Config.currentPage, infoPage.search)
                }, 1000);
            });
        }
    }
    edit(container:any, data:any) {
        // Edit entity
        const edit: InterfaceElement = document.querySelectorAll('#edit-entity');
        edit.forEach((edit: any) => {
            const entityId = edit.dataset.entityid;
            edit.addEventListener('click', () => {
                RInterface('BlacklistedUser', entityId);
            });
        });
        const RInterface = async (entities: any, entityID: any) => {
            const data = await getEntityData(entities, entityID);
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            this.entityDialogContainer.innerHTML = `
                <div class="entity_editor" id="entity-editor">
                <div class="entity_editor_header">
                    <div class="user_info">
                    <div class="avatar"><i class="fa-regular fa-user"></i></div>
                    <h1 class="entity_editor_title">Editar <br><small>Persona</small></h1>
                    </div>

                    <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
                </div>

                <!-- EDITOR BODY -->
                <div class="entity_editor_body">
                    <div class="material_input">
                    <input type="text" id="entity-firstname" class="input_filled" value="${data.firstName}">
                    <label for="entity-firstname">Nombre</label>
                    </div>

                    <div class="material_input">
                    <input type="text" id="entity-firstLastName" class="input_filled" value="${data.firstLastName}">
                    <label for="entity-firstLastName">Apellido</label>
                    </div>

                    <div class="material_input">
                    <input type="text" id="entity-secondlastname" class="input_filled" value="${data.secondLastName}">
                    <label for="entity-secondlastname">2do Apellido</label>
                    </div>

                    <div class="material_input">
                    <input type="text"
                        id="entity-dni"
                        class="input_filled"
                        maxlength="10"
                        value="${data?.dni ?? ''}">
                    <label for="entity-dni">Cédula</label>
                    </div>

                </div>
                <!-- END EDITOR BODY -->

                <div class="entity_editor_footer">
                    <button class="btn btn_primary btn_widder" id="update-changes">Guardar</button>
                </div>
                </div>
            `;

            inputObserver();

            this.close();
            updateBlackUser(entityID);
        };
        const updateBlackUser = async (contractorId: any) => {
            let updateButton: InterfaceElement;
            updateButton = document.getElementById('update-changes');
            const _values: any = {
                firstName: document.getElementById('entity-firstname'),
                firstLastName: document.getElementById('entity-firstLastName'),
                secondLastName: document.getElementById('entity-secondlastname'),
                dni: document.getElementById('entity-dni')
            };
            updateButton.addEventListener('click', () => {
                let blackuserRaw = JSON.stringify({
                    "firstLastName": `${_values.firstLastName.value}`,
                    "secondLastName": `${_values.secondLastName.value}`,
                    "firstName": `${_values.firstName.value}`,
                    "dni": `${_values.dni.value}`,
                });
                update(blackuserRaw);
            });
            /**
             * Update entity and execute functions to finish defying user
             * @param raw
             */
            const update = (raw: any) => {
                updateEntity('BlacklistedUser', contractorId, raw)
                    .then((res) => {
                    setTimeout(async () => {
                        let tableBody;
                        let container;
                        let data;
                        tableBody = document.getElementById('datatable-body');
                        container = document.getElementById('entity-editor-container');
                        data = await getUsers();
                        new CloseDialog().x(container);
                        //new Blacklist().load(tableBody, currentPage, data);
                        new Blacklist().render(infoPage.offset, infoPage.currentPage, infoPage.search)
                    }, 100);
                });
            };
        };
    }
    remove() {
        const remove: InterfaceElement = document.querySelectorAll('#remove-entity');
        remove.forEach((remove:any) => {
            const entityId = remove.dataset.entityid;
            remove.addEventListener('click', () => {
                this.dialogContainer.style.display = 'block';
                this.dialogContainer.innerHTML = `
          <div class="dialog_content" id="dialog-content">
            <div class="dialog dialog_danger">
              <div class="dialog_container">
                <div class="dialog_header">
                  <h2>¿Deseas eliminar esta persona?</h2>
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
                const deleteButton: InterfaceElement = document.getElementById('delete');
                const cancelButton: InterfaceElement = document.getElementById('cancel');
                const dialogContent: InterfaceElement = document.getElementById('dialog-content');
                deleteButton.onclick = () => {
                    deleteEntity('BlacklistedUser', entityId)
                    .then((res) => {
                        setTimeout(async () => {
                            let data = await getUsers();
                            const tableBody = document.getElementById('datatable-body');
                            new CloseDialog().x(dialogContent);
                            new Blacklist().render(infoPage.offset, infoPage.currentPage, infoPage.search)
                            //new Blacklist().load(tableBody, currentPage, data);
                        }, 1000);
                    });
                };
                cancelButton.onclick = () => {
                    new CloseDialog().x(dialogContent);
                    //this.render();
                };
            });
        });
    }

    public close(): void {
        const closeButton: InterfaceElement = document.getElementById('close')
        const editor: InterfaceElement = document.getElementById('entity-editor-container')

        closeButton.addEventListener('click', () => {
            console.log('close')
            new CloseDialog().x(editor)
        })
    }
    import = () => {
        const _importContractors: InterfaceElement = document.getElementById('import-entities');
        _importContractors.addEventListener('click', () => {
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            this.entityDialogContainer.innerHTML = `
                    <div class="entity_editor id="entity-editor">
                        <div class="entity_editor_header">
                            <div class="user_info">
                                <div class="avatar">
                                    <i class="fa-regular fa-up-from-line"></i>
                                </div>
                                <h1 class="entity_editor_title">Importar <br> <small>Persona</small></h1>
                            </div>
                            <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
                        </div>
                        <!--EDITOR BODY -->
                        <div class="entity_editor_body padding_t_8_important">
                            <div class="sidebar_section">
                                <div class="file_template">
                                    <i class="fa-solid fa-file-csv"></i>
                                    <div class="description">
                                        <p class="filename">Plantilla de Lista Negra</p>
                                        <a href="./public/src/templates/NetvisitorsBlackList.csv" download="./public/src/templates/NetvisitorsBlackList.csv" rel="noopener" target="_self" class="filelink">Descargar</a>
                                    </div>
                                </div>
                            </div>
                            <div class="sidebar_section">
                                <input type="file" id="file-handler">
                            </div>
                        </div>
                        <div class="entity_editor_footer">
                            <button class="btn btn_primary btn_widder" id="button-import">Importar<button>
                        </div>
                    </div>
                `;
            this.close();
            const _fileHandler: InterfaceElement = document.getElementById('file-handler');
            _fileHandler.addEventListener('change', () => {
                readFile(_fileHandler.files[0]);
            });
            async function readFile(file: any) {
                const fileReader = new FileReader();
                fileReader.readAsText(file);
                fileReader.addEventListener('load', (e: any) => {
                    let result = e.srcElement.result;
                    let resultSplit = result.split('\r');
                    let rawFile;
                    let stageUsers: any = [];
                    for (let i = 1; i < resultSplit.length; i++) {
                        let blackListData = resultSplit[i].split(';');
                        rawFile = JSON.stringify({
                            "firstName": `${blackListData[0]?.replace(/\n/g, '')}`,
                            "firstLastName": `${blackListData[1]?.replace(/\n/g, '')}`,
                            "secondLastName": `${blackListData[2]?.replace(/\n/g, '')}`,
                            "dni": `${blackListData[3]?.replace(/\n/g, '')}`,
                        });
                        stageUsers.push(rawFile);
                    }
                    const _import: InterfaceElement = document.getElementById('button-import');
                    _import.addEventListener('click', () => {
                        stageUsers.forEach((user: any) => {
                            registerEntity(user, 'BlacklistedUser')
                                .then((res) => {
                                setTimeout(async () => {
                                    let data = await getUsers();
                                    const tableBody = document.getElementById('datatable-body');
                                    const container = document.getElementById('entity-editor-container');
                                    new CloseDialog().x(container);
                                    new Blacklist().render(Config.offset, Config.currentPage, '')
                                    //new Blacklist().load(tableBody, currentPage, data);
                                }, 1000);
                            });
                        });
                    });
                });
            }
        });
    }
    export = () => {
        const exportUsers: InterfaceElement = document.getElementById('export-entities');
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
                exportButton.addEventListener('click', async () => {
                    const _values = {
                        exportOption: document.getElementsByName('exportOption')
                    };
                    let rawExport = JSON.stringify({
                        "filter": {
                            "conditions": [
                              {
                                "property": "customer.id",
                                "operator": "=",
                                "value": `${customerId}`
                              }
                            ],
                            
                        }, 
                        sort: "-createdDate",
                        fetchPlan: 'full',
                        
                    })
                    const users = await getFilterEntityData("BlacklistedUser", rawExport) //await getUsers();
                    for (let i = 0; i < _values.exportOption.length; i++) {
                        let ele: any = _values.exportOption[i];
                        if (ele.type = "radio") {
                            if (ele.checked) {
                                if (ele.value == "xls") {
                                    // @ts-ignore
                                    exportBlackListXls(users);
                                }
                                else if (ele.value == "csv") {
                                    // @ts-ignore
                                    exportBlackListCsv(users);
                                }
                                else if (ele.value == "pdf") {
                                    // @ts-ignore
                                    exportBlackListPdf(users);
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
                    i, items, currentPage, tableBody, limitRows
                )

                paginationWrapper.appendChild(button)
            }
            fillBtnPagination(currentPage, Config.colorPagination)
        }else{
            pagesOptions(items, currentPage)  
        }

        function setupButtons(page: any, items: any, currentPage: number, tableBody: InterfaceElement, limitRows: number) {
            const button: InterfaceElement = document.createElement('button')
            button.classList.add('pagination_button')
            button.setAttribute("name", "pagination-button")
            button.setAttribute("id", "btnPag"+page)
            button.innerText = page

            button.addEventListener('click', (): void => {
                const buttons = document.getElementsByName("pagination-button");
                buttons.forEach(button => {
                    button.style.background = "#ffffff"; 
                })
                infoPage.offset = Config.tableRows * (page - 1)
                currentPage = page
                fillBtnPagination(page, Config.colorPagination)
                new Blacklist().render(infoPage.offset, currentPage, infoPage.search)
            })

            return button
        }

        function setupButtons2(page: any) {
            const button: InterfaceElement = document.createElement('button')
            button.classList.add('pagination_button')
            button.setAttribute("id", "btnPag"+page)
            button.innerText = page
            button.addEventListener('click', (): void => {
                infoPage.offset = Config.tableRows * (page - 1)
                currentPage = page
                new Blacklist().render(infoPage.offset, currentPage, infoPage.search)
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
                    button = setupButtons2(
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
                new Blacklist().render(Config.offset, Config.currentPage, infoPage.search)
            })

            nextButton.addEventListener('click', (): void => {
                infoPage.offset = Config.tableRows * (pageCount - 1)
                new Blacklist().render(infoPage.offset, pageCount, infoPage.search)
            })
        }
    }
}
