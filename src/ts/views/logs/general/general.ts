//
//  Clients.ts
//
//  Generated by Poll Castillo on 15/02/2023
//
import { deleteEntity, getEntityData, registerEntity, setPassword, updateEntity, sendMail, getFilterEntityData, getFilterEntityCount } from "../../../endpoints.js"
import { drawTagsIntoTables, inputObserver, inputSelect, CloseDialog, renderRightSidebar, filterDataByHeaderType, getVerifyEmail, pageNumbers, fillBtnPagination, userPermissions, currentDateTime, eventLog } from "../../../tools.js"
import { Data, InterfaceElement } from "../../../types.js"
import { Config } from "../../../Configs.js"
import { UIRightSidebar, tableLayout } from "./Layout.js"
import { tableLayoutTemplate } from "./Templates.js"
import { exportLogCsv, exportLogXls } from "../../../exportFiles/logs.js"

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
const getLogs = async (): Promise<void> => {
    //const users: Data = await getEntitiesData('Log')
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
                      },
                      {
                        "property": "description",
                        "operator": "contains",
                        "value": `${infoPage.search.toLowerCase()}`
                      },
                      {
                        "property": "user.username",
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
    infoPage.count = await getFilterEntityCount("Log", raw)
    dataPage = await getFilterEntityData("Log", raw)
    return dataPage
}

export class Logs {
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

        let data: any = await getLogs()
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
                    <td>${client?.description ?? ''}</dt>
                    <td>${client?.user?.username ?? ''}</dt>
                    <td>${client?.creationDate ?? ''}</dt>
                    <td>${client?.creationTime ?? ''}</dt>
                    <td class="entity_options">
                        <button class="button" id="edit-entity" data-entityId="${client.id}">
                            <i class="fa-solid fa-arrow-right-to-arc"></i>
                        </button>
                    </td>
                `
                table.appendChild(row)
                drawTagsIntoTables()
            }
        }

        this.export()
        this.edit(this.entityDialogContainer, data)
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
            new Logs().render(Config.offset , Config.currentPage, search.value.toLowerCase().trim())
        })
    }

    private edit(container: InterfaceElement, data: Data) {
        // Edit entity
        const edit: InterfaceElement = document.querySelectorAll('#edit-entity')
        edit.forEach((edit: InterfaceElement) => {
            const entityId = edit.dataset.entityid
            edit.addEventListener('click', (): void => {
                RInterface('Log', entityId)
            })
        })

        const RInterface = async (entities: string, entityID: string): Promise<void> => {
            const data: any = await getEntityData(entities, entityID)
            renderRightSidebar(UIRightSidebar);
            const sidebarContainer = document.getElementById('entity-editor-container');
            const closeSidebar: InterfaceElement = document.getElementById('close');
            closeSidebar.addEventListener('click', () => {
                new CloseDialog().x(sidebarContainer);
            });
            // Note details
            const _details: InterfaceElement = {
                name: document.getElementById('log-name'),
                description: document.getElementById('log-description'),
                user: document.getElementById('log-user'),
                date: document.getElementById('creation-date'),
                time: document.getElementById('creation-time'),
                service: document.getElementById('log-service'),
                customer: document.getElementById('log-customer'),
            };
            _details.name.innerText = data?.name ?? '';
            _details.description.innerText = data?.description ?? '';
            _details.user.value = `${data?.user?.username ?? ''}`;
            _details.date.value = data.creationDate;
            _details.time.value = data.creationTime;
            _details.service.value = data?.service?.name ?? '';
            _details.customer.value = data?.customer?.name ?? '';
        }

        
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
                let rawExport = JSON.stringify({
                    "filter": {
                        "conditions": [
                          {
                            "property": "business.id",
                            "operator": "=",
                            "value": `${businessId}`
                          },
                          {
                            "property": "description",
                            "operator": "contains",
                            "value": `SERVICIO`
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
                                    "property": "description",
                                    "operator": "contains",
                                    "value": `${infoPage.search.toLowerCase()}`
                                  },
                                  {
                                    "property": "user.username",
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
                                "property": "description",
                                "operator": "contains",
                                "value": `SERVICIO`
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
                        
                    })
                }
                const logs: any = await getFilterEntityData("Log", rawExport) //await getLogs()
                for (let i = 0; i < _values.exportOption.length; i++) {
                    let ele: any = _values.exportOption[i]
                    if (ele.type = "radio") {
    
                        if (ele.checked){
                            if(ele.value == "xls"){
                                // @ts-ignore
                                exportLogXls(logs)
                            }else if(ele.value == "csv"){
                                // @ts-ignore
                                exportLogCsv(logs)
                            }else if(ele.value == "pdf"){
                                // @ts-ignore
                                //exportClientPdf(logs)
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
                new Logs().render(infoPage.offset, currentPage, infoPage.search)
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
                new Logs().render(Config.offset, Config.currentPage, infoPage.search)
            })

            nextButton.addEventListener('click', (): void => {
                infoPage.offset = Config.tableRows * (pageCount - 1)
                new Logs().render(infoPage.offset, pageCount, infoPage.search)
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