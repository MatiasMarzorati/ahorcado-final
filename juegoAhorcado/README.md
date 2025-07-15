# Juego del Ahorcado con Simulación de Bots

Un proyecto educativo que combina el clásico juego del ahorcado con análisis de algoritmos de resolución de problemas.

## 🎮 Características

- **Juego Manual**: Interfaz interactiva para jugar al ahorcado
- **Simulación de Bots**: 7 bots con diferentes estrategias
- **Análisis Comparativo**: Estadísticas detalladas de rendimiento
- **Visualizaciones**: Gráficos y tablas de resultados

## 🤖 Estrategias de Bots

1. **BotRandom**: Elección aleatoria
2. **BotFrecuencia**: Basado en frecuencia de letras en español
3. **BotInteligente**: Filtrado de diccionario por patrones
4. **BotFonetico**: Formación de sílabas comunes
5. **BotConservador**: Aprendizaje de letras exitosas
6. **BotKamikaze**: Estrategia híbrida (letras raras → comunes)
7. **BotChatGPT**: Inteligencia artificial (requiere API key)

## 🚀 Configuración

### Instalación

```bash
npm install
```

### Variables de Entorno

Para usar el BotChatGPT, crea un archivo `.env.local` en la raíz del proyecto:

```bash
OPENAI_API_KEY=tu_api_key_de_openai_aqui
```

Puedes obtener una API key gratuita en [OpenAI Platform](https://platform.openai.com/api-keys).

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📊 Análisis de Estrategias

Cada bot implementa un enfoque diferente:

- **BotInteligente**: El más sofisticado, usa técnicas de procesamiento de lenguaje natural
- **BotFrecuencia**: Muy eficiente para su simplicidad
- **BotConservador**: Implementa aprendizaje básico
- **BotKamikaze**: Demuestra estrategias de exploración vs explotación
- **BotFonetico**: Aprovecha características específicas del español
- **BotChatGPT**: Usa inteligencia artificial para análisis contextual

## 🛠️ Tecnologías

- **Framework**: Next.js 15 con App Router
- **Lenguaje**: TypeScript
- **UI**: Tailwind CSS + Radix UI
- **Gráficos**: Recharts
- **IA**: OpenAI API (opcional)

## 📚 Valor Educativo

Este proyecto es excelente para:
- Aprender algoritmos de resolución de problemas
- Comparar estrategias de búsqueda
- Visualizar datos de rendimiento
- Entender patrones en el lenguaje español
- Desarrollar pensamiento algorítmico
