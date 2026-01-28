import express from "express"
import path from "node:path"
import fs from "node:fs/promises"
import sqlite3 from "sqlite3"

const app = express()
const port = Number(process.env.PORT ?? 80)
const dbPath = process.env.DB_PATH
  ?? path.join(process.cwd(), "data", "deudores.sqlite")
const editPasscode = String(process.env.EDIT_PASSWORD ?? "40800554")

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

const distPath = path.join(process.cwd(), "dist")
app.use(express.static(distPath, { maxAge: "1y", index: false }))

app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"))
})

app.listen(port, () => {
  console.log(`Portal de servicios escuchando en puerto ${port}`)
})
