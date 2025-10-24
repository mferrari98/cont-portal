import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Shield, Lock, User } from "lucide-react"

interface LoginProps {
  onLogin: (username: string) => void
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

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

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4 dark">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-[#1a1a1a] border-2 border-[#ffffff]/30 mb-4">
            <Shield className="w-8 h-8 text-[#ffffff]" />
          </div>
          <h1 className="text-3xl font-semibold text-[#ffffff] mb-2">
            Portal de Servicios
          </h1>
          <p className="text-base text-[#ffffff]/60">
            Telecomunicaciones y Automatismos
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1a1a1a] border-2 border-[#ffffff]/30 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-base font-medium text-[#ffffff] mb-2">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#ffffff]/50" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-base bg-[#0d0d0d] border-2 border-[#ffffff]/30 rounded-md text-[#ffffff] placeholder-[#ffffff]/40 focus:outline-none focus:ring-2 focus:ring-[#475472] focus:border-[#475472] transition-colors"
                  placeholder="Ingresa tu usuario"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-base font-medium text-[#ffffff] mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#ffffff]/50" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-base bg-[#0d0d0d] border-2 border-[#ffffff]/30 rounded-md text-[#ffffff] placeholder-[#ffffff]/40 focus:outline-none focus:ring-2 focus:ring-[#475472] focus:border-[#475472] transition-colors"
                  placeholder="Ingresa tu contraseña"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="px-4 py-3 rounded-md bg-red-500/10 border-2 border-red-500">
                <p className="text-base text-red-500 font-medium">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#475472] text-[#ffffff] font-semibold rounded-md hover:bg-[#5a6785]"
            >
              Iniciar sesión
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-[#ffffff]/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-[#1a1a1a] text-[#ffffff]/60 text-base">O</span>
            </div>
          </div>

          {/* Guest Button */}
          <Button
            type="button"
            onClick={handleGuest}
            variant="outline"
            size="lg"
            className="w-full border-2 border-[#ffffff]/30 text-[#ffffff] font-medium hover:border-[#475472] rounded-md"
          >
            Continuar como invitado
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <span className="text-sm text-[#ffffff]/50">Servicoop · 2025</span>
        </div>
      </div>
    </div>
  )
}
