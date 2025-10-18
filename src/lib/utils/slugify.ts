export function generateSlug(title: string, city: string, id: string): string {
  // Convert to lowercase and remove special characters
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  const citySlug = city
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

  // Create slug: title-city-shortid
  const shortId = id.slice(0, 8);
  return `${titleSlug}-${citySlug}-${shortId}`;
}

export function extractIdFromSlug(slug: string): string {
  // Extract the last part after the last hyphen (the ID)
  const parts = slug.split('-');
  return parts[parts.length - 1];
}
