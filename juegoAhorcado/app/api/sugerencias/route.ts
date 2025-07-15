import { NextRequest, NextResponse } from "next/server"
import { frecuenciaLetras } from "@/lib/palabras"

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

    return NextResponse.json({ sugerencias })
  } catch (error) {
    console.error("Error en sugerencias:", error)
    return NextResponse.json({ error: "Error al obtener sugerencias" }, { status: 500 })
  }
} 