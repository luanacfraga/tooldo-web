interface RegisterHeaderProps {
  currentStep: number
  totalSteps: number
}

export function RegisterHeader({ currentStep, totalSteps }: RegisterHeaderProps) {
  return (
    <div className="mb-6 text-center lg:hidden">
      <h2 className="text-2xl font-semibold text-foreground">Cadastre sua empresa</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Etapa {currentStep + 1} de {totalSteps}
      </p>
    </div>
  )
}

