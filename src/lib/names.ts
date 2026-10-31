const PARTICLES = new Set(["de", "da", "do", "das", "dos", "e"]);
const cap = (w: string) => (PARTICLES.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

/** Primeiro e segundo nome ("Mark Twain Duarte Siqueira" → "Mark Twain"); partículas como "de" acompanham o nome seguinte. */
export function shortName(nome: string, email: string | null): string {
  const words = nome.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    const local = (email ?? "").split("@")[0];
    return local ? cap(local) : "";
  }
  let take = Math.min(2, words.length);
  while (take < words.length && PARTICLES.has(words[take - 1].toLowerCase())) take++;
  return words.slice(0, take).map(cap).join(" ");
}

/** Como a pessoa quer ser chamada; sem apelido cadastrado, usa o primeiro e o segundo nome. */
export function displayName(p: { apelido?: string | null; nome: string; email: string | null }): string {
  const a = (p.apelido ?? "").trim();
  return a || shortName(p.nome, p.email);
}
