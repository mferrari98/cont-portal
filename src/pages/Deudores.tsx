import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { HandCoins, Lock, Plus, Trash2, Unlock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { ThemeClasses } from "@/lib/useThemeClasses"

interface Deuda {
  id: number
  fecha: string
  descripcion: string
  debe: string
}

interface Deudor {
  id: number
  nombre: string
  deudas: Deuda[]
}

interface DeudaDraft {
  fecha: string
  descripcion: string
  debe: string
}

interface DeudoresPageProps {
  themeClasses: ThemeClasses
}

const DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/
const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const getTodayIso = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60000)
  return local.toISOString().slice(0, 10)
}

const formatDate = (value: string) => {
  if (!value) {
    return "Sin fecha"
  }

  if (ISO_PATTERN.test(value)) {
    const [year, month, day] = value.split("-")
    return `${day}/${month}/${year}`
  }

  if (DATE_PATTERN.test(value)) {
    return value
  }

  return value
}

const normalizeDate = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  if (ISO_PATTERN.test(trimmed)) {
    return trimmed
  }

  const match = trimmed.match(DATE_PATTERN)
  if (match) {
    const [, day, month, year] = match
    return `${year}-${month}-${day}`
  }

  return null
}

const emptyDraft = (): DeudaDraft => ({
  fecha: getTodayIso(),
  descripcion: "",
  debe: ""
})

const DeudoresPage = ({ themeClasses }: DeudoresPageProps) => {
  const [deudores, setDeudores] = useState<Deudor[]>([])
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [drafts, setDrafts] = useState<Record<number, DeudaDraft>>({})
  const [loading, setLoading] = useState(true)
  const [savingDebtor, setSavingDebtor] = useState(false)
  const [savingDebtId, setSavingDebtId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [passcode, setPasscode] = useState(() => {
    if (typeof window === "undefined") {
      return ""
    }
    return sessionStorage.getItem("deudoresPasscode") ?? ""
  })
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window === "undefined") {
      return false
    }
    return sessionStorage.getItem("deudoresUnlocked") === "true"
  })
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false)
  const [unlockPasscode, setUnlockPasscode] = useState("")
  const [unlockError, setUnlockError] = useState<string | null>(null)
  const [unlocking, setUnlocking] = useState(false)
  const [nuevoDialogOpen, setNuevoDialogOpen] = useState(false)
  const [deudaDialogId, setDeudaDialogId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDeudorId, setSelectedDeudorId] = useState<number | null>(null)

  const hasDeudores = deudores.length > 0
  const isEditingEnabled = isUnlocked && Boolean(passcode)
  const outlineButtonClass = `${themeClasses.bgCard} ${themeClasses.text} border-2 ${themeClasses.border} hover:opacity-80 font-semibold`

  const filteredDeudores = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    if (!normalized) {
      return deudores
    }
    return deudores.filter((deudor) => deudor.nombre.toLowerCase().includes(normalized))
  }, [deudores, searchTerm])

  const selectedDeudor =
    filteredDeudores.find((deudor) => deudor.id === selectedDeudorId) ?? filteredDeudores[0] ?? null
  const selectedDraft = selectedDeudor ? drafts[selectedDeudor.id] ?? emptyDraft() : emptyDraft()

  const buildAuthHeaders = useCallback(() => {
    const headers = new Headers({ "Content-Type": "application/json" })
    if (passcode) {
      headers.set("x-deudores-passcode", passcode)
    }
    return headers
  }, [passcode])

  const loadDeudores = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/deudores")
      if (!response.ok) {
        throw new Error("No se pudo cargar la lista")
      }
      const payload = await response.json()
      setDeudores(payload.deudores ?? [])
    } catch (err) {
      console.error(err)
      setError("No se pudo cargar la lista de deudores")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDeudores()
  }, [loadDeudores])

  useEffect(() => {
    if (filteredDeudores.length === 0) {
      setSelectedDeudorId(null)
      return
    }

    if (!selectedDeudorId || !filteredDeudores.some((deudor) => deudor.id === selectedDeudorId)) {
      setSelectedDeudorId(filteredDeudores[0].id)
    }
  }, [filteredDeudores, selectedDeudorId])

  useEffect(() => {
    if (deudaDialogId !== null && deudaDialogId !== selectedDeudorId) {
      setDeudaDialogId(null)
    }
  }, [deudaDialogId, selectedDeudorId])

  const persistPasscode = (value: string) => {
    if (typeof window === "undefined") {
      return
    }
    sessionStorage.setItem("deudoresUnlocked", "true")
    sessionStorage.setItem("deudoresPasscode", value)
  }

  const clearPasscode = () => {
    if (typeof window === "undefined") {
      return
    }
    sessionStorage.removeItem("deudoresUnlocked")
    sessionStorage.removeItem("deudoresPasscode")
  }

  const handleUnauthorized = () => {
    clearPasscode()
    setIsUnlocked(false)
    setPasscode("")
    setDeudaDialogId(null)
    setNuevoDialogOpen(false)
    setError("Edicion bloqueada: clave incorrecta.")
  }

  const handleUnlockDialogChange = (open: boolean) => {
    setUnlockDialogOpen(open)
    if (!open) {
      setUnlockPasscode("")
      setUnlockError(null)
    }
  }

  const handleLockEditing = () => {
    clearPasscode()
    setIsUnlocked(false)
    setPasscode("")
    setDeudaDialogId(null)
    setNuevoDialogOpen(false)
    setUnlockDialogOpen(false)
    setUnlockPasscode("")
    setUnlockError(null)
    setError(null)
  }

  const handleNuevoDialogChange = (open: boolean) => {
    setNuevoDialogOpen(open)
    if (!open) {
      setNuevoNombre("")
    }
  }

  const handleDebtDialogChange = (deudorId: number, open: boolean) => {
    if (open) {
      setDrafts((prev) => ({
        ...prev,
        [deudorId]: emptyDraft()
      }))
      setDeudaDialogId(deudorId)
    } else if (deudaDialogId === deudorId) {
      setDeudaDialogId(null)
    }
  }

  const handleUnlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = unlockPasscode.trim()
    if (!trimmed) {
      setUnlockError("Ingresa la clave para editar.")
      return
    }

    setUnlocking(true)
    setUnlockError(null)
    try {
      const response = await fetch("/api/deudores/verificar", {
        method: "POST",
        headers: {
          "x-deudores-passcode": trimmed
        }
      })

      if (!response.ok) {
        throw new Error("Clave incorrecta")
      }

      setPasscode(trimmed)
      setIsUnlocked(true)
      persistPasscode(trimmed)
      setUnlockPasscode("")
      setUnlockError(null)
      setUnlockDialogOpen(false)
    } catch (err) {
      console.error(err)
      setUnlockError("Clave incorrecta.")
    } finally {
      setUnlocking(false)
    }
  }

  const handleCrearDeudor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isEditingEnabled) {
      setError("Edicion bloqueada. Ingresa la clave para continuar.")
      return
    }

    const nombre = nuevoNombre.trim()
    if (!nombre) {
      return
    }

    setSavingDebtor(true)
    setError(null)
    try {
      const response = await fetch("/api/deudores", {
        method: "POST",
        headers: buildAuthHeaders(),
        body: JSON.stringify({ nombre })
      })

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error ?? "No se pudo guardar el deudor")
      }

      setNuevoNombre("")
      setNuevoDialogOpen(false)
      await loadDeudores()
    } catch (err) {
      console.error(err)
      setError("No se pudo guardar el deudor")
    } finally {
      setSavingDebtor(false)
    }
  }

  const handleDraftChange = (deudorId: number, field: keyof DeudaDraft, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [deudorId]: {
        ...(prev[deudorId] ?? emptyDraft()),
        [field]: value
      }
    }))
  }

  const handleAgregarDeuda = async (event: FormEvent<HTMLFormElement>, deudorId: number) => {
    event.preventDefault()
    if (!isEditingEnabled) {
      setError("Edicion bloqueada. Ingresa la clave para continuar.")
      return
    }

    const draft = drafts[deudorId] ?? emptyDraft()
    const fechaNormalizada = normalizeDate(draft.fecha)
    const descripcion = draft.descripcion.trim()
    const debe = draft.debe.trim()

    if (!fechaNormalizada) {
      setError("Selecciona una fecha valida.")
      return
    }

    if (!descripcion || !debe) {
      setError("Completa descripcion y debe antes de guardar.")
      return
    }

    setSavingDebtId(deudorId)
    setError(null)
    try {
      const response = await fetch(`/api/deudores/${deudorId}/deudas`, {
        method: "POST",
        headers: buildAuthHeaders(),
        body: JSON.stringify({
          fecha: fechaNormalizada,
          descripcion,
          debe
        })
      })

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error ?? "No se pudo guardar la deuda")
      }

      setDrafts((prev) => ({ ...prev, [deudorId]: emptyDraft() }))
      setDeudaDialogId(null)
      await loadDeudores()
    } catch (err) {
      console.error(err)
      setError("No se pudo guardar la deuda")
    } finally {
      setSavingDebtId(null)
    }
  }

  const handleEliminarDeudor = async (deudor: Deudor) => {
    if (!isEditingEnabled) {
      setError("Edicion bloqueada. Ingresa la clave para continuar.")
      return
    }

    const confirmed = window.confirm(`Eliminar deudor ${deudor.nombre}?`)
    if (!confirmed) {
      return
    }

    setError(null)
    try {
      const response = await fetch(`/api/deudores/${deudor.id}`, {
        method: "DELETE",
        headers: buildAuthHeaders()
      })

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (!response.ok) {
        throw new Error("No se pudo eliminar el deudor")
      }

      await loadDeudores()
    } catch (err) {
      console.error(err)
      setError("No se pudo eliminar el deudor")
    }
  }

  const handleEliminarDeuda = async (deudorId: number, deuda: Deuda) => {
    if (!isEditingEnabled) {
      setError("Edicion bloqueada. Ingresa la clave para continuar.")
      return
    }

    const confirmed = window.confirm("Eliminar esta deuda?")
    if (!confirmed) {
      return
    }

    setError(null)
    try {
      const response = await fetch(`/api/deudores/${deudorId}/deudas/${deuda.id}`, {
        method: "DELETE",
        headers: buildAuthHeaders()
      })

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (!response.ok) {
        throw new Error("No se pudo eliminar la deuda")
      }

      await loadDeudores()
    } catch (err) {
      console.error(err)
      setError("No se pudo eliminar la deuda")
    }
  }

  return (
    <div className="py-6 px-4 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className={`text-sm ${themeClasses.textMuted} flex items-center gap-2`}>
              <a href="/" className="hover:underline">Portal</a>
              <span>/</span>
              <span>Deudores</span>
            </div>
            <h1 className={`text-4xl font-bold tracking-tight ${themeClasses.text} mt-2`}>
              Deudores
            </h1>
            <p className={`text-base mt-2 ${themeClasses.textSubtle}`}>
              Seguimiento de deudas internas por persona.
            </p>
          </div>
        </div>

        <Separator className="mb-6 opacity-50 animate-fade-in" />

        <div className="space-y-6">
          <Card className={`${themeClasses.bgCard} ${themeClasses.border} border`}>
            <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-md flex items-center justify-center ${themeClasses.iconBg}`}>
                  {isEditingEnabled ? (
                    <Unlock className={`h-5 w-5 ${themeClasses.text}`} />
                  ) : (
                    <Lock className={`h-5 w-5 ${themeClasses.text}`} />
                  )}
                </div>
                <div>
                  <h2 className={`text-sm font-semibold ${themeClasses.text}`}>
                    {isEditingEnabled ? "Edicion habilitada" : "Edicion bloqueada"}
                  </h2>
                  <p className={`text-sm ${themeClasses.textMuted}`}>
                    {isEditingEnabled
                      ? "Puedes agregar deudores y deudas."
                      : "Ingresa la clave para habilitar la edicion."}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isEditingEnabled ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${outlineButtonClass} flex items-center gap-2`}
                    onClick={handleLockEditing}
                  >
                    <Lock className="h-4 w-4" />
                    Bloquear edicion
                  </Button>
                ) : (
                  <Dialog open={unlockDialogOpen} onOpenChange={handleUnlockDialogChange}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${outlineButtonClass} flex items-center gap-2`}
                      >
                        <Unlock className="h-4 w-4" />
                        Desbloquear edicion
                      </Button>
                    </DialogTrigger>
                    <DialogContent className={`${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.text} border`}>
                      <DialogHeader>
                        <DialogTitle className={themeClasses.text}>Desbloquear edicion</DialogTitle>
                        <DialogDescription className={themeClasses.textMuted}>
                          Ingresa la clave para habilitar los cambios.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUnlock} className="space-y-4">
                        <Input
                          type="password"
                          inputMode="numeric"
                          value={unlockPasscode}
                          onChange={(event) => setUnlockPasscode(event.target.value)}
                          className={`${themeClasses.inputBg} ${themeClasses.border} ${themeClasses.text}`}
                          placeholder="Clave de edicion"
                          aria-label="Clave de edicion"
                        />
                        {unlockError && (
                          <p className="text-sm text-red-500">{unlockError}</p>
                        )}
                        <DialogFooter>
                          <Button
                            type="submit"
                            variant="outline"
                            size="sm"
                            className={outlineButtonClass}
                            disabled={unlocking}
                          >
                            {unlocking ? "Verificando..." : "Desbloquear"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}

                <Dialog open={nuevoDialogOpen} onOpenChange={handleNuevoDialogChange}>
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-green-500/54 text-white hover:bg-green-500/60 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      disabled={!isEditingEnabled}
                    >
                      <Plus className="h-4 w-4" />
                      Nuevo deudor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className={`${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.text} border`}>
                    <DialogHeader>
                      <DialogTitle className={themeClasses.text}>Nuevo deudor</DialogTitle>
                      <DialogDescription className={themeClasses.textMuted}>
                        Registra una persona para comenzar a cargar deudas.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCrearDeudor} className="space-y-4">
                      <Input
                        placeholder="Nombre y apellido"
                        value={nuevoNombre}
                        onChange={(event) => setNuevoNombre(event.target.value)}
                        className={`${themeClasses.inputBg} ${themeClasses.border} ${themeClasses.text}`}
                        aria-label="Nombre del deudor"
                      />
                      <DialogFooter>
                        <Button
                          type="submit"
                          variant="default"
                          size="sm"
                          className="bg-green-500/54 text-white hover:bg-green-500/60 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={savingDebtor}
                        >
                          {savingDebtor ? "Guardando..." : "Agregar deudor"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HandCoins className={`h-5 w-5 ${themeClasses.text}`} />
                <h2 className={`text-lg font-semibold ${themeClasses.text}`}>
                  Deudas registradas
                </h2>
              </div>
              {hasDeudores && (
                <span className={`text-sm ${themeClasses.textMuted}`}>
                  {deudores.length} personas
                </span>
              )}
            </div>

            {error && (
              <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-500">
                {error}
              </div>
            )}

            {loading && !hasDeudores && (
              <p className={`text-sm ${themeClasses.textMuted}`}>
                Cargando deudores...
              </p>
            )}

            {!loading && !hasDeudores && (
              <Card className={`${themeClasses.bgCard} ${themeClasses.border} border`}>
                <CardContent className="p-5">
                  <p className={`text-sm ${themeClasses.textMuted}`}>
                    Todavia no hay deudores cargados.
                  </p>
                </CardContent>
              </Card>
            )}

            {hasDeudores && (
              <Card className={`${themeClasses.bgCard} ${themeClasses.border} border`}>
                <CardContent className="p-4">
                  <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Input
                          type="search"
                          value={searchTerm}
                          onChange={(event) => setSearchTerm(event.target.value)}
                          className={`${themeClasses.inputBg} ${themeClasses.border} ${themeClasses.text}`}
                          placeholder="Buscar deudor"
                          aria-label="Buscar deudor"
                        />
                        <p className={`text-xs ${themeClasses.textMuted}`}>
                          Mostrando {filteredDeudores.length} de {deudores.length} personas
                        </p>
                      </div>
                      <div
                        className={`rounded-md border ${themeClasses.border} ${themeClasses.resultBg} p-2 max-h-[60vh] overflow-y-auto`}
                      >
                        {filteredDeudores.length === 0 ? (
                          <p className={`text-sm ${themeClasses.textMuted} px-2 py-3`}>
                            No hay coincidencias con ese filtro.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {filteredDeudores.map((deudor) => {
                              const isSelected = selectedDeudor?.id === deudor.id

                              return (
                                <button
                                  key={deudor.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedDeudorId(deudor.id)
                                    setDeudaDialogId(null)
                                  }}
                                  aria-pressed={isSelected}
                                  className={`w-full text-left rounded-md border px-3 py-2 transition ${themeClasses.border} ${themeClasses.bgHover} ${isSelected ? themeClasses.bgCard : "bg-transparent"}`}
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${themeClasses.iconBg}`}>
                                        <User className={`h-4 w-4 ${themeClasses.text}`} />
                                      </div>
                                      <div className="min-w-0">
                                        <p className={`text-sm font-semibold ${themeClasses.text} truncate`}>
                                          {deudor.nombre}
                                        </p>
                                        <p className={`text-xs ${themeClasses.textMuted}`}>
                                          {deudor.deudas.length} deudas
                                        </p>
                                      </div>
                                    </div>
                                    <div className={`text-[11px] font-semibold px-2 py-1 rounded-md ${themeClasses.badge}`}>
                                      {deudor.deudas.length}
                                    </div>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {selectedDeudor ? (
                        <div className="space-y-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-10 h-10 rounded-md flex items-center justify-center ${themeClasses.iconBg}`}>
                                <User className={`h-5 w-5 ${themeClasses.text}`} />
                              </div>
                              <div className="min-w-0">
                                <p className={`text-xl font-semibold ${themeClasses.text} break-words`}>
                                  {selectedDeudor.nombre}
                                </p>
                                <p className={`text-sm ${themeClasses.textMuted}`}>
                                  {selectedDeudor.deudas.length} deudas registradas
                                </p>
                              </div>
                            </div>
                            <div className={`text-xs font-semibold px-2 py-1 rounded-md ${themeClasses.badge}`}>
                              {selectedDeudor.deudas.length} items
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <Dialog
                              open={deudaDialogId === selectedDeudor.id}
                              onOpenChange={(open) => handleDebtDialogChange(selectedDeudor.id, open)}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="bg-green-500/54 text-white hover:bg-green-500/60 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                  disabled={!isEditingEnabled}
                                >
                                  <Plus className="h-4 w-4" />
                                  Nueva deuda
                                </Button>
                              </DialogTrigger>
                              <DialogContent className={`${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.text} border`}>
                                <DialogHeader>
                                  <DialogTitle className={themeClasses.text}>Nueva deuda</DialogTitle>
                                  <DialogDescription className={themeClasses.textMuted}>
                                    Registra una deuda para {selectedDeudor.nombre}.
                                  </DialogDescription>
                                </DialogHeader>
                                <form
                                  onSubmit={(event) => handleAgregarDeuda(event, selectedDeudor.id)}
                                  className="space-y-4"
                                >
                                  <Input
                                    type="date"
                                    value={selectedDraft.fecha}
                                    onChange={(event) => handleDraftChange(selectedDeudor.id, "fecha", event.target.value)}
                                    className={`${themeClasses.inputBg} ${themeClasses.border} ${themeClasses.text}`}
                                    aria-label="Fecha de la deuda"
                                  />
                                  <Input
                                    type="text"
                                    value={selectedDraft.descripcion}
                                    onChange={(event) => handleDraftChange(selectedDeudor.id, "descripcion", event.target.value)}
                                    className={`${themeClasses.inputBg} ${themeClasses.border} ${themeClasses.text}`}
                                    placeholder="Descripcion"
                                    aria-label="Descripcion de la deuda"
                                  />
                                  <Input
                                    type="text"
                                    value={selectedDraft.debe}
                                    onChange={(event) => handleDraftChange(selectedDeudor.id, "debe", event.target.value)}
                                    className={`${themeClasses.inputBg} ${themeClasses.border} ${themeClasses.text}`}
                                    placeholder="Debe"
                                    aria-label="Debe"
                                  />
                                  <DialogFooter>
                                    <Button
                                      type="submit"
                                      variant="default"
                                      size="sm"
                                      className="bg-green-500/54 text-white hover:bg-green-500/60 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                      disabled={savingDebtId === selectedDeudor.id}
                                    >
                                      {savingDebtId === selectedDeudor.id ? "Guardando..." : "Agregar deuda"}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`${outlineButtonClass} flex items-center gap-2`}
                              onClick={() => handleEliminarDeudor(selectedDeudor)}
                              disabled={!isEditingEnabled}
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar deudor
                            </Button>
                          </div>

                          {!isEditingEnabled && (
                            <p className={`text-sm ${themeClasses.textMuted}`}>
                              Edicion bloqueada. Ingresa la clave para agregar o eliminar deudas.
                            </p>
                          )}

                          {selectedDeudor.deudas.length === 0 ? (
                            <p className={`text-sm ${themeClasses.textMuted}`}>
                              Sin deudas registradas para esta persona.
                            </p>
                          ) : (
                            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                              {selectedDeudor.deudas.map((deuda) => (
                                <div
                                  key={deuda.id}
                                  className={`rounded-md border ${themeClasses.border} ${themeClasses.resultBg} px-3 py-2`}
                                >
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                      <p className={`text-sm font-semibold ${themeClasses.text}`}>
                                        {deuda.descripcion}
                                      </p>
                                      <p className={`text-xs ${themeClasses.textMuted}`}>
                                        {formatDate(deuda.fecha)}
                                      </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                                      <div className="text-right">
                                        <p className={`text-xs ${themeClasses.textMuted}`}>Debe</p>
                                        <p className={`text-sm font-semibold ${themeClasses.text}`}>
                                          {deuda.debe}
                                        </p>
                                      </div>
                                      {isEditingEnabled && (
                                        <Button
                                          variant="default"
                                          size="sm"
                                          className="bg-red-500/54 text-white hover:bg-red-500/60 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                          onClick={() => handleEliminarDeuda(selectedDeudor.id, deuda)}
                                        >
                                          Eliminar
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className={`text-sm ${themeClasses.textMuted}`}>
                          Selecciona un deudor para ver sus deudas.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeudoresPage
