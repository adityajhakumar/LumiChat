import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.split('.').pop() || ''
    const arrayBuffer = await file.arrayBuffer()
    
    let content = ''

    if (fileExtension === 'docx') {
      const result = await mammoth.extractRawText({ arrayBuffer })
      content = result.value
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      let allSheets = ''
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName]
        const csv = XLSX.utils.sheet_to_csv(worksheet)
        allSheets += `\n=== Sheet: ${sheetName} ===\n${csv}\n`
      })
      content = allSheets
    } else {
      const decoder = new TextDecoder()
      content = decoder.decode(arrayBuffer)
    }

    return NextResponse.json({ content, fileName: file.name })
  } catch (error) {
    console.error('File processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    )
  }
}
