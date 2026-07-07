/**
 * Componentes auxiliares compartilhados entre as seções do admin.
 * Card, Section, FlagToggle, StatusBadge.
 */

'use client';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl glass-card p-4 ${className}`}>
      {children}
    </div>
  );
}

export function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  // FadeInWhenVisible importado inline para evitar dep circular
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white text-shadow-dark">
        <span>{icon}</span> {title}
      </h2>
      {children}
    </section>
  );
}

export function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
      ok ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-primary' : 'bg-error'}`} />
      {label}
    </span>
  );
}

export function FlagToggle({
  label, flagKey, value, onToggle, isLoading,
}: {
  label: string;
  flagKey: string;
  value: boolean;
  onToggle: (key: string, newValue: boolean) => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-white/80">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => !isLoading && onToggle(flagKey, !value)}
        disabled={isLoading}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none
          disabled:cursor-not-allowed disabled:opacity-50
          ${value ? 'bg-primary' : 'bg-white/20'}`}
        aria-label={`${label}: ${value ? 'ligado' : 'desligado'}`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg
          transform transition-transform duration-200 ease-in-out
          ${value ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}
