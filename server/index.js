import express from "express"
import path from "node:path"
import fs from "node:fs/promises"
import sqlite3 from "sqlite3"
import readXlsxFile from "read-excel-file/node"

const app = express()
const port = Number(process.env.PORT ?? 80)
const dbPath = process.env.DB_PATH
  ?? path.join(process.cwd(), "data", "deudores.sqlite")
const editPasscode = String(process.env.EDIT_PASSWORD ?? "40800554")
const distPath = path.join(process.cwd(), "dist")
const internosPath = path.join(distPath, "internos.xlsx")

await fs.mkdir(path.dirname(dbPath), { recursive: true })

const db = new sqlite3.Database(dbPath)
db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON")
})

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function handleResult(err) {
    if (err) {
      reject(err)
      return
    }
    resolve({ lastID: this.lastID, changes: this.changes })
  })
})

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) {
      reject(err)
      return
    }
    resolve(rows)
  })
})

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) {
      reject(err)
      return
    }
    resolve(row)
  })
})

await run(`
  CREATE TABLE IF NOT EXISTS deudores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)

await run(`
  CREATE TABLE IF NOT EXISTS deudas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deudor_id INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    monto TEXT NOT NULL,
    creado_en TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (deudor_id) REFERENCES deudores(id) ON DELETE CASCADE
  )
`)

app.use(express.json({ limit: "1mb" }))

const DIRECTORY_MAX_ROWS = 800
const DIRECTORY_MAX_COLUMNS = 8
const HEADER_SCAN_ROWS = 20

const HEADER_TOKENS = {
  extension: ["interno", "internos", "extension", "ext", "anexo", "telefono", "telefonos", "int"],
  department: ["sector", "departamento", "area", "unidad", "seccion"],
  title: ["titulo", "cargo", "puesto", "funcion"],
  name: ["apellido y nombre", "apellidos y nombres", "apellido", "nombre", "responsable", "contacto"]
}

const DEFAULT_COLUMN_INDICES = {
  extension: 1,
  department: 2,
  title: 3,
  name: 4
}

const textNormalizationCache = new Map()

const normalizeText = (text) => String(text ?? "")
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[,\s-]+/g, " ")
  .replace(/[^\w\s]/g, "")
  .trim()

const cachedNormalizeText = (text) => {
  if (textNormalizationCache.has(text)) {
    return textNormalizationCache.get(text)
  }
  const normalized = normalizeText(text)
  if (textNormalizationCache.size > 1000) {
    const firstKey = textNormalizationCache.keys().next().value
    if (firstKey !== undefined) {
      textNormalizationCache.delete(firstKey)
    }
  }
  textNormalizationCache.set(text, normalized)
  return normalized
}

const STOP_TOKEN_NORMALIZED = [
  "telefonos internos reserva",
  "reserva 6000"
].map((token) => cachedNormalizeText(token))

const clampRows = (rows) => rows
  .slice(0, DIRECTORY_MAX_ROWS)
  .map((row) => row.slice(0, DIRECTORY_MAX_COLUMNS))

const normalizeCellValue = (value) => {
  if (value === undefined || value === null) return ""
  return String(value).trim()
}

const normalizeExtensionValue = (value) => value.replace(/\.0+$/, "")

const normalizeExtensionSearch = (value) => {
  const digitsOnly = value.replace(/[^\d]/g, "")
  return digitsOnly || value.toLowerCase()
}

const isNumericExtension = (value) => {
  const cleaned = value.replace(/\s+/g, "").replace(/\./g, "")
  return cleaned.length > 0 && /^\d+$/.test(cleaned)
}

const splitNames = (value) => value
  .split(/\s*\/\s*|\s*;\s*|\s*\|\s*|\r?\n|\s+-\s+/g)
  .map((name) => name.trim())
  .filter((name) => name.length > 0)

const matchesHeaderToken = (normalized, tokens) =>
  tokens.some((token) => normalized === token || normalized.includes(token))

const detectHeaderMapping = (rawData) => {
  const maxRows = Math.min(rawData.length, HEADER_SCAN_ROWS)

  for (let i = 0; i < maxRows; i += 1) {
    const row = rawData[i] || []
    const map = {
      extensionIndex: -1,
      departmentIndex: -1,
      titleIndex: -1,
      nameIndex: -1
    }
    let foundExtension = false
    let foundDepartment = false
    let foundTitle = false
    let foundName = false

    row.forEach((cell, idx) => {
      const normalized = cachedNormalizeText(normalizeCellValue(cell))
      if (!normalized) return

      if (!foundExtension && matchesHeaderToken(normalized, HEADER_TOKENS.extension)) {
        map.extensionIndex = idx
        foundExtension = true
      }
      if (!foundDepartment && matchesHeaderToken(normalized, HEADER_TOKENS.department)) {
        map.departmentIndex = idx
        foundDepartment = true
      }
      if (!foundTitle && matchesHeaderToken(normalized, HEADER_TOKENS.title)) {
        map.titleIndex = idx
        foundTitle = true
      }
      if (!foundName && matchesHeaderToken(normalized, HEADER_TOKENS.name)) {
        map.nameIndex = idx
        foundName = true
      }
    })

    if (foundName && (foundExtension || foundDepartment)) {
      return { headerRowIndex: i, columnMap: map }
    }
  }

  return {
    headerRowIndex: -1,
    columnMap: {
      extensionIndex: DEFAULT_COLUMN_INDICES.extension,
      departmentIndex: DEFAULT_COLUMN_INDICES.department,
      titleIndex: DEFAULT_COLUMN_INDICES.title,
      nameIndex: DEFAULT_COLUMN_INDICES.name
    }
  }
}

const uniqueIndices = (indices) => {
  const seen = new Set()
  const result = []

  indices.forEach((idx) => {
    if (idx < 0 || Number.isNaN(idx)) return
    if (seen.has(idx)) return
    seen.add(idx)
    result.push(idx)
  })

  return result
}

const pickCellText = (row, indices) => {
  for (const idx of indices) {
    if (idx < 0 || idx >= row.length) continue
    const value = normalizeCellValue(row[idx])
    if (value) return value
  }
  return ""
}

const shouldStopProcessing = (values, hasName, hasNumericExtension) => {
  if (hasName || hasNumericExtension) return false
  return values.some((value) => {
    if (!value) return false
    const normalized = cachedNormalizeText(value)
    return normalized.length > 0 && STOP_TOKEN_NORMALIZED.some((token) => normalized.includes(token))
  })
}

const processExcelData = (rawData) => {
  const personnel = []
  let id = 1
  let stopProcessing = false
  const { headerRowIndex, columnMap } = detectHeaderMapping(rawData)
  const dataStartIndex = headerRowIndex >= 0 ? headerRowIndex + 1 : 0

  for (let i = dataStartIndex; i < rawData.length && !stopProcessing; i += 1) {
    const row = rawData[i]

    if (!row || row.every((cell) => !cell || cell === "" || cell === 0)) continue

    const rowValues = row.map((cell) => normalizeCellValue(cell))

    const normalizedRow = rowValues.map((value) => cachedNormalizeText(value))
    const headerHasName = normalizedRow.some((value) => matchesHeaderToken(value, HEADER_TOKENS.name))
    const headerHasExtension = normalizedRow.some((value) => matchesHeaderToken(value, HEADER_TOKENS.extension))
    const headerHasDepartment = normalizedRow.some((value) => matchesHeaderToken(value, HEADER_TOKENS.department))
    if (headerHasName && (headerHasExtension || headerHasDepartment)) continue

    const extensionIndices = uniqueIndices([
      columnMap.extensionIndex,
      DEFAULT_COLUMN_INDICES.extension,
      0
    ])
    const nameIndices = uniqueIndices([
      columnMap.nameIndex,
      DEFAULT_COLUMN_INDICES.name,
      DEFAULT_COLUMN_INDICES.title
    ])
    const departmentIndices = uniqueIndices([
      columnMap.departmentIndex,
      DEFAULT_COLUMN_INDICES.department,
      DEFAULT_COLUMN_INDICES.title
    ])

    const extensionRaw = pickCellText(row, extensionIndices)
    const nameRaw = pickCellText(row, nameIndices)
    const departmentRaw = pickCellText(row, departmentIndices)

    const extensionValue = extensionRaw ? normalizeExtensionValue(extensionRaw) : ""
    const hasName = nameRaw.length > 0
    const hasExtension = extensionValue.length > 0
    const hasNumericExtension = extensionRaw ? isNumericExtension(extensionRaw) : false

    if (shouldStopProcessing(rowValues, hasName, hasNumericExtension)) {
      stopProcessing = true
      break
    }

    if (hasName || hasExtension) {
      let names = []

      if (hasName) {
        names = splitNames(nameRaw)
      } else {
        names = ["Sin Nombre"]
      }

      const department = departmentRaw || "Sector sin identificar"

      const filteredNames = names.filter((name) =>
        name &&
        !name.toLowerCase().includes("acalandra@servicoop.com") &&
        !name.toLowerCase().includes("sector comunicaciones al interno") &&
        name.trim().length > 0
      )

      if (filteredNames.length === 0) continue

      filteredNames.forEach((name) => {
        personnel.push({
          id: String(id++),
          name,
          department,
          extension: extensionValue || "N/A",
          searchableName: cachedNormalizeText(name),
          searchableExtension: normalizeExtensionSearch(extensionValue || "")
        })
      })
    }
  }

  return personnel
}

const internosCache = {
  mtimeMs: 0,
  payload: null,
  inflight: null,
  lastError: null,
  lastLoadedAt: 0
}

const refreshInternosCache = async ({ force = false } = {}) => {
  const stat = await fs.stat(internosPath)
  if (!force && internosCache.payload && internosCache.mtimeMs === stat.mtimeMs) {
    return internosCache.payload
  }

  if (internosCache.inflight) {
    return internosCache.inflight
  }

  const loadPromise = (async () => {
    const rows = await readXlsxFile(internosPath)
    const rawData = clampRows(rows)

    if (!rawData || rawData.length === 0) {
      throw new Error("No se encontraron datos en el archivo Excel")
    }

    const personnel = processExcelData(rawData)
    return { personnel }
  })()

  internosCache.inflight = loadPromise

  try {
    const payload = await loadPromise
    internosCache.mtimeMs = stat.mtimeMs
    internosCache.payload = payload
    internosCache.lastLoadedAt = Date.now()
    internosCache.lastError = null
    return payload
  } catch (error) {
    internosCache.lastError = error
    throw error
  } finally {
    internosCache.inflight = null
  }
}

const requirePasscode = (req, res) => {
  const provided = String(req.header("x-deudores-passcode") ?? "").trim()
  if (!provided || provided !== editPasscode) {
    res.status(401).json({ error: "Clave incorrecta" })
    return false
  }
  return true
}

app.get("/api/deudores", async (_req, res) => {
  try {
    const deudores = await all(
      "SELECT id, nombre FROM deudores ORDER BY nombre COLLATE NOCASE"
    )
    const deudas = await all(
      "SELECT id, deudor_id as deudorId, fecha, descripcion, monto FROM deudas ORDER BY fecha DESC, id DESC"
    )

    const deudasPorDeudor = new Map()
    deudas.forEach((deuda) => {
      const lista = deudasPorDeudor.get(deuda.deudorId) ?? []
      lista.push({
        id: deuda.id,
        fecha: deuda.fecha,
        descripcion: deuda.descripcion,
        debe: String(deuda.monto ?? "")
      })
      deudasPorDeudor.set(deuda.deudorId, lista)
    })

    const payload = deudores.map((deudor) => ({
      id: deudor.id,
      nombre: deudor.nombre,
      deudas: deudasPorDeudor.get(deudor.id) ?? []
    }))

    res.json({ deudores: payload })
  } catch (error) {
    console.error("Error cargando deudores", error)
    res.status(500).json({ error: "No se pudo cargar la lista de deudores" })
  }
})

app.get("/api/internos", async (_req, res) => {
  if (internosCache.payload) {
    res.json(internosCache.payload)
    return
  }

  if (internosCache.inflight) {
    res.status(503).json({ error: "Directorio interno en carga" })
    return
  }

  if (internosCache.lastError?.code === "ENOENT") {
    res.status(404).json({ error: "No se encontro el archivo del directorio interno" })
    return
  }

  console.error("Directorio interno sin cache disponible", internosCache.lastError)
  res.status(503).json({ error: "Directorio interno no disponible" })
})

app.post("/api/deudores", async (req, res) => {
  try {
    if (!requirePasscode(req, res)) {
      return
    }
    const nombre = String(req.body?.nombre ?? "").trim()
    if (!nombre) {
      res.status(400).json({ error: "Nombre requerido" })
      return
    }

    const result = await run(
      "INSERT INTO deudores (nombre) VALUES (?)",
      [nombre]
    )

    res.status(201).json({ id: result.lastID })
  } catch (error) {
    console.error("Error guardando deudor", error)
    res.status(500).json({ error: "No se pudo guardar el deudor" })
  }
})

app.post("/api/deudores/:id/deudas", async (req, res) => {
  try {
    if (!requirePasscode(req, res)) {
      return
    }
    const deudorId = Number(req.params.id)
    if (!Number.isInteger(deudorId)) {
      res.status(400).json({ error: "Deudor invalido" })
      return
    }

    const fecha = String(req.body?.fecha ?? "").trim()
    const descripcion = String(req.body?.descripcion ?? "").trim()
    const debe = String(req.body?.debe ?? req.body?.monto ?? "").trim()

    if (!fecha || !descripcion || !debe) {
      res.status(400).json({ error: "Datos de deuda incompletos" })
      return
    }

    const deudor = await get("SELECT id FROM deudores WHERE id = ?", [deudorId])
    if (!deudor) {
      res.status(404).json({ error: "Deudor no encontrado" })
      return
    }

    const result = await run(
      "INSERT INTO deudas (deudor_id, fecha, descripcion, monto) VALUES (?, ?, ?, ?)",
      [deudorId, fecha, descripcion, debe]
    )

    res.status(201).json({ id: result.lastID })
  } catch (error) {
    console.error("Error guardando deuda", error)
    res.status(500).json({ error: "No se pudo guardar la deuda" })
  }
})

app.put("/api/deudores/:id/deudas/:deudaId", async (req, res) => {
  try {
    if (!requirePasscode(req, res)) {
      return
    }
    const deudorId = Number(req.params.id)
    const deudaId = Number(req.params.deudaId)
    if (!Number.isInteger(deudorId) || !Number.isInteger(deudaId)) {
      res.status(400).json({ error: "Parametros invalidos" })
      return
    }

    const fecha = String(req.body?.fecha ?? "").trim()
    const descripcion = String(req.body?.descripcion ?? "").trim()
    const debe = String(req.body?.debe ?? req.body?.monto ?? "").trim()

    if (!fecha || !descripcion || !debe) {
      res.status(400).json({ error: "Datos de deuda incompletos" })
      return
    }

    const result = await run(
      "UPDATE deudas SET fecha = ?, descripcion = ?, monto = ? WHERE id = ? AND deudor_id = ?",
      [fecha, descripcion, debe, deudaId, deudorId]
    )

    if (!result.changes) {
      res.status(404).json({ error: "Deuda no encontrada" })
      return
    }

    res.status(204).end()
  } catch (error) {
    console.error("Error actualizando deuda", error)
    res.status(500).json({ error: "No se pudo actualizar la deuda" })
  }
})

app.delete("/api/deudores/:id", async (req, res) => {
  try {
    if (!requirePasscode(req, res)) {
      return
    }
    const deudorId = Number(req.params.id)
    if (!Number.isInteger(deudorId)) {
      res.status(400).json({ error: "Deudor invalido" })
      return
    }

    const result = await run("DELETE FROM deudores WHERE id = ?", [deudorId])
    if (!result.changes) {
      res.status(404).json({ error: "Deudor no encontrado" })
      return
    }

    res.status(204).end()
  } catch (error) {
    console.error("Error eliminando deudor", error)
    res.status(500).json({ error: "No se pudo eliminar el deudor" })
  }
})

app.delete("/api/deudores/:id/deudas/:deudaId", async (req, res) => {
  try {
    if (!requirePasscode(req, res)) {
      return
    }
    const deudorId = Number(req.params.id)
    const deudaId = Number(req.params.deudaId)
    if (!Number.isInteger(deudorId) || !Number.isInteger(deudaId)) {
      res.status(400).json({ error: "Parametros invalidos" })
      return
    }

    const result = await run(
      "DELETE FROM deudas WHERE id = ? AND deudor_id = ?",
      [deudaId, deudorId]
    )
    if (!result.changes) {
      res.status(404).json({ error: "Deuda no encontrada" })
      return
    }

    res.status(204).end()
  } catch (error) {
    console.error("Error eliminando deuda", error)
    res.status(500).json({ error: "No se pudo eliminar la deuda" })
  }
})

app.post("/api/deudores/verificar", (req, res) => {
  if (!requirePasscode(req, res)) {
    return
  }
  res.status(204).end()
})

app.get("/health.html", (_req, res) => {
  res.status(200).send("ok")
})

app.use(express.static(distPath, { maxAge: "1y", index: false }))

app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"))
})

try {
  await refreshInternosCache({ force: true })
  console.log("Directorio interno precargado")
} catch (error) {
  console.error("Error precargando directorio interno", error)
}

app.listen(port, () => {
  console.log(`Portal de servicios escuchando en puerto ${port}`)
})
