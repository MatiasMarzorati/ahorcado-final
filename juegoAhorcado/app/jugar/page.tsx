"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, RefreshCw, LightbulbIcon } from "lucide-react"
import { HangmanDisplay } from "@/components/hangman-display"
import { BotSuggestions } from "@/components/bot-suggestions"
import { palabrasComunes } from "@/lib/palabras"

export default function JugarPage() {
  const [palabra, setPalabra] = useState("")
  const [palabraOculta, setPalabraOculta] = useState<string[]>([])
  const [letrasUsadas, setLetrasUsadas] = useState<string[]>([])
  const [errores, setErrores] = useState(0)
  const [inputLetra, setInputLetra] = useState("")
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing")
  const [mensaje, setMensaje] = useState("")
  const [maxErrores, setMaxErrores] = useState(6)
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)

  // Inicializar juego
  useEffect(() => {
    iniciarJuego()
  }, [])

  const iniciarJuego = () => {
    // Seleccionar palabra aleatoria
    const palabraAleatoria = palabrasComunes[Math.floor(Math.random() * palabrasComunes.length)]
    setPalabra(palabraAleatoria.toLowerCase())
    setPalabraOculta(Array(palabraAleatoria.length).fill("_"))
    setLetrasUsadas([])
    setErrores(0)
    setInputLetra("")
    setGameStatus("playing")
    setMensaje("")
    setMostrarSugerencias(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (gameStatus !== "playing") return

    const letra = inputLetra.toLowerCase()

    // Validar entrada
    if (!/^[a-záéíóúñ]$/.test(letra)) {
      setMensaje("Por favor, ingresa una sola letra válida")
      return
    }

    // Verificar si la letra ya fue usada
    if (letrasUsadas.includes(letra)) {
      setMensaje("Ya has usado esta letra")
      return
    }

    // Agregar letra a las usadas
    setLetrasUsadas([...letrasUsadas, letra])

    // Verificar si la letra está en la palabra
    if (palabra.includes(letra)) {
      // Actualizar palabra oculta
      const nuevaPalabraOculta = [...palabraOculta]
      for (let i = 0; i < palabra.length; i++) {
        if (palabra[i] === letra) {
          nuevaPalabraOculta[i] = letra
        }
      }
      setPalabraOculta(nuevaPalabraOculta)

      // Verificar si ganó
      if (!nuevaPalabraOculta.includes("_")) {
        setGameStatus("won")
        setMensaje("¡Felicidades! Has ganado")
      }
    } else {
      // Incrementar errores
      const nuevosErrores = errores + 1
      setErrores(nuevosErrores)

      // Verificar si perdió
      if (nuevosErrores >= maxErrores) {
        setGameStatus("lost")
        setMensaje(`Has perdido. La palabra era: ${palabra}`)
      }
    }

    setInputLetra("")
  }

  const toggleSugerencias = () => {
    setMostrarSugerencias(!mostrarSugerencias)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-center flex-grow">Juego del Ahorcado</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div>
          <Card>
            <CardContent className="pt-6">
              <HangmanDisplay errores={errores} />
            </CardContent>
          </Card>
          <div className="mt-4 text-center">
            <p className="text-muted-foreground">
              Errores: {errores}/{maxErrores}
            </p>
            {gameStatus === "playing" && (
              <div className="mt-2">
                <label htmlFor="max-errores-juego" className="text-sm text-muted-foreground block">
                  Errores máximos:
                </label>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <input
                    id="max-errores-juego"
                    type="range"
                    min="1"
                    max="15"
                    value={maxErrores}
                    onChange={(e) => setMaxErrores(Number.parseInt(e.target.value))}
                    className="w-32"
                  />
                  <span className="w-6 text-center font-medium">{maxErrores}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="text-center mb-8">
            <div className="flex justify-center gap-2 mb-6">
              {palabraOculta.map((letra, index) => (
                <div
                  key={index}
                  className="w-10 h-12 border-b-2 border-primary flex items-center justify-center text-2xl font-bold"
                >
                  {letra}
                </div>
              ))}
            </div>

            {gameStatus === "playing" ? (
              <form onSubmit={handleSubmit} className="flex gap-2 max-w-xs mx-auto">
                <Input
                  type="text"
                  value={inputLetra}
                  onChange={(e) => setInputLetra(e.target.value)}
                  maxLength={1}
                  placeholder="Ingresa una letra"
                  className="text-center"
                  autoFocus
                />
                <Button type="submit">Probar</Button>
              </form>
            ) : (
              <Button onClick={iniciarJuego} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Jugar de nuevo
              </Button>
            )}

            {mensaje && (
              <Alert className="mt-4">
                <AlertDescription>{mensaje}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="mt-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Letras usadas:</h3>
              {gameStatus === "playing" && (
                <Button variant="ghost" size="sm" onClick={toggleSugerencias} className="gap-1">
                  <LightbulbIcon className="h-4 w-4" />
                  {mostrarSugerencias ? "Ocultar sugerencias" : "Ver sugerencias"}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {letrasUsadas.map((letra) => (
                <div
                  key={letra}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${palabra.includes(letra) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {letra}
                </div>
              ))}
            </div>

            {gameStatus === "playing" && mostrarSugerencias && (
              <div className="mt-6">
                <BotSuggestions palabraOculta={palabraOculta} letrasUsadas={letrasUsadas} palabra={palabra} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
