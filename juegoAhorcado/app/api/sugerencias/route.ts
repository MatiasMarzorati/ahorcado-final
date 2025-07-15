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

    // Agregar sugerencia de ChatGPT
    try {
      const patron = palabraOculta.join("")
      const letrasUsadasStr = letrasUsadas.join(", ")
      
      // Obtener solo las letras incorrectas (las que no están en el patrón)
      const letrasIncorrectas = letrasUsadas.filter((letra: string) => !palabraOculta.includes(letra))
      const letrasIncorrectasStr = letrasIncorrectas.join(", ")
      
      console.log("🤖 [SUGERENCIAS] Llamando a ChatGPT...")
      console.log("📊 Contexto:", {
        patron,
        letrasUsadas: letrasUsadasStr,
        longitud: palabraOculta.length,
        timestamp: new Date().toISOString()
      })
      
      const prompt = `Eres un experto jugador del ahorcado en español. 

ESTADO ACTUAL DEL JUEGO:
- Patrón de la palabra: "${patron}" 
  * Los guiones bajos "_" representan letras que aún no se han descubierto
  * Las letras visibles son las que ya se adivinaron correctamente
- Letras ya probadas (incorrectas): [${letrasIncorrectasStr}]
- Longitud total de la palabra: ${palabraOculta.length} letras

CONTEXTO:
- Esta es una palabra en español de ${palabraOculta.length} letras
- Ya se han probado las letras incorrectas: ${letrasIncorrectasStr || "ninguna"}
- Las letras que aparecen en el patrón están en la palabra
- Las letras que no aparecen en el patrón pero están en "ya probadas" NO están en la palabra

TU TAREA:
Elegir UNA SOLA letra del alfabeto español que no haya sido probada aún.

Usa tu propio criterio y conocimiento del español para elegir la mejor letra.

IMPORTANTE: Las únicas respuestas posibles son: a, b, c, d, e, f, g, h, i, j, k, l, m, n, ñ, o, p, q, r, s, t, u, v, w, x, y, z

Responde ÚNICAMENTE con una de estas letras (una sola letra, sin espacios ni puntuación).`

      console.log("📝 Prompt enviado a ChatGPT:", prompt)

      const startTime = Date.now()
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 5,
        temperature: 0.3,
      })
      const endTime = Date.now()

      const respuesta = completion.choices[0]?.message?.content?.trim().toLowerCase()
      
      console.log("✅ [SUGERENCIAS] Respuesta de ChatGPT:", {
        respuesta,
        tiempo: `${endTime - startTime}ms`,
        tokens: completion.usage?.total_tokens,
        model: completion.model
      })
      
      // Validar que la respuesta es una letra válida
      if (respuesta && /^[a-zñ]$/.test(respuesta) && !letrasUsadas.includes(respuesta)) {
        console.log("🎯 [SUGERENCIAS] Respuesta válida de ChatGPT:", respuesta)
        sugerencias.push({
          nombre: "BotChatGPT",
          letra: respuesta,
        })
      } else {
        console.log("⚠️ [SUGERENCIAS] Respuesta inválida de ChatGPT, usando fallback")
        // Fallback a frecuencia si ChatGPT falla
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