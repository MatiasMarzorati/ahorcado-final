import type { FC } from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BotSuggestionsProps {
  palabraOculta: string[]
  letrasUsadas: string[]
  palabra: string
}

interface Sugerencia {
  nombre: string
  letra: string
}

export const BotSuggestions: FC<BotSuggestionsProps> = ({ palabraOculta, letrasUsadas, palabra }) => {
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([])
  const [loading, setLoading] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Cancelar llamada anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController()

    // Debounce de 500ms para evitar llamadas excesivas
    timeoutRef.current = setTimeout(async () => {
      const obtenerSugerencias = async () => {
        try {
          console.log("🔄 [CLIENTE] Solicitando sugerencias...", {
            palabraOculta: palabraOculta.join(""),
            letrasUsadas,
            timestamp: new Date().toISOString()
          })
          
          setLoading(true)
          const response = await fetch("/api/sugerencias", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              palabraOculta,
              letrasUsadas,
            }),
            signal: abortControllerRef.current?.signal
          })

          if (response.ok) {
            const data = await response.json()
            console.log("✅ [CLIENTE] Sugerencias recibidas:", data.sugerencias)
            setSugerencias(data.sugerencias)
          } else {
            console.error("❌ [CLIENTE] Error al obtener sugerencias")
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.log("🔄 [CLIENTE] Llamada cancelada")
            return
          }
          console.error("❌ [CLIENTE] Error:", error)
        } finally {
          setLoading(false)
        }
      }

      obtenerSugerencias()
    }, 500)

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [palabraOculta.join(""), letrasUsadas.join("")])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Sugerencias de Bots</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Cargando sugerencias...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {sugerencias.map((sugerencia) => (
                <div key={sugerencia.nombre} className="flex flex-col items-center p-2 border rounded-md">
                  <span className="text-sm font-medium">{sugerencia.nombre}</span>
                  <span className="mt-1 text-2xl font-bold">{sugerencia.letra}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Estas son las letras que cada bot elegiría en este momento basándose en su estrategia. 
              El BotChatGPT usa inteligencia artificial para analizar el contexto.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
