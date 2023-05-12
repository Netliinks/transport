//
//  VisitsView.ts
//
//  Generated by Poll Castillo on 09/03/2023.
//
import { Config } from "../../../Configs.js"
import { getEntityData, getEntitiesData, getUserInfo, getFile } from "../../../endpoints.js"
import { CloseDialog, drawTagsIntoTables, renderRightSidebar, filterDataByHeaderType, inputObserver, generateCsv, verifyUserType  } from "../../../tools.js"
import { InterfaceElement, InterfaceElementCollection } from "../../../types.js"
import { UIContentLayout, UIRightSidebar } from "./Layout.js"
import { UITableSkeletonTemplate } from "./Template.js"

// Local configs
const tableRows = Config.tableRows
let currentPage = Config.currentPage
const pageName = 'Visitas'
const customerId = localStorage.getItem('customer_id');
const GetVisits = async (): Promise<void> => {
    const visitsRaw = await getEntitiesData('Visit')
    const visits = visitsRaw.filter((data: any) => `${data.customer?.id}` === `${customerId}`);
    return visits
}

export class Visits {
    private dialogContainer: InterfaceElement = document.getElementById('app-dialogs')
    private siebarDialogContainer: InterfaceElement = document.getElementById('entity-editor-container')
    private appContainer: InterfaceElement = document.getElementById('datatable-container')

    public render = async (): Promise<void> => {
        let visitsArray: any = await GetVisits()
        this.appContainer.innerHTML = ''
        this.appContainer.innerHTML = UIContentLayout

        // Getting interface elements
        const viewTitle: InterfaceElement = document.getElementById('view-title')
        const tableBody: InterfaceElement = document.getElementById('datatable-body')

        // Changing interface element content
        viewTitle.innerText = pageName
        tableBody.innerHTML = UITableSkeletonTemplate.repeat(tableRows)

        // Exec functions
        this.load(tableBody, currentPage, visitsArray)
        this.searchVisit(tableBody, visitsArray)
        new filterDataByHeaderType().filter()
        this.pagination(visitsArray, tableRows, currentPage)
        this.export()

        // Rendering icons
    }

    public load = (tableBody: InterfaceElement, currentPage: number, visits: any): void => {
        tableBody.innerHTML = '' // clean table

        // configuring max table row size
        currentPage--
        let start: number = tableRows * currentPage
        let end: number = start + tableRows
        let paginatedItems: any = visits.slice(start, end)

        // Show message if page is empty
        if (visits.length === 0) {
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
                let visit = paginatedItems[i] // getting visit items
                let row: InterfaceElement = document.createElement('TR')
                row.innerHTML += `
                    <td style="white-space: nowrap">${visit.firstName} ${visit.firstLastName} ${visit.secondLastName}</td>
                    <td>${visit.dni}</td>
                    <td id="table-date">${visit.createdDate}</td>
                    <td id="table-time" style="white-space: nowrap">${visit.creationTime}</td>
                    <td>${verifyUserType(visit.user.userType)}</td>
                    <td class="tag"><span>${visit.visitState.name}</span></td>
                    <td id="table-time">${visit.citadel.description}</td>

                    <td>
                        <button class="button" id="entity-details" data-entityId="${visit.id}">
                            <i class="table_icon fa-regular fa-magnifying-glass"></i>
                        </button>
                    </td>
                `
                tableBody.appendChild(row)
                drawTagsIntoTables()
            }
            this.previewVisit()
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

    private previewVisit = async (): Promise<void> => {
        const openButtons: InterfaceElement = document.querySelectorAll('#entity-details')
        openButtons.forEach((openButton: InterfaceElement) => {
            const entityId: string = openButton.dataset.entityid
            openButton.addEventListener('click', (): void => {
                renderInterface(entityId)
            })
        })

        const renderInterface = async (entity: string): Promise<void> => {
            let entityData = await getEntityData('Visit', entity)
            //console.log(entityData)
            renderRightSidebar(UIRightSidebar)
            const controlImages: InterfaceElement = document.getElementById('galeria')
            const visitName: InterfaceElement = document.getElementById('visit-name')
            visitName.value = `${entityData.firstName} ${entityData.firstLastName}`

            const visitReason: InterfaceElement = document.getElementById('visit-reason')
            visitReason.value = entityData?.reason

            const visitAutorizedBy: InterfaceElement = document.getElementById('visit-authorizedby')
            visitAutorizedBy.value = entityData?.authorizer

            const visitStatus: InterfaceElement = document.getElementById('visit-status')
            visitStatus.innerText = entityData.visitState.name

            const visitCitadel: InterfaceElement = document.getElementById('visit-citadel')
            visitCitadel.value = entityData.citadel?.description

            const visitCitadelID: InterfaceElement = document.getElementById('visit-citadelid')
            visitCitadelID.value = entityData.citadel?.name

            const visitDepartment: InterfaceElement = document.getElementById('visit-department')
            visitDepartment.value = entityData.department?.name

            // Start marking
            const ingressDate: InterfaceElement = document.getElementById('ingress-date')
            ingressDate.value = entityData?.ingressDate ?? ''
            const ingressTime: InterfaceElement = document.getElementById('ingress-time')
            ingressTime.value = entityData?.ingressTime ?? ''
            const ingressGuardId: InterfaceElement = document.getElementById('ingress-guard-id')
            ingressGuardId.value = entityData?.ingressIssuedId?.username ?? ''
            const ingressGuardName: InterfaceElement = document.getElementById('ingress-guard-name')
            ingressGuardName.value = `${entityData?.ingressIssuedId?.firstName ?? ''} ${entityData?.ingressIssuedId?.lastName ?? ''}`
            // End marking
            const egressDate: InterfaceElement = document.getElementById('egress-date')
            egressDate.value = entityData?.egressDate ?? ''
            const egressTime: InterfaceElement = document.getElementById('egress-time')
            egressTime.value = entityData?.egressTime ?? ''
            const egressGuardId: InterfaceElement = document.getElementById('egress-guard-id')
            egressGuardId.value = entityData?.egressIssuedId?.username ?? ''
            const egressGuardName: InterfaceElement = document.getElementById('egress-guard-name')
            egressGuardName.value = `${entityData?.egressIssuedId?.firstName ?? ''} ${entityData?.egressIssuedId?.lastName ?? ''}`
            //console.log(entityData.citadel.name)
            if (entityData?.image !== undefined || entityData?.camera1 !== undefined || entityData?.camera2 !== undefined || entityData?.camera3 !== undefined|| entityData?.camera4 !== undefined) {
                let images = []
                if(entityData?.image !== undefined){
                    let details = {
                        "image": `${await getFile(entityData.image)}`,
                        "description": "Adjunto",
                        "icon": "mobile"
                    }
                    images.push(details)
                }
                if(entityData?.camera1 !== undefined){
                    let details = {
                        "image": `${await getFile(entityData.camera1)}`,
                        "description": "Cámara 1",
                        "icon": "camera"
                    }
                    images.push(details)
                }
                if(entityData?.camera2 !== undefined){
                    let details = {
                        "image": `${await getFile(entityData.camera2)}`,
                        "description": "Cámara 2",
                        "icon": "camera"
                    }
                    images.push(details)
                }
                if(entityData?.camera3 !== undefined){
                    let details = {
                        "image": `${await getFile(entityData.camera3)}`,
                        "description": "Cámara 3",
                        "icon": "camera"
                    }
                    images.push(details)
                }
                if(entityData?.camera4 !== undefined){
                    let details = {
                        "image": `${await getFile(entityData.camera4)}`,
                        "description": "Cámara 4",
                        "icon": "camera"
                    }
                    images.push(details)
                }
                for(let i=0; i<images.length; i++){
                    controlImages.innerHTML += `
                        <label><i class="fa-solid fa-${images[i].icon}"></i> ${images[i].description}</label>
                        <img width="100%" class="note_picture margin_b_8" src="${images[i].image}">
                    `
                }
            }else{
                controlImages.innerHTML += `
                <div class="input_detail">
                    <label><i class="fa-solid fa-info-circle"></i> No hay imágenes</label>
                </div>
                `
            }

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
                const visits: any = await GetVisits();
                    for(let i=0; i < visits.length; i++){
                        let visit = visits[i]
                        // @ts-ignore
                        if(visit.ingressDate >= _values.start.value && visit.ingressDate <= _values.end.value){
                            let obj = {
                                "Nombre": `${visit.firstName} ${visit.firstLastName} ${visit.secondLastName}`,
                                "DNI": `${visit.dni}`,
                                "Fecha Creación": `${visit.creationDate}`,
                                "Hora Creación": `${visit.creationTime}`,
                                "Usuario": `${visit.user.firstName} ${visit.user.lastName}`,
                                "Tipo": `${verifyUserType(visit.user.userType)}`,
                                "Departamento": `${visit.department.name}`,
                                "Estado": `${visit.visitState.name}`,
                                "Verificado": `${visit.verifiedDocument ? 'Si' : 'No'}`,
                                "Favorita": `${visit.favorite ? 'Si' : 'No'}`,
                                "Teléfono": `${visit.phoneNumber}`,
                                "Autorizado": `${visit.authorizer}`,
                                "Fecha Ingreso": `${visit.ingressDate}`,
                                "Hora Ingreso": `${visit.ingressTime}`,
                                "Emitido Ingreso": `${visit.ingressIssuedId.firstName} ${visit.ingressIssuedId.lastName}`,
                                "Fecha Salida": `${visit.egressDate}`,
                                "Hora Salida": `${visit.egressTime}`,
                                "Emitido Salida": `${visit.egressIssuedId?.firstName} ${visit.egressIssuedId?.lastName}`,
                                "Asunto": `${visit.reason.split("\n").join("(salto)")}`,
                              }
                              rows.push(obj);
                        }
                        
                    }
                    generateCsv(rows, "Visitas");
                
                
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
                new Visits().load(tableBody, page, items)
            })

            return button
        }
    }
}