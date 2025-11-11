import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Shield, Lock, User } from "lucide-react"

const loginSchema = z.object({
  username: z.string().min(1, "El usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida")
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginProps {
  onLogin: (username: string) => void
  theme: 'light' | 'dark'
}

export function Login({ onLogin, theme }: LoginProps) {
  const [error, setError] = useState("")
  const isDark = theme === 'dark'

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  })

  const onSubmit = (data: LoginFormData) => {
    setError("")

    if (data.username === "admin" && data.password === "admin") {
      onLogin("admin")
    } else {
      setError("Usuario o contraseña incorrectos")
    }
  }

  const handleGuest = () => {
    onLogin("invitado")
  }

  const themeClasses = {
    bg: isDark ? 'bg-[#141413]' : 'bg-[#FAF9F5]',
    bgCard: isDark ? 'bg-[#1F1E1D]' : 'bg-[#FAF9F5]',
    text: isDark ? 'text-[#E5E4E0]' : 'text-[#141413]',
    textMuted: isDark ? 'text-[#6ccff6]' : 'text-[#141413]/60',
    border: isDark ? 'border-[#1F1E1D]' : 'border-[#F5F4F0]',
    borderHover: 'hover:border-[#6ccff6]',
    iconBg: isDark ? 'bg-[#141413]' : 'bg-[#FAF9F5]',
    inputInnerBg: isDark ? 'bg-[#2A2A28]' : 'bg-[#FFFFFF]' // Más claro que la tarjeta para contraste
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
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${themeClasses.bgCard} border-2 ${themeClasses.border} mb-4`}>
            <Shield className={`w-6 h-6 ${themeClasses.text}`} />
          </div>
          <h1 className={`text-3xl font-medium tracking-tight ${themeClasses.text} mb-2`}>
            Portal de Servicios
          </h1>
          <p className={`text-sm ${themeClasses.textMuted}`}>
            Telecomunicaciones y Automatismos
          </p>
        </div>

        {/* Login Card */}
        <Card className={`border-2 ${themeClasses.border} ${themeClasses.bgCard} animate-fade-in-up stagger-1 shadow-md`}>
          <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={`text-sm font-medium ${themeClasses.text} mb-3 block`}>
                      Usuario
                    </FormLabel>
                    <FormControl>
                      <Card className={`border-2 ${themeClasses.border} ${themeClasses.inputInnerBg} ${themeClasses.borderHover} transition-all duration-300 hover:shadow-md hover:shadow-[#6ccff6]/8 h-14`}>
                        <CardContent className="p-0 h-full flex items-center">
                          <div className="flex items-center gap-3 w-full">
                            <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${themeClasses.iconBg} ${themeClasses.border} transition-all duration-300 group-hover:border-[#6ccff6] ml-3`}>
                              <User className={`w-4 h-4 ${themeClasses.text} transition-transform duration-300 group-hover:scale-110`} />
                            </div>
                            <input
                              {...field}
                              type="text"
                              placeholder="Ingresa tu usuario"
                              className={`flex-1 bg-transparent border-none outline-none text-base ${themeClasses.text} placeholder:${themeClasses.textMuted} py-2 px-3`}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </FormControl>
                    <FormMessage className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={`text-sm font-medium ${themeClasses.text} mb-3 block`}>
                      Contraseña
                    </FormLabel>
                    <FormControl>
                      <Card className={`border-2 ${themeClasses.border} ${themeClasses.inputInnerBg} ${themeClasses.borderHover} transition-all duration-300 hover:shadow-md hover:shadow-[#6ccff6]/8 h-14`}>
                        <CardContent className="p-0 h-full flex items-center">
                          <div className="flex items-center gap-3 w-full">
                            <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${themeClasses.iconBg} ${themeClasses.border} transition-all duration-300 group-hover:border-[#6ccff6] ml-3`}>
                              <Lock className={`w-4 h-4 ${themeClasses.text} transition-transform duration-300 group-hover:scale-110`} />
                            </div>
                            <input
                              {...field}
                              type="password"
                              placeholder="Ingresa tu contraseña"
                              className={`flex-1 bg-transparent border-none outline-none text-base ${themeClasses.text} placeholder:${themeClasses.textMuted} py-2 px-3`}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </FormControl>
                    <FormMessage className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  </FormItem>
                )}
              />

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
                className="w-full bg-[#6ccff6] text-[#141413] font-semibold rounded-lg hover:bg-[#5ab8e8] transition-all duration-200"
              >
                Iniciar sesión
              </Button>
            </form>
          </Form>

          {/* Custom Divider with "O" */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div
                className="w-full h-0.5"
                style={{
                  backgroundColor: isDark ? '#2A2A28' : '#FFFFFF'
                }}
              ></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-4 ${themeClasses.bgCard} ${themeClasses.text} font-medium`}>O</span>
            </div>
          </div>

          {/* Guest Button as Card */}
          <Card
            className={`border-2 ${themeClasses.border} ${themeClasses.inputInnerBg} ${themeClasses.borderHover} transition-all duration-300 hover:shadow-md hover:shadow-[#6ccff6]/8 h-14 cursor-pointer`}
            onClick={handleGuest}
          >
            <CardContent className="p-0 h-full flex items-center justify-center">
              <div className={`${themeClasses.text} font-medium text-base`}>
                Continuar como invitado
              </div>
            </CardContent>
          </Card>
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
