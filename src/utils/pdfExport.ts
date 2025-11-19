import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportElementToPDF(el: HTMLElement, filename='calendario.pdf', landscape=true){
  const canvas = await html2canvas(el, { scale:2 })
  const img = canvas.toDataURL('image/png')
  const pdf = new jsPDF(landscape ? 'landscape' : 'portrait', 'pt', 'a4')
  const props = pdf.getImageProperties(img)
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (props.height * pdfWidth) / props.width
  pdf.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight)
  pdf.save(filename)
}
