//
//  AssistControl.ts
//
//  Generated by Poll Castillo on 15/03/2023.
//
import { Config } from "../../../Configs.js";
import { getEntityData, getFilterEntityData } from "../../../endpoints.js";
import { CloseDialog, drawTagsIntoTables, renderRightSidebar, filterDataByHeaderType, inputObserver } from "../../../tools.js";
import { UIContentLayout, UIRightSidebar } from "./Layout.js";
import { UITableSkeletonTemplate } from "./Template.js";
import { exportVehicularCsv, exportVehicularPdf, exportVehicularXls } from "../../../exportFiles/vehiculars.js";
import { InterfaceElement, InterfaceElementCollection } from "../../../types.js";
// Local configs
const tableRows = Config.tableRows;
let currentPage = Config.currentPage;
const pageName = 'Ingreso Vehicular';
const customerId = localStorage.getItem('customer_id');
let dataPage: any
const GetVehiculars = async () => {
    //const vehicularRaw = await getEntitiesData('Vehicular');
    //const vehicular = vehicularRaw.filter((data: any) => data.customer?.id === `${customerId}`);
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
        fetchPlan: 'full',
        
    })
    dataPage = await getFilterEntityData("Vehicular", raw)
    return dataPage;
};
export class Vehiculars {
    private dialogContainer: InterfaceElement = document.getElementById('app-dialogs')
    private siebarDialogContainer: InterfaceElement = document.getElementById('entity-editor-container')
    private appContainer: InterfaceElement = document.getElementById('datatable-container')

    public render = async (): Promise<void> => {      
        this.appContainer.innerHTML = ''
        this.appContainer.innerHTML = UIContentLayout

        // Getting interface elements
        const viewTitle: InterfaceElement = document.getElementById('view-title')
        const tableBody: InterfaceElement = document.getElementById('datatable-body')

        // Changing interface element content
        viewTitle.innerText = pageName
        tableBody.innerHTML = '.Cargando...'

        let eventsArray: any = await GetVehiculars()
        tableBody.innerHTML = UITableSkeletonTemplate.repeat(tableRows)

        // Exec functions
        this.load(tableBody, currentPage, eventsArray)
        this.searchNotes(tableBody, eventsArray)
        new filterDataByHeaderType().filter()
        this.pagination(eventsArray, tableRows, currentPage)
        this.export()

        // Rendering icons
    }

    public load = (tableBody: InterfaceElement, currentPage: number, events: any): void => {
        tableBody.innerHTML = '' // clean table

        // configuring max table row size
        currentPage--
        let start: number = tableRows * currentPage
        let end: number = start + tableRows
        let paginatedItems: any = events.slice(start, end)

        // Show message if page is empty
        if (events.length === 0) {
            let row: InterfaceElement = document.createElement('TR')
            row.innerHTML = `
            <td>No existen datos<td>
            <td></td>
            <td></td>
            `

            tableBody.appendChild(row)
        }
        else {
            for (let i = 0; i < paginatedItems.length; i++) {
                let vehicular = paginatedItems[i]; // getting visit items
                let row = document.createElement('TR');
                row.innerHTML += `
                <td style="white-space: nowrap">${vehicular.licensePlate}</td>
                <td>${vehicular.dni}</td>
                <td>${vehicular.driver}</td>
                <td id="table-date">${vehicular.ingressDate} ${vehicular.ingressTime}</td>
                <td id="table-date">${vehicular?.egressDate ?? ''} ${vehicular?.egressTime ?? ''}</td>
                <td class="tag"><span>${vehicular.visitState.name}</span></td>

                <td>
                    <button class="button" id="entity-details" data-entityId="${vehicular.id}">
                        <i class="table_icon fa-regular fa-magnifying-glass"></i>
                    </button>
                </td>
                `
                tableBody.appendChild(row)
                
                // TODO: Corret this fixer
                // fixDate()
            }
            this.previewEvent()
        }
    }

    private searchNotes = async (tableBody: InterfaceElement, visits: any) => {
        const search: InterfaceElement = document.getElementById('search')

        await search.addEventListener('keyup', () => {
            const arrayVisits = visits.filter((vehicular: any) => `${vehicular.licensePlate}${vehicular.dni}${vehicular.driver}${vehicular.ingressDate}${vehicular.ingressTime}${vehicular.egressDate}${vehicular.egressTime}${vehicular.visitState.name}`
                    .toLowerCase()
                    .includes(search.value.toLowerCase()));
            

            let filteredEvents = arrayVisits.length
            let result = arrayVisits

            if (filteredEvents >= Config.tableRows) filteredEvents = Config.tableRows

            this.load(tableBody, currentPage, result)
            this.pagination(result, tableRows, currentPage)

            // Rendering icons
        })
    }

    private previewEvent = async (): Promise<void> => {
        const openPreview: InterfaceElement = document.querySelectorAll('#entity-details')
        openPreview.forEach((preview: InterfaceElement) => {
            let currentEventId = preview.dataset.entityid
            preview.addEventListener('click', (): void => {
                previewBox(currentEventId)
            })
        })

        const previewBox = async (entity: string): Promise<void> => {
            let markingData = await getEntityData('Vehicular', entity);
            renderRightSidebar(UIRightSidebar)
            const sidebarContainer: InterfaceElement = document.getElementById('entity-editor-container')
            const closeSidebar: InterfaceElement = document.getElementById('close')
            closeSidebar.addEventListener('click', (): void => {
                new CloseDialog().x(sidebarContainer)
            })
            // Event details
            const _values: InterfaceElementCollection = {
                status: document.getElementById('marking-status'),
                name: document.getElementById('marking-name'),
                dni: document.getElementById('marking-dni'),
                license: document.getElementById('marking-license'),
                department: document.getElementById('marking-department'),
                contractor: document.getElementById('marking-contractor'),
                product: document.getElementById('marking-product'),
                type: document.getElementById('marking-type'),
                observation: document.getElementById('marking-observation'),
                dayManager: document.getElementById('marking-dayManager'),
                nightManager: document.getElementById('marking-nightManager'),
                // Start marking
                startDate: document.getElementById('marking-start-date'),
                startTime: document.getElementById('marking-start-time'),
                startGuardID: document.getElementById('marking-start-guard-id'),
                startGuardName: document.getElementById('marking-start-guard-name'),
                // End marking
                endDate: document.getElementById('marking-end-date'),
                endTime: document.getElementById('marking-end-time'),
                endGuardID: document.getElementById('marking-end-guard-id'),
                endGuardName: document.getElementById('marking-end-guard-name')
            }

            _values.status.innerText = markingData.visitState.name;
            _values.name.value = markingData?.driver ?? '';
            _values.dni.value = markingData?.dni ?? '';
            _values.license.value = markingData?.licensePlate ?? '';
            _values.department.value = markingData?.noGuide ?? '';
            _values.contractor.value = markingData?.supplier ?? '';
            _values.product.value = markingData?.product ?? '';
            _values.type.value = markingData?.type ?? '';
            _values.observation.value = markingData?.observation ?? '';
            _values.dayManager.value = markingData?.dayManager ?? '';
            _values.nightManager.value = markingData?.nightManager ?? '';
            // Start marking
            _values.startDate.value = markingData?.ingressDate ?? '';
            _values.startTime.value = markingData?.ingressTime ?? '';
            _values.startGuardID.value = markingData.ingressIssued?.username ?? '';
            _values.startGuardName.value = markingData.ingressIssued?.firstName ?? '' + ' ' + markingData.ingressIssued?.lastName ?? '';
            // End marking
            _values.endDate.value = markingData?.egressDate ?? '';
            _values.endTime.value = markingData?.egressTime ?? '';
            _values.endGuardID.value = markingData.egressIssued?.username ?? '';
            _values.endGuardName.value = markingData.egressIssued?.firstName ?? '' + ' ' + markingData.egressIssued?.lastName ?? '';
            this.closeRightSidebar()
        }
    }

    private export = (): void => {
        const exportNotes: InterfaceElement = document.getElementById('export-entities');
            exportNotes.addEventListener('click', async() => {
                this.dialogContainer.style.display = 'block';
                this.dialogContainer.innerHTML = `
                    <div class="dialog_content" id="dialog-content">
                        <div class="dialog">
                            <div class="dialog_container padding_8">
                                <div class="dialog_header">
                                    <h2>Seleccionar la fecha</h2>
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
                let fecha: any = new Date(); //Fecha actual
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
                    const _values = {
                        start: document.getElementById('start-date'),
                        end: document.getElementById('end-date'),
                        exportOption: document.getElementsByName('exportOption')
                    }
                    const vehiculars = dataPage //await GetVehiculars();
                    for (let i = 0; i < _values.exportOption.length; i++) {
                        let ele: any = _values.exportOption[i];
                        if (ele.type = "radio") {
                            if (ele.checked) {
                                if (ele.value == "xls") {
                                    // @ts-ignore
                                    exportVehicularXls(vehiculars, _values.start.value, _values.end.value);
                                }
                                else if (ele.value == "csv") {
                                    // @ts-ignore
                                    exportVehicularCsv(vehiculars, _values.start.value, _values.end.value);
                                }
                                else if (ele.value == "pdf") {
                                    // @ts-ignore
                                    exportVehicularPdf(vehiculars, _values.start.value, _values.end.value);
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
        pageCount = Math.ceil(items.length / limitRows)

        let button: InterfaceElement

        for (let i = 1; i < pageCount + 1; i++) {
            button = setupButtons(
                i, items, currentPage, tableBody, limitRows
            )

            paginationWrapper.appendChild(button)
        }

        function setupButtons(page: any, items: any, currentPage: number, tableBody: InterfaceElement, limitRows: number) {
            const button: InterfaceElement = document.createElement('button')
            button.classList.add('pagination_button')
            button.innerText = page

            button.addEventListener('click', (): void => {
                currentPage = page
                new Vehiculars().load(tableBody, page, items)
            })

            return button
        }
    }

    private closeRightSidebar = (): void => {
        const closeButton: InterfaceElement = document.getElementById('close')

        const editor: InterfaceElement = document.getElementById('entity-editor-container')

        closeButton.addEventListener('click', (): void => {
            new CloseDialog().x(editor)
        })
    }
}
