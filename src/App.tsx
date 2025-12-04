import { Login } from "@/components/Login"
import { useState, useEffect, useMemo } from "react"
import { useThemeClasses } from "@/lib/useThemeClasses"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  ChefHat,
  LogOut,
  User
} from "lucide-react"

interface Service {
  id: string
  name: string
  icon: React.ReactNode
  desc: string
  url: string
}

const allServices: Service[] = [
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
    id: 'dash',
    name: 'Dashboard Exemys',
    icon: <LayoutDashboard className="w-6 h-6" />,
    desc: 'Panel de control y monitoreo',
    url: '/dash/'
  },
  {
    id: 'gis',
    name: 'GIS',
    icon: <Map className="w-6 h-6" />,
    desc: 'Sistema de información geográfica',
    url: '/gis/'
  },
  {
    id: 'monitor',
    name: 'Monitor',
    icon: <Monitor className="w-6 h-6" />,
    desc: 'Monitor de recursos del servidor',
    url: '/monitor/'
  },
  {
    id: 'emp',
    name: 'Emp',
    icon: <ChefHat className="w-6 h-6" />,
    desc: 'Gestión',
    url: '/emp/'
  }
]

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [user, setUser] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [loadingService, setLoadingService] = useState<string | null>(null)
  const [showSearchDialog, setShowSearchDialog] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem('portal_user')
    const savedTheme = (localStorage.getItem('portal_theme') as 'light' | 'dark') || 'dark'

    // Apply theme immediately to prevent any color flashing
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    if (savedUser) setUser(savedUser)
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
      if (e.key === 'portal_theme' && e.newValue) {
        setTheme(e.newValue as 'light' | 'dark')
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('themeChanged', handleThemeEvent)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('portal_theme', newTheme)
    // Disparar evento para sincronizar otras pestañas/aplicaciones (ej: emp app)
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: newTheme }
    }))
  }

  const handleLogin = (username: string) => {
    setUser(username)
    localStorage.setItem('portal_user', username)
  }

  const handleLogoutClick = () => {
    if (user === 'invitado') {
      // Direct logout for guest users
      setUser(null)
      localStorage.removeItem('portal_user')
    } else {
      // Show confirmation dialog for admin users
      setShowLogoutDialog(true)
    }
  }

  const handleLogoutConfirm = () => {
    setUser(null)
    localStorage.removeItem('portal_user')
    setShowLogoutDialog(false)
  }

  
  const handleServiceClick = (serviceId: string, url: string) => {
    setLoadingService(serviceId)
    // Navigate to the service
    window.location.href = url
    // Reset loading state after a timeout (in case navigation takes time)
    setTimeout(() => {
      setLoadingService(null)
    }, 3000)
  }

  const services = useMemo(() =>
    user === 'admin' ? allServices : allServices.slice(0, 3),
    [user]
  )
  const isDark = theme === 'dark'

  // Los hooks deben ser llamados siempre, antes de cualquier return condicional
  const themeClasses = useThemeClasses(theme)

  if (isLoading) return null

  if (!user) return <Login onLogin={handleLogin} theme={theme} />

  return (
    <div className={`min-h-screen gradient-background relative`}>

        {/* Top Bar */}
        <div className={`border-b ${themeClasses.borderLight} relative z-10 animate-fade-in`}>
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-md border flex items-center justify-center ${themeClasses.bgCard} ${themeClasses.border}`}>
                <Shield className={`w-4 h-4 ${themeClasses.text}`} />
              </div>
              <span className={`text-base font-medium ${themeClasses.text}`}>
                Telecomunicaciones y Automatismos
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* User Badge */}
              <Badge variant="outline" className={`flex items-center gap-1.5 px-3 py-1.5 ${themeClasses.border} ${themeClasses.text}`}>
                <User className="w-3.5 h-3.5" />
                {user === 'admin' ? 'Admin' : 'Invitado'}
              </Badge>

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

              {/* Logout */}
              <Button
                onClick={handleLogoutClick}
                variant="outline"
                size="icon"
                className={`border-2 ${themeClasses.border} ${themeClasses.text} rounded-md h-8 w-8 hover:cursor-pointer`}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-6 px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6 mt-8">
              <h1 className={`text-5xl font-bold tracking-tight ${themeClasses.text} animate-fade-in inline-block whitespace-nowrap`}>
                Portal de Servicios
              </h1>
              <p className={`text-base mt-2 ${themeClasses.textSubtle} animate-fade-in`} style={{ animationDelay: '2.5s' }}>
                Centro de Control
              </p>
            </div>

            <Separator className="mb-8 opacity-50 animate-fade-in" style={{ animationDelay: '3s' }} />

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className={`animate-fade-in-up stagger-${index + 1}`}
                >
                  <button
                    onClick={() => handleServiceClick(service.id, service.url)}
                    className="group block h-full w-full text-left hover:cursor-pointer"
                    disabled={loadingService === service.id}
                  >
                    <Card className={`${themeClasses.bgCard} h-full relative ${loadingService === service.id ? 'opacity-75' : ''}`}>
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
                            <h3 className={`text-lg font-semibold mb-1.5 ${themeClasses.text} leading-tight break-words transition-colors duration-300 group-hover:${themeClasses.textSubtle}`}>
                              {service.name}
                            </h3>
                            <p className={`text-sm ${themeClasses.textMuted} leading-snug break-words`}>
                              {loadingService === service.id ? 'Cargando...' : service.desc}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <Separator className="mt-8 mb-4 opacity-50 animate-fade-in" style={{ animationDelay: '0.8s' }} />
          </div>
        </div>

        {/* Logout Confirmation Dialog */}
        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogContent className={`${themeClasses.bgCard} ${themeClasses.text} border-2 ${themeClasses.border}`}>
            <DialogHeader>
              <DialogTitle>¿Cerrar sesión?</DialogTitle>
              <DialogDescription className={themeClasses.textMuted}>
                ¿Estás seguro que deseas cerrar tu sesión? Tendrás que volver a iniciar sesión para acceder al portal.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowLogoutDialog(false)}
                className={`${themeClasses.border} ${themeClasses.text}`}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleLogoutConfirm}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                Cerrar sesión
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
