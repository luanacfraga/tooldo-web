'use client'

import { useIsMobile } from '@/lib/hooks/use-media-query'
import { useUIStore } from '@/lib/stores/ui-store'
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useMemo } from 'react'

export interface MenuItem {
  name: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  subItems?: {
    name: string
    href: string
  }[]
}

interface SidebarProps {
  items: MenuItem[]
  onLogout?: () => void
  showLogout?: boolean
  className?: string
  topComponent?: ReactNode
}

export function Sidebar({
  items,
  onLogout,
  showLogout = true,
  className = '',
  topComponent,
}: SidebarProps) {
  const pathname = usePathname()
  const { isMobileMenuOpen, closeMobileMenu, isWebMenuCollapsed, toggleWebMenu } = useUIStore()
  const isMobile = useIsMobile()

  const shouldShowText = !isWebMenuCollapsed || isMobile

  const sidebarClasses = useMemo(
    () =>
      [
        'fixed left-0 top-0 h-screen z-[60] pt-16',
        'bg-card border-r border-border shadow-sm',
        'transition-all duration-300 ease-in-out',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0',
        isWebMenuCollapsed ? 'lg:w-16' : 'w-64',
        className,
      ]
        .filter(Boolean)
        .join(' '),
    [isMobileMenuOpen, isWebMenuCollapsed, className]
  )

  return (
    <>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={closeMobileMenu} />
      )}

      <div className={sidebarClasses}>
        <button
          className="absolute -right-3 top-20 hidden rounded-full border border-border bg-card p-1 text-muted-foreground shadow-md transition-colors duration-200 hover:text-primary lg:flex"
          onClick={toggleWebMenu}
          aria-label={isWebMenuCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isWebMenuCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {shouldShowText && topComponent && <div className="mt-4">{topComponent}</div>}

        <nav className={`mt-8 ${isWebMenuCollapsed ? 'lg:px-2' : 'px-4'}`}>
          <ul className="space-y-2">
            {items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.subItems && item.subItems.some((subItem) => pathname === subItem.href))

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isWebMenuCollapsed ? 'lg:justify-center lg:p-2' : 'px-4 py-3'
                    } ${
                      isActive
                        ? 'bg-primary/10 text-primary shadow-sm [&>svg]:text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    } `
                      .trim()
                      .replace(/\s+/g, ' ')}
                    title={isWebMenuCollapsed ? item.name : ''}
                  >
                    {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
                    {shouldShowText && <span>{item.name}</span>}
                  </Link>

                  {item.subItems && isActive && shouldShowText && (
                    <ul className="ml-8 mt-2 space-y-1">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.name}>
                          <Link
                            href={subItem.href}
                            onClick={closeMobileMenu}
                            className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                              pathname === subItem.href
                                ? 'bg-muted text-primary'
                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        {showLogout && onLogout && (
          <div
            className={`absolute bottom-0 left-0 right-0 border-t border-border bg-muted/30 ${
              isWebMenuCollapsed ? 'lg:p-2' : 'p-4'
            }`}
          >
            <button
              onClick={() => {
                onLogout()
                closeMobileMenu()
              }}
              className={`flex items-center gap-3 rounded-lg text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground ${
                isWebMenuCollapsed
                  ? 'lg:mx-auto lg:w-auto lg:justify-center lg:p-2'
                  : 'w-full px-4 py-3'
              } `
                .trim()
                .replace(/\s+/g, ' ')}
              title={isWebMenuCollapsed ? 'Sair' : ''}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {shouldShowText && <span>Sair</span>}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
