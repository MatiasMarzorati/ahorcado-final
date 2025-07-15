export interface BotResult {
  nombre: string
  palabrasAdivinadas: number
  porcentajeAciertos: number
  erroresPromedio: number
  letrasUsadasPromedio: number
  resultadosDetallados: PartidaDetallada[] // Añadido para almacenar resultados individuales
}

export interface PartidaResult {
  adivinada: boolean
  errores: number
  letrasUsadas: number
}

// Nueva interfaz para resultados detallados
export interface PartidaDetallada extends PartidaResult {
  palabra: string
  letrasAdivinadas: string[]
  letrasErradas: string[]
  secuenciaLetras: string[] // Orden en que se probaron las letras
}

export interface Bot {
  nombre: string
  elegirLetra: (palabraOculta: string[], letrasUsadas: string[], palabra?: string) => string | Promise<string>
  reset?: () => void
  [key: string]: any // Permitir propiedades adicionales
}
