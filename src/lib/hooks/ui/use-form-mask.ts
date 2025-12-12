import { useEffect, useState } from 'react'
import { UseFormSetValue, UseFormWatch } from 'react-hook-form'

type MaskFunction = (value: string) => string
type UnmaskFunction = (value: string) => string

interface UseFormMaskOptions<T extends Record<string, string>> {
  fieldName: keyof T
  mask: MaskFunction
  unmask: UnmaskFunction
  watch: UseFormWatch<T>
  setValue: UseFormSetValue<T>
}

export function useFormMask<T extends Record<string, string>>({
  fieldName,
  mask,
  unmask,
  watch,
  setValue,
}: UseFormMaskOptions<T>) {
  const fieldValue = watch(fieldName)
  const [maskedValue, setMaskedValue] = useState('')

  useEffect(() => {
    if (fieldValue) {
      const unmaskedValue = unmask(maskedValue)
      if (fieldValue !== unmaskedValue) {
        setMaskedValue(mask(fieldValue))
      }
    }
  }, [fieldValue, maskedValue, mask, unmask])

  const handleChange = (value: string) => {
    const masked = mask(value)
    const unmasked = unmask(masked)
    setMaskedValue(masked)
    setValue(fieldName, unmasked as T[keyof T])
  }

  return {
    maskedValue,
    setMaskedValue,
    handleChange,
  }
}
