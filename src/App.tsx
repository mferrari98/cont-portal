import { useState, useEffect } from "react"
import { useThemeClasses } from "@/lib/useThemeClasses"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { SearchButton } from "@/components/search/SearchButton"
import { SearchDialog } from "@/components/search/SearchDialog"
import {
  Moon,
  Sun,
  Shield,
  BarChart3,
  LayoutDashboard,
  Map,
  Monitor,
  ChefHat
} from "lucide-react"

interface Service {
  id: string
  name: string
  icon: React.ReactNode
  desc: string
  url: string
}

const THEME_STORAGE_KEY = 'theme'
const LEGACY_THEME_STORAGE_KEY = 'portal_theme'

const serviciosLocales: Service[] = [
  {
    id: 'guardias',
    name: 'Guardias',
    icon: <Shield className="w-6 h-6" />,
    desc: 'Cronograma de guardias rotativas',
    url: '/guardias/'
  },
  {
    id: 'reportes',
    name: 'Reportes de Agua',
    icon: <BarChart3 className="w-6 h-6" />,
    desc: 'Sistema de reportería y análisis',
    url: '/reporte/'
  },
  {
    id: 'monitor',
    name: 'Monitor',
    icon: <Monitor className="w-6 h-6" />,
    desc: 'Monitor de recursos del servidor',
    url: '/monitor/'
  },
  {
    id: 'empa',
    name: 'Pedidos',
    icon: <ChefHat className="w-6 h-6" />,
    desc: 'Gestión',
    url: '/empa/'
  }
]

const serviciosExternos: Service[] = [
  {
    id: 'gis',
    name: 'GIS',
    icon: <Map className="w-6 h-6" />,
    desc: 'Sistema de información geográfica',
    url: '/gis/'
  },
  {
    id: 'dash',
    name: 'Dashboard Exemys',
    icon: <LayoutDashboard className="w-6 h-6" />,
    desc: 'Panel de control y monitoreo',
    url: 'https://10.10.4.125/'
  }
]

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [isLoading, setIsLoading] = useState(true)
  const [loadingService, setLoadingService] = useState<string | null>(null)
  const [showSearchDialog, setShowSearchDialog] = useState(false)

  useEffect(() => {
    const savedTheme = (localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark')
      || (localStorage.getItem(LEGACY_THEME_STORAGE_KEY) as 'light' | 'dark')
      || 'dark'

    localStorage.setItem(THEME_STORAGE_KEY, savedTheme)
    localStorage.setItem(LEGACY_THEME_STORAGE_KEY, savedTheme)

    // Apply theme immediately to prevent any color flashing
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    setTheme(savedTheme)
    setIsLoading(false)
  }, [])

  // Apply dark mode class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Escuchar cambios de tema desde otras pestañas/aplicaciones (sincronización con emp app)
  useEffect(() => {
    const handleThemeEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: 'light' | 'dark' }>
      if (customEvent.detail?.theme && ['light', 'dark'].includes(customEvent.detail.theme)) {
        setTheme(customEvent.detail.theme)
      }
    }

    // Escuchar evento personalizado
    window.addEventListener('themeChanged', handleThemeEvent)

    // También escuchar cambios en storage (de otras pestañas/aplicaciones)
    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === THEME_STORAGE_KEY || e.key === LEGACY_THEME_STORAGE_KEY) && e.newValue) {
        setTheme(e.newValue as 'light' | 'dark')
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('themeChanged', handleThemeEvent)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    const resetLoading = () => {
      setLoadingService(null)
    }

    const handlePageShow = () => {
      resetLoading()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        resetLoading()
      }
    }

    window.addEventListener('pageshow', handlePageShow)
    window.addEventListener('focus', resetLoading)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('pageshow', handlePageShow)
      window.removeEventListener('focus', resetLoading)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    localStorage.setItem(LEGACY_THEME_STORAGE_KEY, newTheme)
    // Disparar evento para sincronizar otras pestañas/aplicaciones (ej: emp app)
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: newTheme }
    }))
  }

  const handleServiceClick = (serviceId: string) => {
    // Optimistically show loading state for accessibility feedback
    setLoadingService(serviceId)
  }

  const isDark = theme === 'dark'
  const gruposServicios = [
    { id: 'locales', titulo: 'Apps locales', servicios: serviciosLocales },
    { id: 'externas', titulo: 'Apps externas', servicios: serviciosExternos }
  ]

  // Los hooks deben ser llamados siempre, antes de cualquier return condicional
  const themeClasses = useThemeClasses(theme)

  if (isLoading) return null

  return (
    <div className={`min-h-screen gradient-background relative`}>

        {/* Top Bar */}
        <div className={`border-b ${themeClasses.borderLight} relative z-10 animate-fade-in`}>
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-md border flex items-center justify-center ${themeClasses.bgCard} ${themeClasses.border}`}>
                <Shield className={`w-4 h-4 ${themeClasses.text}`} />
              </div>
              <a
                href="/"
                className={`text-base font-medium ${themeClasses.text} transition-opacity hover:opacity-80`}
              >
                Telecomunicaciones y Automatismos
              </a>
            </div>

            <div className="flex items-center gap-2">
              {/* Search Button */}
              <SearchButton
                onClick={() => setShowSearchDialog(true)}
                themeClasses={themeClasses}
              />

              {/* Theme Toggle */}
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="icon"
                className={`border-2 ${themeClasses.border} ${themeClasses.text} rounded-md h-8 w-8 hover:cursor-pointer`}
              >
                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>

            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-6 px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6 mt-8">
              <h1 className={`text-5xl font-bold tracking-tight ${themeClasses.text} inline-block whitespace-nowrap`}>
                Portal de Servicios
              </h1>
              <p className={`text-base mt-2 ${themeClasses.textSubtle}`}>
                Centro de Control
              </p>
            </div>

            <Separator className="mb-8 opacity-50 animate-fade-in" style={{ animationDelay: '3s' }} />

            {/* Services Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {gruposServicios.map((grupo) => (
                <div
                  key={grupo.id}
                  className={grupo.id === 'locales' ? 'lg:col-span-2' : 'lg:col-span-1'}
                >
                  <h2 className={`text-xl font-semibold ${themeClasses.text} mb-3`}>
                    {grupo.titulo}
                  </h2>
                  <div className={`grid ${grupo.id === 'locales' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
                    {grupo.servicios.map((service, index) => (
                      <div
                        key={service.id}
                        className={`animate-fade-in-up stagger-${index + 1}`}
                      >
                        <a
                          href={service.url}
                          onClick={() => handleServiceClick(service.id)}
                          className="group block h-full w-full text-left hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
                          aria-label={`Abrir ${service.name}`}
                          aria-busy={loadingService === service.id}
                        >
                          <Card className={`${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.borderHover} border h-full relative transition-all duration-300 ease-out shadow-sm ${loadingService === service.id ? 'opacity-75' : ''} group-hover:-translate-y-0.5 group-hover:shadow-md`}>
                            <CardContent className="p-4 h-full min-h-[77px] flex items-center">
                              <div className="flex items-start gap-3 w-full">
                                <div className={`w-11 h-11 rounded-md flex items-center justify-center flex-shrink-0 ${themeClasses.iconBg} transition-all duration-300`}>
                                  <div className={`${themeClasses.text} ${service.id === 'dash' ? themeClasses.textSubtle : ''} transition-transform duration-300 group-hover:scale-121`}>
                                    {loadingService === service.id ? (
                                      <Spinner size="sm" />
                                    ) : (
                                      service.icon
                                    )}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className={`text-lg font-semibold mb-1.5 ${themeClasses.text} leading-tight break-words transition-colors duration-300 ${isDark ? 'group-hover:text-[#60a5fa]' : 'group-hover:text-[#3b82f6]'}`}>
                                    {service.name}
                                  </h3>
                                  <p className={`text-sm ${themeClasses.textMuted} leading-snug break-words`}>
                                    {loadingService === service.id ? 'Cargando...' : service.desc}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </a>

                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <Separator className="mt-8 mb-4 opacity-50 animate-fade-in" style={{ animationDelay: '0.8s' }} />
          </div>
        </div>

        {/* Search Dialog */}
        <SearchDialog
          isOpen={showSearchDialog}
          onClose={() => setShowSearchDialog(false)}
          themeClasses={themeClasses}
        />
      </div>
  )
}

export default App
