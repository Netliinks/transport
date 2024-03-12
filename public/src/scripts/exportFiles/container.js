export const exportContainerCsv = async (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let container = ar[i];
        // @ts-ignore
        //if(visit.creationDate >= start && visit.creationDate <= end){
        let obj = {
            "Servicio": `${container?.service?.name ?? ''}`,
            "Cliente": `${container?.customer?.name ?? ''}`,
            "ID Contenedor": `${container?.name ?? ''}`,
            "Placa Vehicular": `${container?.licensePlate ?? ''}`,
            "Conductor": `${container?.driver ?? ''}`,
            "DNI": `${container?.dniDriver ?? ''}`,
            "Compañía Transporte": `${container?.transportCompany ?? ''}`,
            "Placa Transporte": `${container?.transportPlate ?? ''}`,
            "Color cabezal": `${container?.headColor ?? ''}`,
            "Bloqueo Satelital": `${container?.satelliteLock ?? ''}`,
            "Estampilla": `${container?.stamp ?? ''}`,
            "Guardia": `${container?.companion.username ?? ''}`,
            "Arma": `${container?.weapon.licensePlate ?? ''}`,
            "Fecha Creación": `${container?.creationDate ?? ''}`,
            "Hora Creación": `${container?.creationTime ?? ''}`,
            "Creado por": `${container?.createdBy ?? ''}`,
        };
        rows.push(obj);
        //}
    }
    generateFile(rows, "Contenedores", "csv");
};
export const exportContainerXls = async (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let container = ar[i];
        // @ts-ignore
        //if(visit.creationDate >= start && visit.creationDate <= end){
        let obj = {
            "Servicio": `${container?.service?.name ?? ''}`,
            "Cliente": `${container?.customer?.name ?? ''}`,
            "ID Contenedor": `${container?.name ?? ''}`,
            "Placa Vehicular": `${container?.licensePlate ?? ''}`,
            "Conductor": `${container?.driver ?? ''}`,
            "DNI": `${container?.dniDriver ?? ''}`,
            "Compañía Transporte": `${container?.transportCompany ?? ''}`,
            "Placa Transporte": `${container?.transportPlate ?? ''}`,
            "Color cabezal": `${container?.headColor ?? ''}`,
            "Bloqueo Satelital": `${container?.satelliteLock ?? ''}`,
            "Estampilla": `${container?.stamp ?? ''}`,
            "Guardia": `${container?.companion.username ?? ''}`,
            "Arma": `${container?.weapon.licensePlate ?? ''}`,
            "Fecha Creación": `${container?.creationDate ?? ''}`,
            "Hora Creación": `${container?.creationTime ?? ''}`,
            "Creado por": `${container?.createdBy ?? ''}`,
        };
        rows.push(obj);
        //}
    }
    generateFile(rows, "Contenedores", "xls");
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
