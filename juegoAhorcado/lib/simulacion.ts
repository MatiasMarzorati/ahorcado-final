import type { Bot, BotResult, PartidaDetallada } from "./tipos"
import { frecuenciaLetras, diccionarioEspanol, silabasComunes } from "./palabras"

// Bot que elige letras al azar
export const BotRandom: Bot = {
  nombre: "BotRandom",
  elegirLetra: (palabraOculta, letrasUsadas) => {
    const alfabeto = "abcdefghijklmnñopqrstuvwxyz"
    let letra

    do {
      letra = alfabeto.charAt(Math.floor(Math.random() * alfabeto.length))
    } while (letrasUsadas.includes(letra))

    return letra
  },
}

// Bot que usa frecuencia de letras en español
export const BotFrecuencia: Bot = {
  nombre: "BotFrecuencia",
  elegirLetra: (palabraOculta, letrasUsadas) => {
    for (const letra of frecuenciaLetras) {
      if (!letrasUsadas.includes(letra)) {
        return letra
      }
    }
    return "a" // Fallback (nunca debería llegar aquí)
  },
}

// Bot que filtra palabras del diccionario según el patrón actual
export const BotInteligente: Bot = {
  nombre: "BotInteligente",
  elegirLetra: async (palabraOculta, letrasUsadas) => {
    // Crear expresión regular basada en el patrón actual
    const patron = palabraOculta.map((c) => (c === "_" ? "." : c)).join("")
    const regex = new RegExp(`^${patron}$`)

    // Filtrar palabras que coinciden con el patrón
    const palabrasPosibles = diccionarioEspanol.filter((palabra) => {
      if (palabra.length !== palabraOculta.length) return false

      // Verificar que la palabra coincide con el patrón y no tiene letras ya usadas incorrectamente
      for (let i = 0; i < palabra.length; i++) {
        if (palabraOculta[i] !== "_" && palabraOculta[i] !== palabra[i]) {
          return false
        }
      }

      // Verificar que la palabra no contiene letras que ya se probaron y no están en la palabra
      const letrasIncorrectas = letrasUsadas.filter((l) => !palabraOculta.includes(l))
      for (const letraIncorrecta of letrasIncorrectas) {
        if (palabra.includes(letraIncorrecta)) {
          return false
        }
      }

      return regex.test(palabra)
    })

    if (palabrasPosibles.length === 0) {
          // Si no hay palabras posibles, usar estrategia de frecuencia
    return await BotFrecuencia.elegirLetra(palabraOculta, letrasUsadas)
    }

    // Contar frecuencia de letras en las palabras posibles
    const frecuencia: Record<string, number> = {}
    for (const palabra of palabrasPosibles) {
      for (const letra of palabra) {
        if (!letrasUsadas.includes(letra)) {
          frecuencia[letra] = (frecuencia[letra] || 0) + 1
        }
      }
    }

    // Elegir la letra más frecuente que no se haya usado
    let letraMasFrecuente = ""
    let maxFrecuencia = 0

    for (const letra in frecuencia) {
      if (frecuencia[letra] > maxFrecuencia) {
        maxFrecuencia = frecuencia[letra]
        letraMasFrecuente = letra
      }
    }

    if (letraMasFrecuente) {
      return letraMasFrecuente
    }

    // Si no hay letras frecuentes, usar estrategia de frecuencia
    return await BotFrecuencia.elegirLetra(palabraOculta, letrasUsadas)
  },
}

// Bot que intenta formar sílabas frecuentes
export const BotFonetico: Bot = {
  nombre: "BotFonetico",
  elegirLetra: async (palabraOculta, letrasUsadas) => {
    // Buscar patrones de sílabas incompletas
    for (const silaba of silabasComunes) {
      // Si la primera letra de la sílaba está en la palabra pero la segunda no
      if (silaba.length === 2) {
        const [primera, segunda] = silaba.split("")
        if (palabraOculta.includes(primera) && !letrasUsadas.includes(segunda)) {
          return segunda
        }
      }
    }

    // Estrategia alternativa: buscar letras que formen sílabas comunes
    // Priorizar letras que podrían formar sílabas con letras ya conocidas
    const letrasConocidas = palabraOculta.filter(l => l !== "_")
    for (const letra of frecuenciaLetras) {
      if (!letrasUsadas.includes(letra)) {
        // Verificar si esta letra forma sílabas comunes con letras conocidas
        for (const letraConocida of letrasConocidas) {
          const posibleSilaba1 = letraConocida + letra
          const posibleSilaba2 = letra + letraConocida
          if (silabasComunes.includes(posibleSilaba1) || silabasComunes.includes(posibleSilaba2)) {
            return letra
          }
        }
      }
    }

    // Si no encuentra patrones de sílabas, usar frecuencia
    return await BotFrecuencia.elegirLetra(palabraOculta, letrasUsadas)
  },
}

// Bot que solo usa letras que funcionaron antes
export const BotConservador: Bot = {
  nombre: "BotConservador",
  letrasExitosas: [] as string[],
  letrasFallidas: [] as string[],
  elegirLetra: async function (palabraOculta, letrasUsadas, palabra) {
    // Si hay letras exitosas previas, intentar usarlas primero
    if (this.letrasExitosas.length > 0) {
      for (const letra of this.letrasExitosas) {
        if (!letrasUsadas.includes(letra)) {
          return letra
        }
      }
    }

    // Estrategia inicial: empezar con vocales más frecuentes
    if (letrasUsadas.length === 0) {
      const vocalesFrecuentes = ["e", "a", "o", "i", "u"]
      for (const vocal of vocalesFrecuentes) {
        if (!letrasUsadas.includes(vocal)) {
          return vocal
        }
      }
    }

    // Estrategia conservadora: evitar letras que ya fallaron
    const letrasDisponibles = frecuenciaLetras.filter(letra => 
      !letrasUsadas.includes(letra) && !this.letrasFallidas.includes(letra)
    )

    if (letrasDisponibles.length > 0) {
      // Elegir la letra más frecuente entre las disponibles
      for (const letra of letrasDisponibles) {
        return letra
      }
    }

    // Si no hay letras exitosas o ya se usaron todas, usar frecuencia
    const letraElegida = await BotFrecuencia.elegirLetra(palabraOculta, letrasUsadas)

    // Si la letra está en la palabra, añadirla a las exitosas
    if (palabra && palabra.includes(letraElegida) && !this.letrasExitosas.includes(letraElegida)) {
      this.letrasExitosas.push(letraElegida)
    } else if (palabra && !palabra.includes(letraElegida) && !this.letrasFallidas.includes(letraElegida)) {
      // Si la letra no está en la palabra, añadirla a las fallidas
      this.letrasFallidas.push(letraElegida)
    }

    return letraElegida
  },
  reset: function () {
    this.letrasExitosas = []
    this.letrasFallidas = []
  },
}

// Bot que empieza con letras raras y luego cambia
export const BotKamikaze: Bot = {
  nombre: "BotKamikaze",
  elegirLetra: async (palabraOculta, letrasUsadas) => {
    // Si hay menos de 3 letras usadas, usar letras poco frecuentes
    if (letrasUsadas.length < 3) {
      const letrasRaras = ["k", "w", "x", "y", "z", "j", "ñ", "q", "f", "h"]

      for (const letra of letrasRaras) {
        if (!letrasUsadas.includes(letra)) {
          return letra
        }
      }
    }

    // Estrategia intermedia: usar letras de frecuencia media
    if (letrasUsadas.length < 8) {
      const letrasMedias = ["p", "b", "g", "v", "y", "h", "f", "z", "j", "ñ"]
      for (const letra of letrasMedias) {
        if (!letrasUsadas.includes(letra)) {
          return letra
        }
      }
    }

    // Después de 8 intentos, cambiar a estrategia de frecuencia
    return await BotFrecuencia.elegirLetra(palabraOculta, letrasUsadas)
  },
}

// Bot que usa ChatGPT para elegir letras
export const BotChatGPT: Bot = {
  nombre: "BotChatGPT",
  elegirLetra: async (palabraOculta, letrasUsadas, palabra) => {
    try {
      console.log("🤖 [BOT] BotChatGPT solicitando letra...", {
        patron: palabraOculta.join(""),
        letrasUsadas,
        longitud: palabraOculta.length,
        timestamp: new Date().toISOString()
      })

      // Obtener solo las letras incorrectas (las que no están en el patrón)
      const letrasIncorrectas = letrasUsadas.filter((letra: string) => !palabraOculta.includes(letra))
      
      // Usar la nueva función con function calling
      const { getLetterSuggestion } = await import("./openai")
      const letra = await getLetterSuggestion(
        palabraOculta.join(""),
        letrasIncorrectas,
        palabraOculta.length
      )
      
      console.log("🎯 [BOT] BotChatGPT eligió:", letra)
      return letra
      
    } catch (error) {
      console.error("❌ [BOT] Error con BotChatGPT:", error)
      console.log("🔄 [BOT] Usando fallback a frecuencia")
      // Fallback a estrategia de frecuencia
      return await BotFrecuencia.elegirLetra(palabraOculta, letrasUsadas)
    }
  },
}

// Lista de bots clásicos (sin ChatGPT)
export const botsClasicos: Bot[] = [BotRandom, BotFrecuencia, BotInteligente, BotFonetico, BotConservador, BotKamikaze]

// Lista de todos los bots
const bots: Bot[] = [...botsClasicos, BotChatGPT]

// Función para simular una partida con un bot
async function simularPartida(palabra: string, bot: Bot, maxErrores = 6): Promise<PartidaDetallada> {
  // Reiniciar el bot si tiene función reset
  if (bot.reset) {
    bot.reset()
  }

  const palabraOculta = Array(palabra.length).fill("_")
  const letrasUsadas: string[] = []
  const letrasAdivinadas: string[] = []
  const letrasErradas: string[] = []
  const secuenciaLetras: string[] = []
  let errores = 0

  // Máximo 26 intentos (todas las letras del alfabeto)
  while (errores < maxErrores && palabraOculta.includes("_") && letrasUsadas.length < 26) {
    // El bot elige una letra
    const letra = await bot.elegirLetra(palabraOculta, letrasUsadas, palabra)
    letrasUsadas.push(letra)
    secuenciaLetras.push(letra)

    // Verificar si la letra está en la palabra
    if (palabra.includes(letra)) {
      letrasAdivinadas.push(letra)
      // Actualizar palabra oculta
      for (let i = 0; i < palabra.length; i++) {
        if (palabra[i] === letra) {
          palabraOculta[i] = letra
        }
      }
    } else {
      letrasErradas.push(letra)
      errores++
    }
  }

  return {
    adivinada: !palabraOculta.includes("_"),
    errores,
    letrasUsadas: letrasUsadas.length,
    palabra,
    letrasAdivinadas,
    letrasErradas,
    secuenciaLetras,
  }
}

// Función principal para simular partidas con bots específicos
export async function simularPartidas(palabras: string[], maxErrores = 6, botsASimular?: Bot[]): Promise<BotResult[]> {
  const botsParaSimular = botsASimular || bots
  const resultados: BotResult[] = []

  for (const bot of botsParaSimular) {
    let palabrasAdivinadas = 0
    let erroresTotal = 0
    let letrasUsadasTotal = 0
    const resultadosDetallados: PartidaDetallada[] = []

    for (const palabra of palabras) {
      const resultado = await simularPartida(palabra, bot, maxErrores)
      resultadosDetallados.push(resultado)

      if (resultado.adivinada) {
        palabrasAdivinadas++
      }

      erroresTotal += resultado.errores
      letrasUsadasTotal += resultado.letrasUsadas
    }

    resultados.push({
      nombre: bot.nombre,
      palabrasAdivinadas,
      porcentajeAciertos: (palabrasAdivinadas / palabras.length) * 100,
      erroresPromedio: erroresTotal / palabras.length,
      letrasUsadasPromedio: letrasUsadasTotal / palabras.length,
      resultadosDetallados,
    })
  }

  return resultados
}

// Función para simular solo bots clásicos
export async function simularPartidasClasicas(palabras: string[], maxErrores = 6): Promise<BotResult[]> {
  return simularPartidas(palabras, maxErrores, botsClasicos)
}

// Función para simular solo ChatGPT
export async function simularPartidasChatGPT(palabras: string[], maxErrores = 6): Promise<BotResult[]> {
  return simularPartidas(palabras, maxErrores, [BotChatGPT])
}
