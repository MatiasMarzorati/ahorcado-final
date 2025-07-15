"use client"

import type { FC } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { BotResult } from "@/lib/tipos"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface SimulationChartProps {
  resultados: BotResult[]
}

export const SimulationChart: FC<SimulationChartProps> = ({ resultados }) => {
  // Ordenar resultados por porcentaje de aciertos (de mayor a menor)
  const resultadosOrdenados = [...resultados].sort((a, b) => b.porcentajeAciertos - a.porcentajeAciertos)

  // Preparar datos para el gráfico
  const chartData = resultadosOrdenados.map((bot) => ({
    name: bot.nombre.replace("Bot", ""),
    aciertos: bot.porcentajeAciertos,
    errores: bot.erroresPromedio,
    letras: bot.letrasUsadasPromedio,
    palabrasAdivinadas: bot.palabrasAdivinadas,
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">Porcentaje de Aciertos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: "%", position: "insideLeft", angle: -90 }} />
              <Tooltip />
              <Bar dataKey="aciertos" name="% Aciertos" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Errores Promedio</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="errores" name="Errores Promedio" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Letras Usadas Promedio</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="letras" name="Letras Usadas" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
