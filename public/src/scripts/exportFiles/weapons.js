//import {generateFile } from "../tools";
/*export const exportVehicularPdf = (ar: any, start: any, end: any) => {
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    var doc = new jsPDF('l');
    doc.addImage("./public/src/assets/pictures/report.png", "PNG", 10, 10, 50, 15);
    doc.setDrawColor(0, 0, 128);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 128);
    doc.setFontSize(25);
    doc.text(10, 40, `Ingreso Vehicular`);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'italic');
    doc.text(220, 40, `Fecha: Desde ${start} Hasta ${end}`);
    //construimos cabecera del csv
    doc.setFont(undefined, 'bold');
    doc.line(5, 45, 290, 45);
    doc.setFillColor(210, 210, 210);
    doc.rect(5, 45, 285, 10, 'F');
    doc.text(10, 50, "Placa");
    doc.text(40, 50, "DNI");
    doc.text(70, 50, "Conductor");
    doc.text(110, 50, "Inicio");
    doc.text(130, 50, "Hora");
    doc.text(150, 50, "Fin");
    doc.text(170, 50, "Hora");
    doc.text(190, 50, "Estado");
    doc.text(220, 50, "Usuario");
    doc.line(5, 55, 290, 55);
    let row = 60;
    let lineas = 0;
    let pagina = 1;
    doc.setTextColor(0, 0, 128);
    doc.text(10, 200, `Página ${pagina}`);
    //resto del contenido
    for (let i = 0; i < ar.length; i++) {
        let vehicular = ar[i];
        // @ts-ignore
        //if (vehicular.ingressDate >= start && vehicular.ingressDate <= end) {
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(10, row, `${vehicular?.licensePlate ?? ''}`);
            doc.text(40, row, `${vehicular?.dni ?? ''}`);
            doc.text(70, row, `${vehicular?.driver ?? ''}`);
            doc.text(110, row, `${vehicular?.ingressDate ?? ''}`);
            doc.text(130, row, `${vehicular?.ingressTime ?? ''}`);
            doc.text(150, row, `${vehicular?.egressDate ?? ''}`);
            doc.text(170, row, `${vehicular?.egressTime ?? ''}`);
            doc.text(190, row, `${vehicular?.visitState?.name ?? ''}`);
            doc.text(220, row, `${vehicular.user?.firstName ?? ''} ${vehicular.user?.lastName ?? ''}`);
            row += 5;
            let limitLineas = 33;
            if (pagina == 1)
                limitLineas = 26;
            if (lineas >= limitLineas) {
                doc.addPage();
                lineas = 0;
                row = 30;
                pagina += 1;
                doc.setFont(undefined, 'bold');
                doc.setFontSize(10);
                //construimos cabecera del csv
                doc.line(5, 15, 290, 15);
                doc.setFillColor(210, 210, 210);
                doc.rect(5, 15, 285, 10, 'F');
                doc.text(10, 20, "Placa");
                doc.text(40, 20, "DNI");
                doc.text(70, 20, "Conductor");
                doc.text(110, 20, "Inicio");
                doc.text(130, 20, "Hora");
                doc.text(150, 20, "Fin");
                doc.text(170, 20, "Hora");
                doc.text(190, 20, "Estado");
                doc.text(220, 20, "Usuario");
                doc.line(5, 25, 290, 25);
                doc.setTextColor(0, 0, 128);
                doc.text(10, 200, `Página ${pagina}`);
            }
            lineas++;
        //}
    }
    // Save the PDF
    var d = new Date();
    var title = "log_Vehicular_" + d.getDate() + "_" + (d.getMonth() + 1) + "_" + d.getFullYear() + `.pdf`;
    doc.save(title);
};*/
export const exportWeaponCsv = (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let weapon = ar[i];
        // @ts-ignore
        //if (vehicular.ingressDate >= start && vehicular.ingressDate <= end) {
        let obj = {
            "Nombre": `${weapon?.name.split("\n").join("(salto)") ?? ''}`,
            "Placa": `${weapon?.licensePlate.split("\n").join("(salto)") ?? ''}`,
            "Serie": `${weapon?.nroSerie.split("\n").join("(salto)") ?? ''}`,
            "Estado": `${weapon?.weaponState?.name ?? ''}`,
            "Fecha Creación": `${weapon?.creationDate ?? ''}`,
            "Hora Creación": `${weapon?.creationTime ?? ''}`,
            "Creado por": `${weapon?.createdBy ?? ''}`,
        };
        rows.push(obj);
        //}
    }
    generateFile(rows, "Armas", "csv");
};
export const exportWeaponXls = (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let weapon = ar[i];
        // @ts-ignore
        //if (vehicular.ingressDate >= start && vehicular.ingressDate <= end) {
        let obj = {
            "Nombre": `${weapon?.name.split("\n").join("(salto)") ?? ''}`,
            "Placa": `${weapon?.licensePlate.split("\n").join("(salto)") ?? ''}`,
            "Serie": `${weapon?.nroSerie.split("\n").join("(salto)") ?? ''}`,
            "Estado": `${weapon?.weaponState?.name ?? ''}`,
            "Fecha Creación": `${weapon?.creationDate ?? ''}`,
            "Hora Creación": `${weapon?.creationTime ?? ''}`,
            "Creado por": `${weapon?.createdBy ?? ''}`,
        };
        rows.push(obj);
        //}
    }
    generateFile(rows, "Armas", "xls");
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
