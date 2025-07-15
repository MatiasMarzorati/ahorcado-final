import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { palabraOculta, letrasUsadas, longitud } = await request.json()

    const patron = palabraOculta.join("")
    const letrasUsadasStr = letrasUsadas.join(", ")
    
    // Obtener solo las letras incorrectas (las que no están en el patrón)
    const letrasIncorrectas = letrasUsadas.filter((letra: string) => !palabraOculta.includes(letra))
    const letrasIncorrectasStr = letrasIncorrectas.join(", ")
    
    console.log("🤖 [SIMULACIONES] Llamando a ChatGPT...")
    console.log("📊 Contexto:", {
      patron,
      letrasUsadas: letrasUsadasStr,
      longitud,
      timestamp: new Date().toISOString()
    })
    
    const prompt = `Eres un experto jugador del ahorcado en español. 

ESTADO ACTUAL DEL JUEGO:
- Patrón de la palabra: "${patron}" 
  * Los guiones bajos "_" representan letras que aún no se han descubierto
  * Las letras visibles son las que ya se adivinaron correctamente
- Letras ya probadas (incorrectas): [${letrasIncorrectasStr}]
- Longitud total de la palabra: ${longitud} letras

CONTEXTO DETALLADO:
- Esta es una palabra en español de ${longitud} letras
- Ya se han probado las letras incorrectas: ${letrasIncorrectasStr || "ninguna"}
- Las letras que aparecen en el patrón están en la palabra
- Las letras que no aparecen en el patrón pero están en "ya probadas" NO están en la palabra

ANÁLISIS DEL PATRÓN:
- Observa cuidadosamente el patrón "${patron}"
- Identifica las letras que faltan (los guiones bajos "_")
- Considera qué letras podrían completar palabras comunes en español
- Piensa en la estructura de la palabra y posibles combinaciones

EJEMPLO DE ANÁLISIS:
Si tienes "rendi_iento", faltan letras en las posiciones con "_". 
Considera qué letras podrían completar palabras como "rendimiento", "rendimiento", etc.

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
    
    console.log("✅ [SIMULACIONES] Respuesta de ChatGPT:", {
      respuesta,
      tiempo: `${endTime - startTime}ms`,
      tokens: completion.usage?.total_tokens,
      model: completion.model
    })
    
    // Validar que la respuesta es una letra válida
    if (respuesta && /^[a-zñ]$/.test(respuesta) && !letrasUsadas.includes(respuesta)) {
      console.log("🎯 [SIMULACIONES] Respuesta válida de ChatGPT:", respuesta)
      return NextResponse.json({ letra: respuesta })
    }
    
    console.log("⚠️ [SIMULACIONES] Respuesta inválida de ChatGPT, devolviendo null")
    // Si la respuesta no es válida, devolver null para usar fallback
    return NextResponse.json({ letra: null })
  } catch (error) {
    console.error("❌ [SIMULACIONES] Error con ChatGPT:", error)
    return NextResponse.json({ letra: null })
  }
} 