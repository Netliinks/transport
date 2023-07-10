export const exportMarcationsPdf = (ar, start, end) => {
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    var doc = new jsPDF();
    doc.setDrawColor(0, 0, 128);
    doc.setFont(undefined, 'bold');
    doc.text(10, 20, `Marcaciones desde ${start} hasta ${end}`);
    doc.setFontSize(10);
    //construimos cabecera del csv
    doc.text(10, 30, "Nombre");
    doc.text(50, 30, "DNI");
    doc.text(80, 30, "Inicio");
    doc.text(100, 30, "Hora");
    doc.text(130, 30, "Fin");
    doc.text(150, 30, "Hora");
    doc.text(170, 30, "Estado");
    doc.line(10, 35, 200, 35);
    let row = 40;
    let lineas = 0;
    let pagina = 1;
    doc.text(10, 290, `Página # ${pagina}`);
    //resto del contenido
    for (let i = 0; i < ar.length; i++) {
        let marcation = ar[i];
        // @ts-ignore
        if (marcation.ingressDate >= start && marcation.ingressDate <= end) {
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            doc.text(10, row, `${marcation.user.firstName} ${marcation.user.lastName}`);
            doc.text(50, row, `${marcation.user?.dni ?? ''}`);
            doc.text(80, row, `${marcation.ingressDate}`);
            doc.text(100, row, `${marcation.ingressTime}`);
            doc.text(130, row, `${marcation?.egressDate ?? ''}`);
            doc.text(150, row, `${marcation?.egressTime ?? ''}`);
            doc.text(170, row, `${marcation.marcationState.name}`);
            row += 5;
            let limitLineas = 51;
            if (pagina == 1)
                limitLineas = 48;
            if (lineas >= limitLineas) {
                doc.addPage();
                lineas = 0;
                row = 30;
                pagina += 1;
                doc.setFont(undefined, 'bold');
                doc.setFontSize(10);
                //construimos cabecera del csv
                doc.text(10, 20, "Nombre");
                doc.text(50, 20, "DNI");
                doc.text(80, 20, "Inicio");
                doc.text(100, 20, "Hora");
                doc.text(130, 20, "Fin");
                doc.text(150, 20, "Hora");
                doc.text(170, 20, "Estado");
                doc.line(10, 25, 200, 25);
                doc.text(10, 290, `Página # ${pagina}`);
            }
            lineas++;
        }
    }
    // Save the PDF
    var d = new Date();
    var title = "log_Marcaciones_" + d.getDate() + "_" + (d.getMonth() + 1) + "_" + d.getFullYear() + `.pdf`;
    doc.save(title);
};
export const exportMarcationsCsv = (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let marcation = ar[i];
        // @ts-ignore
        if (marcation.ingressDate >= _values.start.value && marcation.ingressDate <= _values.end.value) {
            let obj = {
                "DNI": `${marcation.user?.dni ?? ''}`,
                "Usuario": `${marcation.user.firstName} ${marcation.user.lastName}`,
                "Fecha Ingreso": `${marcation.ingressDate}`,
                "Hora Ingreso": `${marcation.ingressTime}`,
                "Emitido Ingreso": `${marcation.ingressIssued.firstName} ${marcation.ingressIssued.lastName}`,
                "Fecha Salida": `${marcation?.egressDate ?? ''}`,
                "Hora Salida": `${marcation?.egressTime ?? ''}`,
                "Emitido Salida": `${marcation.egressIssued?.firstName ?? ''} ${marcation.egressIssued?.lastName ?? ''}`,
                "Estado": `${marcation.marcationState.name}`,
            };
            rows.push(obj);
        }
    }
    generateFile(rows, "Marcaciones", "csv");
};
export const exportMarcationsXls = (ar, start, end) => {
    let rows = [];
    for (let i = 0; i < ar.length; i++) {
        let marcation = ar[i];
        // @ts-ignore
        if (marcation.ingressDate >= start && marcation.ingressDate <= end) {
            let obj = {
                "DNI": `${marcation.user?.dni ?? ''}`,
                "Usuario": `${marcation.user.firstName} ${marcation.user.lastName}`,
                "Fecha Ingreso": `${marcation.ingressDate}`,
                "Hora Ingreso": `${marcation.ingressTime}`,
                "Emitido Ingreso": `${marcation.ingressIssued.firstName} ${marcation.ingressIssued.lastName}`,
                "Fecha Salida": `${marcation?.egressDate ?? ''}`,
                "Hora Salida": `${marcation?.egressTime ?? ''}`,
                "Emitido Salida": `${marcation.egressIssued?.firstName ?? ''} ${marcation.egressIssued?.lastName ?? ''}`,
                "Estado": `${marcation.marcationState.name}`,
            };
            rows.push(obj);
        }
    }
    generateFile(rows, "Marcaciones", "xls");
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
