export const CONTAINER_PADDING = {
  mobile: 'px-4',
  tablet: 'sm:px-6',
  desktop: 'lg:px-8',
  all: 'px-4 sm:px-6 lg:px-8',
} as const

export const CONTAINER_MAX_WIDTH = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  full: 'max-w-full',
} as const

export const SPACING = {
  section: 'py-6 sm:py-8',
  sectionLarge: 'py-8 sm:py-12',
  card: 'p-6 sm:p-8',
  cardCompact: 'p-4 sm:p-6',
  gap: {
    xs: 'gap-2',
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
  },
  margin: {
    xs: 'mb-4',
    sm: 'mb-6',
    md: 'mb-6 sm:mb-8',
    lg: 'mb-8 sm:mb-12',
  },
} as const

export const HEADER_HEIGHT = {
  mobile: 'h-14',
  desktop: 'sm:h-16',
  all: 'h-14 sm:h-16',
} as const

export const PAGE_CONTAINER = `${CONTAINER_PADDING.all} ${SPACING.section}`
export const PAGE_CONTAINER_LARGE = `${CONTAINER_PADDING.all} ${SPACING.sectionLarge}`
