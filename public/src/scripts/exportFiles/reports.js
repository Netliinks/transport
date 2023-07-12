//import {generateFile } from "../tools";
export const exportReportPdf = (ar, start, end) => {
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    var doc = new jsPDF('l');
    doc.addImage("./public/src/assets/pictures/report.png", "PNG", 10, 10, 50, 15);
    doc.setDrawColor(0, 0, 128);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 128);
    doc.setFontSize(25);
    doc.text(10, 40, `Reportes`);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'italic');
    doc.text(220, 40, `Fecha: Desde ${start} Hasta ${end}`);
    //construimos cabecera del csv
    doc.setFont(undefined, 'bold');
    doc.line(5, 45, 290, 45);
    doc.setFillColor(210, 210, 210);
    doc.rect(5, 45, 285, 10, 'F');
    doc.text(10, 50, "Fecha");
    doc.text(30, 50, "Hora");
    doc.text(50, 50, "Usuario");
    doc.text(90, 50, "Título");
    doc.text(140, 50, "Contenido");
    doc.text(240, 50, "Foto");
    doc.line(5, 55, 290, 55);
    let row = 60;
    let lineas = 0;
    let pagina = 1;
    doc.setTextColor(0, 0, 128);
    doc.text(10, 200, `Página ${pagina}`);
    //resto del contenido
    for (let i = 0; i < ar.length; i++) {
        let report = ar[i];
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(10, row + 15, `${report.fecha}`);
        doc.text(30, row + 15, `${report.hora}`);
        doc.text(50, row + 15, `${report.usuario}`);
        doc.text(90, row + 15, `${report.titulo}`);
        var description = report.contenido.split("\n").join("(salto)");
        console.log(description.length);
        if (description.length > 550)
            doc.setFontSize(7);
        var lMargin = 140; //left margin in mm
        var rMargin = 15; //right margin in mm
        var pdfInMM = 250; //210;  // width of A4 in mm
        var paragraph = doc.splitTextToSize(description, (pdfInMM - lMargin - rMargin));
        doc.text(lMargin, row, paragraph);
        doc.line(5, row + 30, 290, row + 30);
        doc.addImage(`${report.imagen}`, "JPEG", 240, row - 2, 50, 30);
        row += 34;
        let limitLineas = 5;
        if (pagina == 1)
            limitLineas = 3;
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
            doc.text(10, 20, "Fecha");
            doc.text(30, 20, "Hora");
            doc.text(50, 20, "Usuario");
            doc.text(90, 20, "Título");
            doc.text(140, 20, "Contenido");
            doc.text(240, 20, "Foto");
            doc.line(5, 25, 290, 25);
            doc.setTextColor(0, 0, 128);
            doc.text(10, 200, `Página ${pagina}`);
        }
        lineas++;
    }
    // Save the PDF
    var d = new Date();
    var title = "log_Reportes_" + d.getDate() + "_" + (d.getMonth() + 1) + "_" + d.getFullYear() + `.pdf`;
    doc.save(title);
};
export const exportReportCsv = (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let note = ar[i];
        let noteCreationDateAndTime = note.creationDate.split('T');
        let noteCreationDate = noteCreationDateAndTime[0];
        let noteCreationTime = noteCreationDateAndTime[1];
        // @ts-ignore
        if (noteCreationDate >= start && noteCreationDate <= end) {
            let obj = {
                "Título": `${note.title.split("\n").join("(salto)")}`,
                "Fecha": `${noteCreationDate}`,
                "Hora": `${noteCreationTime}`,
                "Usuario": `${note.user?.firstName ?? ''} ${note.user?.lastName ?? ''}`,
                "Contenido": `${note.content.split("\n").join("(salto)")}`,
            };
            rows.push(obj);
        }
    }
    generateFile(rows, "Reportes", "csv");
};
export const exportReportXls = (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let note = ar[i];
        let noteCreationDateAndTime = note.creationDate.split('T');
        let noteCreationDate = noteCreationDateAndTime[0];
        let noteCreationTime = noteCreationDateAndTime[1];
        // @ts-ignore
        if (noteCreationDate >= start && noteCreationDate <= end) {
            let obj = {
                "Título": `${note.title.split("\n").join("(salto)")}`,
                "Fecha": `${noteCreationDate}`,
                "Hora": `${noteCreationTime}`,
                "Usuario": `${note.user?.firstName ?? ''} ${note.user?.lastName ?? ''}`,
                "Contenido": `${note.content.split("\n").join("(salto)")}`,
            };
            rows.push(obj);
        }
    }
    generateFile(rows, "Reportes", "xls");
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
