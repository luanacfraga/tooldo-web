import { ReactNode } from 'react'

interface ActionsLayoutProps {
  children: ReactNode
}

export default function ActionsLayout({ children }: ActionsLayoutProps) {
  return <div>{children}</div>
}
