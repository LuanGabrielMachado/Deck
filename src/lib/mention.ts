/**
 * Utilitários de menção (@usuario).
 *
 * Regras:
 *  - Só pode mencionar usuários que você segue
 *  - Máximo de 3 menções por post (anti-spam)
 *  - Nome normalizado: sem espaços, case-insensitive
 */

/** Extrai todos os @nomes únicos de um texto (máx 3). */
export function extractMentions(text: string): string[] {
  const matches = text.match(/@([\w\u00C0-\u024F]+)/gi) ?? [];
  const names = matches.map((m) => m.slice(1).toLowerCase());
  return [...new Set(names)].slice(0, 3);
}
