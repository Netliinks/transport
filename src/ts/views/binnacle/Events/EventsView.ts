// @filename: EvetnsView.ts

import { Config } from "../../../Configs.js"
import { getEntityData, getEntitiesData, getUserInfo, getFile } from "../../../endpoints.js"
import { CloseDialog, drawTagsIntoTables, renderRightSidebar, filterDataByHeaderType, inputObserver, generateCsv  } from "../../../tools.js"
import { InterfaceElement, InterfaceElementCollection } from "../../../types.js"
import { UIContentLayout, UIRightSidebar } from "./Layout.js"
import { UITableSkeletonTemplate } from "./Template.js"

// Local configs
const tableRows = Config.tableRows
let currentPage = Config.currentPage
const pageName = 'Eventos'
const customerId = localStorage.getItem('customer_id');
const getEvents = async (): Promise<void> => {
    const eventsRaw = await getEntitiesData('Notification')
    const events = eventsRaw.filter((data: any) => `${data.customer?.id}` === `${customerId}`);
    const removeVisitsFromList: any = events.filter((data: any) => data.notificationType.name !== "Visita")
    const removeVehicularFromList: any = removeVisitsFromList.filter((data: any) => data.notificationType.name !== 'Vehicular')
    const removeNoteFromList = removeVehicularFromList.filter((data: any) => data.notificationType.name !== 'Nota')
    return removeNoteFromList
}

export class Events {
    private dialogContainer: InterfaceElement = document.getElementById('app-dialogs')
    private siebarDialogContainer: InterfaceElement = document.getElementById('entity-editor-container')
    private appContainer: InterfaceElement = document.getElementById('datatable-container')

    public render = async (): Promise<void> => {
        let eventsArray: any = await getEvents()
        this.appContainer.innerHTML = ''
        this.appContainer.innerHTML = UIContentLayout

        // Getting interface elements
        const viewTitle: InterfaceElement = document.getElementById('view-title')
        const tableBody: InterfaceElement = document.getElementById('datatable-body')

        // Changing interface element content
        viewTitle.innerText = pageName
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
                let event = paginatedItems[i] // getting note items
                let row: InterfaceElement = document.createElement('TR')
                row.innerHTML += `
                    <td>${event.title}</td>
                    <td>${event.description}</td>
                    <td id="table-date">${event.creationDate}</td>
                    <td>
                        <button class="button" id="entity-details" data-entityId="${event.id}">
                            <i class="fa-solid fa-magnifying-glass"></i>
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

    private searchNotes = async (tableBody: InterfaceElement, events: any) => {
        const search: InterfaceElement = document.getElementById('search')

        await search.addEventListener('keyup', () => {
            const arrayEvents: any = events.filter((event: any) =>
                `${event.title}
                ${event.description}
                ${event.creationDate}`
                    .toLowerCase()
                    .includes(search.value.toLowerCase())
            )

            let filteredEvents = arrayEvents.length
            let result = arrayEvents

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

        const previewBox = async (noteId: string): Promise<void> => {
            const event = await getEntityData('Notification', noteId)

            renderRightSidebar(UIRightSidebar)
            const sidebarContainer: InterfaceElement = document.getElementById('entity-editor-container')
            const closeSidebar: InterfaceElement = document.getElementById('close')
            closeSidebar.addEventListener('click', (): void => {
                new CloseDialog().x(sidebarContainer)
            })
            // Event details
            const _details: InterfaceElementCollection = {
                picture: document.getElementById('event-picture-placeholder'),
                title: document.getElementById('event-title'),
                content: document.getElementById('event-content'),
                author: document.getElementById('event-author'),
                authorId: document.getElementById('event-author-id'),
                date: document.getElementById('creation-date'),
                time: document.getElementById('creation-time')
            }

            /*const eventCreationDateAndTime = event.creationDate.split('T')
            const eventCreationTime = eventCreationDateAndTime[1]
            const eventCreationDate = eventCreationDateAndTime[0]*/

            _details.title.innerText = event.title
            _details.content.innerText = event.description
            _details.author.value = `${event.user.firstName} ${event.user.lastName}`
            _details.authorId.value = event.createdBy
            _details.date.value = event.creationDate
            _details.time.value = event.creationTime
            if (event.attachment !== undefined) {
                const image = await getFile(event.attachment)
                _details.picture.innerHTML = `
                    <img id="note-picture" width="100%" class="note_picture margin_b_8" src="${image}">
                `
            }
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
                const events: any = await getEvents();
                    for(let i=0; i < events.length; i++){
                        let event = events[i]
                        // @ts-ignore
                        if(event.creationDate >= _values.start.value && event.creationDate <= _values.end.value){
                            let obj = {
                                "Título": `${event.title.split("\n").join("(salto)")}`,
                                "Fecha": `${event.creationDate}`,
                                "Hora": `${event.creationTime}`,
                                "Usuario": `${event.user.firstName} ${event.user.lastName}`,
                                "Descripción": `${event.description.split("\n").join("(salto)")}`
                              }
                              rows.push(obj);
                        }
                        
                    }
                    generateCsv(rows, "Eventos");
                
                
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
                new Events().load(tableBody, page, items)
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
