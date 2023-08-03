//
//  VisitsView.ts
//
//  Generated by Poll Castillo on 09/03/2023.
//
import { Config } from "../../../Configs.js";
import { getEntityData, getFile, getFilterEntityData } from "../../../endpoints.js";
import { CloseDialog, drawTagsIntoTables, renderRightSidebar, filterDataByHeaderType, inputObserver, verifyUserType, pageNumbers, fillBtnPagination } from "../../../tools.js";
import { UIContentLayout, UIRightSidebar } from "./Layout.js";
import { UITableSkeletonTemplate } from "./Template.js";
import { exportVisitCsv, exportVisitPdf, exportVisitXls } from "../../../exportFiles/visits.js";
// Local configs
const tableRows = Config.tableRows;
let currentPage = Config.currentPage;
const pageName = 'Visitas';
const customerId = localStorage.getItem('customer_id');
let dataPage;
const GetVisits = async () => {
    //const visitsRaw = await getEntitiesData('Visit')
    //const visits = visitsRaw.filter((data: any) => `${data.customer?.id}` === `${customerId}`);
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
    });
    dataPage = await getFilterEntityData("Visit", raw);
    return dataPage;
};
export class Visits {
    constructor() {
        this.dialogContainer = document.getElementById('app-dialogs');
        this.siebarDialogContainer = document.getElementById('entity-editor-container');
        this.appContainer = document.getElementById('datatable-container');
        this.render = async () => {
            this.appContainer.innerHTML = '';
            this.appContainer.innerHTML = UIContentLayout;
            // Getting interface elements
            const viewTitle = document.getElementById('view-title');
            const tableBody = document.getElementById('datatable-body');
            // Changing interface element content
            viewTitle.innerText = pageName;
            tableBody.innerHTML = '.Cargando...';
            let visitsArray = await GetVisits();
            tableBody.innerHTML = UITableSkeletonTemplate.repeat(tableRows);
            // Exec functions
            this.load(tableBody, currentPage, visitsArray);
            this.searchVisit(tableBody, visitsArray);
            new filterDataByHeaderType().filter();
            this.pagination(visitsArray, tableRows, currentPage);
            this.export();
            // Rendering icons
        };
        this.load = (tableBody, currentPage, visits) => {
            tableBody.innerHTML = ''; // clean table
            // configuring max table row size
            currentPage--;
            let start = tableRows * currentPage;
            let end = start + tableRows;
            let paginatedItems = visits.slice(start, end);
            // Show message if page is empty
            if (visits.length === 0) {
                let row = document.createElement('TR');
                row.innerHTML = `
            <td>No existen datos<td>
            <td></td>
            <td></td>
            `;
                tableBody.appendChild(row);
            }
            else {
                for (let i = 0; i < paginatedItems.length; i++) {
                    let visit = paginatedItems[i]; // getting visit items
                    let row = document.createElement('TR');
                    row.innerHTML += `
                    <td style="white-space: nowrap">${visit.firstName} ${visit.firstLastName} ${visit.secondLastName}</td>
                    <td>${visit.dni}</td>
                    <td id="table-date">${visit.creationDate}</td>
                    <td id="table-time" style="white-space: nowrap">${visit.creationTime}</td>
                    <td>${verifyUserType(visit.user.userType)}</td>
                    <td class="tag"><span>${visit.visitState.name}</span></td>

                    <td>
                        <button class="button" id="entity-details" data-entityId="${visit.id}">
                            <i class="table_icon fa-regular fa-magnifying-glass"></i>
                        </button>
                    </td>
                `;
                    tableBody.appendChild(row);
                    drawTagsIntoTables();
                }
                this.previewVisit();
                //this.fixCreatedDate()
            }
        };
        this.searchVisit = async (tableBody, visits) => {
            const search = document.getElementById('search');
            await search.addEventListener('keyup', () => {
                const arrayVisits = visits.filter((visit) => `${visit.dni}${visit.firstName}${visit.firstLastName}${visit.secondLastName}${visit.creationDate}${visit.visitState.name}${visit.user.userType}${visit.creationTime}`
                    .toLowerCase()
                    .includes(search.value.toLowerCase()));
                let filteredVisit = arrayVisits.length;
                let result = arrayVisits;
                if (filteredVisit >= Config.tableRows)
                    filteredVisit = Config.tableRows;
                this.load(tableBody, currentPage, result);
            });
        };
        this.previewVisit = async () => {
            const openButtons = document.querySelectorAll('#entity-details');
            openButtons.forEach((openButton) => {
                const entityId = openButton.dataset.entityid;
                openButton.addEventListener('click', () => {
                    renderInterface(entityId);
                });
            });
            const renderInterface = async (entity) => {
                let entityData = await getEntityData('Visit', entity);
                //console.log(entityData)
                renderRightSidebar(UIRightSidebar);
                const controlImages = document.getElementById('galeria');
                const visitName = document.getElementById('visit-name');
                visitName.value = `${entityData.firstName} ${entityData.firstLastName}`;
                const visitReason = document.getElementById('visit-reason');
                visitReason.value = entityData?.reason;
                const visitAutorizedBy = document.getElementById('visit-authorizedby');
                visitAutorizedBy.value = entityData?.authorizer;
                const visitStatus = document.getElementById('visit-status');
                visitStatus.innerText = entityData.visitState.name;
                const visitCitadel = document.getElementById('visit-citadel');
                visitCitadel.value = entityData.citadel?.description;
                const visitCitadelID = document.getElementById('visit-citadelid');
                visitCitadelID.value = entityData.citadel?.name;
                const visitDepartment = document.getElementById('visit-department');
                visitDepartment.value = entityData.department?.name;
                // Start marking
                const ingressDate = document.getElementById('ingress-date');
                ingressDate.value = entityData?.ingressDate ?? '';
                const ingressTime = document.getElementById('ingress-time');
                ingressTime.value = entityData?.ingressTime ?? '';
                const ingressGuardId = document.getElementById('ingress-guard-id');
                ingressGuardId.value = entityData?.ingressIssuedId?.username ?? '';
                const ingressGuardName = document.getElementById('ingress-guard-name');
                ingressGuardName.value = `${entityData?.ingressIssuedId?.firstName ?? ''} ${entityData?.ingressIssuedId?.lastName ?? ''}`;
                // End marking
                const egressDate = document.getElementById('egress-date');
                egressDate.value = entityData?.egressDate ?? '';
                const egressTime = document.getElementById('egress-time');
                egressTime.value = entityData?.egressTime ?? '';
                const egressGuardId = document.getElementById('egress-guard-id');
                egressGuardId.value = entityData?.egressIssuedId?.username ?? '';
                const egressGuardName = document.getElementById('egress-guard-name');
                egressGuardName.value = `${entityData?.egressIssuedId?.firstName ?? ''} ${entityData?.egressIssuedId?.lastName ?? ''}`;
                //console.log(entityData.citadel.name)
                if (entityData?.image !== undefined || entityData?.camera1 !== undefined || entityData?.camera2 !== undefined || entityData?.camera3 !== undefined || entityData?.camera4 !== undefined) {
                    let images = [];
                    if (entityData?.image !== undefined) {
                        let details = {
                            "image": `${await getFile(entityData.image)}`,
                            "description": `Adjunto - ${entityData?.dni ?? ''}`,
                            "icon": "mobile",
                            "id": "image"
                        };
                        images.push(details);
                    }
                    if (entityData?.camera1 !== undefined) {
                        let details = {
                            "image": `${await getFile(entityData.camera1)}`,
                            "description": `Cámara 1 - ${entityData?.dni ?? ''}`,
                            "icon": "camera",
                            "id": "camera1"
                        };
                        images.push(details);
                    }
                    if (entityData?.camera2 !== undefined) {
                        let details = {
                            "image": `${await getFile(entityData.camera2)}`,
                            "description": `Cámara 2 - ${entityData?.dni ?? ''}`,
                            "icon": "camera",
                            "id": "camera2"
                        };
                        images.push(details);
                    }
                    if (entityData?.camera3 !== undefined) {
                        let details = {
                            "image": `${await getFile(entityData.camera3)}`,
                            "description": `Cámara 3 - ${entityData?.dni ?? ''}`,
                            "icon": "camera",
                            "id": "camera3"
                        };
                        images.push(details);
                    }
                    if (entityData?.camera4 !== undefined) {
                        let details = {
                            "image": `${await getFile(entityData.camera4)}`,
                            "description": `Cámara 4 - ${entityData?.dni ?? ''}`,
                            "icon": "camera",
                            "id": "camera4"
                        };
                        images.push(details);
                    }
                    for (let i = 0; i < images.length; i++) {
                        controlImages.innerHTML += `
                        <label><i class="fa-solid fa-${images[i].icon}"></i> ${images[i].description}</label>
                        <img width="100%" class="note_picture margin_b_8" src="${images[i].image}" id="entity-details-zoom" data-entityId="${images[i].id}" name="${images[i].id}">
                    `;
                    }
                    this.previewZoom(images);
                }
                else {
                    controlImages.innerHTML += `
                <div class="input_detail">
                    <label><i class="fa-solid fa-info-circle"></i> No hay imágenes</label>
                </div>
                `;
                }
                this.closeRightSidebar();
                //drawTagsIntoTables()
            };
        };
        this.closeRightSidebar = () => {
            const closeButton = document.getElementById('close');
            const editor = document.getElementById('entity-editor-container');
            closeButton.addEventListener('click', () => {
                new CloseDialog().x(editor);
            });
        };
        /*private fixCreatedDate = (): void => {
            const tableDate: InterfaceElementCollection = document.querySelectorAll('#table-date')
    
            tableDate.forEach((date: InterfaceElement) => {
                const separateDateAndTime = date.innerText.split('T')
                date.innerText = separateDateAndTime[0]
            })
        }*/
        this.export = () => {
            const exportNotes = document.getElementById('export-entities');
            exportNotes.addEventListener('click', async () => {
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
                let fecha = new Date(); //Fecha actual
                let mes = fecha.getMonth() + 1; //obteniendo mes
                let dia = fecha.getDate(); //obteniendo dia
                let anio = fecha.getFullYear(); //obteniendo año
                if (dia < 10)
                    dia = '0' + dia; //agrega cero si el menor de 10
                if (mes < 10)
                    mes = '0' + mes; //agrega cero si el menor de 10
                // @ts-ignore
                document.getElementById("start-date").value = anio + "-" + mes + "-" + dia;
                // @ts-ignore
                document.getElementById("end-date").value = anio + "-" + mes + "-" + dia;
                inputObserver();
                const _closeButton = document.getElementById('cancel');
                const exportButton = document.getElementById('export-data');
                const _dialog = document.getElementById('dialog-content');
                exportButton.addEventListener('click', async () => {
                    const _values = {
                        start: document.getElementById('start-date'),
                        end: document.getElementById('end-date'),
                        exportOption: document.getElementsByName('exportOption')
                    };
                    const visits = dataPage; //await GetVisits();
                    for (let i = 0; i < _values.exportOption.length; i++) {
                        let ele = _values.exportOption[i];
                        if (ele.type = "radio") {
                            if (ele.checked) {
                                if (ele.value == "xls") {
                                    // @ts-ignore
                                    exportVisitXls(visits, _values.start.value, _values.end.value);
                                }
                                else if (ele.value == "csv") {
                                    // @ts-ignore
                                    exportVisitCsv(visits, _values.start.value, _values.end.value);
                                }
                                else if (ele.value == "pdf") {
                                    // @ts-ignore
                                    exportVisitPdf(visits, _values.start.value, _values.end.value);
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
        this.previewZoom = async (arrayImages) => {
            const openButtons = document.querySelectorAll('#entity-details-zoom');
            openButtons.forEach((openButton) => {
                const entityId = openButton.dataset.entityid;
                openButton.addEventListener('click', () => {
                    renderInterfaceZoom(entityId, arrayImages);
                });
            });
            const renderInterfaceZoom = async (entity, arrayImages) => {
                let description = '';
                for (let i = 0; i < arrayImages.length; i++) {
                    if (arrayImages[i].id == entity) {
                        description = arrayImages[i].description;
                    }
                }
                const picture = document.getElementsByName(`${entity}`);
                const close = document.getElementById("close-modalZoom");
                const modalZoom = document.getElementById('modalZoom');
                const editor = document.getElementById('entity-editor-container');
                editor.style.display = 'none';
                const img01 = document.getElementById('img01');
                const caption = document.getElementById('caption');
                modalZoom.style.display = 'block';
                img01.src = picture[0].currentSrc;
                caption.innerHTML = `${description}`;
                close.addEventListener('click', () => {
                    modalZoom.style.display = 'none';
                    const editor = document.getElementById('entity-editor-container');
                    editor.style.display = 'flex';
                });
            };
        };
    }
    pagination(items, limitRows, currentPage) {
        const tableBody = document.getElementById('datatable-body');
        const paginationWrapper = document.getElementById('pagination-container');
        paginationWrapper.innerHTML = '';
        let pageCount;
        pageCount = Math.ceil(items.length / limitRows);
        let button;
        if (pageCount <= Config.maxLimitPage) {
            for (let i = 1; i < pageCount + 1; i++) {
                button = setupButtons(i, items, currentPage, tableBody, limitRows);
                paginationWrapper.appendChild(button);
            }
            fillBtnPagination(currentPage, Config.colorPagination);
        }
        else {
            pagesOptions(items, currentPage);
        }
        function setupButtons(page, items, currentPage, tableBody, limitRows) {
            const button = document.createElement('button');
            button.classList.add('pagination_button');
            button.setAttribute("name", "pagination-button");
            button.setAttribute("id", "btnPag" + page);
            button.innerText = page;
            button.addEventListener('click', () => {
                const buttons = document.getElementsByName("pagination-button");
                buttons.forEach(button => {
                    button.style.background = "#ffffff";
                });
                currentPage = page;
                fillBtnPagination(page, Config.colorPagination);
                new Visits().load(tableBody, page, items);
            });
            return button;
        }
        function setupButtons2(page) {
            const button = document.createElement('button');
            button.classList.add('pagination_button');
            button.setAttribute("id", "btnPag" + page);
            button.innerText = page;
            button.addEventListener('click', () => {
                currentPage = page;
                pagesOptions(items, currentPage);
                new Visits().load(tableBody, page, items);
            });
            return button;
        }
        function pagesOptions(items, currentPage) {
            paginationWrapper.innerHTML = '';
            let pages = pageNumbers(items, Config.maxLimitPage, currentPage);
            const prevButton = document.createElement('button');
            prevButton.classList.add('pagination_button');
            prevButton.innerText = "<<";
            paginationWrapper.appendChild(prevButton);
            const nextButton = document.createElement('button');
            nextButton.classList.add('pagination_button');
            nextButton.innerText = ">>";
            for (let i = 0; i < pages.length; i++) {
                if (pages[i] <= pageCount) {
                    button = setupButtons2(pages[i]);
                    paginationWrapper.appendChild(button);
                }
            }
            paginationWrapper.appendChild(nextButton);
            fillBtnPagination(currentPage, Config.colorPagination);
            setupButtonsEvents(prevButton, nextButton);
        }
        function setupButtonsEvents(prevButton, nextButton) {
            prevButton.addEventListener('click', () => {
                pagesOptions(items, 1);
                new Visits().load(tableBody, 1, items);
            });
            nextButton.addEventListener('click', () => {
                pagesOptions(items, pageCount);
                new Visits().load(tableBody, pageCount, items);
            });
        }
    }
}
