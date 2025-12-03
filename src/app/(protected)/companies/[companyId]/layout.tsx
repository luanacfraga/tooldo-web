'use client'

import { CompanyLayout } from '@/components/layout/company-layout'

export default function CompanyRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CompanyLayout>{children}</CompanyLayout>
}

