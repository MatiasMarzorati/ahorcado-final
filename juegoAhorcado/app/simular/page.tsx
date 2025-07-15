"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Play, BarChart3, TableIcon, Bot, Brain } from "lucide-react"
import { SimulationResults } from "@/components/simulation-results"
import { SimulationChart } from "@/components/simulation-chart"
import { palabrasComunes } from "@/lib/palabras"
import { simularPartidasClasicas, simularPartidasChatGPT } from "@/lib/simulacion"
import type { BotResult } from "@/lib/tipos"

export default function SimularPage() {
  const [palabras, setPalabras] = useState<string[]>([])
  const [palabrasInput, setPalabrasInput] = useState("")
  const [resultados, setResultados] = useState<BotResult[]>([])
  const [resultadosChatGPT, setResultadosChatGPT] = useState<BotResult[]>([])
  const [isSimulating, setIsSimulating] = useState(false)
  const [isSimulatingChatGPT, setIsSimulatingChatGPT] = useState(false)
  const [hasSimulated, setHasSimulated] = useState(false)
  const [hasSimulatedChatGPT, setHasSimulatedChatGPT] = useState(false)
  const [maxErrores, setMaxErrores] = useState<number>(6)

  const obtenerPalabrasParaSimular = () => {
    if (palabrasInput.trim()) {
      return palabrasInput
        .split("\n")
        .map((p) => p.trim().toLowerCase())
        .filter((p) => p.length > 0)
    } else {
      // Si no hay palabras, usar 20 palabras aleatorias de las comunes
      return [...palabrasComunes].sort(() => Math.random() - 0.5).slice(0, 20)
    }
  }

  const handleSimularEstrategias = async () => {
    setIsSimulating(true)
    const palabrasParaSimular = obtenerPalabrasParaSimular()
    setPalabras(palabrasParaSimular)

    // Simular partidas con estrategias clásicas (sin ChatGPT)
    setTimeout(async () => {
      const resultadosSimulacion = await simularPartidasClasicas(palabrasParaSimular, maxErrores)
      setResultados(resultadosSimulacion)
      setIsSimulating(false)
      setHasSimulated(true)
    }, 500)
  }

  const handleSimularChatGPT = async () => {
    setIsSimulatingChatGPT(true)
    const palabrasParaSimular = obtenerPalabrasParaSimular()
    setPalabras(palabrasParaSimular)

    // Simular partidas solo con ChatGPT
    setTimeout(async () => {
      const resultadosSimulacion = await simularPartidasChatGPT(palabrasParaSimular, maxErrores)
      setResultadosChatGPT(resultadosSimulacion)
      setIsSimulatingChatGPT(false)
      setHasSimulatedChatGPT(true)
    }, 500)
  }

  const cargarPalabrasEjemplo = () => {
    // Cargar 10 palabras aleatorias como ejemplo
    const palabrasEjemplo = [...palabrasComunes]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)
      .join("\n")

    setPalabrasInput(palabrasEjemplo)
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
        <h1 className="text-3xl font-bold text-center flex-grow">Simulación con Bots</h1>
      </div>

      <div className="grid md:grid-cols-[1fr_2fr] gap-8 max-w-6xl mx-auto">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Palabras para simular</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 mb-4">
                <div>
                  <label htmlFor="max-errores" className="block text-sm font-medium mb-1">
                    Errores máximos permitidos:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="max-errores"
                      type="range"
                      min="1"
                      max="15"
                      value={maxErrores}
                      onChange={(e) => setMaxErrores(Number.parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-8 text-center font-medium">{maxErrores}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Número de errores antes de que el bot pierda (tradicional: 6)
                  </p>
                </div>
              </div>
              <Textarea
                placeholder="Ingresa una palabra por línea..."
                value={palabrasInput}
                onChange={(e) => setPalabrasInput(e.target.value)}
                rows={10}
                className="mb-4"
              />
              <div className="flex flex-col gap-2">
                <Button onClick={handleSimularEstrategias} disabled={isSimulating} className="gap-2">
                  <Bot className="h-4 w-4" />
                  {isSimulating ? "Simulando..." : "Simular estrategias clásicas (SIN GPT)"}
                </Button>
                <Button onClick={handleSimularChatGPT} disabled={isSimulatingChatGPT} className="gap-2">
                  <Brain className="h-4 w-4" />
                  {isSimulatingChatGPT ? "Simulando..." : "Simular solo ChatGPT"}
                </Button>
                <Button variant="outline" onClick={cargarPalabrasEjemplo} disabled={isSimulating || isSimulatingChatGPT}>
                  Cargar palabras de ejemplo
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Si no ingresas palabras, se usarán 20 palabras aleatorias del diccionario.
                Puedes ejecutar las simulaciones por separado: estrategias clásicas (6 bots) o solo ChatGPT.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Resultados de Estrategias Tradicionales */}
          {(hasSimulated || isSimulating) && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Bot className="h-5 w-5" />
                <h2 className="text-xl font-bold">Estrategias Clásicas (SIN GPT)</h2>
                {isSimulating && (
                  <div className="text-sm text-muted-foreground">Simulando...</div>
                )}
              </div>
              
              {hasSimulated && (
                <Tabs defaultValue="tabla">
                  <div className="flex justify-between items-center mb-4">
                    <TabsList>
                      <TabsTrigger value="tabla" className="gap-1">
                        <TableIcon className="h-4 w-4" />
                        Tabla
                      </TabsTrigger>
                      <TabsTrigger value="grafico" className="gap-1">
                        <BarChart3 className="h-4 w-4" />
                        Gráfico
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="tabla">
                    <SimulationResults resultados={resultados} palabras={palabras} maxErrores={maxErrores} />
                  </TabsContent>

                  <TabsContent value="grafico">
                    <SimulationChart resultados={resultados} />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}

          {/* Resultados de ChatGPT */}
          {(hasSimulatedChatGPT || isSimulatingChatGPT) && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5" />
                <h2 className="text-xl font-bold">ChatGPT</h2>
                {isSimulatingChatGPT && (
                  <div className="text-sm text-muted-foreground">Simulando...</div>
                )}
              </div>
              
              {hasSimulatedChatGPT && (
                <Tabs defaultValue="tabla">
                  <div className="flex justify-between items-center mb-4">
                    <TabsList>
                      <TabsTrigger value="tabla" className="gap-1">
                        <TableIcon className="h-4 w-4" />
                        Tabla
                      </TabsTrigger>
                      <TabsTrigger value="grafico" className="gap-1">
                        <BarChart3 className="h-4 w-4" />
                        Gráfico
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="tabla">
                    <SimulationResults resultados={resultadosChatGPT} palabras={palabras} maxErrores={maxErrores} />
                  </TabsContent>

                  <TabsContent value="grafico">
                    <SimulationChart resultados={resultadosChatGPT} />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}

          {/* Estado inicial */}
          {!hasSimulated && !hasSimulatedChatGPT && !isSimulating && !isSimulatingChatGPT && (
            <div className="flex flex-col items-center justify-center h-full p-12 border rounded-lg bg-muted/20">
              <p className="text-muted-foreground text-center">
                Ingresa palabras y selecciona qué tipo de simulación quieres ejecutar.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
