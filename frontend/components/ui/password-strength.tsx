import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface PasswordStrengthProps {
  password: string
  className?: string
}

interface StrengthResult {
  score: number
  label: string
  color: string
  suggestions: string[]
}

function calculatePasswordStrength(password: string): StrengthResult {
  if (!password) {
    return {
      score: 0,
      label: 'Digite uma senha',
      color: 'bg-gray-200',
      suggestions: ['Digite uma senha para ver a análise']
    }
  }

  let score = 0
  const suggestions: string[] = []

  // Critérios de força
  const hasLowerCase = /[a-z]/.test(password)
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChars = /[@$!%*?&]/.test(password)
  const hasMinLength = password.length >= 8
  const hasGoodLength = password.length >= 12

  // Pontuação
  if (hasMinLength) score += 1
  else suggestions.push('Use pelo menos 8 caracteres')

  if (hasLowerCase) score += 1
  else suggestions.push('Adicione letras minúsculas')

  if (hasUpperCase) score += 1
  else suggestions.push('Adicione letras maiúsculas')

  if (hasNumbers) score += 1
  else suggestions.push('Adicione números')

  if (hasSpecialChars) score += 1
  else suggestions.push('Adicione caracteres especiais (@$!%*?&)')

  if (hasGoodLength) score += 1
  else if (hasMinLength) suggestions.push('Use 12+ caracteres para maior segurança')

  // Penalidades
  if (password.length < 6) score = Math.max(0, score - 2)
  if (/^(.)\1+$/.test(password)) score = Math.max(0, score - 2) // Caracteres repetidos
  if (/123456|abcdef|qwerty|password/i.test(password)) score = Math.max(0, score - 2) // Padrões comuns

  // Determinar label e cor
  let label: string
  let color: string

  if (score <= 1) {
    label = 'Muito fraca'
    color = 'bg-red-500'
  } else if (score <= 2) {
    label = 'Fraca'
    color = 'bg-orange-500'
  } else if (score <= 3) {
    label = 'Razoável'
    color = 'bg-yellow-500'
  } else if (score <= 4) {
    label = 'Boa'
    color = 'bg-blue-500'
  } else {
    label = 'Muito forte'
    color = 'bg-green-500'
  }

  return { score: Math.min(score, 5), label, color, suggestions }
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const strength = useMemo(() => calculatePasswordStrength(password), [password])

  if (!password) {
    return null
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Barra de força */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={cn(
                'h-2 flex-1 rounded-full transition-colors duration-200',
                level <= strength.score ? strength.color : 'bg-gray-200'
              )}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-muted-foreground min-w-fit">
          {strength.label}
        </span>
      </div>

      {/* Sugestões */}
      {strength.suggestions.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <ul className="list-disc list-inside space-y-1">
            {strength.suggestions.slice(0, 3).map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}