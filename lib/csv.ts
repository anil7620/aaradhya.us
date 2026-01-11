export function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  let stringValue = String(value)
  if (stringValue.includes('"')) {
    stringValue = stringValue.replace(/"/g, '""')
  }
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue}"`
  }
  return stringValue
}

export function objectsToCsv(
  rows: Record<string, unknown>[],
  headers: string[]
): string {
  const lines = [headers.join(',')]
  for (const row of rows) {
    const line = headers.map((header) => escapeCsvValue(row[header])).join(',')
    lines.push(line)
  }
  return lines.join('\n')
}

function parseLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  values.push(current.trim())
  return values
}

export function csvToObjects(text: string): Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (!lines.length) return []

  const headers = parseLine(lines[0]).map((header) => header.trim())

  return lines.slice(1).map((line) => {
    const values = parseLine(line)
    const record: Record<string, string> = {}
    headers.forEach((header, index) => {
      record[header] = values[index] ?? ''
    })
    return record
  })
}


