import { Login } from "@/components/Login"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
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
  const [flippedCard, setFlippedCard] = useState<string | null>(null)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const flipTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('portal_user')
    const savedTheme = (localStorage.getItem('portal_theme') as 'light' | 'dark') || 'dark'

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

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('portal_theme', newTheme)
  }

  const handleLogin = (username: string) => {
    setUser(username)
    localStorage.setItem('portal_user', username)
  }

  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
  }

  const handleLogoutConfirm = () => {
    setUser(null)
    localStorage.removeItem('portal_user')
    setShowLogoutDialog(false)
  }

  const handleCardMouseEnter = (serviceId: string) => {
    // Clear any existing timer
    if (flipTimerRef.current) {
      clearTimeout(flipTimerRef.current)
    }
    // Start 1.5-second timer
    flipTimerRef.current = setTimeout(() => {
      setFlippedCard(serviceId)
    }, 1500)
  }

  const handleCardMouseLeave = () => {
    // Clear timer if not flipped yet
    if (flipTimerRef.current) {
      clearTimeout(flipTimerRef.current)
      flipTimerRef.current = null
    }
    // Unflip card if currently flipped
    setFlippedCard(null)
  }

  const services = user === 'admin' ? allServices : allServices.slice(0, 3)
  const isDark = theme === 'dark'

  if (isLoading) return null
  if (!user) return <Login onLogin={handleLogin} theme={theme} />

  const themeClasses = {
    bg: isDark ? 'bg-[#0d0d0d]' : 'bg-[#ffffff]',
    bgCard: isDark ? 'bg-[#2e2f31]' : 'bg-[#ffffff]',
    text: isDark ? 'text-[#ffffff]' : 'text-[#0d0d0d]',
    textMuted: isDark ? 'text-[#ffffff]/70' : 'text-[#0d0d0d]/70',
    textSubtle: isDark ? 'text-[#6ccff6]' : 'text-[#0d0d0d]/60',
    textFaded: isDark ? 'text-[#ffffff]/50' : 'text-[#0d0d0d]/50',
    border: isDark ? 'border-[#ffffff]/20' : 'border-[#0d0d0d]/30',
    borderLight: isDark ? 'border-[#ffffff]/10' : 'border-[#0d0d0d]/20',
    borderHover: isDark ? 'hover:border-[#00a54f]' : 'hover:border-[#00a54f]',
    bgHover: isDark ? 'hover:bg-[#2e2f31]' : 'hover:bg-[#f5f5f5]',
    iconBg: isDark ? 'bg-[#0d0d0d]' : 'bg-[#0d0d0d]/5',
    inputBg: isDark ? 'bg-[#0d0d0d]' : 'bg-[#f5f5f5]',
    accent: 'bg-[#00a54f]'
  }

  return (
    <TooltipProvider>
      <div className={`min-h-screen ${themeClasses.bg} relative overflow-hidden`}>
        {/* Mesh Gradient Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div
            className="absolute top-[10%] left-[20%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 mesh-gradient-1"
            style={{
              background: 'radial-gradient(circle, rgba(0,165,79,0.4) 0%, transparent 70%)'
            }}
          ></div>
          <div
            className="absolute bottom-[20%] right-[15%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-15 mesh-gradient-2"
            style={{
              background: 'radial-gradient(circle, rgba(108,207,246,0.3) 0%, transparent 70%)'
            }}
          ></div>
          <div
            className="absolute top-[60%] left-[10%] w-[400px] h-[400px] rounded-full blur-[80px] opacity-10 mesh-gradient-1"
            style={{
              background: 'radial-gradient(circle, rgba(0,165,79,0.25) 0%, transparent 70%)',
              animationDelay: '5s'
            }}
          ></div>
        </div>

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

              {/* Theme Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={toggleTheme}
                    variant="outline"
                    size="icon"
                    className={`border-2 ${themeClasses.border} ${themeClasses.text} rounded-md h-8 w-8`}
                  >
                    {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cambiar tema</p>
                </TooltipContent>
              </Tooltip>

              {/* Logout */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleLogoutClick}
                    variant="outline"
                    size="icon"
                    className={`border-2 ${themeClasses.border} ${themeClasses.text} rounded-md h-8 w-8`}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cerrar sesión</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-6 px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6 mt-8">
              <h1 className={`text-5xl font-bold tracking-tight ${themeClasses.text} typewriter inline-block whitespace-nowrap`}>
                Portal de Servicios
              </h1>
              <p className={`text-base mt-2 ${themeClasses.textSubtle} animate-fade-in`} style={{ animationDelay: '2.5s' }}>
                Centro de Control
              </p>
            </div>

            <Separator className="mb-8 opacity-50 animate-fade-in" style={{ animationDelay: '3s' }} />

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service, index) => {
                const isFlipped = flippedCard === service.id
                return (
                  <div
                    key={service.id}
                    className={`flip-card ${isFlipped ? 'flipped' : ''} animate-fade-in-up stagger-${index + 1}`}
                    onMouseEnter={() => handleCardMouseEnter(service.id)}
                    onMouseLeave={handleCardMouseLeave}
                  >
                    <div className="flip-card-inner">
                      {/* Front Face */}
                      <div className="flip-card-front">
                        <a href={service.url} className="group block h-full">
                          <Card className={`border-2 ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.borderHover} transition-all duration-300 hover:shadow-2xl hover:shadow-[#00a54f]/30 hover:-translate-y-1 h-full`}>
                            <CardContent className="p-4 h-full min-h-[96px] flex items-center">
                              <div className="flex items-start gap-3 w-full">
                                <div className={`w-11 h-11 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${themeClasses.iconBg} ${themeClasses.border} transition-all duration-300 group-hover:border-[#00a54f]`}>
                                  <div className={`${themeClasses.text} transition-transform duration-300 group-hover:scale-110`}>
                                    {service.icon}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className={`text-lg font-semibold mb-1.5 ${themeClasses.text} leading-tight break-words transition-colors duration-300 group-hover:text-[#00a54f]`}>
                                    {service.name}
                                  </h3>
                                  <p className={`text-sm ${themeClasses.textMuted} leading-snug break-words`}>
                                    {service.desc}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </a>
                      </div>

                      {/* Back Face */}
                      <div className="flip-card-back">
                        <a href={service.url} className="block w-full h-full">
                          <Card className={`border-2 ${themeClasses.border} ${themeClasses.bgCard} h-full`}>
                            <CardContent className="p-4 h-full min-h-[96px] flex items-center justify-center">
                              <p className={`text-sm ${themeClasses.textMuted} text-center leading-relaxed`}>
                                {service.id === 'guardias' && 'Gestiona y consulta los turnos de guardia del personal'}
                                {service.id === 'reportes' && 'Reporte de niveles de agua por sitio'}
                                {service.id === 'dash' && 'Monitoreo de exemys en tiempo real'}
                                {service.id === 'gis' && 'Explora mapas y datos geoespaciales'}
                                {service.id === 'monitor' && 'Supervisa el estado y recursos del servidor'}
                                {service.id === 'emp' && 'Administra información y gestión empresarial'}
                              </p>
                            </CardContent>
                          </Card>
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <Separator className="mt-8 mb-4 opacity-50 animate-fade-in" style={{ animationDelay: '0.8s' }} />
            <div className="text-right animate-fade-in" style={{ animationDelay: '1s' }}>
              <span className={`text-sm ${themeClasses.textFaded}`}>
                Servicoop · 2025
              </span>
            </div>
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
      </div>
    </TooltipProvider>
  )
}

export default App
