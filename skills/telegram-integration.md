---
name: telegram-integration
description: Especialista em Telegram WebApp SDK — MainButton, BackButton, HapticFeedback, CloudStorage, BiometricManager, themeParams, e todos os recursos nativos do Telegram para Mini Apps.
requires_double_check: true
telegram_features: [MainButton, BackButton, SecondaryButton, HapticFeedback, CloudStorage, BiometricManager, ThemeParams, Popup, Alert, switchInlineQuery, initData]
---

# Telegram Integration Specialist

## 🎯 PROPÓSITO DA SKILL

Esta skill é o **especialista em integração com Telegram** para o Deck. Garante que todas as features do Telegram WebApp SDK sejam usadas corretamente, de forma SSR-safe, com fallbacks apropriados e seguindo padrões estabelecidos.

**Responsabilidades:**
1. Implementar UI nativa do Telegram (MainButton, BackButton, SecondaryButton)
2. Gerenciar HapticFeedback e vibração por emoji
3. Integrar CloudStorage para rate limiting e persistência
4. Implementar BiometricManager para lock biométrico
5. Sincronizar tema com Telegram themeParams
6. Gerenciar navegação (switchInlineQuery, openLink, close)
7. Garantir inicialização SSR-safe do SDK
8. Validar uso correto de initData para autenticação

---

## RECURSOS DO TELEGRAM DISPONÍVEIS

### UI Nativa

| Recurso | Arquivo | Descrição |
|---------|---------|-----------|
| `MainButton` | `telegram-utils.ts` | Botão principal dinâmico (texto, cor, progresso) |
| `BackButton` | `telegram-utils.ts` | Navegação voltada ao topo |
| `SecondaryButton` | `telegram-utils.ts` | Botão secundário (suporte básico) |
| `showPopup` | `telegram-utils.ts` | Popup nativo com botões customizados |
| `showAlert` | `telegram-utils.ts` | Alerta simples nativo |
| `showConfirm` | `telegram-utils.ts` | Confirmação sim/não nativo |

### Haptic Feedback

| Método | Tipo | Uso no Projeto |
|--------|------|----------------|
| `impactOccurred` | light/medium/heavy/rigid/soft | Clicks, selections |
| `notificationOccurred` | success/warning/error | Notificações de ação |
| `selectionChanged` | — | Picker de reações |
| `vibrateReaction` | Padrões por emoji | Reações com vibração específica |

### Armazenamento

| Recurso | Arquivo | Descrição |
|---------|---------|-----------|
| `CloudStorage` | `rate-limit-cache.ts` | Rate limiting camada 1 (sincronizado) |
| `localStorage` | `rate-limit-cache.ts` | Fallback se CloudStorage indisponível |

### Biometria

| Recurso | Arquivo | Descrição |
|---------|---------|-----------|
| `BiometricManager` | `use-biometric-lock.ts` | Face ID, Touch ID, Fingerprint |
| `biometricInit` | `use-biometric-lock.ts` | Inicializa e verifica disponibilidade |
| `biometricAuthenticate` | `use-biometric-lock.ts` | Autentica e retorna token |
| `biometricUpdateToken` | `use-biometric-lock.ts` | Salva token no armazenamento seguro |

### Tema e Cores

| Recurso | Arquivo | Descrição |
|---------|---------|-----------|
| `themeParams` | `theme-provider.tsx` | Cores dinâmicas do Telegram |
| `colorScheme` | `theme-provider.tsx` | light/dark mode automático |
| `setHeaderColor` | `telegram-utils.ts` | Cor da status bar (#ffffff) |
| `setBackgroundColor` | `telegram-utils.ts` | Cor de fundo do app |

### Navegação e Fullscreen

| Recurso | Arquivo | Descrição |
|---------|---------|-----------|
| `expand()` | `telegram-utils.ts` | Expande para fullscreen |
| `requestFullscreen()` | `telegram-utils.ts` | Solicita fullscreen explícito |
| `lockOrientation()` | `telegram-utils.ts` | Trava em portrait |
| `switchInlineQuery` | `telegram-utils.ts` | Convite a amigos via inline query |
| `openLink` | `telegram-utils.ts` | Abre link externo |
| `close()` | `telegram-utils.ts` | Fecha o Mini App |

### Identidade e Auth

| Recurso | Arquivo | Descrição |
|---------|---------|-----------|
| `initData` | `telegram.d.ts` | String assinada para autenticação |
| `initDataUnsafe` | `telegram.d.ts` | Dados do usuário (não verificados) |
| `TelegramUser` | `telegram.d.ts` | Interface do usuário do Telegram |

---

## PADRÕES DE IMPLEMENTAÇÃO

### 1. Inicialização SSR-Safe (OBRIGATÓRIO)

```typescript
// SEMPRE usar wrapper seguro para evitar erros de SSR
let tg: TelegramWebApp | null = null;
let isInitializing = false;

export function initTelegramWebApp() {
  if (typeof window !== "undefined" && !tg && !isInitializing) {
    isInitializing = true;
    try {
      if (window.Telegram?.WebApp) {
        tg = window.Telegram.WebApp;
        tg.expand();
        tg.requestFullscreen();
        tg.ready();
        tg.setHeaderColor('#ffffff');
      }
    } catch {
      // Silencioso para não poluir logs
    } finally {
      isInitializing = false;
    }
  }
  return tg;
}
```

**Regras:**
- ✅ Verificar `typeof window !== "undefined"` antes de acessar
- ✅ Usar flag `isInitializing` para evitar race conditions
- ✅ Try-catch silencioso para não quebrar em browsers sem Telegram
- ✅ Chamar `ready()` após inicialização
- ✅ Configurar header branco (`#ffffff`) para ícones escuros

### 2. MainButton Dinâmica

```typescript
useEffect(() => {
  if (isVideoPlaying) {
    mainButtonHide();
    return;
  }

  if (isPublishing) {
    mainButtonShow();
    mainButtonDisable();
    mainButtonSetText('Publicando...');
    mainButtonShowProgress();
    return;
  }

  if (isValid && canPost) {
    mainButtonShow();
    mainButtonEnable();
    mainButtonSetText('Publicar');
    return;
  }

  if (!canPost) {
    mainButtonShow();
    mainButtonDisable();
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    mainButtonSetText(`Aguardar ${minutes}m ${seconds}s`);
    return;
  }

  mainButtonHide();
}, [isValid, canPost, timeRemaining, isVideoPlaying, isPublishing]);
```

### 3. Haptic Feedback por Emoji

```typescript
const REACTION_VIBRATION: Record<string, number | number[]> = {
  '💀': 400,
  '😂': [80, 60, 80],
  '😱': [200, 100, 200],
  '❤️': [60, 40, 60],
  '🔥': [40, 30, 40, 30, 40],
  '👍': 60,
};

export function vibrateReaction(emoji: string): void {
  const pattern = REACTION_VIBRATION[emoji] ?? 60;

  // Web Vibration API (Android — mais expressivo)
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
      return;
    } catch { /* fallback */ }
  }

  // Fallback: Telegram HapticFeedback (iOS)
  hapticImpact('medium');
}
```

### 4. CloudStorage para Rate Limiting

```typescript
// Camada 1 do rate limiting híbrido
const RATE_LIMIT_KEY = '@deck/last-post-timestamp';

export async function getRateLimitCache(): Promise<number | null> {
  return new Promise((resolve) => {
    const tg = window.Telegram?.WebApp;
    
    if (tg?.CloudStorage) {
      tg.CloudStorage.getItem(RATE_LIMIT_KEY, (err, value) => {
        if (err || !value) {
          const local = localStorage.getItem(RATE_LIMIT_KEY);
          resolve(local ? parseInt(local) : null);
        } else {
          resolve(parseInt(value));
        }
      });
    } else {
      const local = localStorage.getItem(RATE_LIMIT_KEY);
      resolve(local ? parseInt(local) : null);
    }
  });
}
```

### 5. BiometricManager para Lock

```typescript
// Hook use-biometric-lock.ts
export function biometricInit(cb?: (available: boolean, type: BiometricType) => void): void {
  const bm = getBiometricManager();
  if (!bm) { cb?.(false, 'unknown'); return; }
  bm.init(() => {
    cb?.(bm.isBiometricAvailable, bm.biometricType);
  });
}

export function biometricAuthenticate(
  reason: string,
  cb: (success: boolean, token?: string) => void,
): void {
  const bm = getBiometricManager();
  if (!bm) { cb(false); return; }
  bm.authenticate({ reason }, cb);
}
```

---

## DOCUMENTAÇÃO OFICIAL DO TELEGRAM

| Recurso | Link Oficial | Status no Deck |
|---------|--------------|---------------------|
| **WebApp SDK** | https://core.telegram.org/bots/webapps | ✅ Implementado |
| **CloudStorage** | https://core.telegram.org/bots/webapps#cloudstorage | ✅ Rate limiting camada 1 |
| **BiometricManager** | https://core.telegram.org/bots/webapps#biometricmanager | ✅ Lock biométrico |
| **MainButton** | https://core.telegram.org/bots/webapps#mainbutton | ✅ Dinâmica |
| **BackButton** | https://core.telegram.org/bots/webapps#backbutton | ✅ Navegação |
| **SecondaryButton** | https://core.telegram.org/bots/webapps#secondarybutton | ✅ Suporte básico |
| **HapticFeedback** | https://core.telegram.org/bots/webapps#hapticfeedback | ✅ + Web Vibration API |
| **Popup/Alert** | https://core.telegram.org/bots/webapps#popup | ✅ showTelegramPopup |
| **switchInlineQuery** | https://core.telegram.org/bots/webapps#switchinlinequery | ✅ Convite a amigos |
| **ThemeParams** | https://core.telegram.org/bots/webapps#themeparams | ✅ theme-provider.tsx |

---

## DICAS DE INTEGRAÇÃO

### ✅ DO

- **Sempre verificar disponibilidade:** `if (window.Telegram?.WebApp)` antes de usar qualquer feature
- **Usar callbacks assíncronos:** CloudStorage e BiometricManager são callback-based
- **Fallback para localStorage:** CloudStorage pode falhar, sempre ter fallback
- **Inicializar no layout.tsx:** Carregar SDK antes de qualquer componente
- **Respeitar portrait lock:** App desenhado para vertical, usar `lockOrientation()`
- **Header branco:** `setHeaderColor('#ffffff')` para ícones escuros na status bar
- **Expandir automaticamente:** `tg.expand()` no inicialização
- **Haptic sutil:** Usar `light` ou `soft` para feedbacks frequentes

### ❌ NÃO

- **Não assumir que Telegram está disponível:** Pode rodar em browser externo
- **Não bloquear thread principal:** Callbacks do Telegram podem ser lentos
- **Não ignorar fallbacks:** Sempre prover alternativa se Telegram SDK falhar
- **Não usar integer para telegramId:** Usar BIGINT (`mode: "number"`)
- **Não esquecer cleanup:** Remover event listeners com `offEvent`, `offClick`

---

## EXEMPLOS DE USO REAL NO PROJETO

| Feature | Arquivo | Recursos Telegram Usados |
|---------|---------|-------------------------|
| **Create Post** | `src/app/create/page.tsx` | MainButton dinâmica, HapticFeedback |
| **Profile Lock** | `src/hooks/use-biometric-lock.ts` | BiometricManager, CloudStorage |
| **Rate Limiting** | `src/lib/rate-limit-cache.ts` | CloudStorage (camada 1) |
| **Theme Sync** | `src/lib/theme-provider.tsx` | themeParams, colorScheme |
| **Navigation** | `src/components/ui/button.tsx` | BackButton, close |
| **Share** | `src/components/post-card-share.tsx` | switchInlineQuery |
| **Notifications** | `server/bot/` | Bot API para notificações push |
