import { getSearch } from "../tools.js";
/*export const exportLogServicePdf = (ar: any, start: any, end: any) => {
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    var doc = new jsPDF('l')
    doc.addImage("./public/src/assets/pictures/report.png", "PNG", 10, 10, 50, 15);
    doc.setDrawColor(0, 0, 128);
    doc.setFont(undefined, 'bold')
    doc.setTextColor(0,0,128)
    doc.setFontSize(25)
    doc.text(10, 40, `Visitas`)
    doc.setFontSize(10)
    doc.setTextColor(0,0,0);
    doc.setFont(undefined, 'italic')
    doc.text(220, 40, `Fecha: Desde ${start} Hasta ${end}`)
    //construimos cabecera del csv
    doc.setFont(undefined, 'bold')
    doc.line(5, 45, 290, 45);
    doc.setFillColor(210,210,210)
    doc.rect(5, 45, 285, 10, 'F')
    doc.text(10, 50, "Nombre")
    doc.text(60, 50, "DNI")
    doc.text(90, 50, "Fecha")
    doc.text(110, 50, "Hora")
    doc.text(130, 50, "Usuario")
    doc.text(170, 50, "Tipo")
    doc.text(190, 50, "Departamento")
    doc.text(230, 50, "Estado")
    doc.text(250, 50, "Inicio")
    doc.text(270, 50, "Fin")
    doc.line(5, 55, 290, 55);
    
    let row = 60
    let lineas = 0
    let pagina = 1
    doc.setTextColor(0,0,128)
    doc.text(10, 200, `Página ${pagina}`)
    //resto del contenido
    for (let i = 0; i < ar.length; i++) {
        let visit = ar[i]
        // @ts-ignore
        //if(visit.creationDate >= start && visit.creationDate <= end){
            doc.setFontSize(9)
            doc.setFont(undefined, 'normal')
            doc.setTextColor(0,0,0)
            doc.text(10, row, `${visit.firstName} ${visit.firstLastName} ${visit.secondLastName}`)
            doc.text(60, row, `${visit.dni}`)
            doc.text(90, row, `${visit.creationDate}`)
            doc.text(110, row, `${visit.creationTime}`)
            doc.text(130, row, `${visit.user?.firstName ?? ''} ${visit.user?.lastName ?? ''}`)
            doc.text(170, row, `${verifyUserType(visit.user.userType)}`)
            doc.text(190, row, `${visit.department?.name ?? ''}`)
            doc.text(230, row, `${visit.visitState?.name ?? ''}`)
            doc.text(250, row, `${visit?.ingressTime ?? ''}`)
            doc.text(270, row, `${visit?.egressTime ?? ''}`)
            row += 5
            let limitLineas = 33
            if(pagina == 1) limitLineas = 26
            if(lineas >= limitLineas){
                
                doc.addPage()
                lineas=0
                row = 30
                pagina+=1
                doc.setFont(undefined, 'bold')
                doc.setFontSize(10)
                //construimos cabecera del csv
                doc.line(5, 15, 290, 15)
                doc.setFillColor(210,210,210);
                doc.rect(5, 15, 285, 10, 'F');
                doc.text(10, 20, "Nombre")
                doc.text(60, 20, "DNI")
                doc.text(90, 20, "Fecha")
                doc.text(110, 20, "Hora")
                doc.text(130, 20, "Usuario")
                doc.text(170, 20, "Tipo")
                doc.text(190, 20, "Departamento")
                doc.text(230, 20, "Estado")
                doc.text(250, 20, "Inicio")
                doc.text(270, 20, "Fin")
                doc.line(5, 25, 290, 25)
                doc.setTextColor(0,0,128)
                doc.text(10, 200, `Página ${pagina}`)
            }
            lineas++
        //}

    }
    // Save the PDF
    var d = new Date()
    var title = "log_Visitas_"+ d.getDate() + "_" + (d.getMonth()+1) + "_" + d.getFullYear() +`.pdf`;
    doc.save(title);

}*/
export const exportServiceCsv = async (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let service = ar[i];
        // @ts-ignore
        //if(visit.creationDate >= start && visit.creationDate <= end){
        let obj = {
            "Solicitante": `${service?.name ?? ''}`,
            "Cliente": `${service?.customer?.name ?? ''}`,
            "Email": `${service?.email ?? ''}`,
            "Estado": `${service?.serviceState?.name ?? ''}`,
            "Ciudad Origen": `${service?.cityOrigin?.name ?? ''}`,
            "Ciudad Destino": `${service?.cityDestination?.name ?? ''}`,
            "Lugar Origen": `${service?.placeOrigin ?? ''}`,
            "Lugar Destino": `${service?.placeDestination ?? ''}`,
            "Fecha Servicio": `${service?.outputDate ?? ''}`,
            "Hora Servicio": `${service?.outputTime ?? ''}`,
            "Referencia Cliente": `${service?.reference ?? ''}`,
            "Tipo de Custodia": `${service?.custodyType ?? ''}`,
            "# Contenedores": `${service?.quantyContainers ?? '0'}`,
            "# Vehículos": `${service?.quantyVehiculars ?? '0'}`,
            "Fecha Creación": `${service?.creationDate ?? ''}`,
            "Hora Creación": `${service?.creationTime ?? ''}`,
            "Creado por": `${service?.createdBy ?? ''}`,
            "Observación": `${service?.observation.split("\n").join("(salto)") ?? ''}`,
        };
        let control = await getSearch("service.id", service.id, "Control");
        if (control != undefined) {
            let obj1 = {
                "Origen Fecha": `${control?.arrivalOriginDate ?? ''}`,
                "Origen Hora": ` ${control?.arrivalOriginTime ?? ''}`,
                "Origen Usuario": ` ${control?.originUser?.username ?? ''}`,
                "Observación 1": ` ${control?.observation ?? ''}`,
                "Inicio Fecha": `${control?.startingPointDate ?? ''}`,
                "Inicio Hora": ` ${control?.startingPointTime ?? ''}`,
                "Inicio Usuario": ` ${control?.startUser?.username ?? ''}`,
                "Observación 2": ` ${control?.observation2 ?? ''}`,
                "Destino Fecha": `${control?.arrivalDestinationDate ?? ''}`,
                "Destino Hora": ` ${control?.arrivalDestinationTime ?? ''}`,
                "Destino Usuario": ` ${control?.destinationUser?.username ?? ''}`,
                "Observación 3": ` ${control?.observation3 ?? ''}`,
                "Fin Fecha": `${control?.endServiceDate ?? ''}`,
                "Fin Hora": ` ${control?.endServiceTime ?? ''}`,
                "Fin Usuario": ` ${control?.endUser?.username ?? ''}`,
                "Observación 4": ` ${control?.observation4 ?? ''}`,
            };
            obj = Object.assign(obj, obj1);
        }
        rows.push(obj);
        //}
    }
    generateFile(rows, "Log_Servicios", "csv");
};
export const exportServiceXls = async (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let service = ar[i];
        // @ts-ignore
        //if(visit.creationDate >= start && visit.creationDate <= end){
        let obj = {
            "Solicitante": `${service?.name ?? ''}`,
            "Cliente": `${service?.customer?.name ?? ''}`,
            "Email": `${service?.email ?? ''}`,
            "Estado": `${service?.serviceState?.name ?? ''}`,
            "Ciudad Origen": `${service?.cityOrigin?.name ?? ''}`,
            "Ciudad Destino": `${service?.cityDestination?.name ?? ''}`,
            "Lugar Origen": `${service?.placeOrigin ?? ''}`,
            "Lugar Destino": `${service?.placeDestination ?? ''}`,
            "Fecha Servicio": `${service?.outputDate ?? ''}`,
            "Hora Servicio": `${service?.outputTime ?? ''}`,
            "Referencia Cliente": `${service?.reference ?? ''}`,
            "Tipo de Custodia": `${service?.custodyType ?? ''}`,
            "# Contenedores": `${service?.quantyContainers ?? '0'}`,
            "# Vehículos": `${service?.quantyVehiculars ?? '0'}`,
            "Fecha Creación": `${service?.creationDate ?? ''}`,
            "Hora Creación": `${service?.creationTime ?? ''}`,
            "Creado por": `${service?.createdBy ?? ''}`,
            "Observación": `${service?.observation.split("\n").join("(salto)") ?? ''}`,
        };
        let control = await getSearch("service.id", service.id, "Control");
        if (control != undefined) {
            let obj1 = {
                "Origen Fecha": `${control?.arrivalOriginDate ?? ''}`,
                "Origen Hora": ` ${control?.arrivalOriginTime ?? ''}`,
                "Origen Usuario": ` ${control?.originUser?.username ?? ''}`,
                "Observación 1": ` ${control?.observation ?? ''}`,
                "Inicio Fecha": `${control?.startingPointDate ?? ''}`,
                "Inicio Hora": ` ${control?.startingPointTime ?? ''}`,
                "Inicio Usuario": ` ${control?.startUser?.username ?? ''}`,
                "Observación 2": ` ${control?.observation2 ?? ''}`,
                "Destino Fecha": `${control?.arrivalDestinationDate ?? ''}`,
                "Destino Hora": ` ${control?.arrivalDestinationTime ?? ''}`,
                "Destino Usuario": ` ${control?.destinationUser?.username ?? ''}`,
                "Observación 3": ` ${control?.observation3 ?? ''}`,
                "Fin Fecha": `${control?.endServiceDate ?? ''}`,
                "Fin Hora": ` ${control?.endServiceTime ?? ''}`,
                "Fin Usuario": ` ${control?.endUser?.username ?? ''}`,
                "Observación 4": ` ${control?.observation4 ?? ''}`,
            };
            obj = Object.assign(obj, obj1);
        }
        rows.push(obj);
        //}
    }
    generateFile(rows, "Servicios", "xls");
};
const generateFile = (ar, title, extension) => {
    //comprobamos compatibilidad
    if (window.Blob && (window.URL || window.webkitURL)) {
        var contenido = "", d = new Date(), blob, reader, save, clicEvent;
        //creamos contenido del archivo
        for (var i = 0; i < ar.length; i++) {
            //construimos cabecera del csv
            if (i == 0)
                contenido += Object.keys(ar[i]).join(";") + "\n";
            //resto del contenido
            contenido += Object.keys(ar[i]).map(function (key) {
                return ar[i][key];
            }).join(";") + "\n";
        }
        //creamos el blob
        blob = new Blob(["\ufeff", contenido], { type: `text/${extension}` });
        //creamos el reader
        // @ts-ignore
        var reader = new FileReader();
        reader.onload = function (event) {
            //escuchamos su evento load y creamos un enlace en dom
            save = document.createElement('a');
            // @ts-ignore
            save.href = event.target.result;
            save.target = '_blank';
            //aquí le damos nombre al archivo
            save.download = "log_" + title + "_" + d.getDate() + "_" + (d.getMonth() + 1) + "_" + d.getFullYear() + `.${extension}`;
            try {
                //creamos un evento click
                clicEvent = new MouseEvent('click', {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                });
            }
            catch (e) {
                //si llega aquí es que probablemente implemente la forma antigua de crear un enlace
                clicEvent = document.createEvent("MouseEvent");
                // @ts-ignore
                clicEvent.click();
            }
            //disparamos el evento
            save.dispatchEvent(clicEvent);
            //liberamos el objeto window.URL
            (window.URL || window.webkitURL).revokeObjectURL(save.href);
        };
        //leemos como url
        reader.readAsDataURL(blob);
    }
    else {
        //el navegador no admite esta opción
        alert("Su navegador no permite esta acción");
    }
};
