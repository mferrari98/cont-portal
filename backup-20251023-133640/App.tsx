import { Login } from "@/components/Login"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
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
    name: 'Reportes',
    icon: <BarChart3 className="w-6 h-6" />,
    desc: 'Sistema de reportería y análisis',
    url: '/reporte/'
  },
  {
    id: 'dash',
    name: 'Dashboard',
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

  useEffect(() => {
    const savedUser = localStorage.getItem('portal_user')
    const savedTheme = (localStorage.getItem('portal_theme') as 'light' | 'dark') || 'dark'

    if (savedUser) setUser(savedUser)
    setTheme(savedTheme)
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

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('portal_user')
  }

  const services = user === 'admin' ? allServices : allServices.slice(0, 3)
  const isDark = theme === 'dark'

  if (!user) return <Login onLogin={handleLogin} />

  const themeClasses = {
    bg: isDark ? 'bg-[#0d0d0d]' : 'bg-[#ffffff]',
    bgCard: isDark ? 'bg-[#1a1a1a]' : 'bg-[#ffffff]',
    text: isDark ? 'text-[#ffffff]' : 'text-[#0d0d0d]',
    textMuted: isDark ? 'text-[#ffffff]/70' : 'text-[#0d0d0d]/70',
    textSubtle: isDark ? 'text-[#ffffff]/60' : 'text-[#0d0d0d]/60',
    textFaded: isDark ? 'text-[#ffffff]/50' : 'text-[#0d0d0d]/50',
    border: isDark ? 'border-[#ffffff]/20' : 'border-[#0d0d0d]/30',
    borderLight: isDark ? 'border-[#ffffff]/10' : 'border-[#0d0d0d]/20',
    borderHover: isDark ? 'hover:border-[#475472]' : 'hover:border-[#475472]',
    bgHover: isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-[#f5f5f5]',
    iconBg: isDark ? 'bg-[#0d0d0d]' : 'bg-[#0d0d0d]/5',
    accent: 'bg-[#475472]'
  }

  return (
    <div className={`min-h-screen ${themeClasses.bg}`}>
        {/* Top Bar */}
        <div className={`border-b ${themeClasses.borderLight}`}>
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
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
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${themeClasses.bgCard} ${themeClasses.border}`}>
                <User className={`w-3.5 h-3.5 ${themeClasses.textMuted}`} />
                <span className={`text-sm ${themeClasses.text}`}>
                  {user === 'admin' ? 'Admin' : 'Invitado'}
                </span>
              </div>

              {/* Theme Toggle */}
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="icon"
                className={`border-2 ${themeClasses.border} ${themeClasses.text} rounded-md h-8 w-8`}
              >
                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>

              {/* Logout */}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="icon"
                title="Cerrar sesión"
                className={`border-2 ${themeClasses.border} ${themeClasses.text} rounded-md h-8 w-8`}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-12">
              <h1 className={`text-6xl font-bold tracking-tight ${themeClasses.text}`}>
                Portal de Servicios
              </h1>
              <p className={`text-lg mt-3 ${themeClasses.textSubtle}`}>
                Centro de Control
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Button
                  key={service.id}
                  asChild
                  variant="outline"
                  className={`h-auto min-h-0 p-4 border-2 ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.borderHover} rounded-lg whitespace-normal`}
                >
                  <a href={service.url}>
                    <div className="flex items-start gap-3 w-full">
                      <div className={`w-10 h-10 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${themeClasses.iconBg} ${themeClasses.border}`}>
                        <div className={themeClasses.text}>
                          {service.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h3 className={`text-lg font-medium mb-1 ${themeClasses.text} leading-tight break-words`}>
                          {service.name}
                        </h3>
                        <p className={`text-sm ${themeClasses.textMuted} leading-snug break-words`}>
                          {service.desc}
                        </p>
                      </div>
                    </div>
                  </a>
                </Button>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-20 text-right">
              <span className={`text-sm ${themeClasses.textFaded}`}>
                Servicoop · 2025
              </span>
            </div>
          </div>
        </div>
    </div>
  )
}

export default App
