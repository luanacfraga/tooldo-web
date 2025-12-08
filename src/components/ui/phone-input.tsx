'use client'

import * as React from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'

export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange?: (value: string) => void
  onValueChange?: (value: string) => void
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onChange, onValueChange, value, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('')

    const formatPhone = (input: string): string => {
      const numbers = input.replace(/\D/g, '')
      const limited = numbers.slice(0, 11)

      if (limited.length === 0) return ''

      if (limited.length <= 2) {
        return `(${limited}`
      }

      if (limited.length <= 6) {
        return `(${limited.slice(0, 2)}) ${limited.slice(2)}`
      }

      if (limited.length <= 10) {
        return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`
      }

      return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7, 11)}`
    }

    React.useEffect(() => {
      if (value !== undefined) {
        const formatted = formatPhone(String(value))
        setDisplayValue(formatted)
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      const formatted = formatPhone(inputValue)

      setDisplayValue(formatted)

      const numbers = formatted.replace(/\D/g, '')

      if (onChange) {
        onChange(numbers)
      }

      if (onValueChange) {
        onValueChange(numbers)
      }
    }

    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        className={cn(className)}
        {...props}
      />
    )
  }
)

PhoneInput.displayName = 'PhoneInput'

export { PhoneInput }
