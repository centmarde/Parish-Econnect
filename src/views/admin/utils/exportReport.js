import { Document, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, Packer } from 'docx'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

/**
 * Generate and export booking trends report as Excel
 */
export async function exportBookingTrendsExcel(trendData, currentMonthCounts) {
  const now = new Date()

  // Current Month Summary data
  const currentTotal = Object.values(currentMonthCounts).reduce((sum, count) => sum + count, 0)
  const currentMonthData = [
    ['Booking Type', 'Count'],
    ['Baptism', currentMonthCounts.baptism],
    ['Wedding', currentMonthCounts.wedding],
    ['Funeral', currentMonthCounts.funeral],
    ['Thanksgiving', currentMonthCounts.thanksgiving],
    ['Others', currentMonthCounts.others],
    ['Total', currentTotal]
  ]

  // Historical Trends data
  const trendsHeaders = ['Month', 'Baptism', 'Wedding', 'Funeral', 'Thanksgiving', 'Others', 'Total']
  const trendsRows = trendData.map(monthData => [
    monthData.month,
    monthData.baptism,
    monthData.wedding,
    monthData.funeral,
    monthData.thanksgiving,
    monthData.others,
    monthData.baptism + monthData.wedding + monthData.funeral + monthData.thanksgiving + monthData.others
  ])

  // Calculate totals
  const totals = trendData.reduce((acc, month) => {
    acc.baptism += month.baptism
    acc.wedding += month.wedding
    acc.funeral += month.funeral
    acc.thanksgiving += month.thanksgiving
    acc.others += month.others
    return acc
  }, { baptism: 0, wedding: 0, funeral: 0, thanksgiving: 0, others: 0 })

  const totalRow = [
    'TOTAL',
    totals.baptism,
    totals.wedding,
    totals.funeral,
    totals.thanksgiving,
    totals.others,
    totals.baptism + totals.wedding + totals.funeral + totals.thanksgiving + totals.others
  ]

  // Create workbook
  const wb = XLSX.utils.book_new()

  // Current Month sheet
  const ws1 = XLSX.utils.aoa_to_sheet([
    [`Current Month Summary (${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`],
    [],
    ...currentMonthData
  ])
  XLSX.utils.book_append_sheet(wb, ws1, 'Current Month')

  // Historical Trends sheet
  const ws2 = XLSX.utils.aoa_to_sheet([
    ['Historical Booking Trends'],
    [],
    trendsHeaders,
    ...trendsRows,
    totalRow
  ])
  XLSX.utils.book_append_sheet(wb, ws2, 'Historical Trends')

  // Generate and save
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const fileName = `Booking_Trends_Report_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}.xlsx`
  saveAs(blob, fileName)

  return fileName
}

/**
 * Generate and export booking trends report as DOCX
 */
export async function exportBookingTrendsReport(trendData, currentMonthCounts) {
  const now = new Date()
  const reportTitle = `Booking Trends Report - ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`

  // Calculate totals
  const currentTotal = Object.values(currentMonthCounts).reduce((sum, count) => sum + count, 0)

  // Create table rows for historical trends
  const trendTableRows = [
    // Header row
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: 'Month', bold: true, alignment: AlignmentType.CENTER })],
          shading: { fill: '4A5568' },
          width: { size: 20, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Baptism', bold: true, alignment: AlignmentType.CENTER })],
          shading: { fill: '667eea' },
          width: { size: 16, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Wedding', bold: true, alignment: AlignmentType.CENTER })],
          shading: { fill: 'f093fb' },
          width: { size: 16, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Funeral', bold: true, alignment: AlignmentType.CENTER })],
          shading: { fill: '4facfe' },
          width: { size: 16, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Thanksgiving', bold: true, alignment: AlignmentType.CENTER })],
          shading: { fill: '43e97b' },
          width: { size: 16, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Others', bold: true, alignment: AlignmentType.CENTER })],
          shading: { fill: 'fa709a' },
          width: { size: 16, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Total', bold: true, alignment: AlignmentType.CENTER })],
          shading: { fill: '2D3748' },
          width: { size: 16, type: WidthType.PERCENTAGE }
        })
      ]
    }),
    // Data rows
    ...trendData.map(monthData => {
      const total = monthData.baptism + monthData.wedding + monthData.funeral + monthData.thanksgiving + monthData.others
      return new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: monthData.month, alignment: AlignmentType.CENTER })]
          }),
          new TableCell({
            children: [new Paragraph({ text: String(monthData.baptism), alignment: AlignmentType.CENTER })]
          }),
          new TableCell({
            children: [new Paragraph({ text: String(monthData.wedding), alignment: AlignmentType.CENTER })]
          }),
          new TableCell({
            children: [new Paragraph({ text: String(monthData.funeral), alignment: AlignmentType.CENTER })]
          }),
          new TableCell({
            children: [new Paragraph({ text: String(monthData.thanksgiving), alignment: AlignmentType.CENTER })]
          }),
          new TableCell({
            children: [new Paragraph({ text: String(monthData.others), alignment: AlignmentType.CENTER })]
          }),
          new TableCell({
            children: [new Paragraph({ text: String(total), alignment: AlignmentType.CENTER, bold: true })]
          })
        ]
      })
    })
  ]

  // Calculate column totals
  const columnTotals = trendData.reduce((acc, month) => {
    acc.baptism += month.baptism
    acc.wedding += month.wedding
    acc.funeral += month.funeral
    acc.thanksgiving += month.thanksgiving
    acc.others += month.others
    return acc
  }, { baptism: 0, wedding: 0, funeral: 0, thanksgiving: 0, others: 0 })

  const grandTotal = columnTotals.baptism + columnTotals.wedding + columnTotals.funeral + columnTotals.thanksgiving + columnTotals.others

  // Add totals row
  trendTableRows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: 'TOTAL', bold: true, alignment: AlignmentType.CENTER })],
          shading: { fill: 'E2E8F0' }
        }),
        new TableCell({
          children: [new Paragraph({ text: String(columnTotals.baptism), bold: true, alignment: AlignmentType.CENTER })],
          shading: { fill: 'E2E8F0' }
        }),
        new TableCell({
          children: [new Paragraph({ text: String(columnTotals.wedding), bold: true, alignment: AlignmentType.CENTER })],
          shading: { fill: 'E2E8F0' }
        }),
        new TableCell({
          children: [new Paragraph({ text: String(columnTotals.funeral), bold: true, alignment: AlignmentType.CENTER })],
          shading: { fill: 'E2E8F0' }
        }),
        new TableCell({
          children: [new Paragraph({ text: String(columnTotals.thanksgiving), bold: true, alignment: AlignmentType.CENTER })],
          shading: { fill: 'E2E8F0' }
        }),
        new TableCell({
          children: [new Paragraph({ text: String(columnTotals.others), bold: true, alignment: AlignmentType.CENTER })],
          shading: { fill: 'E2E8F0' }
        }),
        new TableCell({
          children: [new Paragraph({ text: String(grandTotal), bold: true, alignment: AlignmentType.CENTER })],
          shading: { fill: 'E2E8F0' }
        })
      ]
    })
  )

  // Create current month summary table
  const currentMonthTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Booking Type', bold: true, alignment: AlignmentType.CENTER })],
            shading: { fill: '4A5568' },
            width: { size: 50, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Count', bold: true, alignment: AlignmentType.CENTER })],
            shading: { fill: '4A5568' },
            width: { size: 50, type: WidthType.PERCENTAGE }
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: 'Baptism', alignment: AlignmentType.LEFT })] }),
          new TableCell({ children: [new Paragraph({ text: String(currentMonthCounts.baptism), alignment: AlignmentType.CENTER })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: 'Wedding', alignment: AlignmentType.LEFT })] }),
          new TableCell({ children: [new Paragraph({ text: String(currentMonthCounts.wedding), alignment: AlignmentType.CENTER })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: 'Funeral', alignment: AlignmentType.LEFT })] }),
          new TableCell({ children: [new Paragraph({ text: String(currentMonthCounts.funeral), alignment: AlignmentType.CENTER })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: 'Thanksgiving', alignment: AlignmentType.LEFT })] }),
          new TableCell({ children: [new Paragraph({ text: String(currentMonthCounts.thanksgiving), alignment: AlignmentType.CENTER })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: 'Others', alignment: AlignmentType.LEFT })] }),
          new TableCell({ children: [new Paragraph({ text: String(currentMonthCounts.others), alignment: AlignmentType.CENTER })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Total', bold: true, alignment: AlignmentType.LEFT })],
            shading: { fill: 'E2E8F0' }
          }),
          new TableCell({
            children: [new Paragraph({ text: String(currentTotal), bold: true, alignment: AlignmentType.CENTER })],
            shading: { fill: 'E2E8F0' }
          })
        ]
      })
    ]
  })

  // Create trends table
  const trendsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: trendTableRows
  })

  // Create the document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: reportTitle,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),

          // Current Month Section
          new Paragraph({
            text: `Current Month Summary (${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 200 }
          }),

          currentMonthTable,

          // Spacing
          new Paragraph({ text: '', spacing: { after: 400 } }),

          // Historical Trends Section
          new Paragraph({
            text: 'Historical Booking Trends',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 200 }
          }),

          trendsTable,

          // Footer
          new Paragraph({
            text: `Report generated on ${now.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}`,
            alignment: AlignmentType.CENTER,
            spacing: { before: 600 }
          })
        ]
      }
    ]
  })

  // Generate and save the document
  const blob = await Packer.toBlob(doc)
  const fileName = `Booking_Trends_Report_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}.docx`
  saveAs(blob, fileName)

  return fileName
}
