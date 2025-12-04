import { useState } from "react"
import { useThemeClasses } from "@/lib/useThemeClasses"
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

  const themeClasses = useThemeClasses(theme)

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
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-md ${themeClasses.bgCard} mb-4`}>
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
        <Card className={`${themeClasses.bgCard} animate-fade-in-up stagger-1 rounded-md`}>
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
                      <div className={`${themeClasses.inputBg} h-9 flex items-center rounded-md`}>
                        <div className="flex items-center gap-3 w-full rounded-md">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${themeClasses.iconBg} transition-all duration-300 ml-3`}>
                            <User className={`w-4 h-4 ${themeClasses.text} transition-transform duration-300 group-hover:scale-110`} />
                          </div>
                          <input
                            {...field}
                            type="text"
                            placeholder="Ingresa tu usuario"
                            className={`flex-1 bg-transparent border-none outline-none text-base ${themeClasses.text} placeholder:${themeClasses.textMuted} py-2 px-3`}
                          />
                        </div>
                      </div>
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
                      <div className={`${themeClasses.inputBg} h-9 flex items-center rounded-md`}>
                        <div className="flex items-center gap-3 w-full rounded-md">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${themeClasses.iconBg} transition-all duration-300 ml-3`}>
                            <Lock className={`w-4 h-4 ${themeClasses.text} transition-transform duration-300 group-hover:scale-110`} />
                          </div>
                          <input
                            {...field}
                            type="password"
                            placeholder="Ingresa tu contraseña"
                            className={`flex-1 bg-transparent border-none outline-none text-base ${themeClasses.text} placeholder:${themeClasses.textMuted} py-2 px-3`}
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  </FormItem>
                )}
              />

              {/* Error Message */}
              {error && (
                <div className="px-4 py-3 rounded-md bg-red-500/10 border-2 border-red-500 animate-fade-in">
                  <p className="text-sm text-red-500 font-medium">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                size="lg"
                className={`w-full ${themeClasses.accent} font-semibold rounded-md hover:opacity-90 transition-all duration-200`}
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
              <span className={`px-4 ${themeClasses.bgCard} ${themeClasses.text} font-medium rounded-full`}>O</span>
            </div>
          </div>

          {/* Guest Button as Card */}
          <div
            className={`${themeClasses.inputBg} h-9 cursor-pointer flex items-center justify-center rounded-md`}
            onClick={handleGuest}
          >
            <div className={`${themeClasses.text} font-medium text-base`}>
              Continuar como invitado
            </div>
          </div>
          </CardContent>
        </Card>

        </div>
    </div>
  )
}
