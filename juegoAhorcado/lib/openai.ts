import OpenAI from "openai"

/*
 * NOTA IMPORTANTE DE SEGURIDAD
 * ============================
 * 1. El SDK de OpenAI bloquea su uso en el navegador para evitar filtrar la API key.
 * 2. Este archivo ahora detecta si el código se está ejecutando en el cliente.
 *    – En browser: Llama a nuestra route `/api/chatgpt` (que sí corre en servidor).
 *    – En server: Instancia el SDK con la key de entorno de manera segura.
 */

// Tipos para function-calling
export type AllowedLetter = 
  | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" 
  | "n" | "ñ" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"

export type GuessLetterResponse = {
  letter: AllowedLetter
}

// Cache simple para evitar llamadas duplicadas (tanto en cliente como server)
const suggestionCache = new Map<string, { letra: AllowedLetter, timestamp: number }>()
const CACHE_DURATION = 5000 // 5 s

// Definición de la herramienta para function-calling
export const guessLetterTool = {
  type: "function" as const,
  function: {
    name: "guess_letter",
    description: "Elige una letra del alfabeto español para adivinar en el juego del ahorcado",
    parameters: {
      type: "object",
      properties: {
        letter: {
          type: "string",
          enum: [
            "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
            "n", "ñ", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
          ],
          description: "Una sola letra del alfabeto español (incluyendo ñ)"
        }
      },
      required: ["letter"]
    }
  }
}

// Cliente OpenAI (solo se inicializará en entorno servidor)
let openai: OpenAI | null = null

// Función para obtener sugerencia de letra usando function calling
export async function getLetterSuggestion(
  patron: string,
  letrasIncorrectas: string[],
  longitud: number
): Promise<AllowedLetter> {
  // 1️⃣ Entorno CLIENTE: llamamos a la API interna para evitar exponer la key
  if (typeof window !== "undefined") {
    try {
      const response = await fetch("/api/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          palabraOculta: patron.split(""),
          letrasUsadas: letrasIncorrectas, // solo las incorrectas
          longitud,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const letra = (data.letra || "e") as AllowedLetter
        return letra
      }
    } catch (err) {
      console.error("❌ [CLIENTE] Error llamando a /api/chatgpt:", err)
    }

    // Fallback muy simple en cliente
    return "e"
  }

  // 2️⃣ Entorno SERVIDOR
  // Inicializar OpenAI una sola vez
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      // En server este flag es irrelevante, pero lo dejamos explícito
      dangerouslyAllowBrowser: false,
    })
  }

  try {
    // Crear clave de cache
    const cacheKey = `${patron}-${letrasIncorrectas.sort().join(",")}-${longitud}`
    const now = Date.now()
    
    // Verificar cache
    const cached = suggestionCache.get(cacheKey)
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log("🔄 [CACHE] Usando sugerencia cacheada:", cached.letra)
      return cached.letra
    }

    console.log("🤖 [FUNCTION CALLING] Llamando a ChatGPT...")
    console.log("📊 Contexto:", {
      patron,
      letrasIncorrectas,
      longitud,
      timestamp: new Date().toISOString()
    })

    const letrasIncorrectasStr = letrasIncorrectas.join(", ")
    
    const contextoJuego = `Eres un experto jugador del ahorcado en español. 

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

REGLAS IMPORTANTES:
- NO debes elegir letras que ya aparecen en el patrón (las letras visibles)
- NO debes elegir letras que ya se probaron y fallaron (las de la lista de incorrectas)
- Solo puedes elegir letras que NO se han probado aún

ANÁLISIS DEL PATRÓN:
- Observa cuidadosamente el patrón "${patron}"
- Identifica las letras que faltan (los guiones bajos "_")
- Considera qué letras podrían completar palabras comunes en español
- Piensa en la estructura de la palabra y posibles combinaciones

EJEMPLO DE ANÁLISIS:
Si tienes "rendi_iento", faltan letras en las posiciones con "_". 
Considera qué letras podrían completar palabras como "rendimiento", "rendimiento", etc.

TU TAREA:
Elegir UNA SOLA letra del alfabeto español que NO haya sido probada aún.

IMPORTANTE: Verifica que la letra elegida no esté en el patrón ni en la lista de letras incorrectas antes de responder.

Usa tu propio criterio y conocimiento del español para elegir la mejor letra.`

    const startTime = Date.now()
    const completion = await openai!.chat.completions.create({
      model: "gpt-4o-mini",
      tools: [guessLetterTool],
      tool_choice: { type: "function", function: { name: "guess_letter" } },
      messages: [
        { 
          role: "system", 
          content: "Devuelve UNA letra usando la función guess_letter y nada más." 
        },
        { 
          role: "user", 
          content: contextoJuego 
        }
      ],
      temperature: 0.3,
    })
    const endTime = Date.now()

    // Extraer la letra de la respuesta
    const call = completion.choices[0].message.tool_calls?.[0]
    if (!call || call.function.name !== "guess_letter") {
      throw new Error("No se recibió una llamada válida a guess_letter")
    }

    const args = JSON.parse(call.function.arguments) as GuessLetterResponse
    const letra = args.letter

    console.log("✅ [FUNCTION CALLING] Respuesta de ChatGPT:", {
      letra,
      tiempo: `${endTime - startTime}ms`,
      tokens: completion.usage?.total_tokens,
      model: completion.model
    })

    // Validar que la letra no haya sido usada
    if (letrasIncorrectas.includes(letra) || patron.includes(letra)) {
      throw new Error(`Letra ${letra} ya fue probada`)
    }

    // Guardar en cache
    suggestionCache.set(cacheKey, { letra, timestamp: now })
    
    // Limpiar cache antiguo
    for (const [key, value] of suggestionCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        suggestionCache.delete(key)
      }
    }

    console.log("🎯 [FUNCTION CALLING] Letra válida elegida:", letra)
    return letra

  } catch (error) {
    console.error("❌ [FUNCTION CALLING] Error con ChatGPT:", error)
    console.log("🔄 [FUNCTION CALLING] Usando fallback: 'e'")
    return "e" // Fallback a la letra más frecuente
  }
} 