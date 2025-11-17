'use client'

import { useUIStore } from '@/lib/stores/ui-store'
import { ReactNode, useEffect, useMemo } from 'react'
import { HeaderMenu } from './header-menu'

interface BaseLayoutProps {
  children: ReactNode
  sidebar: ReactNode
}

export function BaseLayout({ children, sidebar }: BaseLayoutProps) {
  const { isWebMenuCollapsed, isMobileMenuOpen } = useUIStore()

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const mainClasses = useMemo(
    () =>
      [
        'flex-1 transition-all duration-300 ease-in-out',
        isWebMenuCollapsed ? 'lg:ml-16' : 'lg:ml-64',
        isMobileMenuOpen &&
          'filter blur-sm lg:filter-none pointer-events-none lg:pointer-events-auto',
      ]
        .filter(Boolean)
        .join(' '),
    [isWebMenuCollapsed, isMobileMenuOpen]
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HeaderMenu />

      <div className="flex flex-1 pt-16">
        {sidebar}

        <main className={mainClasses}>
          <div className="mx-auto h-full max-w-7xl overflow-hidden">
            <div className="h-[calc(100vh-4rem)] overflow-y-auto px-4 pb-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
