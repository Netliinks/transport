//
//  NotesView.ts
//
//  Generated by Poll Castillo on 09/03/2023.
//
import { Config } from "../../../Configs.js"
import { getEntityData, getEntitiesData } from "../../../endpoints.js"
import { CloseDialog, fixDate, renderRightSidebar } from "../../../tools.js"
import { InterfaceElement } from "../../../types.js"
import { UIContentLayout, UIRightSidebar } from "./Layout.js"
import { UITableSkeletonTemplate } from "./Template.js"

// Local configs
const tableRows = Config.tableRows
let currentPage = Config.currentPage
const pageName = 'Notas'

const GetNotes = async (): Promise<void> => {
    const notes = await getEntitiesData('Note')
    return notes
}

export class Notes {
    private dialogContainer: InterfaceElement = document.getElementById('app-dialogs')
    private siebarDialogContainer: InterfaceElement = document.getElementById('entity-editor-container')
    private appContainer: InterfaceElement = document.getElementById('datatable-container')

    public render = async (): Promise<void> => {
        let notesArray: any = await GetNotes()
        this.appContainer.innerHTML = ''
        this.appContainer.innerHTML = UIContentLayout

        // Getting interface elements
        const viewTitle: InterfaceElement = document.getElementById('view-title')
        const tableBody: InterfaceElement = document.getElementById('datatable-body')

        // Changing interface element content
        viewTitle.innerText = pageName
        tableBody.innerHTML = UITableSkeletonTemplate.repeat(tableRows)

        // Exec functions
        this.load(tableBody, currentPage, notesArray)
        this.searchNotes(tableBody, notesArray)

        // Rendering icons
        // @ts-ignore
        feather.replace()
    }

    public load = (tableBody: InterfaceElement, currentPage: number, notes: any): void => {
        tableBody.innerHTML = '' // clean table

        // configuring max table row size
        currentPage--
        let start: number = tableRows * currentPage
        let end: number = start + tableRows
        let paginatedItems: any = notes.slice(start, end)

        // Show message if page is empty
        if (notes.length === 0) {
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
                let note = paginatedItems[i] // getting note items
                let row: InterfaceElement = document.createElement('TR')
                row.innerHTML += `
                    <td>${note.title}</td>
                    <td>${note.content}</td>
                    <td id="table-date">${note.createdDate}</td>
                    <td>
                        <button class="button" id="entity-details" data-entityId="${note.id}">
                            <i data-feather="search" class="table_icon"></i>
                        </button>
                    </td>
                `
                tableBody.appendChild(row)
                this.previewNote()
                fixDate()
            }
        }
    }

    private searchNotes = async (tableBody: InterfaceElement, notes: any) => {
        const search: InterfaceElement = document.getElementById('search')

        await search.addEventListener('keyup', () => {
            const arrayNotes: any = notes.filter((note: any) =>
                `${note.title}`
                    .toLowerCase()
                    .includes(search.value.toLowerCase())
            )

            let filteredNotes = arrayNotes.length
            let result = arrayNotes

            if (filteredNotes >= Config.tableRows) filteredNotes = Config.tableRows

            this.load(tableBody, currentPage, result)

            // Rendering icons
            // @ts-ignore
            feather.replace()
        })
    }

    private previewNote = async (): Promise<void> => {
        const open: InterfaceElement = document.getElementById('entity-details')
        open.addEventListener('click', (): void => {
            renderInterface('User')
        })

        const renderInterface = async (entities: string): Promise<void> => {
            renderRightSidebar(UIRightSidebar)
        }
    }
}