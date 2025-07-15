import type { FC } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Bot } from "@/lib/tipos"
import { BotRandom, BotFrecuencia, BotInteligente, BotFonetico, BotConservador, BotKamikaze } from "@/lib/simulacion"

interface BotSuggestionsProps {
  palabraOculta: string[]
  letrasUsadas: string[]
  palabra: string
}

export const BotSuggestions: FC<BotSuggestionsProps> = ({ palabraOculta, letrasUsadas, palabra }) => {
  // Lista de bots
  const bots: Bot[] = [BotRandom, BotFrecuencia, BotInteligente, BotFonetico, BotConservador, BotKamikaze]

  // Obtener sugerencias de cada bot
  const sugerencias = bots.map((bot) => {
    let sugerencia = ""
    try {
      // Algunos bots pueden necesitar la palabra real para su lógica interna
      sugerencia = bot.elegirLetra(palabraOculta, letrasUsadas, palabra)
    } catch (error) {
      console.error(`Error al obtener sugerencia de ${bot.nombre}:`, error)
      sugerencia = "?"
    }
    return {
      nombre: bot.nombre,
      letra: sugerencia,
    }
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Sugerencias de Bots</CardTitle>
      </CardHeader>
      <CardContent>
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
        </p>
      </CardContent>
    </Card>
  )
}
