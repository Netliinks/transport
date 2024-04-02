import { getEntityData, getFile } from "../endpoints.js";
import { getDetails, getSearch } from "../tools.js";
export const exportServicePdf = async (ar) => {
    let control = await getSearch("service.id", ar.id, "Control");
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    var doc = new jsPDF();
    let listImages = [];
    doc.addImage("./public/src/assets/pictures/report.png", "PNG", 7, 7, 30, 6);
    //doc.setDrawColor(0, 0, 128);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(55, 15, `REPORTE OPERACIONAL DE CONTROL DE CUSTODIA ARMADA`);
    doc.setFontSize(8);
    doc.line(5, 20, 205, 20);
    doc.text(85, 24, "DATOS INFORMATIVOS");
    doc.line(5, 26, 205, 26);
    doc.text(40, 30, "INFORMACIÓN OPERATIVA");
    doc.text(130, 30, "INFORMACIÓN ADMINISTRATIVA");
    doc.line(5, 32, 205, 32);
    doc.line(100, 26, 100, 50); //vertical centro
    doc.line(5, 20, 5, 50); //vertical inicio
    doc.line(205, 20, 205, 50); //vertical fin
    doc.text(7, 36, "FECHA/HORA DEL PEDIDO:");
    doc.line(5, 38, 205, 38);
    doc.text(7, 42, "FECHA/HORA DE INICIO:");
    doc.line(5, 44, 205, 44);
    doc.text(7, 48, "FECHA/HORA DEL FINAL:");
    doc.line(5, 50, 205, 50);
    doc.line(47, 32, 47, 50); //vertical 1
    doc.text(102, 36, "NOMBRE DE LA EMPRESA:");
    doc.text(102, 42, "EJECUTIVO SOLICITANTE:");
    doc.text(102, 48, "TIPO DE CUSTODIA:");
    doc.line(142, 32, 142, 50); //vertical 2
    doc.setFont(undefined, 'normal');
    doc.text(49, 36, `${ar?.outputDate ?? ''} - ${ar?.outputTime ?? ''}`);
    doc.text(49, 42, `${control?.startingPointDate ?? ''} - ${control?.startingPointTime ?? ''}`);
    doc.text(49, 48, `${control?.endServiceDate ?? ''} - ${control?.endServiceTime ?? ''}`);
    doc.text(144, 36, `${ar?.customer?.name ?? ''}`);
    doc.text(144, 42, `${ar?.name ?? ''}`);
    doc.text(144, 48, `${ar?.custodyType ?? ''}`);
    doc.setFont(undefined, 'bold');
    doc.text(7, 54, `RUTA DESDE: ${ar?.placeOrigin ?? ''}`);
    doc.text(102, 54, `HASTA: ${ar?.placeDestination ?? ''}`);
    doc.text(5, 65, `DATOS DE PATRULLAS`);
    let pagina = 1;
    doc.setTextColor(0, 0, 128);
    doc.text(10, 290, `Página ${pagina}`);
    //doc.setFont(undefined, 'bold')
    //doc.setFont(undefined, 'italic')
    let row = 70;
    //let lineas = 0
    const patrols = await getDetails("service.id", ar.id, "ServiceDetailV");
    //resto del contenido
    if (patrols != undefined) {
        for (let i = 0; i < patrols.length; i++) {
            let patrol = patrols[i];
            const crew = await getEntityData("Crew", patrol?.crew?.id);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(0, 0, 0);
            doc.line(5, row, 205, row);
            doc.line(100, row, 100, row + 6); //vertical centro 1
            doc.line(5, row, 5, row + 42); //vertical inicio
            doc.line(205, row, 205, row + 42); //vertical fin
            doc.line(47, row, 47, row + 6); //vertical NOMBRE
            doc.line(142, row, 142, row + 6); //vertical VEHICULO
            doc.text(7, row += 4, "NOMBRE:");
            doc.text(102, row, "VEHÍCULO:");
            doc.setFont(undefined, 'normal');
            doc.text(49, row, `${patrol?.crew?.name ?? ''}`);
            doc.text(144, row, `${crew?.vehicular?.type ?? ''} [${crew?.vehicular?.licensePlate ?? ''}]`);
            doc.setFont(undefined, 'bold');
            doc.line(5, row += 2, 205, row);
            doc.text(90, row += 4, "TRIPULACIÓN");
            doc.line(5, row += 2, 205, row);
            doc.line(100, row, 100, row + 30); //vertical centro 2
            doc.line(47, row, 47, row + 30); //vertical 1
            doc.line(142, row, 142, row + 30); //vertical 2
            doc.text(7, row += 4, "SUPERVISOR:");
            doc.text(102, row, "CÉDULA:");
            doc.setFont(undefined, 'normal');
            doc.text(49, row, `${crew.crewOne?.firstName ?? ''} ${crew.crewOne?.lastName ?? ''}`);
            doc.text(144, row, `${crew?.crewOne?.dni ?? ''}`);
            doc.setFont(undefined, 'bold');
            doc.line(5, row += 2, 205, row);
            doc.text(7, row += 4, "SEGUNDERO:"); //20
            doc.text(102, row, "CÉDULA:");
            doc.setFont(undefined, 'normal');
            doc.text(49, row, `${crew.crewTwo?.firstName ?? ''} ${crew.crewTwo?.lastName ?? ''}`);
            doc.text(144, row, `${crew?.crewTwo?.dni ?? ''}`);
            doc.setFont(undefined, 'bold');
            doc.line(5, row += 2, 205, row);
            doc.text(7, row += 4, "CUSTODIO 1:");
            doc.text(102, row, "CÉDULA:");
            doc.setFont(undefined, 'normal');
            doc.text(49, row, `${crew.crewThree?.firstName ?? ''} ${crew.crewThree?.lastName ?? ''}`);
            doc.text(144, row, `${crew?.crewThree?.dni ?? ''}`);
            doc.setFont(undefined, 'bold');
            doc.line(5, row += 2, 205, row);
            doc.text(7, row += 4, "CUSTODIO 2:");
            doc.text(102, row, "CÉDULA:");
            doc.setFont(undefined, 'normal');
            doc.text(49, row, `${crew.crewFour?.firstName ?? ''} ${crew.crewFour?.lastName ?? ''}`);
            doc.text(144, row, `${crew?.crewFour?.dni ?? ''}`);
            doc.setFont(undefined, 'bold');
            doc.line(5, row += 2, 205, row);
            doc.text(7, row += 4, "CUSTODIO 3:");
            doc.text(102, row, "CÉDULA:");
            doc.setFont(undefined, 'normal');
            doc.text(49, row, `${crew.crewFive?.firstName ?? ''} ${crew.crewFive?.lastName ?? ''}`);
            doc.text(144, row, `${crew?.crewFive?.dni ?? ''}`);
            doc.setFont(undefined, 'bold');
            doc.line(5, row += 2, 205, row);
            row += 5;
            //cada bloque mide 47 (4), maxim row 258  por primera hoja 
            if ((row + 47) > 261) {
                doc.addPage();
                row = 15;
                pagina += 1;
                doc.setFont(undefined, 'bold');
                //doc.setFontSize(10)
                doc.setTextColor(0, 0, 128);
                doc.text(10, 290, `Página ${pagina}`);
            }
        }
    }
    if (row + 56 > 261) {
        doc.addPage();
        row = 15;
        pagina += 1;
        doc.setFont(undefined, 'bold');
        //doc.setFontSize(10)
        doc.setTextColor(0, 0, 128);
        doc.text(10, 290, `Página ${pagina}`);
    }
    else {
        row += 10;
    }
    doc.setTextColor(0, 0, 0);
    doc.text(5, row, `DATOS DE CONTENEDORES`);
    row += 5;
    const containers = await getDetails("service.id", ar.id, "Charge");
    if (containers != undefined) {
        for (let i = 0; i < containers.length; i++) {
            let container = containers[i];
            doc.setFont(undefined, 'bold');
            doc.setTextColor(0, 0, 0);
            doc.line(5, row, 205, row);
            doc.line(100, row, 100, row + 6); //vertical centro 1
            doc.line(5, row, 5, row + 36); //vertical inicio
            doc.line(205, row, 205, row + 36); //vertical fin
            doc.line(47, row, 47, row + 6); //vertical NOMBRE
            doc.line(142, row, 142, row + 6); //vertical VEHICULO
            doc.text(7, row += 4, "ID. CONTENEDOR:");
            doc.text(102, row, "PLACA VEHICULAR:");
            doc.setFont(undefined, 'normal');
            doc.text(49, row, `${container?.name ?? ''}`);
            doc.text(144, row, `${container?.licensePlate ?? ''}`);
            doc.setFont(undefined, 'bold');
            doc.line(5, row += 2, 205, row);
            doc.line(100, row, 100, row + 30); //vertical centro 2
            doc.line(47, row, 47, row + 30); //vertical 1
            doc.line(142, row, 142, row + 30); //vertical 2
            doc.text(7, row += 4, "CONDUCTOR:");
            doc.text(102, row, "CÉDULA:");
            doc.setFont(undefined, 'normal');
            doc.text(49, row, `${container?.driver ?? ''}`);
            doc.text(144, row, `${container?.dniDriver ?? ''}`);
            doc.setFont(undefined, 'bold');
            doc.line(5, row += 2, 205, row);
            doc.text(7, row += 4, "CIA. TRANSPORTE:"); //20
            doc.text(102, row, "PLACA TRANSPORTE:");
            doc.setFont(undefined, 'normal');
            doc.text(49, row, `${container?.transportCompany ?? ''}`);
            doc.text(144, row, `${container?.transportPlate ?? ''}`);
            doc.setFont(undefined, 'bold');
            doc.line(5, row += 2, 205, row);
            doc.text(7, row += 4, "COLOR CABEZAL:");
            doc.text(102, row, "BLOQUEO SATELITAL:");
            doc.setFont(undefined, 'normal');
            doc.text(49, row, `${container?.headColor ?? ''}`);
            doc.text(144, row, `${container?.satelliteLock ?? ''}`);
            doc.setFont(undefined, 'bold');
            doc.line(5, row += 2, 205, row);
            doc.text(7, row += 4, "ESTAMPILLA:");
            doc.text(102, row, "");
            doc.setFont(undefined, 'normal');
            doc.text(49, row, `${container?.stamp ?? ''}`);
            doc.text(144, row, ``);
            doc.setFont(undefined, 'bold');
            doc.line(5, row += 2, 205, row);
            doc.text(7, row += 4, "CUSTODIO:");
            doc.text(102, row, "CÉDULA:");
            doc.setFont(undefined, 'normal');
            doc.text(49, row, `${container?.companion?.firstName ?? ''} ${container?.companion?.lastName ?? ''}`);
            doc.text(144, row, `${container?.companion?.dni ?? ''}`);
            doc.setFont(undefined, 'bold');
            doc.line(5, row += 2, 205, row);
            row += 5;
            //41 POR BLOQUE
            if ((row + 41) > 261) {
                doc.addPage();
                row = 15;
                pagina += 1;
                doc.setFont(undefined, 'bold');
                //doc.setFontSize(10)
                doc.setTextColor(0, 0, 128);
                doc.text(10, 290, `Página ${pagina}`);
            }
        }
    }
    if (row + 56 > 261) {
        doc.addPage();
        row = 15;
        pagina += 1;
        doc.setFont(undefined, 'bold');
        //doc.setFontSize(10)
        doc.setTextColor(0, 0, 128);
        doc.text(10, 290, `Página ${pagina}`);
    }
    else {
        row += 10;
    }
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(5, row, `DETALLE DE RUTA`);
    row += 5;
    doc.text(7, row, "HORA");
    doc.text(102, row, "RECORRIDO");
    const details = await getDetails("service.id", ar.id, "DetailsObs");
    row += 2;
    if (details != undefined) {
        for (let i = 0; i < details.length; i++) {
            let detail = details[i];
            if (detail?.image !== undefined) {
                listImages.push(detail.image);
            }
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, 'normal');
            doc.line(5, row, 205, row); //HORIZONTAL INICIO
            doc.line(5, row, 5, row + 6); //vertical inicio
            doc.line(205, row, 205, row + 6); //vertical fin
            doc.line(20, row, 20, row + 6); //vertical
            doc.text(7, row += 4, `${detail?.creationTime ?? ''}`); //HORIZONTAL INICIO
            doc.text(22, row, `${detail?.content ?? ''}`);
            doc.line(5, row += 2, 205, row); //HORIZONTAL FIN
            if ((row + 6) > 286) {
                doc.addPage();
                row = 15;
                pagina += 1;
                doc.setFont(undefined, 'bold');
                //doc.setFontSize(10)
                doc.setTextColor(0, 0, 128);
                doc.text(10, 290, `Página ${pagina}`);
            }
        }
    }
    if (listImages.length != 0) {
        if (row + 60 > 286) {
            doc.addPage();
            row = 15;
            pagina += 1;
            doc.setFont(undefined, 'bold');
            //doc.setFontSize(10)
            doc.setTextColor(0, 0, 128);
            doc.text(10, 290, `Página ${pagina}`);
        }
        else {
            row += 10;
        }
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(5, row, `IMÁGENES`);
        row += 5;
        let column = 5;
        for (let i = 0; i < listImages.length; i++) {
            doc.addImage(await getFile(listImages[i]), "JPEG", column, row, 45, 50);
            column += 51;
            //console.log("row "+row)
            if (column > 200) {
                //console.log("row total "+row)
                if ((row + 65) > 200) {
                    doc.addPage();
                    column = 5;
                    row = 15;
                    pagina += 1;
                    doc.setFont(undefined, 'bold');
                    //doc.setFontSize(10)
                    doc.setTextColor(0, 0, 128);
                    doc.text(10, 290, `Página ${pagina}`);
                }
                else {
                    column = 5;
                    row += 60;
                }
            }
        }
    }
    // Save the PDF
    var d = new Date();
    var title = "Servicio_" + `${ar?.name ?? ''}` + d.getDate() + "_" + (d.getMonth() + 1) + "_" + d.getFullYear() + `.pdf`;
    doc.save(title);
};
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
            "Origen Fecha": ``,
            "Origen Hora": ``,
            "Origen Usuario": ``,
            //"Observación 1": ``,
            "Inicio Fecha": ``,
            "Inicio Hora": ``,
            "Inicio Usuario": ``,
            //"Observación 2": ``,
            "Destino Fecha": ``,
            "Destino Hora": ``,
            "Destino Usuario": ``,
            //"Observación 3": ``,
            "Fin Fecha": ``,
            "Fin Hora": ``,
            "Fin Usuario": ``,
            "Patrulla_1": ``,
            "Supervisor_P1": ``,
            "Segundero_P1": ``,
            "Custodio1_P1": ``,
            "Custodio2_P1": ``,
            "Custodio3_P1": ``,
            "Patrulla_2": ``,
            "Supervisor_P2": ``,
            "Segundero_P2": ``,
            "Custodio1_P2": ``,
            "Custodio2_P2": ``,
            "Custodio3_P2": ``,
            "Patrulla_3": ``,
            "Supervisor_P3": ``,
            "Segundero_P3": ``,
            "Custodio1_P3": ``,
            "Custodio2_P3": ``,
            "Custodio3_P3": ``,
            "Patrulla_4": ``,
            "Supervisor_P4": ``,
            "Segundero_P4": ``,
            "Custodio1_P4": ``,
            "Custodio2_P4": ``,
            "Custodio3_P4": ``,
            "Patrulla_5": ``,
            "Supervisor_P5": ``,
            "Segundero_P5": ``,
            "Custodio1_P5": ``,
            "Custodio2_P5": ``,
            "Custodio3_P5": ``,
            "Patrulla_6": ``,
            "Supervisor_P6": ``,
            "Segundero_P6": ``,
            "Custodio1_P6": ``,
            "Custodio2_P6": ``,
            "Custodio3_P6": ``,
            "Contenedor_1": ``,
            "Placa_1": ``,
            "Conductor_1": ``,
            "DNI_1": ``,
            "Contenedor_2": ``,
            "Placa_2": ``,
            "Conductor_2": ``,
            "DNI_2": ``,
            "Contenedor_3": ``,
            "Placa_3": ``,
            "Conductor_3": ``,
            "DNI_3": ``,
            "Contenedor_4": ``,
            "Placa_4": ``,
            "Conductor_4": ``,
            "DNI_4": ``,
            "Contenedor_5": ``,
            "Placa_5": ``,
            "Conductor_5": ``,
            "DNI_5": ``,
            "Contenedor_6": ``,
            "Placa_6": ``,
            "Conductor_6": ``,
            "DNI_6": ``,
        };
        let control = await getSearch("service.id", service.id, "Control");
        if (control != undefined) {
            let obj1 = {
                "Origen Fecha": `${control?.arrivalOriginDate ?? ''}`,
                "Origen Hora": `${control?.arrivalOriginTime ?? ''}`,
                "Origen Usuario": `${control?.originUser?.firstName ?? ''} ${control?.originUser?.lastName ?? ''}`,
                //"Observación 1": `${control?.observation ?? ''}`,
                "Inicio Fecha": `${control?.startingPointDate ?? ''}`,
                "Inicio Hora": `${control?.startingPointTime ?? ''}`,
                "Inicio Usuario": `${control?.startUser?.firstName ?? ''} ${control?.startUser?.lastName ?? ''}`,
                //"Observación 2": `${control?.observation2 ?? ''}`,
                "Destino Fecha": `${control?.arrivalDestinationDate ?? ''}`,
                "Destino Hora": `${control?.arrivalDestinationTime ?? ''}`,
                "Destino Usuario": `${control?.destinationUser?.firstName ?? ''} ${control?.destinationUser?.lastName ?? ''}`,
                //"Observación 3": `${control?.observation3 ?? ''}`,
                "Fin Fecha": `${control?.endServiceDate ?? ''}`,
                "Fin Hora": `${control?.endServiceTime ?? ''}`,
                "Fin Usuario": `${control?.endUser?.firstName ?? ''} ${control?.endUser?.lastName ?? ''}`,
                //"Observación 4": `${control?.observation4 ?? ''}`,
            };
            obj = Object.assign(obj, obj1);
        }
        let patrols = await getDetails("service.id", service.id, "ServiceDetailV");
        //console.log(patrols);
        if (patrols != undefined) {
            for (let i = 0; i < patrols.length; i++) {
                const patrol = await getDetails("id", patrols[i].id, "Crew");
                if (patrol != undefined) {
                    if (i == 0) {
                        let obj3 = {
                            "Patrulla_1": `${patrol[0]?.name ?? ''}`,
                            "Supervisor_P1": `${patrol[0]?.crewOne?.firstName ?? ''} ${patrol[0]?.crewOne?.lastName ?? ''}`,
                            "Segundero_P1": `${patrol[0]?.crewTwo?.firstName ?? ''} ${patrol[0]?.crewTwo?.lastName ?? ''}`,
                            "Custodio1_P1": `${patrol[0]?.crewThree?.firstName ?? ''} ${patrol[0]?.crewThree?.lastName ?? ''}`,
                            "Custodio2_P1": `${patrol[0]?.crewFour?.firstName ?? ''} ${patrol[0]?.crewFour?.lastName ?? ''}`,
                            "Custodio3_P1": `${patrol[0]?.crewFive?.firstName ?? ''} ${patrol[0]?.crewFive?.lastName ?? ''}`,
                        };
                        obj = Object.assign(obj, obj3);
                    }
                    else if (i == 1) {
                        let obj3 = {
                            "Patrulla_2": `${patrol[1]?.name ?? ''}`,
                            "Supervisor_P2": `${patrol[1]?.crewOne?.firstName ?? ''} ${patrol[1]?.crewOne?.lastName ?? ''}`,
                            "Segundero_P2": `${patrol[1]?.crewTwo?.firstName ?? ''} ${patrol[1]?.crewTwo?.lastName ?? ''}`,
                            "Custodio1_P2": `${patrol[1]?.crewThree?.firstName ?? ''} ${patrol[1]?.crewThree?.lastName ?? ''}`,
                            "Custodio2_P2": `${patrol[1]?.crewFour?.firstName ?? ''} ${patrol[1]?.crewFour?.lastName ?? ''}`,
                            "Custodio3_P2": `${patrol[1]?.crewFive?.firstName ?? ''} ${patrol[1]?.crewFive?.lastName ?? ''}`,
                        };
                        obj = Object.assign(obj, obj3);
                    }
                    else if (i == 2) {
                        let obj3 = {
                            "Patrulla_3": `${patrol[2]?.name ?? ''}`,
                            "Supervisor_P3": `${patrol[2]?.crewOne?.firstName ?? ''} ${patrol[2]?.crewOne?.lastName ?? ''}`,
                            "Segundero_P3": `${patrol[2]?.crewTwo?.firstName ?? ''} ${patrol[2]?.crewTwo?.lastName ?? ''}`,
                            "Custodio1_P3": `${patrol[2]?.crewThree?.firstName ?? ''} ${patrol[2]?.crewThree?.lastName ?? ''}`,
                            "Custodio2_P3": `${patrol[2]?.crewFour?.firstName ?? ''} ${patrol[2]?.crewFour?.lastName ?? ''}`,
                            "Custodio3_P3": `${patrol[2]?.crewFive?.firstName ?? ''} ${patrol[2]?.crewFive?.lastName ?? ''}`,
                        };
                        obj = Object.assign(obj, obj3);
                    }
                    else if (i == 3) {
                        let obj3 = {
                            "Patrulla_4": `${patrol[3]?.name ?? ''}`,
                            "Supervisor_P4": `${patrol[3]?.crewOne?.firstName ?? ''} ${patrol[3]?.crewOne?.lastName ?? ''}`,
                            "Segundero_P4": `${patrol[3]?.crewTwo?.firstName ?? ''} ${patrol[3]?.crewTwo?.lastName ?? ''}`,
                            "Custodio1_P4": `${patrol[3]?.crewThree?.firstName ?? ''} ${patrol[3]?.crewThree?.lastName ?? ''}`,
                            "Custodio2_P4": `${patrol[3]?.crewFour?.firstName ?? ''} ${patrol[3]?.crewFour?.lastName ?? ''}`,
                            "Custodio3_P4": `${patrol[3]?.crewFive?.firstName ?? ''} ${patrol[3]?.crewFive?.lastName ?? ''}`,
                        };
                        obj = Object.assign(obj, obj3);
                    }
                    else if (i == 4) {
                        let obj3 = {
                            "Patrulla_5": `${patrol[4]?.name ?? ''}`,
                            "Supervisor_P5": `${patrol[4]?.crewOne?.firstName ?? ''} ${patrol[4]?.crewOne?.lastName ?? ''}`,
                            "Segundero_P5": `${patrol[4]?.crewTwo?.firstName ?? ''} ${patrol[4]?.crewTwo?.lastName ?? ''}`,
                            "Custodio1_P5": `${patrol[4]?.crewThree?.firstName ?? ''} ${patrol[4]?.crewThree?.lastName ?? ''}`,
                            "Custodio2_P5": `${patrol[4]?.crewFour?.firstName ?? ''} ${patrol[4]?.crewFour?.lastName ?? ''}`,
                            "Custodio3_P5": `${patrol[4]?.crewFive?.firstName ?? ''} ${patrol[4]?.crewFive?.lastName ?? ''}`,
                        };
                        obj = Object.assign(obj, obj3);
                    }
                    else if (i == 6) {
                        let obj3 = {
                            "Patrulla_6": `${patrol[5]?.name ?? ''}`,
                            "Supervisor_P6": `${patrol[5]?.crewOne?.firstName ?? ''} ${patrol[5]?.crewOne?.lastName ?? ''}`,
                            "Segundero_P6": `${patrol[5]?.crewTwo?.firstName ?? ''} ${patrol[5]?.crewTwo?.lastName ?? ''}`,
                            "Custodio1_P6": `${patrol[5]?.crewThree?.firstName ?? ''} ${patrol[5]?.crewThree?.lastName ?? ''}`,
                            "Custodio2_P6": `${patrol[5]?.crewFour?.firstName ?? ''} ${patrol[5]?.crewFour?.lastName ?? ''}`,
                            "Custodio3_P6": `${patrol[5]?.crewFive?.firstName ?? ''} ${patrol[5]?.crewFive?.lastName ?? ''}`,
                        };
                        obj = Object.assign(obj, obj3);
                    }
                }
            }
        }
        let containers = await getDetails("service.id", service.id, "Charge");
        //console.log(containers);
        if (containers != undefined) {
            let obj2 = {
                "Contenedor_1": `${containers[0]?.name ?? ''}`,
                "Placa_1": `${containers[0]?.licensePlate ?? ''}`,
                "Conductor_1": `${containers[0]?.driver ?? ''}`,
                "DNI_1": `${containers[0]?.dniDriver ?? ''}`,
                "Contenedor_2": `${containers[1]?.name ?? ''}`,
                "Placa_2": `${containers[1]?.licensePlate ?? ''}`,
                "Conductor_2": `${containers[1]?.driver ?? ''}`,
                "DNI_2": `${containers[1]?.dniDriver ?? ''}`,
                "Contenedor_3": `${containers[2]?.name ?? ''}`,
                "Placa_3": `${containers[2]?.licensePlate ?? ''}`,
                "Conductor_3": `${containers[2]?.driver ?? ''}`,
                "DNI_3": `${containers[2]?.dniDriver ?? ''}`,
                "Contenedor_4": `${containers[3]?.name ?? ''}`,
                "Placa_4": `${containers[3]?.licensePlate ?? ''}`,
                "Conductor_4": `${containers[3]?.driver ?? ''}`,
                "DNI_4": `${containers[3]?.dniDriver ?? ''}`,
                "Contenedor_5": `${containers[4]?.name ?? ''}`,
                "Placa_5": `${containers[4]?.licensePlate ?? ''}`,
                "Conductor_5": `${containers[4]?.driver ?? ''}`,
                "DNI_5": `${containers[4]?.dniDriver ?? ''}`,
                "Contenedor_6": `${containers[5]?.name ?? ''}`,
                "Placa_6": `${containers[5]?.licensePlate ?? ''}`,
                "Conductor_6": `${containers[5]?.driver ?? ''}`,
                "DNI_6": `${containers[5]?.dniDriver ?? ''}`,
            };
            obj = Object.assign(obj, obj2);
        }
        rows.push(obj);
        //}
    }
    generateFile(rows, "Servicios", "csv");
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
            "Origen Fecha": ``,
            "Origen Hora": ``,
            "Origen Usuario": ``,
            //"Observación 1": ``,
            "Inicio Fecha": ``,
            "Inicio Hora": ``,
            "Inicio Usuario": ``,
            //"Observación 2": ``,
            "Destino Fecha": ``,
            "Destino Hora": ``,
            "Destino Usuario": ``,
            //"Observación 3": ``,
            "Fin Fecha": ``,
            "Fin Hora": ``,
            "Fin Usuario": ``,
            "Patrulla_1": ``,
            "Supervisor_P1": ``,
            "Segundero_P1": ``,
            "Custodio1_P1": ``,
            "Custodio2_P1": ``,
            "Custodio3_P1": ``,
            "Patrulla_2": ``,
            "Supervisor_P2": ``,
            "Segundero_P2": ``,
            "Custodio1_P2": ``,
            "Custodio2_P2": ``,
            "Custodio3_P2": ``,
            "Patrulla_3": ``,
            "Supervisor_P3": ``,
            "Segundero_P3": ``,
            "Custodio1_P3": ``,
            "Custodio2_P3": ``,
            "Custodio3_P3": ``,
            "Patrulla_4": ``,
            "Supervisor_P4": ``,
            "Segundero_P4": ``,
            "Custodio1_P4": ``,
            "Custodio2_P4": ``,
            "Custodio3_P4": ``,
            "Patrulla_5": ``,
            "Supervisor_P5": ``,
            "Segundero_P5": ``,
            "Custodio1_P5": ``,
            "Custodio2_P5": ``,
            "Custodio3_P5": ``,
            "Patrulla_6": ``,
            "Supervisor_P6": ``,
            "Segundero_P6": ``,
            "Custodio1_P6": ``,
            "Custodio2_P6": ``,
            "Custodio3_P6": ``,
            "Contenedor_1": ``,
            "Placa_1": ``,
            "Conductor_1": ``,
            "DNI_1": ``,
            "Contenedor_2": ``,
            "Placa_2": ``,
            "Conductor_2": ``,
            "DNI_2": ``,
            "Contenedor_3": ``,
            "Placa_3": ``,
            "Conductor_3": ``,
            "DNI_3": ``,
            "Contenedor_4": ``,
            "Placa_4": ``,
            "Conductor_4": ``,
            "DNI_4": ``,
            "Contenedor_5": ``,
            "Placa_5": ``,
            "Conductor_5": ``,
            "DNI_5": ``,
            "Contenedor_6": ``,
            "Placa_6": ``,
            "Conductor_6": ``,
            "DNI_6": ``,
        };
        let control = await getSearch("service.id", service.id, "Control");
        if (control != undefined) {
            let obj1 = {
                "Origen Fecha": `${control?.arrivalOriginDate ?? ''}`,
                "Origen Hora": `${control?.arrivalOriginTime ?? ''}`,
                "Origen Usuario": `${control?.originUser?.firstName ?? ''} ${control?.originUser?.lastName ?? ''}`,
                //"Observación 1": `${control?.observation ?? ''}`,
                "Inicio Fecha": `${control?.startingPointDate ?? ''}`,
                "Inicio Hora": `${control?.startingPointTime ?? ''}`,
                "Inicio Usuario": `${control?.startUser?.firstName ?? ''} ${control?.startUser?.lastName ?? ''}`,
                //"Observación 2": `${control?.observation2 ?? ''}`,
                "Destino Fecha": `${control?.arrivalDestinationDate ?? ''}`,
                "Destino Hora": `${control?.arrivalDestinationTime ?? ''}`,
                "Destino Usuario": `${control?.destinationUser?.firstName ?? ''} ${control?.destinationUser?.lastName ?? ''}`,
                //"Observación 3": `${control?.observation3 ?? ''}`,
                "Fin Fecha": `${control?.endServiceDate ?? ''}`,
                "Fin Hora": `${control?.endServiceTime ?? ''}`,
                "Fin Usuario": `${control?.endUser?.firstName ?? ''} ${control?.endUser?.lastName ?? ''}`,
                //"Observación 4": `${control?.observation4 ?? ''}`,
            };
            obj = Object.assign(obj, obj1);
        }
        let patrols = await getDetails("service.id", service.id, "ServiceDetailV");
        //console.log(patrols);
        if (patrols != undefined) {
            for (let i = 0; i < patrols.length; i++) {
                const patrol = await getDetails("id", patrols[i].id, "Crew");
                if (patrol != undefined) {
                    if (i == 0) {
                        let obj3 = {
                            "Patrulla_1": `${patrol[0]?.name ?? ''}`,
                            "Supervisor_P1": `${patrol[0]?.crewOne?.firstName ?? ''} ${patrol[0]?.crewOne?.lastName ?? ''}`,
                            "Segundero_P1": `${patrol[0]?.crewTwo?.firstName ?? ''} ${patrol[0]?.crewTwo?.lastName ?? ''}`,
                            "Custodio1_P1": `${patrol[0]?.crewThree?.firstName ?? ''} ${patrol[0]?.crewThree?.lastName ?? ''}`,
                            "Custodio2_P1": `${patrol[0]?.crewFour?.firstName ?? ''} ${patrol[0]?.crewFour?.lastName ?? ''}`,
                            "Custodio3_P1": `${patrol[0]?.crewFive?.firstName ?? ''} ${patrol[0]?.crewFive?.lastName ?? ''}`,
                        };
                        obj = Object.assign(obj, obj3);
                    }
                    else if (i == 1) {
                        let obj3 = {
                            "Patrulla_2": `${patrol[1]?.name ?? ''}`,
                            "Supervisor_P2": `${patrol[1]?.crewOne?.firstName ?? ''} ${patrol[1]?.crewOne?.lastName ?? ''}`,
                            "Segundero_P2": `${patrol[1]?.crewTwo?.firstName ?? ''} ${patrol[1]?.crewTwo?.lastName ?? ''}`,
                            "Custodio1_P2": `${patrol[1]?.crewThree?.firstName ?? ''} ${patrol[1]?.crewThree?.lastName ?? ''}`,
                            "Custodio2_P2": `${patrol[1]?.crewFour?.firstName ?? ''} ${patrol[1]?.crewFour?.lastName ?? ''}`,
                            "Custodio3_P2": `${patrol[1]?.crewFive?.firstName ?? ''} ${patrol[1]?.crewFive?.lastName ?? ''}`,
                        };
                        obj = Object.assign(obj, obj3);
                    }
                    else if (i == 2) {
                        let obj3 = {
                            "Patrulla_3": `${patrol[2]?.name ?? ''}`,
                            "Supervisor_P3": `${patrol[2]?.crewOne?.firstName ?? ''} ${patrol[2]?.crewOne?.lastName ?? ''}`,
                            "Segundero_P3": `${patrol[2]?.crewTwo?.firstName ?? ''} ${patrol[2]?.crewTwo?.lastName ?? ''}`,
                            "Custodio1_P3": `${patrol[2]?.crewThree?.firstName ?? ''} ${patrol[2]?.crewThree?.lastName ?? ''}`,
                            "Custodio2_P3": `${patrol[2]?.crewFour?.firstName ?? ''} ${patrol[2]?.crewFour?.lastName ?? ''}`,
                            "Custodio3_P3": `${patrol[2]?.crewFive?.firstName ?? ''} ${patrol[2]?.crewFive?.lastName ?? ''}`,
                        };
                        obj = Object.assign(obj, obj3);
                    }
                    else if (i == 3) {
                        let obj3 = {
                            "Patrulla_4": `${patrol[3]?.name ?? ''}`,
                            "Supervisor_P4": `${patrol[3]?.crewOne?.firstName ?? ''} ${patrol[3]?.crewOne?.lastName ?? ''}`,
                            "Segundero_P4": `${patrol[3]?.crewTwo?.firstName ?? ''} ${patrol[3]?.crewTwo?.lastName ?? ''}`,
                            "Custodio1_P4": `${patrol[3]?.crewThree?.firstName ?? ''} ${patrol[3]?.crewThree?.lastName ?? ''}`,
                            "Custodio2_P4": `${patrol[3]?.crewFour?.firstName ?? ''} ${patrol[3]?.crewFour?.lastName ?? ''}`,
                            "Custodio3_P4": `${patrol[3]?.crewFive?.firstName ?? ''} ${patrol[3]?.crewFive?.lastName ?? ''}`,
                        };
                        obj = Object.assign(obj, obj3);
                    }
                    else if (i == 4) {
                        let obj3 = {
                            "Patrulla_5": `${patrol[4]?.name ?? ''}`,
                            "Supervisor_P5": `${patrol[4]?.crewOne?.firstName ?? ''} ${patrol[4]?.crewOne?.lastName ?? ''}`,
                            "Segundero_P5": `${patrol[4]?.crewTwo?.firstName ?? ''} ${patrol[4]?.crewTwo?.lastName ?? ''}`,
                            "Custodio1_P5": `${patrol[4]?.crewThree?.firstName ?? ''} ${patrol[4]?.crewThree?.lastName ?? ''}`,
                            "Custodio2_P5": `${patrol[4]?.crewFour?.firstName ?? ''} ${patrol[4]?.crewFour?.lastName ?? ''}`,
                            "Custodio3_P5": `${patrol[4]?.crewFive?.firstName ?? ''} ${patrol[4]?.crewFive?.lastName ?? ''}`,
                        };
                        obj = Object.assign(obj, obj3);
                    }
                    else if (i == 6) {
                        let obj3 = {
                            "Patrulla_6": `${patrol[5]?.name ?? ''}`,
                            "Supervisor_P6": `${patrol[5]?.crewOne?.firstName ?? ''} ${patrol[5]?.crewOne?.lastName ?? ''}`,
                            "Segundero_P6": `${patrol[5]?.crewTwo?.firstName ?? ''} ${patrol[5]?.crewTwo?.lastName ?? ''}`,
                            "Custodio1_P6": `${patrol[5]?.crewThree?.firstName ?? ''} ${patrol[5]?.crewThree?.lastName ?? ''}`,
                            "Custodio2_P6": `${patrol[5]?.crewFour?.firstName ?? ''} ${patrol[5]?.crewFour?.lastName ?? ''}`,
                            "Custodio3_P6": `${patrol[5]?.crewFive?.firstName ?? ''} ${patrol[5]?.crewFive?.lastName ?? ''}`,
                        };
                        obj = Object.assign(obj, obj3);
                    }
                }
            }
        }
        let containers = await getDetails("service.id", service.id, "Charge");
        //console.log(containers);
        if (containers != undefined) {
            let obj2 = {
                "Contenedor_1": `${containers[0]?.name ?? ''}`,
                "Placa_1": `${containers[0]?.licensePlate ?? ''}`,
                "Conductor_1": `${containers[0]?.driver ?? ''}`,
                "DNI_1": `${containers[0]?.dniDriver ?? ''}`,
                "Contenedor_2": `${containers[1]?.name ?? ''}`,
                "Placa_2": `${containers[1]?.licensePlate ?? ''}`,
                "Conductor_2": `${containers[1]?.driver ?? ''}`,
                "DNI_2": `${containers[1]?.dniDriver ?? ''}`,
                "Contenedor_3": `${containers[2]?.name ?? ''}`,
                "Placa_3": `${containers[2]?.licensePlate ?? ''}`,
                "Conductor_3": `${containers[2]?.driver ?? ''}`,
                "DNI_3": `${containers[2]?.dniDriver ?? ''}`,
                "Contenedor_4": `${containers[3]?.name ?? ''}`,
                "Placa_4": `${containers[3]?.licensePlate ?? ''}`,
                "Conductor_4": `${containers[3]?.driver ?? ''}`,
                "DNI_4": `${containers[3]?.dniDriver ?? ''}`,
                "Contenedor_5": `${containers[4]?.name ?? ''}`,
                "Placa_5": `${containers[4]?.licensePlate ?? ''}`,
                "Conductor_5": `${containers[4]?.driver ?? ''}`,
                "DNI_5": `${containers[4]?.dniDriver ?? ''}`,
                "Contenedor_6": `${containers[5]?.name ?? ''}`,
                "Placa_6": `${containers[5]?.licensePlate ?? ''}`,
                "Conductor_6": `${containers[5]?.driver ?? ''}`,
                "DNI_6": `${containers[5]?.dniDriver ?? ''}`,
            };
            obj = Object.assign(obj, obj2);
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
