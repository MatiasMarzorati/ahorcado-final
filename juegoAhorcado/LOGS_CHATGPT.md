# 📊 Logs de ChatGPT - Sistema de Ahorcado

## 🤖 Logs Implementados

### 1. **Sugerencias** (`/api/sugerencias`)
- `🤖 [SUGERENCIAS] Llamando a ChatGPT...`
- `📊 Contexto:` - Patrón, letras usadas, longitud, timestamp
- `📝 Prompt enviado a ChatGPT:` - Prompt completo
- `✅ [SUGERENCIAS] Respuesta de ChatGPT:` - Respuesta, tiempo, tokens, modelo
- `🎯 [SUGERENCIAS] Respuesta válida de ChatGPT:` - Letra elegida
- `⚠️ [SUGERENCIAS] Respuesta inválida de ChatGPT, usando fallback`
- `❌ [SUGERENCIAS] Error con ChatGPT:` - Error detallado
- `🔄 [SUGERENCIAS] Usando fallback a frecuencia`

### 2. **Simulaciones** (`/api/chatgpt`)
- `🤖 [SIMULACIONES] Llamando a ChatGPT...`
- `📊 Contexto:` - Patrón, letras usadas, longitud, timestamp
- `📝 Prompt enviado a ChatGPT:` - Prompt completo
- `✅ [SIMULACIONES] Respuesta de ChatGPT:` - Respuesta, tiempo, tokens, modelo
- `🎯 [SIMULACIONES] Respuesta válida de ChatGPT:` - Letra elegida
- `⚠️ [SIMULACIONES] Respuesta inválida de ChatGPT, devolviendo null`
- `❌ [SIMULACIONES] Error con ChatGPT:` - Error detallado

### 3. **Cliente** (`BotSuggestions`)
- `🔄 [CLIENTE] Solicitando sugerencias...` - Contexto de la solicitud
- `✅ [CLIENTE] Sugerencias recibidas:` - Lista de sugerencias
- `❌ [CLIENTE] Error al obtener sugerencias`
- `❌ [CLIENTE] Error:` - Error de red

### 4. **Bot** (`BotChatGPT`)
- `🤖 [BOT] BotChatGPT solicitando letra...` - Contexto del bot
- `✅ [BOT] Respuesta de BotChatGPT:` - Respuesta de la API
- `🎯 [BOT] BotChatGPT eligió:` - Letra final elegida
- `⚠️ [BOT] BotChatGPT falló, usando fallback`
- `❌ [BOT] Error con BotChatGPT:` - Error detallado

## 📈 Información Registrada

### **Contexto de cada llamada:**
- Patrón actual de la palabra
- Letras ya usadas
- Longitud de la palabra
- Timestamp de la llamada

### **Métricas de rendimiento:**
- Tiempo de respuesta (ms)
- Tokens utilizados
- Modelo usado (gpt-3.5-turbo)

### **Estados de respuesta:**
- ✅ Respuesta válida
- ⚠️ Respuesta inválida (fallback)
- ❌ Error (fallback)

## 🔍 Cómo Ver los Logs

### **En desarrollo:**
```bash
npm run dev
```
Los logs aparecen en la consola del servidor.

### **En producción:**
Los logs aparecen en los logs del servidor (Vercel, etc.)

## 📊 Ejemplo de Flujo Completo

```
🔄 [CLIENTE] Solicitando sugerencias...
🤖 [SUGERENCIAS] Llamando a ChatGPT...
📊 Contexto: { patron: "c_sa", letrasUsadas: "a, b", longitud: 4 }
📝 Prompt enviado a ChatGPT: [prompt completo]
✅ [SUGERENCIAS] Respuesta de ChatGPT: { respuesta: "e", tiempo: "1200ms", tokens: 15 }
🎯 [SUGERENCIAS] Respuesta válida de ChatGPT: e
✅ [CLIENTE] Sugerencias recibidas: [lista de sugerencias]
```

## 🎯 Beneficios

1. **Debugging**: Fácil identificación de problemas
2. **Monitoreo**: Seguimiento del rendimiento de ChatGPT
3. **Análisis**: Estadísticas de uso y efectividad
4. **Optimización**: Identificación de prompts más efectivos
5. **Costos**: Seguimiento de tokens utilizados 