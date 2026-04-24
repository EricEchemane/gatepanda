export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
}

export function createEventSlug(name: string) {
  return `${slugify(name)}-${crypto.randomUUID().slice(0, 8)}`
}
