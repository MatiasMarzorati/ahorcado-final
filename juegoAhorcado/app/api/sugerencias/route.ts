import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { frecuenciaLetras } from "@/lib/palabras"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { palabraOculta, letrasUsadas } = await request.json()

    // Funciones síncronas para bots regulares
    const sugerencias = [
      {
        nombre: "BotRandom",
        letra: (() => {
          const alfabeto = "abcdefghijklmnñopqrstuvwxyz"
          const letrasDisponibles = alfabeto.split("").filter(l => !letrasUsadas.includes(l))
          return letrasDisponibles[Math.floor(Math.random() * letrasDisponibles.length)] || "?"
        })(),
      },
      {
        nombre: "BotFrecuencia",
        letra: (() => {
          for (const letra of frecuenciaLetras) {
            if (!letrasUsadas.includes(letra)) {
              return letra
            }
          }
          return "?"
        })(),
      },
      {
        nombre: "BotInteligente",
        letra: (() => {
          // Versión simplificada para sugerencias
          for (const letra of frecuenciaLetras) {
            if (!letrasUsadas.includes(letra)) {
              return letra
            }
          }
          return "?"
        })(),
      },
      {
        nombre: "BotFonetico",
        letra: (() => {
          // Versión simplificada para sugerencias
          for (const letra of frecuenciaLetras) {
            if (!letrasUsadas.includes(letra)) {
              return letra
            }
          }
          return "?"
        })(),
      },
      {
        nombre: "BotConservador",
        letra: (() => {
          // Versión simplificada para sugerencias
          for (const letra of frecuenciaLetras) {
            if (!letrasUsadas.includes(letra)) {
              return letra
            }
          }
          return "?"
        })(),
      },
      {
        nombre: "BotKamikaze",
        letra: (() => {
          // Versión simplificada para sugerencias
          if (letrasUsadas.length < 3) {
            const letrasRaras = ["k", "w", "x", "y", "z", "j", "ñ", "q", "f", "h"]
            for (const letra of letrasRaras) {
              if (!letrasUsadas.includes(letra)) {
                return letra
              }
            }
          }
          // Usar frecuencia como fallback
          for (const letra of frecuenciaLetras) {
            if (!letrasUsadas.includes(letra)) {
              return letra
            }
          }
          return "?"
        })(),
      },
    ]

    // Agregar sugerencia de ChatGPT usando function calling
    try {
      const patron = palabraOculta.join("")
      
      // Obtener solo las letras incorrectas (las que no están en el patrón)
      const letrasIncorrectas = letrasUsadas.filter((letra: string) => !palabraOculta.includes(letra))
      
      console.log("🤖 [SUGERENCIAS] Llamando a ChatGPT...")
      console.log("📊 Contexto:", {
        patron,
        letrasIncorrectas: letrasIncorrectas.join(", "),
        longitud: palabraOculta.length,
        timestamp: new Date().toISOString()
      })
      
      // Usar la nueva función con function calling
      const { getLetterSuggestion } = await import("@/lib/openai")
      const letra = await getLetterSuggestion(
        patron,
        letrasIncorrectas,
        palabraOculta.length
      )
      
      console.log("🎯 [SUGERENCIAS] Respuesta válida de ChatGPT:", letra)
      sugerencias.push({
        nombre: "BotChatGPT",
        letra: letra,
      })
      
    } catch (error) {
      console.error("❌ [SUGERENCIAS] Error con ChatGPT:", error)
      console.log("🔄 [SUGERENCIAS] Usando fallback a frecuencia")
      // Fallback a frecuencia
      for (const letra of frecuenciaLetras) {
        if (!letrasUsadas.includes(letra)) {
          sugerencias.push({
            nombre: "BotChatGPT",
            letra: letra,
          })
          break
        }
      }
    }

    return NextResponse.json({ sugerencias })
  } catch (error) {
    console.error("Error en sugerencias:", error)
    return NextResponse.json({ error: "Error al obtener sugerencias" }, { status: 500 })
  }
} 