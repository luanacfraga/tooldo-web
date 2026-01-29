export function getInitials(input?: {
  name?: string | null
  firstName?: string | null
  lastName?: string | null
}): string {
  const first = (input?.firstName ?? '').trim()
  const last = (input?.lastName ?? '').trim()

  if (first || last) {
    const a = first ? first[0] : ''
    const b = last ? last[0] : ''
    const initials = `${a}${b}`.toUpperCase()
    return initials || 'U'
  }

  const name = (input?.name ?? '').trim()
  if (!name) return 'U'

  const parts = name
    .split(/\s+/g)
    .map((p) => p.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean)

  const a = parts[0]?.[0] ?? ''
  const b = parts[1]?.[0] ?? ''
  return `${a}${b}`.toUpperCase() || 'U'
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getAvatarColor(seed?: string | null): string {
  const s = (seed ?? '').trim()
  if (!s) return 'hsl(var(--primary))'

  const h = hashString(s)
  const hue = 240 + (h % 41)
  const sat = 32 + (h % 18)
  const light = 38 + (h % 14)

  return `hsl(${hue} ${sat}% ${light}%)`
}

export function getUserAvatar(input?: {
  id?: string | null
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  initials?: string | null
  avatarColor?: string | null
}): { initials: string; color: string } {
  const initials =
    (input?.initials ?? undefined) ||
    getInitials({ name: input?.name, firstName: input?.firstName, lastName: input?.lastName })

  const color = (input?.avatarColor ?? undefined) || getAvatarColor(input?.id || input?.name || '')

  return { initials, color }
}
