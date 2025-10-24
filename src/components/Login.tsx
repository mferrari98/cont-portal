import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Shield, Lock, User } from "lucide-react"

interface LoginProps {
  onLogin: (username: string) => void
  theme: 'light' | 'dark'
}

export function Login({ onLogin, theme }: LoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const isDark = theme === 'dark'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (username === "admin" && password === "admin") {
      onLogin("admin")
    } else {
      setError("Usuario o contraseña incorrectos")
    }
  }

  const handleGuest = () => {
    onLogin("invitado")
  }

  const themeClasses = {
    bg: isDark ? 'bg-[#0d0d0d]' : 'bg-[#ffffff]',
    bgCard: isDark ? 'bg-[#2e2f31]' : 'bg-[#ffffff]',
    text: isDark ? 'text-[#ffffff]' : 'text-[#0d0d0d]',
    textMuted: isDark ? 'text-[#6ccff6]' : 'text-[#0d0d0d]/60',
    border: isDark ? 'border-[#ffffff]/20' : 'border-[#0d0d0d]/30',
    inputBg: isDark ? 'bg-[#0d0d0d]' : 'bg-[#f5f5f5]'
  }

  return (
    <div className={`min-h-screen ${themeClasses.bg} flex items-center justify-center p-4 relative ${isDark ? 'dark' : ''}`}>
      {/* Dot Pattern Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)'
            : 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      ></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg ${themeClasses.bgCard} border-2 ${themeClasses.border} mb-4 transition-all duration-300 hover:border-[#00a54f] hover:shadow-lg hover:shadow-[#00a54f]/30`}>
            <Shield className={`w-8 h-8 ${themeClasses.text}`} />
          </div>
          <h1 className={`text-4xl font-bold tracking-tight ${themeClasses.text} mb-2`}>
            Portal de Servicios
          </h1>
          <p className={`text-base ${themeClasses.textMuted}`}>
            Telecomunicaciones y Automatismos
          </p>
        </div>

        {/* Login Card */}
        <Card className={`border-2 ${themeClasses.border} ${themeClasses.bgCard} animate-fade-in-up stagger-1 shadow-2xl`}>
          <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className={`h-5 w-5 ${themeClasses.textMuted}`} />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 text-base ${themeClasses.inputBg} border-2 ${themeClasses.border} rounded-lg ${themeClasses.text} placeholder:${themeClasses.textMuted} focus:outline-none focus:ring-2 focus:ring-[#00a54f] focus:border-[#00a54f] transition-all duration-200`}
                  placeholder="Ingresa tu usuario"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${themeClasses.textMuted}`} />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 text-base ${themeClasses.inputBg} border-2 ${themeClasses.border} rounded-lg ${themeClasses.text} placeholder:${themeClasses.textMuted} focus:outline-none focus:ring-2 focus:ring-[#00a54f] focus:border-[#00a54f] transition-all duration-200`}
                  placeholder="Ingresa tu contraseña"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-500/10 border-2 border-red-500 animate-fade-in">
                <p className="text-sm text-red-500 font-medium">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#00a54f] text-white font-semibold rounded-lg hover:bg-[#008f44] transition-all duration-200 hover:shadow-lg hover:shadow-[#00a54f]/30"
            >
              Iniciar sesión
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6">
            <Separator className="opacity-50" />
          </div>

          {/* Guest Button */}
          <Button
            type="button"
            onClick={handleGuest}
            variant="outline"
            size="lg"
            className={`w-full border-2 ${themeClasses.border} ${themeClasses.text} font-medium hover:border-[#6ccff6] hover:bg-[#6ccff6]/10 rounded-lg transition-all duration-200`}
          >
            Continuar como invitado
          </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center animate-fade-in stagger-2">
          <span className={`text-sm ${themeClasses.textMuted}`}>Servicoop · 2025</span>
        </div>
      </div>
    </div>
  )
}
