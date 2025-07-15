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
    const vocales = ["a", "e", "i", "o", "u"]
    const consonantes = "bcdfghjklmnñpqrstvwxyz".split("")
    const letrasConocidas = palabraOculta.filter((l) => l !== "_")

    // Generar candidatos que aún no se hayan probado
    const candidatos = "abcdefghijklmnñopqrstuvwxyz"
      .split("")
      .filter((l) => !letrasUsadas.includes(l))

    let mejor = ""
    let mejorScore = -1

    for (const letra of candidatos) {
      let score = 0

      // --- 1. ANÁLISIS DE SÍLABAS CON LETRAS CONOCIDAS (PRIORIDAD MÁXIMA) ---
      for (const conocida of letrasConocidas) {
        // Sílabas que empiezan con letra conocida
        if (silabasComunes.includes(conocida + letra)) score += 5
        // Sílabas que terminan con letra conocida
        if (silabasComunes.includes(letra + conocida)) score += 5
      }

      // --- 2. ANÁLISIS DE PATRONES ESPECÍFICOS EN EL PATRÓN ---
      // Buscar patrones como "C_V" (consonante-vocal) y "V_C" (vocal-consonante)
      for (let i = 0; i < palabraOculta.length - 1; i++) {
        const actual = palabraOculta[i]
        const siguiente = palabraOculta[i + 1]
        
        if (actual !== "_" && siguiente === "_") {
          // Si la actual es consonante, buscar vocal que forme sílaba
          if (consonantes.includes(actual) && vocales.includes(letra)) {
            if (silabasComunes.includes(actual + letra)) score += 4
          }
          // Si la actual es vocal, buscar consonante que forme sílaba
          if (vocales.includes(actual) && consonantes.includes(letra)) {
            if (silabasComunes.includes(actual + letra)) score += 4
          }
        }
        
        if (actual === "_" && siguiente !== "_") {
          // Si la siguiente es consonante, buscar vocal que forme sílaba
          if (consonantes.includes(siguiente) && vocales.includes(letra)) {
            if (silabasComunes.includes(letra + siguiente)) score += 4
          }
          // Si la siguiente es vocal, buscar consonante que forme sílaba
          if (vocales.includes(siguiente) && consonantes.includes(letra)) {
            if (silabasComunes.includes(letra + siguiente)) score += 4
          }
        }
      }

      // --- 3. ANÁLISIS DE POSICIÓN EN LA PALABRA ---
      const posicion = palabraOculta.indexOf("_")
      if (posicion !== -1) {
        // En medio: evaluar contexto con letras adyacentes
        if (posicion > 0 && posicion < palabraOculta.length - 1) {
          const anterior = palabraOculta[posicion - 1]
          const siguiente = palabraOculta[posicion + 1]
          
          // Si hay letra anterior, buscar sílabas que empiecen con ella
          if (anterior !== "_") {
            if (silabasComunes.includes(anterior + letra)) score += 3
          }
          // Si hay letra siguiente, buscar sílabas que terminen con ella
          if (siguiente !== "_") {
            if (silabasComunes.includes(letra + siguiente)) score += 3
          }
        }
      }

      // --- 4. PREFERENCIAS FONÉTICAS EQUILIBRADAS ---
      // Preferir letras que forman sílabas comunes en español
      const silabasConLetra = silabasComunes.filter(s => s.includes(letra))
      score += silabasConLetra.length * 0.5

      // --- 5. ANÁLISIS DE LONGITUD ADAPTATIVO ---
      // Para palabras cortas (≤4 letras), ligera preferencia por vocales
      if (palabraOculta.length <= 4 && vocales.includes(letra)) score += 0.5
      // Para palabras largas (>6 letras), ligera preferencia por consonantes frecuentes
      if (palabraOculta.length > 6 && ["r", "n", "s", "t", "l"].includes(letra)) score += 0.5

      if (score > mejorScore) {
        mejorScore = score
        mejor = letra
      }
    }

    if (mejorScore > 0) {
      return mejor
    }

    // --- FALLBACK EQUILIBRADO ---
    // Si no hay puntuación alta, usar estrategia mixta balanceada
    const vocalesDisponibles = candidatos.filter(l => vocales.includes(l))
    const consonantesDisponibles = candidatos.filter(l => consonantes.includes(l))
    
    // Alternar entre vocales y consonantes de forma equilibrada
    if (vocalesDisponibles.length > 0 && consonantesDisponibles.length > 0) {
      const vocalesUsadas = letrasUsadas.filter(l => vocales.includes(l))
      const consonantesUsadas = letrasUsadas.filter(l => consonantes.includes(l))
      
      // Si hay más consonantes que vocales usadas, probar vocal
      if (consonantesUsadas.length > vocalesUsadas.length) {
        return vocalesDisponibles[0]
      }
      // Si hay más vocales que consonantes usadas, probar consonante
      if (vocalesUsadas.length > consonantesUsadas.length) {
        return consonantesDisponibles[0]
      }
      // Si están equilibradas, alternar
      return letrasUsadas.length % 2 === 0 ? vocalesDisponibles[0] : consonantesDisponibles[0]
    }

    // Si solo hay un tipo disponible, usarlo
    if (vocalesDisponibles.length > 0) return vocalesDisponibles[0]
    if (consonantesDisponibles.length > 0) return consonantesDisponibles[0]

    // Último recurso: frecuencia equilibrada
    return await BotFrecuencia.elegirLetra(palabraOculta, letrasUsadas)
  },
}

// Bot que solo usa letras que funcionaron antes
export const BotConservador: Bot = {
  nombre: "BotConservador",
  letrasExitosas: [] as string[],
  letrasFallidas: [] as string[],
  // Historial con contadores de aciertos / fallos
  letrasStats: {} as Record<string, { ok: number; fail: number }>,
  // Nuevo: historial de patrones y longitudes
  patronesStats: {} as Record<string, { ok: number; fail: number }>,
  longitudesStats: {} as Record<number, { ok: number; fail: number }>,
  elegirLetra: async function (palabraOculta, letrasUsadas, palabra) {
    const vocales = ["a", "e", "i", "o", "u"]
    const consonantes = "bcdfghjklmnñpqrstvwxyz".split("")

    // --- 1. ANÁLISIS CONTEXTUAL AVANZADO ---
    const longitud = palabraOculta.length
    const patron = palabraOculta.join("")
    const vocalesUsadas = letrasUsadas.filter(l => vocales.includes(l))
    const consonantesUsadas = letrasUsadas.filter(l => consonantes.includes(l))
    
    // Calcular estadísticas de longitud actual
    const longStat = this.longitudesStats[longitud] || { ok: 0, fail: 0 }
    const longRatio = longStat.ok + longStat.fail === 0 ? 0 : longStat.ok / (longStat.ok + longStat.fail)

    // --- 2. CALCULAR PUNTUACIÓN INTELIGENTE ---
    const disponibles = "abcdefghijklmnñopqrstuvwxyz"
      .split("")
      .filter((l) => !letrasUsadas.includes(l))

    let mejor = ""
    let mejorScore = -Infinity

    for (const letra of disponibles) {
      const stat = this.letrasStats[letra] || { ok: 0, fail: 0 }
      const intentos = stat.ok + stat.fail

      // --- Score base con suavizado ---
      const ratio = intentos === 0 ? 0 : stat.ok / intentos
      let score = ratio * 5 // ponderación principal

      // --- ANÁLISIS DE CONTEXTO ESPECÍFICO ---
      
      // 1. Ajuste por longitud de palabra
      if (longRatio > 0.6) {
        // Si las palabras de esta longitud suelen adivinarse, ser más agresivo
        score += 1
      } else if (longRatio < 0.3) {
        // Si las palabras de esta longitud son difíciles, ser más conservador
        score -= 1
      }

      // 2. Análisis de balance vocal/consonante
      const balanceVocal = vocalesUsadas.length / Math.max(letrasUsadas.length, 1)
      const balanceConsonante = consonantesUsadas.length / Math.max(letrasUsadas.length, 1)
      
      if (vocales.includes(letra)) {
        // Si ya hay muchas vocales, reducir preferencia
        if (balanceVocal > 0.7) score -= 2
        // Si hay pocas vocales, aumentar preferencia
        if (balanceVocal < 0.3) score += 2
      } else {
        // Si ya hay muchas consonantes, reducir preferencia
        if (balanceConsonante > 0.7) score -= 2
        // Si hay pocas consonantes, aumentar preferencia
        if (balanceConsonante < 0.3) score += 2
      }

      // 3. Análisis de posición en la palabra
      const posicionesVacias = palabraOculta.map((l, i) => l === "_" ? i : -1).filter(i => i !== -1)
      if (posicionesVacias.length > 0) {
        const primeraPosicion = posicionesVacias[0]
        const ultimaPosicion = posicionesVacias[posicionesVacias.length - 1]
        
        // Al inicio: preferir consonantes
        if (primeraPosicion === 0 && consonantes.includes(letra)) score += 1
        // Al final: preferir vocales o consonantes suaves
        if (ultimaPosicion === palabraOculta.length - 1) {
          if (vocales.includes(letra)) score += 1
          if (["n", "r", "s", "l"].includes(letra)) score += 0.5
        }
      }

      // 4. Aprendizaje de patrones específicos
      const patronesRelevantes = [
        patron.replace(/_/g, "."), // patrón actual
        `${longitud}letras`, // longitud
        `${vocalesUsadas.length}v-${consonantesUsadas.length}c` // balance
      ]
      
      for (const patronRelevante of patronesRelevantes) {
        const patronStat = this.patronesStats[patronRelevante] || { ok: 0, fail: 0 }
        const patronIntentos = patronStat.ok + patronStat.fail
        if (patronIntentos > 0) {
          const patronRatio = patronStat.ok / patronIntentos
          score += patronRatio * 2 // influencia moderada de patrones
        }
      }

      // 5. Preferencia inicial inteligente
      if (intentos === 0) {
        // Para primeras letras: preferir vocales frecuentes
        if (letrasUsadas.length === 0 && vocales.includes(letra)) {
          score += ["e", "a", "o", "i", "u"].indexOf(letra) * 0.5
        }
        // Para palabras largas sin vocales: priorizar vocales
        if (longitud > 6 && vocalesUsadas.length === 0 && vocales.includes(letra)) {
          score += 2
        }
      }

      // 6. Penalización por fallos recientes
      score -= stat.fail * 0.1

      if (score > mejorScore) {
        mejorScore = score
        mejor = letra
      }
    }

    let letraElegida = mejor

    // Si por alguna razón no se eligió nada, usar estrategia de frecuencia
    if (!letraElegida) {
      letraElegida = await BotFrecuencia.elegirLetra(palabraOculta, letrasUsadas)
    }

    // --- 3. ACTUALIZAR HISTORIAL AVANZADO ---
    
    // Actualizar estadísticas de letra
    if (!this.letrasStats[letraElegida]) {
      this.letrasStats[letraElegida] = { ok: 0, fail: 0 }
    }

    // Actualizar estadísticas de longitud
    if (!this.longitudesStats[longitud]) {
      this.longitudesStats[longitud] = { ok: 0, fail: 0 }
    }

    // Actualizar estadísticas de patrones
    const patronesParaActualizar = [
      patron.replace(/_/g, "."),
      `${longitud}letras`,
      `${vocalesUsadas.length}v-${consonantesUsadas.length}c`
    ]
    
    for (const patronKey of patronesParaActualizar) {
      if (!this.patronesStats[patronKey]) {
        this.patronesStats[patronKey] = { ok: 0, fail: 0 }
      }
    }

    // Registrar resultado
    if (palabra && palabra.includes(letraElegida)) {
      if (!this.letrasExitosas.includes(letraElegida)) this.letrasExitosas.push(letraElegida)
      this.letrasStats[letraElegida].ok += 1
      this.longitudesStats[longitud].ok += 1
      for (const patronKey of patronesParaActualizar) {
        this.patronesStats[patronKey].ok += 1
      }
    } else {
      if (!this.letrasFallidas.includes(letraElegida)) this.letrasFallidas.push(letraElegida)
      this.letrasStats[letraElegida].fail += 1
      this.longitudesStats[longitud].fail += 1
      for (const patronKey of patronesParaActualizar) {
        this.patronesStats[patronKey].fail += 1
      }
    }

    return letraElegida
  },
  reset: function () {
    this.letrasExitosas = []
    this.letrasFallidas = []
    this.letrasStats = {}
    this.patronesStats = {}
    this.longitudesStats = {}
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
