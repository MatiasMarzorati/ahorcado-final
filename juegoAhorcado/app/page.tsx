import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { GamepadIcon as GameController, BotIcon as Robot, Brain } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold text-center mb-8">Juego del Ahorcado</h1>
      <p className="text-center text-muted-foreground mb-10">
        Juega al clásico juego del ahorcado o simula partidas con bots inteligentes
      </p>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GameController className="h-6 w-6" />
              Jugar Manualmente
            </CardTitle>
            <CardDescription>Juega al ahorcado de forma tradicional adivinando letras</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p>
              Adivina la palabra oculta letra por letra antes de que se complete el dibujo del ahorcado. Tienes un
              máximo de 6 errores permitidos.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/jugar" className="w-full">
              <Button className="w-full">Jugar Ahora</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Robot className="h-6 w-6" />
              Simulación con Bots
            </CardTitle>
            <CardDescription>Simula partidas automáticas con diferentes estrategias de bots</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p>
              Compara el rendimiento de 7 bots diferentes con distintas estrategias para resolver palabras. Carga una
              lista de palabras y analiza los resultados.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/simular" className="w-full">
              <Button className="w-full" variant="outline">
                Simular Partidas
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Estrategias de Bots
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">BotRandom</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Elige letras al azar del abecedario.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">BotFrecuencia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Usa una lista de letras ordenadas por frecuencia en español.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">BotInteligente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Filtra palabras de un diccionario según el patrón actual.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">BotFonetico</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Intenta formar sílabas frecuentes en español.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">BotConservador</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Solo usa letras que funcionaron en partidas anteriores.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">BotKamikaze</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Empieza con letras raras y luego cambia a estrategia común.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">BotChatGPT</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Usa inteligencia artificial para analizar el contexto y elegir la mejor letra.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
