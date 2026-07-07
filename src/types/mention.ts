/** Usuário selecionado via chip de menção — subset mínimo de User. */
export interface MentionedUser {
  telegramId: number;
  name: string;
  photoUrl: string | null;
}
