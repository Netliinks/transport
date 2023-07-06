import { verifyUserType } from "../tools";

export const exportEventPdf = (ar: any, title: string) => {
    // @ts-ignore
    window.jsPDF = window.jspdf.jsPDF;
    // @ts-ignore
    var doc = new jsPDF('l')
    doc.text(20, 20, 'Hello world!')
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    //construimos cabecera del csv
    doc.text(10, 30, "Fecha")
    doc.text(30, 30, "Hora")
    doc.text(50, 30, "Usuario")
    doc.text(90, 30, "Título")
    doc.text(140, 30, "Descripción")   
    
    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    let row = 40
    //resto del contenido
    for (var i = 0; i < ar.length; i++) {
        doc.text(10, row, `${ar[i].creationDate}`)
        doc.text(30, row, `${ar[i].creationTime}`)
        doc.text(50, row, `${ar[i].user.firstName} ${ar[i].user.lastName}`)
        doc.text(90, row, `${ar[i].title.split("\n").join("(salto)")}`)
        doc.text(140, row, `${ar[i].description.split("\n").join("(salto)")}`)

        row += 5

    }

    

    // Add new page
    //doc.addPage();
    //doc.text(20, 20, 'Visit CodexWorld.com');

    // Save the PDF
    doc.save('document.pdf');

}