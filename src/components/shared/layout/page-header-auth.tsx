interface PageHeaderAuthProps {
  title: string
  description: string
}

export function PageHeaderAuth({ title, description }: PageHeaderAuthProps) {
  return (
    <>
      <div className="mb-8 animate-fade-in text-center lg:hidden">
        <h2 className="mb-2 text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="mb-8 hidden text-center lg:block">
        <h2 className="text-3xl font-bold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
    </>
  )
}
