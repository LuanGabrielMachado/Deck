/**
 * Utilitários de menção (@usuario).
 *
 * Regras:
 *  - Só pode mencionar usuários que você segue
 *  - Máximo de 3 menções por post (anti-spam)
 *  - Nome normalizado: sem espaços, case-insensitive
 */

/** Extrai todos os @nomes únicos de um texto. */
export function extractMentions(text: string): string[] {
  const matches = text.match(/@([\w\u00C0-\u024F]+)/gi) ?? [];
  const names = matches.map((m) => m.slice(1).toLowerCase());
  // Remove duplicatas preservando ordem de aparição
  return [...new Set(names)].slice(0, 3);
}

/** Retorna o texto com menções estilizadas (bold) para exibição. */
export function renderMentions(text: string): string {
  return text.replace(/@([\w\u00C0-\u024F]+)/gi, '@$1');
}

/** Verifica se um texto contém alguma menção. */
export function hasMentions(text: string): boolean {
  return /@([\w\u00C0-\u024F]+)/i.test(text);
}
