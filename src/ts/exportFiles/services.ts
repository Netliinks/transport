import { getEntitiesData, getUserInfo, getFilterEntityData, getEntityData, registerEntity, _userAgent, updateEntity } from "../endpoints.js"
import { getDetails, getSearch } from "../tools.js";
export const exportServicePdf = async (ar: any) => {
  let control = await getSearch("service.id", ar.id, "Control")
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    var doc = new jsPDF()
    doc.addImage("./public/src/assets/pictures/report.png", "PNG", 7, 7, 30, 10);
    //doc.setDrawColor(0, 0, 128);
    doc.setFont(undefined, 'bold')
    //doc.setTextColor(0,0,0)
    doc.setFontSize(10)
    doc.text(55, 15, `REPORTE OPERACIONAL DE CONTROL DE CUSTODIA ARMADA`)
    doc.setFontSize(8)
    doc.line(5, 20, 205, 20);
    doc.text(85, 24, "DATOS INFORMATIVOS")
    doc.line(5, 26, 205, 26);
    doc.text(40, 30, "INFORMACIÓN OPERATIVA")
    doc.text(130, 30, "INFORMACIÓN ADMINISTRATIVA")
    doc.line(5, 32, 205, 32);
    doc.line(100, 26, 100, 50);//vertical centro
    doc.line(5, 20, 5, 50);//vertical inicio
    doc.line(205, 20, 205, 50);//vertical fin
    doc.text(7, 36, "FECHA/HORA DEL PEDIDO:")
    doc.line(5, 38, 205, 38);
    doc.text(7, 42, "FECHA/HORA DE INICIO:")
    doc.line(5, 44, 205, 44);
    doc.text(7, 48, "FECHA/HORA DEL FINAL:")
    doc.line(5, 50, 205, 50);
    doc.line(47, 32, 47, 50);//vertical 1
    doc.text(102, 36, "NOMBRE DE LA EMPRESA:")
    doc.text(102, 42, "EJECUTIVO SOLICITANTE:")
    doc.text(102, 48, "TIPO DE CUSTODIA:")
    doc.line(142, 32, 142, 50);//vertical 2
    doc.setFont(undefined, 'normal')
    doc.text(49, 36, `${control.arrivalOriginDate} - ${control.arrivalOriginTime}`)
    doc.text(49, 42, `${control.startingPointDate} - ${control.startingPointTime}`)
    doc.text(49, 48, `${control.endServiceDate} - ${control.endServiceTime}`)
    doc.text(144, 36, `${ar?.customer?.name ?? ''}`)
    doc.text(144, 42, `${ar?.name ?? ''}`)
    doc.text(144, 48, `${ar?.custodyType ?? ''}`)
    doc.setFont(undefined, 'bold')
    doc.text(7, 54, `RUTA DESDE: ${ar?.placeOrigin ?? ''}`)
    doc.text(102, 54, `HASTA: ${ar?.placeDestination ?? ''}`)
    doc.text(5, 65, `DATOS DE PATRULLAS`)
    let pagina = 1;
    doc.setTextColor(0, 0, 128);
    doc.text(10, 290, `Página ${pagina}`);
    //doc.setFont(undefined, 'bold')
    //doc.setFont(undefined, 'italic')
    let row = 70
    let lineas = 0
    const patrols: any = await getDetails("service.id", ar.id, "ServiceDetailV")
    //resto del contenido
    for (let i = 0; i < patrols.length; i++) {
        let patrol = patrols[i]

            
            /*row += 5
            let limitLineas = 51;
            if (pagina == 1)
              limitLineas = 44;
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
            lineas++*/

    }
    // Save the PDF
    var d = new Date()
    var title = "Servicio_"+ d.getDate() + "_" + (d.getMonth()+1) + "_" + d.getFullYear() +`.pdf`;
    doc.save(title);

}

export const exportServiceCsv = async (ar: any, start: any, end: any) => {
    let rows = [];
    for(let i=0; i < ar.length; i++){
        let service = ar[i]
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
          }
          
          let control = await getSearch("service.id", service.id, "Control")
          if(control != undefined){
            let obj1 = {
              "Origen Fecha": `${control?.arrivalOriginDate ?? ''}`,
              "Origen Hora": ` ${control?.arrivalOriginTime ?? ''}`,
              "Origen Usuario": ` ${control?.originUser?.username ?? ''}`,
              //"Observación 1": ` ${control?.observation ?? ''}`,
              "Inicio Fecha": `${control?.startingPointDate ?? ''}`,
              "Inicio Hora": ` ${control?.startingPointTime ?? ''}`,
              "Inicio Usuario": ` ${control?.startUser?.username ?? ''}`,
              //"Observación 2": ` ${control?.observation2 ?? ''}`,
              "Destino Fecha": `${control?.arrivalDestinationDate ?? ''}`,
              "Destino Hora": ` ${control?.arrivalDestinationTime ?? ''}`,
              "Destino Usuario": ` ${control?.destinationUser?.username ?? ''}`,
              //"Observación 3": ` ${control?.observation3 ?? ''}`,
              "Fin Fecha": `${control?.endServiceDate ?? ''}`,
              "Fin Hora": ` ${control?.endServiceTime ?? ''}`,
              "Fin Usuario": ` ${control?.endUser?.username ?? ''}`,
              //"Observación 4": ` ${control?.observation4 ?? ''}`,
            }
            obj = Object.assign(obj, obj1);
          }
          rows.push(obj);
        //}
        
    }
    generateFile(rows, "Log_Servicios", "csv");
}

export const exportServiceXls = async (ar: any, start: any, end: any) => {
    let rows = [];
    for(let i=0; i < ar.length; i++){
        let service = ar[i]
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
            }
            
            let control = await getSearch("service.id", service.id, "Control")
            if(control != undefined){
              let obj1 = {
                "Origen Fecha": `${control?.arrivalOriginDate ?? ''}`,
                "Origen Hora": ` ${control?.arrivalOriginTime ?? ''}`,
                "Origen Usuario": ` ${control?.originUser?.username ?? ''}`,
                //"Observación 1": ` ${control?.observation ?? ''}`,
                "Inicio Fecha": `${control?.startingPointDate ?? ''}`,
                "Inicio Hora": ` ${control?.startingPointTime ?? ''}`,
                "Inicio Usuario": ` ${control?.startUser?.username ?? ''}`,
                //"Observación 2": ` ${control?.observation2 ?? ''}`,
                "Destino Fecha": `${control?.arrivalDestinationDate ?? ''}`,
                "Destino Hora": ` ${control?.arrivalDestinationTime ?? ''}`,
                "Destino Usuario": ` ${control?.destinationUser?.username ?? ''}`,
                //"Observación 3": ` ${control?.observation3 ?? ''}`,
                "Fin Fecha": `${control?.endServiceDate ?? ''}`,
                "Fin Hora": ` ${control?.endServiceTime ?? ''}`,
                "Fin Usuario": ` ${control?.endUser?.username ?? ''}`,
                //"Observación 4": ` ${control?.observation4 ?? ''}`,
              }
              obj = Object.assign(obj, obj1);
            }
            rows.push(obj);
        //}
        
    }
    generateFile(rows, "Servicios", "xls");
}

const generateFile = (ar: any, title: string, extension: string) => {
    //comprobamos compatibilidad
    if(window.Blob && (window.URL || window.webkitURL)){
        var contenido = "",
          d = new Date(),
          blob,
          reader,
          save,
          clicEvent;
        //creamos contenido del archivo
        for (var i = 0; i < ar.length; i++) {
          //construimos cabecera del csv
          if (i == 0)
            contenido += Object.keys(ar[i]).join(";") + "\n";
          //resto del contenido
          contenido += Object.keys(ar[i]).map(function(key){
                  return ar[i][key];
                }).join(";") + "\n";
        }
        //creamos el blob
        blob =  new Blob(["\ufeff", contenido], {type: `text/${extension}`});
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
          save.download = "log_"+title+"_"+ d.getDate() + "_" + (d.getMonth()+1) + "_" + d.getFullYear() +`.${extension}`;
          try {
            //creamos un evento click
            clicEvent = new MouseEvent('click', {
              'view': window,
              'bubbles': true,
              'cancelable': true
            });
          } catch (e) {
            //si llega aquí es que probablemente implemente la forma antigua de crear un enlace
            clicEvent = document.createEvent("MouseEvent");
            // @ts-ignore
            clicEvent.click();
          }
          //disparamos el evento
          save.dispatchEvent(clicEvent);
          //liberamos el objeto window.URL
          (window.URL || window.webkitURL).revokeObjectURL(save.href);
        }
        //leemos como url
        reader.readAsDataURL(blob);
      }else {
        //el navegador no admite esta opción
        alert("Su navegador no permite esta acción");
      }

}