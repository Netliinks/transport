//
//  lib.tools.ts
//
// Generated by Poll Castillo on 15/02/2023.
import { Config } from "./Configs"
import { currentTime } from "./UserLoggedInfo"
import { getEntitiesData, getUserInfo, getFilterEntityData, getEntityData, registerEntity, _userAgent, updateEntity } from "./endpoints.js"
import { Data, InterfaceElement, InterfaceElementCollection } from "./types.js"

//
export const inputObserver = (): void => {
    const inputs = <NodeListOf<Element>>document.querySelectorAll('input')
    inputs.forEach((input: any) => {
        input.addEventListener("keyup", (e: any): void => {
            if (input.value == "" || input.value == " ")
                input.classList.remove('input_filled'),
                    input.value = ""
            else
                input.classList.add('input_filled')
        })
    })
}

export const inputSelect = async (entity: string, selectId: string, currentStatus?: string): Promise<void> => {
    const data = await getEntitiesData(entity)
    const Fdata1: Data = data.filter((data: any) => data?.name != "Asignado")
    const Fdata2: Data = Fdata1.filter((data: any) => data?.name != "En servicio")
    const state: any = await currentStatus
    const select: InterfaceElement = document.querySelector(`#${selectId}`)
    const inputParent = select.parentNode
    const optionsContent = inputParent.querySelector('#input-options')
    const optionsContainer: InterfaceElement = document.createElement('div')
    optionsContainer.classList.add('input_options_container')

    optionsContent.appendChild(optionsContainer)

    for (let i = 0; i < Fdata2.length; i++) {
        const inputOption: InterfaceElement = document.createElement('div')
        select.setAttribute('data-optionid', Fdata2[0].id)
        select.setAttribute('value', Fdata2[0].name)
        if(Fdata2[i].id == state || `${Fdata2[i].name}`.includes(state)){
            select.setAttribute('data-optionid', Fdata2[i].id)
            select.value = Fdata2[i].name
        }
        inputOption.classList.add('input_option')
        inputOption.setAttribute('id', Fdata2[i].id)
        let nameData: Data = Fdata2[i].name
        if (nameData === 'Enabled') {
            nameData = 'Activo'
        } else if (nameData === 'Disabled') {
            nameData = 'Inactivo'
        }
        inputOption.innerHTML = nameData

        optionsContainer.appendChild(inputOption)
    }
    const options: InterfaceElement = optionsContainer.querySelectorAll('.input_option')

    if (state === "Enabled") {
        select.value = "Activo"
        select.setAttribute('data-optionid', '60885987-1b61-4247-94c7-dff348347f93')
    } else if (state === 'Disabled') {
        select.value = "Inactivo"
        select.setAttribute('data-optionid', '225b5e5d-9bb1-469a-b2d9-ca85d53db47b')
    }
    

    select.addEventListener('click', (): void => {
        inputParent.classList.toggle('select_active')
    })

    options.forEach((option: any) => {
        option.addEventListener('click', (): void => {
            select.value = option.innerText
            select.removeAttribute('data-optionid')
            select.setAttribute('data-optionid', option.getAttribute('id'))
            inputParent.classList.remove('select_active')
        })
    })
}

export class FixStatusElement {
    public fix(element: any): void {
        const elementTextValue = element.innerText
        if (elementTextValue === "Enabled")
            elementTextValue.innerText = 'Activo',
                elementTextValue.toUpperCase()
        else
            elementTextValue.toUpperCase()
    }
}

export class FixStatusInputElement {
    public fix(inputId: string): void {
        const inputs = <NodeListOf<Element>>document.querySelectorAll(`#${inputId}`)
        inputs.forEach((input: any): void => {
            if (input.value === 'Enabled')
                input.value = 'Activo'.toUpperCase()
            else if (input.value == 'Disabled')
                input.value = 'Inactivo'.toUpperCase()
        })
    }
}

export const drawTagsIntoTables = (): void => {
    const tags: HTMLElement | any = document.querySelectorAll('.tag span')
    tags.forEach((tag: any): void => {
        let text = tag.innerText
        if (text === "Enabled" ||
            text === "enabled" ||
            text === "ENABLED" ||
            text === "Activo" ||
            text === "ACTIVO") {
            tag.innerText = "Activo"
            tag.classList.add("tag_green")
        }
        else if (text === "Disabled" ||
            text === "disabled" ||
            text === "DISABLED" ||
            text === "Inactivo" ||
            text === "INACTIVO") {
            tag.innerText = "Inactivo"
            tag.classList.add("tag_gray")
        } else if (text === "Pendiente" ||
            text === "pendiente" ||
            text === "PENDIENTE") {
            tag.classList.add("tag_yellow")
        } else {
            tag.classList.add('tag_gray')
        }
    })
}

export class CloseDialog {
    public x(container?: any) {
        container.style.display = 'none'
        // const dialog: InterfaceElement = container.firstElementChild
        // dialog.remove()
    }
}

// SIDEBAR RENDERING TOOLS
export const renderRightSidebar = (UIFragment: InterfaceElement) => {
    const dialogContainer: InterfaceElement = document.getElementById('entity-editor-container')

    dialogContainer.innerHTML = ''
    dialogContainer.style.display = 'flex'
    dialogContainer.innerHTML = UIFragment
}

export const fixDate = () => {
    const arrayDates: InterfaceElementCollection = document.querySelectorAll('#table-date')
    arrayDates.forEach((date: InterfaceElement) => {
        const dateP1 = date.innerText.split('-')
        const dateP2 = dateP1[2].split('T')
        const dateP3 = dateP2[1].split(':')

        const YearDate = dateP1[0]
        const MonthDate = dateP1[1]
        const DayDate = dateP2[0]

        const Hours = dateP3[0]
        const Minutes = dateP3[1]
        const Seconds = dateP3[2]

        const DT = YearDate + ' ' + MonthDate + ' ' + DayDate
        const Time = Hours + ':' + Minutes + ':' + Seconds.slice(0, 2)

        date.innerText = DT + ' ' + Time
    })

}

export class filterDataByHeaderType {
    private readonly datatable: InterfaceElement = document.getElementById('datatable')

    public filter = (): void => {

        this.datatable.onclick = (e: any) => {
            if (e.target.tagName != "SPAN") return
            let span = e.target
            let th = e.target.parentNode

            const THead = this.datatable.querySelectorAll('tr th span')
            THead.forEach((header: InterfaceElement) => {
                header.classList.remove('datatable_header_selected')
            })

            e.target.classList.add('datatable_header_selected')
            this.sortGrid(th.cellIndex, span.dataset.type, span)
        }
    }

    private sortGrid = (colNum: number, type: string, span: any): void => {
        let tbody: any = this.datatable.querySelector('tbody')
        let rowsArray = Array.from(tbody.rows)
        let compare: any

        if(span.dataset.mode == "desc"){              
            compare = (rowA: any, rowB: any) => {
                return rowA.cells[colNum].innerHTML >
                    rowB.cells[colNum].innerHTML ? -1 : 1
            }
            span.setAttribute("data-mode", "asc")
        }else{
            compare = (rowA: any, rowB: any) => {
                return rowA.cells[colNum].innerHTML >
                    rowB.cells[colNum].innerHTML ? 1 : -1
            }
            span.setAttribute("data-mode", "desc")
        }
        /*switch (type) {
            case 'name':
                compare = (rowA: any, rowB: any) => {
                    return rowA.cells[colNum].innerHTML >
                        rowB.cells[colNum].innerHTML ? 1 : -1
                }
                break
            case 'id':
                compare = (rowA: any, rowB: any) => {
                    return rowA.cells[colNum].innerHTML >
                        rowB.cells[colNum].innerHTML ? 1 : -1
                }
                break
            case 'status':
                compare = (rowA: any, rowB: any) => {
                    return rowA.cells[colNum].innerHTML >
                        rowB.cells[colNum].innerHTML ? 1 : -1
                }
                break
            case 'citadel':
                compare = (rowA: any, rowB: any) => {
                    return rowA.cells[colNum].innerHTML >
                        rowB.cells[colNum].innerHTML ? 1 : -1
                }
                break
        }*/

        rowsArray.sort(compare)
        tbody.append(...rowsArray)
    }
}

export const userInfo = getUserInfo()

export const getVerifyEmail = async (email: string) => {
    let value = false;
    //console.log(email.includes("@"))
    if(email.includes("@") === true){
        /*const users = await getEntitiesData('User');
        const data = users.filter((data) => `${data.email}`.includes(`${email}`));*/
        let raw = JSON.stringify({
            "filter": {
                "conditions": [
                  {
                    "property": "email",
                    "operator": "=",
                    "value": `${email}`
                  }
                ]
            }
        });
        let data = await getFilterEntityData("User", raw);
        if(data.length != 0){
            value = true;
        }
    }
    return value;
}

export const getVerifyUsername = async (username: string) => {
    let value = "none";
    //console.log(email.includes("@"))
    if(username != ''){
        /*const users = await getEntitiesData('User');
        const data = users.filter((data) => `${data.email}`.includes(`${email}`));*/
        let raw = JSON.stringify({
            "filter": {
                "conditions": [
                  {
                    "property": "username",
                    "operator": "=",
                    "value": `${username}`
                  }
                ]
            }
        });
        let data = await getFilterEntityData("User", raw);
        if(data.length != 0){
            value = `${verifyUserType(data[0].userType)}, super: ${data[0].isSuper ? 'Si' : 'No'}`;
        }
    }
    return value;
}


export const getNothing = async (param: string, value: string, table: string) => {
    let raw = JSON.stringify({
        "filter": {
            "conditions": [
                {
                "property": `${param}`,
                "operator": "=",
                "value": `${value}`
                }
            ]
        },
        fetchPlan: 'full',
    });
    let data = await getFilterEntityData(`${table}`, raw);
    if(data.length != 0){
        return data[0]
    }
}

export const getSearch = async (param: string, value: string, table: string) => {
    const businessId = localStorage.getItem('business_id')
    let raw = JSON.stringify({
        "filter": {
            "conditions": [
                {
                "property": `${param}`,
                "operator": "=",
                "value": `${value}`
                },
                {
                "property": `business.id`,
                "operator": "=",
                "value": `${businessId}`
                }
            ]
        },
        fetchPlan: 'full',
    });
    let data = await getFilterEntityData(`${table}`, raw);
    if(data.length != 0){
        return data[0]
    }
}

export const getDetails = async (param: string, value: string, table: string) => {
    const businessId = localStorage.getItem('business_id')
    let raw = JSON.stringify({
        "filter": {
            "conditions": [
                {
                "property": `${param}`,
                "operator": "=",
                "value": `${value}`
                },
                {
                "property": `business.id`,
                "operator": "=",
                "value": `${businessId}`
                }
            ]
        },
        fetchPlan: 'full',
    });
    let data = await getFilterEntityData(`${table}`, raw);
    if(data.length != 0){
        return data
    }
}

export const getUpdateState = async (value: string, table: string, entityId: any) => {
    let raw: any
    if(table == "Vehicular"){
        raw = JSON.stringify({
            "vehicularState": {
                "id": `${value}`
            },
        })
    }else if(table == "User"){
        raw = JSON.stringify({
            "userState": {
                "id": `${value}`
            },
        })
    }else if(table == "Weapon"){
        raw = JSON.stringify({
            "weaponState": {
                "id": `${value}`
            },
        })
    }else if(table == "Crew"){
        raw = JSON.stringify({
            "crewState": {
                "id": `${value}`
            },
        })
    }else if(table == "Service"){
        raw = JSON.stringify({
            "serviceState": {
                "id": `${value}`
            },
        })
    }
    updateEntity(table, entityId, raw)
}


export const verifyUserType = (userType: string) =>{
    if(userType == 'CUSTOMER'){
      return 'Cliente'
    }else if(userType == 'GUARD'){
      return 'Guardia'
    }else if(userType == 'EMPLOYEE'){
      return 'Empleado'
    }else if(userType == 'CONTRACTOR'){
      return 'Contratista'
    }else{
      return userType
    }
}

/*export const registryPlataform = async(id: any) => {
    let platUser = await getEntityData('User', id)
    const _date = new Date()
    // TIME
    const _hours: number = _date.getHours()
    const _minutes: number = _date.getMinutes()
    const _seconds: number = _date.getSeconds()
    const _fixedHours: string = ('0' + _hours).slice(-2)
    const _fixedMinutes: string = ('0' + _minutes).slice(-2)
    const _fixedSeconds: string = ('0' + _seconds).slice(-2)
    const currentTime = `${_fixedHours}:${_fixedMinutes}:${_fixedSeconds}`
    // DATE
    const _day: number = _date.getDate()
    const _month: number = _date.getMonth() + 1
    const _year: number = _date.getFullYear()
    const date: string = `${_year}-${('0' + _month).slice(-2)}-${('0' + _day).slice(-2)}`
    let plataformRaw = JSON.stringify({
        // @ts-ignore
        "userAgent": `${_userAgent}`,
        "customer": {
            "id": `${platUser.customer.id}`
        },
        "system": {
            "id": `3377a344-a1e9-7ea0-4204-44d4040debd2`
        },
        "user": {
            "id": `${platUser.id}`
        },
        // @ts-ignore
        "creationDate": `${date}`,
        // @ts-ignore
        "creationTime": `${currentTime}`,
    })
    await registerEntity(plataformRaw, 'WebAccess')
    .then(res => {
        console.log("Registrado")
    })
}*/

export const pageNumbers: any = (totalPages: number, max: number, currentPage: number) => {
    let limitMin: any
    let limitMax: any
    let ranges = []
    if(currentPage == 1){
        limitMin = 1
        limitMax = max
        for(let i = limitMin; i <= limitMax; i++){
            ranges.push(i)
        }
    }
    /*else if(currentPage == totalPages){
        let limit = totalPages - max
        for(let i = limit; i <= totalPages; i++){
                ranges.push(i)
        }
    }*/else{
        limitMin = currentPage - 4
        for(let i = limitMin; i < currentPage; i++){
            ranges.push(i)
        }
        limitMax = currentPage + 5
        for(let i = currentPage; i <= limitMax; i++){
            ranges.push(i)
        }
    }
    return ranges
    /*console.log(items)
    console.log("items.length "+items.length)
    console.log("max "+max)
    console.log("currentPage "+currentPage)
    const half: number = Math.round(max/2)
    console.log("half "+half)
    let to = max
    console.log("to "+to)

    console.log("currentPage + half "+(currentPage + half))
    if(currentPage + half >= items.length){
        to = items.length
    } else if(currentPage > half){
        to = currentPage + half
    }
    console.log("to resultado "+to)
    let from = to - max

    return Array.from({length: max}, (_,i) => (i+1)+from)*/
}

export const fillBtnPagination: any = (currentPage: number, color: any) => {
    let btnActive: InterfaceElement = document.getElementById("btnPag"+currentPage)
    if(btnActive) btnActive.style.backgroundColor=color;
    //btnActive.focus();
}

export const userPermissions: any = () => {
    const userType: any = localStorage.getItem('user_type')
    if(userType == 'ADMIN'){
        return {
            style: "relative"
        }
    }else{
        return {
            style: "none"
        }
    }
}

export const currentDateTime: any = () => {
    const _date = new Date();
    // TIME
    const _hours = _date.getHours();
    const _minutes = _date.getMinutes();
    const _seconds = _date.getSeconds();
    const _fixedHours = ('0' + _hours).slice(-2);
    const _fixedMinutes = ('0' + _minutes).slice(-2);
    const _fixedSeconds = ('0' + _seconds).slice(-2);
    const currentTime = `${_fixedHours}:${_fixedMinutes}:${_fixedSeconds}`;
    // DATE
    const _day = _date.getDate();
    const _month = _date.getMonth() + 1;
    const _year = _date.getFullYear();
    const date = `${_year}-${('0' + _month).slice(-2)}-${('0' + _day).slice(-2)}`;
    return {
        date: date,
        time: currentTime
    }
}

export const eventLog: any = async (mode: string, table: string, message: any, service: any) => {
    let logConfing = {
        name: '', 
        word: '',
        raw: ''
    }
    const currentUser = await getUserInfo()
    const businessId = localStorage.getItem('business_id')
    if(mode == 'INS'){
        logConfing.name = 'INGRESO'       
        logConfing.word = 'ingresado' 
    }else if(mode == 'UPD'){
        logConfing.name = 'ACTUALIZACION' 
        logConfing.word = 'actualizado' 
    }else if(mode == 'DLT'){
        logConfing.name = 'ELIMINACION' 
        logConfing.word = 'eliminado' 
    }

    if(service == '' || service == undefined || service == null){
        logConfing.raw = JSON.stringify({
            "name": `${logConfing.name}`,
            "description": `Se ha ${logConfing.word} un ${table}: ${message}.`,
            "user":{
                "id": `${currentUser.attributes.id}`
            },
            "business":{
                "id": `${businessId}`
            },
            'creationDate': `${currentDateTime().date}`,
            'creationTime': `${currentDateTime().time}`,
        })
    }else{
        logConfing.raw = JSON.stringify({
            "name": `${logConfing.name}`,
            "description": `Se ha ${logConfing.word} un ${table}: ${message}.`,
            "user":{
                "id": `${currentUser.attributes.id}`
            },
            "business":{
                "id": `${businessId}`
            },
            "customer":{
                "id": `${service?.customer?.id}`
            },
            "service":{
                "id": `${service?.id}`
            },
            'creationDate': `${currentDateTime().date}`,
            'creationTime': `${currentDateTime().time}`,
        })
    }

    registerEntity(logConfing.raw, 'Log')
}

export const inputSelectType = async (selectId: any, table: any, currentType: any ) => {
    let data: any
    if(table == "VEHICULAR"){
        data = [
            {id: 'CAMIONETA', name: 'CAMIONETA'},
            {id: 'AUTO', name: 'AUTO'},
            {id: 'MOTO', name: 'MOTO'},
            {id: 'LANCHA', name: 'LANCHA'},
        ]
    }else if(table == "SERVICE"){
        data = [
            {id: 'INTERNA', name: 'INTERNA'},
            {id: 'EXTERNA', name: 'EXTERNA'},
            {id: 'FLUVIAL', name: 'FLUVIAL'},
        ]
    }else if(table == "CATEGORY"){
        data = [
            {id: 'P1', name: 'P1'},
            {id: 'P2', name: 'P2'},
            {id: 'P3', name: 'P3'},
            {id: 'P4', name: 'P4'},
            {id: 'P5', name: 'P5'},
        ]
    }
    const type = await currentType
    const select: InterfaceElement = document.querySelector(`#${selectId}`)
    const inputParent = select.parentNode
    const optionsContent = inputParent.querySelector('#input-options')
    const optionsContainer: InterfaceElement = document.createElement('div')
    optionsContainer.classList.add('input_options_container')

    optionsContent.appendChild(optionsContainer)

    for (let i = 0; i < data.length; i++) {
        const inputOption: InterfaceElement = document.createElement('div')
        select.setAttribute('data-optionid', data[0].id)
        select.setAttribute('value', data[0].name)
        inputOption.classList.add('input_option')
        inputOption.setAttribute('id', data[i].id)
        let nameData: Data = data[i].name
        if (nameData === 'Enabled') {
            nameData = 'Activo'
        } else if (nameData === 'Disabled') {
            nameData = 'Inactivo'
        }
        inputOption.innerHTML = nameData

        optionsContainer.appendChild(inputOption)
    }
    
    const options: InterfaceElement = optionsContainer.querySelectorAll('.input_option');
    /*if (type === "CUSTOMER") {
        select.value = "Cliente";
        select.setAttribute('data-optionid', type);
    }
    else if (type === 'GUARD') {
        select.value = "Guardia";
        select.setAttribute('data-optionid', type);
    }
    else {
        select.value = data[0].name;
    }*/
    select.addEventListener('click', () => {
        inputParent.classList.toggle('select_active');
    });
    options.forEach((option: any) => {
        option.addEventListener('click', () => {
            select.value = option.innerText;
            select.removeAttribute('data-optionid');
            select.setAttribute('data-optionid', option.getAttribute('id'));
            inputParent.classList.remove('select_active');
        });
    });
} 