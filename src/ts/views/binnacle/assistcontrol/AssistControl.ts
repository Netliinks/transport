//
//  AssistControl.ts
//
//  Generated by Poll Castillo on 15/03/2023.
//
import { Config } from "../../../Configs.js"
import { getEntityData, getEntitiesData, getUserInfo } from "../../../endpoints.js";
import { CloseDialog, drawTagsIntoTables, renderRightSidebar, filterDataByHeaderType, inputObserver, generateCsv  } from "../../../tools.js";
import { InterfaceElement, InterfaceElementCollection } from "../../../types.js"
import { UIContentLayout, UIRightSidebar } from "./Layout.js"
import { UITableSkeletonTemplate } from "./Template.js"

// Local configs
const tableRows = Config.tableRows
let currentPage = Config.currentPage
const pageName = 'Control de asistencias'
const customerId = localStorage.getItem('customer_id');
const GetAssistControl = async (): Promise<void> => {
    const assistControlRaw = await getEntitiesData('Marcation')
    const assistControl = assistControlRaw.filter((data: any) => `${data.customer?.id}` === `${customerId}`);
    return assistControl
}

export class AssistControl {
    private dialogContainer: InterfaceElement = document.getElementById('app-dialogs')
    private siebarDialogContainer: InterfaceElement = document.getElementById('entity-editor-container')
    private appContainer: InterfaceElement = document.getElementById('datatable-container')

    public render = async (): Promise<void> => {
        let assistControlArray: any = await GetAssistControl()
        this.appContainer.innerHTML = ''
        this.appContainer.innerHTML = UIContentLayout

        // Getting interface elements
        const viewTitle: InterfaceElement = document.getElementById('view-title')
        const tableBody: InterfaceElement = document.getElementById('datatable-body')

        // Changing interface element content
        viewTitle.innerText = pageName
        tableBody.innerHTML = UITableSkeletonTemplate.repeat(tableRows)

        // Exec functions
        this.load(tableBody, currentPage, assistControlArray)
        this.searchVisit(tableBody, assistControlArray)
        new filterDataByHeaderType().filter()
        this.pagination(assistControlArray, tableRows, currentPage)
        this.export()

        // Rendering icons
    }

    public load = (tableBody: InterfaceElement, currentPage: number, assistControl: any): void => {
        tableBody.innerHTML = '' // clean table

        // configuring max table row size
        currentPage--
        let start: number = tableRows * currentPage
        let end: number = start + tableRows
        let paginatedItems: any = assistControl.slice(start, end)

        // Show message if page is empty
        if (assistControl.length === 0) {
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
                let assistControl = paginatedItems[i] // getting visit items
                let row: InterfaceElement = document.createElement('TR')
                row.innerHTML += `
                    <td style="white-space: nowrap">${assistControl.user.firstName} ${assistControl.user.lastName} ${assistControl.user.secondLastName}</td>
                    <td>${assistControl.dni}</td>
                    <td id="table-date">${assistControl.ingressTime}</td>
                    <td id="table-date">${assistControl.egressTime}</td>
                    <td class="tag"><span>${assistControl.marcationState.name}</span></td>

                    <td>
                        <button class="button" id="entity-details" data-entityId="${assistControl.id}">
                            <i class="table_icon fa-regular fa-magnifying-glass"></i>
                        </button>
                    </td>
                `
                tableBody.appendChild(row)
                drawTagsIntoTables()
            }
            this.previewAssist()
            this.fixCreatedDate()
        }
    }

    private searchVisit = async (tableBody: InterfaceElement, visits: any) => {
        const search: InterfaceElement = document.getElementById('search')

        await search.addEventListener('keyup', () => {
            const arrayVisits: any = visits.filter((visit: any) =>
                `${visit.dni}${visit.firstName}${visit.firstLastName}${visit.secondLastName}${visit.createdDate}${visit.visitState.name}${visit.user.userType}${visit.creationTime}`
                    .toLowerCase()
                    .includes(search.value.toLowerCase())
            )

            let filteredVisit = arrayVisits.length
            let result = arrayVisits

            if (filteredVisit >= Config.tableRows) filteredVisit = Config.tableRows

            this.load(tableBody, currentPage, result)
        })
    }

    private previewAssist = async (): Promise<void> => {
        const openButtons: InterfaceElement = document.querySelectorAll('#entity-details')
        openButtons.forEach((openButton: InterfaceElement) => {
            const entityId: string = openButton.dataset.entityid
            openButton.addEventListener('click', (): void => {
                renderInterface(entityId)
            })
        })


        const renderInterface = async (entity: string): Promise<void> => {
            let markingData = await getEntityData('Marcation', entity)
            console.log(markingData)
            renderRightSidebar(UIRightSidebar)

            const _values: InterfaceElementCollection = {
                status: document.getElementById('marking-status'),
                name: document.getElementById('marking-name'),
                dni: document.getElementById('marking-dni'),
                type: document.getElementById('marking-type'),
                department: document.getElementById('marking-department'),
                contractor: document.getElementById('marking-contractor'),
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

            _values.status.innerText = markingData.marcationState.name
            _values.name.value = markingData.user.firstName + ' ' + markingData.user.lastName
            _values.dni.value = markingData.user.dni
            _values.type.value = markingData.user.userType
            _values.department.value = markingData.user.department
            _values.contractor.value = markingData.user.contractor

            // Start marking
            _values.startDate.value = markingData.ingressDate
            _values.startTime.value = markingData.ingressTime
            _values.startGuardID.value = markingData.ingressIssued.username
            _values.startGuardName.value = markingData.ingressIssued.firstName + ' ' + markingData.ingressIssued.lastName
            // End marking
            _values.endDate.value = markingData?.egressDate ?? ''
            _values.endTime.value = markingData?.egressTime ?? ''
            _values.endGuardID.value = markingData.egressIssued?.username ?? ''
            _values.endGuardName.value = markingData.egressIssued?.firstName ?? '' + ' ' + markingData.egressIssued?.lastName ?? ''

            drawTagsIntoTables()

            this.closeRightSidebar()
            drawTagsIntoTables()
        }

    }

    private closeRightSidebar = (): void => {
        const closeButton: InterfaceElement = document.getElementById('close')

        const editor: InterfaceElement = document.getElementById('entity-editor-container')

        closeButton.addEventListener('click', (): void => {
            new CloseDialog().x(editor)
        })
    }

    private fixCreatedDate = (): void => {
        const tableDate: InterfaceElementCollection = document.querySelectorAll('#table-date')

        tableDate.forEach((date: InterfaceElement) => {
            const separateDateAndTime = date.innerText.split('T')
            date.innerText = separateDateAndTime[0]
        })
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
                let rows = [];
                const _values = {
                    start: document.getElementById('start-date'),
                    end: document.getElementById('end-date'),
                }
                const marcations: any = await GetAssistControl();
                for(let i=0; i < marcations.length; i++){
                    let marcation = marcations[i]
                    // @ts-ignore
                    if(marcation.ingressDate >= _values.start.value && marcation.ingressDate <= _values.end.value){
                        let obj = {
                            "DNI": `${marcation.user.dni}`,
                            "Usuario": `${marcation.user.firstName} ${marcation.user.lastName}`,
                            "Fecha Ingreso": `${marcation.ingressDate}`,
                            "Hora Ingreso": `${marcation.ingressTime}`,
                            "Emitido Ingreso": `${marcation.ingressIssued.firstName} ${marcation.ingressIssued.lastName}`,
                            "Fecha Salida": `${marcation.egressDate}`,
                            "Hora Salida": `${marcation.egressTime}`,
                            "Emitido Salida": `${marcation.egressIssued?.firstName} ${marcation.egressIssued?.lastName}`,
                          }
                          rows.push(obj);
                    }
                    
                }
                generateCsv(rows, "Marcaciones");
                
                
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
                new AssistControl().load(tableBody, page, items)
            })

            return button
        }
    }

}