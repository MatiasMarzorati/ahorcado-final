"use client"

import { type FC, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Check, X } from "lucide-react"
import type { BotResult } from "@/lib/tipos"

interface SimulationResultsProps {
  resultados: BotResult[]
  palabras: string[]
  maxErrores?: number
}

export const SimulationResults: FC<SimulationResultsProps> = ({ resultados, palabras, maxErrores = 6 }) => {
  // Ordenar resultados por porcentaje de aciertos (de mayor a menor)
  const resultadosOrdenados = [...resultados].sort((a, b) => b.porcentajeAciertos - a.porcentajeAciertos)
  const [expandedBot, setExpandedBot] = useState<string | null>(null)
  const [expandedPalabra, setExpandedPalabra] = useState<string | null>(null)

  const toggleBot = (botNombre: string) => {
    if (expandedBot === botNombre) {
      setExpandedBot(null)
      setExpandedPalabra(null)
    } else {
      setExpandedBot(botNombre)
      setExpandedPalabra(null)
    }
  }

  const togglePalabra = (palabra: string) => {
    if (expandedPalabra === palabra) {
      setExpandedPalabra(null)
    } else {
      setExpandedPalabra(palabra)
    }
  }

  return (
    <div>
      <div className="mb-4 p-4 bg-muted rounded-lg">
        <p className="font-medium">Total de palabras simuladas: {palabras.length}</p>
        <p className="text-sm text-muted-foreground">Palabras: {palabras.join(", ")}</p>
        <p className="text-sm text-muted-foreground mt-1">Errores máximos permitidos: {maxErrores}</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>Bot</TableHead>
            <TableHead>Palabras Adivinadas</TableHead>
            <TableHead>% Aciertos</TableHead>
            <TableHead>Errores Promedio</TableHead>
            <TableHead>Letras Usadas Promedio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resultadosOrdenados.map((resultado) => (
            <>
              <TableRow
                key={resultado.nombre}
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => toggleBot(resultado.nombre)}
              >
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {expandedBot === resultado.nombre ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="font-medium">{resultado.nombre}</TableCell>
                <TableCell>
                  {resultado.palabrasAdivinadas} / {palabras.length}
                </TableCell>
                <TableCell>{resultado.porcentajeAciertos.toFixed(1)}%</TableCell>
                <TableCell>{resultado.erroresPromedio.toFixed(1)}</TableCell>
                <TableCell>{resultado.letrasUsadasPromedio.toFixed(1)}</TableCell>
              </TableRow>

              {expandedBot === resultado.nombre && (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <div className="p-4 bg-muted/30">
                      <h4 className="font-medium mb-2">Resultados detallados de {resultado.nombre}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {resultado.resultadosDetallados.map((detalle) => (
                          <Card
                            key={detalle.palabra}
                            className={`cursor-pointer ${detalle.adivinada ? "border-green-200" : "border-red-200"}`}
                            onClick={() => togglePalabra(detalle.palabra)}
                          >
                            <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                              <CardTitle className="text-base flex items-center gap-2">
                                {detalle.adivinada ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <X className="h-4 w-4 text-red-500" />
                                )}
                                {detalle.palabra}
                              </CardTitle>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                {expandedPalabra === detalle.palabra ? (
                                  <ChevronUp className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )}
                              </Button>
                            </CardHeader>
                            <CardContent className="p-3 pt-2">
                              <div className="text-sm">
                                <div className="flex justify-between">
                                  <span>Errores:</span>
                                  <span>
                                    {detalle.errores}/{maxErrores}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Letras usadas:</span>
                                  <span>{detalle.letrasUsadas}</span>
                                </div>
                              </div>

                              {expandedPalabra === detalle.palabra && (
                                <div className="mt-3 pt-3 border-t text-sm">
                                  <div className="mb-2">
                                    <span className="font-medium">Secuencia de letras:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {detalle.secuenciaLetras.map((letra, index) => (
                                        <span
                                          key={`${letra}-${index}`}
                                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                                            ${
                                              detalle.palabra.includes(letra)
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                          {letra}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <span className="font-medium">Letras acertadas:</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {detalle.letrasAdivinadas.map((letra) => (
                                          <span
                                            key={letra}
                                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-medium"
                                          >
                                            {letra}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="font-medium">Letras erradas:</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {detalle.letrasErradas.map((letra) => (
                                          <span
                                            key={letra}
                                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-medium"
                                          >
                                            {letra}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
