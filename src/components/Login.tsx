import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
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
    text: isDark ? 'text-[#FAF9F5]' : 'text-[#141413]',
    textMuted: isDark ? 'text-[#6ccff6]' : 'text-[#141413]/60',
    border: isDark ? 'border-[#FAF9F5]/20' : 'border-[#141413]/30',
    inputBg: isDark ? 'bg-[#1F1E1D]' : 'bg-[#F5F4F0]'
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
                    <FormLabel className={`text-sm font-medium ${themeClasses.text}`}>
                      Usuario
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className={`h-5 w-5 ${themeClasses.textMuted}`} />
                        </div>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Ingresa tu usuario"
                          className={`pl-11 pr-4 py-3 text-base ${themeClasses.inputBg} border ${themeClasses.border} rounded-md ${themeClasses.text} placeholder:${themeClasses.textMuted}`}
                        />
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
                    <FormLabel className={`text-sm font-medium ${themeClasses.text}`}>
                      Contraseña
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className={`h-5 w-5 ${themeClasses.textMuted}`} />
                        </div>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Ingresa tu contraseña"
                          className={`pl-11 pr-4 py-3 text-base ${themeClasses.inputBg} border ${themeClasses.border} rounded-md ${themeClasses.text} placeholder:${themeClasses.textMuted}`}
                        />
                      </div>
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
                className="w-full bg-[#6ccff6] text-[#141413] font-semibold rounded-lg hover:bg-[#5ab8e8] transition-all duration-200 progressive-border-animation"
              >
                Iniciar sesión
              </Button>
            </form>
          </Form>

          {/* Divider */}
          <Separator className={`my-6 ${themeClasses.border}`} />

          {/* Guest Button */}
          <Button
            type="button"
            onClick={handleGuest}
            variant="outline"
            size="lg"
            className={`w-full border-2 ${themeClasses.border} ${themeClasses.text} font-medium hover:border-[#6ccff6] hover:bg-[#6ccff6]/10 rounded-lg transition-all duration-200 progressive-border-animation`}
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
