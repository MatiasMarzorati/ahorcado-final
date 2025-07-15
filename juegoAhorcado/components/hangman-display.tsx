import type { FC } from "react"

interface HangmanDisplayProps {
  errores: number
}

export const HangmanDisplay: FC<HangmanDisplayProps> = ({ errores }) => {
  return (
    <div className="w-full max-w-xs mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-auto">
        {/* Base */}
        <line x1="40" y1="180" x2="160" y2="180" stroke="currentColor" strokeWidth="4" />

        {/* Poste vertical */}
        <line x1="60" y1="20" x2="60" y2="180" stroke="currentColor" strokeWidth="4" />

        {/* Poste horizontal */}
        <line x1="60" y1="20" x2="140" y2="20" stroke="currentColor" strokeWidth="4" />

        {/* Cuerda */}
        <line x1="140" y1="20" x2="140" y2="40" stroke="currentColor" strokeWidth="4" />

        {/* Cabeza */}
        {errores >= 1 && <circle cx="140" cy="55" r="15" stroke="currentColor" strokeWidth="4" fill="none" />}

        {/* Cuerpo */}
        {errores >= 2 && <line x1="140" y1="70" x2="140" y2="120" stroke="currentColor" strokeWidth="4" />}

        {/* Brazo izquierdo */}
        {errores >= 3 && <line x1="140" y1="80" x2="120" y2="100" stroke="currentColor" strokeWidth="4" />}

        {/* Brazo derecho */}
        {errores >= 4 && <line x1="140" y1="80" x2="160" y2="100" stroke="currentColor" strokeWidth="4" />}

        {/* Pierna izquierda */}
        {errores >= 5 && <line x1="140" y1="120" x2="120" y2="150" stroke="currentColor" strokeWidth="4" />}

        {/* Pierna derecha */}
        {errores >= 6 && <line x1="140" y1="120" x2="160" y2="150" stroke="currentColor" strokeWidth="4" />}
      </svg>
    </div>
  )
}
