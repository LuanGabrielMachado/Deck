---
name: telegram-specialist
description: Especialista em Telegram — integração e desenvolvimento específico do Telegram, com exemplos de como usar integrações, funções (CloudStorage, Haptic Feedback, Botões integrados, tudo que pode ser integrado nativamente pelo Telegram).
requires_double_check: true
telegram_features: [MainButton, BackButton, SecondaryButton, HapticFeedback, CloudStorage, BiometricManager, ThemeParams, Popup, Alert, Confirm, switchInlineQuery, initData, WebAppLink, Fullscreen]
---

# Telegram Specialist

## 🎯 PROPÓSITO DA SKILL

Esta skill é o **especialista em desenvolvimento Telegram** para o Deck. Domina todos os recursos nativos do Telegram WebApp SDK e Bot API.

**Responsabilidades:**
1. Implementar UI nativa do Telegram (MainButton, BackButton, SecondaryButton)
2. Gerenciar HapticFeedback e vibração por emoji
3. Integrar CloudStorage para rate limiting e persistência
4. Implementar BiometricManager para lock biométrico
5. Sincronizar tema com Telegram themeParams
6. Gerenciar navegação (switchInlineQuery, openLink, close)
7. Garantir inicialização SSR-safe do SDK
8. Validar uso correto de initData para autenticação
9. Implementar botões interativos e popups nativos
10. Usar recursos de fullscreen e orientação

**Quando usar:**
- Implementar features nativas do Telegram
- Integrar Bot API para notificações
- Usar CloudStorage para persistência
- Implementar biometria (Face ID, Touch ID)
- Criar popups, alerts, confirms nativos
- Gerenciar tema (dark/light mode)

**Quando NÃO usar:**
- Para código genérico React → use `code-contributor`
- Para decisões arquiteturais → use `deck-specialist`
- Para validação de regras → use `rule-enforcer`

---

## 📚 RECURSOS DO TELEGRAM DISPONÍVEIS

### 1. UI Nativa - Botões

#### MainButton (Botão Principal)

**Arquivo:** `src/lib/telegram-utils.ts`

**API:**
```typescript
interface MainButton {
  show(): void
  hide(): void
  setText(text: string): void
  setParams(params: { text?: string; color?: string; textColor?: string }): void
  showProgress(allowReplaceAfterClick?: boolean): void
  hideProgress(): void
  enable(): void
  disable(): void
  onClick(handler: () => void): void
  offClick(handler: () => void): void
}
```

**Exemplo de Uso Dinâmico:**
```typescript
// src/app/create/page.tsx
useEffect(() => {
  if (isVideoPlaying) {
    mainButtonHide()
    return
  }

  if (isPublishing) {
    mainButtonShow()
    mainButtonDisable()
    mainButtonSetText('Publicando...')
    mainButtonShowProgress()
    return
  }

  if (isValid && canPost) {
    mainButtonShow()
    mainButtonEnable()
    mainButtonSetText('Publicar')
    return
  }

  if (!canPost) {
    mainButtonShow()
    mainButtonDisable()
    const minutes = Math.floor(timeRemaining / 60000)
    const seconds = Math.floor((timeRemaining % 60000) / 1000)
    mainButtonSetText(`Aguardar ${minutes}m ${seconds}s`)
    return
  }

  mainButtonHide()
}, [isValid, canPost, timeRemaining, isVideoPlaying, isPublishing])
```

**Dicas:**
- ✅ Sempre fazer cleanup com `offClick` no useEffect
- ✅ Usar `showProgress` durante operações assíncronas
- ✅ Desabilitar botão quando ação não disponível
- ✅ Texto claro e objetivo (max 20 caracteres)

#### BackButton (Botão Voltar)

**API:**
```typescript
interface BackButton {
  show(): void
  hide(): void
  onClick(handler: () => void): void
  offClick(handler: () => void): void
}
```

**Exemplo:**
```typescript
useEffect(() => {
  backButtonShow()
  backButtonOnClick(() => {
    router.back()
  })

  return () => {
    backButtonHide()
    backButtonOffClick(() => {})
  }
}, [router])
```

#### SecondaryButton (Botão Secundário)

**API:**
```typescript
interface SecondaryButton {
  show(): void
  hide(): void
  setText(text: string): void
  setParams(params: { text?: string; color?: string; textColor?: string }): void
  enable(): void
  disable(): void
  onClick(handler: () => void): void
  offClick(handler: () => void): void
}
```

**Exemplo:**
```typescript
// Botão secundário abaixo da MainButton
secondaryButtonSetText('Cancelar')
secondaryButtonSetParams({
  color: '#FF3B30',
  textColor: '#FFFFFF'
})
secondaryButtonShow()
```

---

### 2. Haptic Feedback (Vibração)

**Arquivo:** `src/lib/telegram-utils.ts`

**API:**
```typescript
interface HapticFeedback {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
  notificationOccurred(type: 'success' | 'warning' | 'error'): void
  selectionChanged(): void
}
```

**Tipos de Impacto:**
| Tipo | Intensidade | Uso Recomendado |
|------|-------------|-----------------|
| `light` | Suave | Clicks em botões, selections |
| `medium` | Média | Ações confirmadas |
| `heavy` | Forte | Ações importantes |
| `rigid` | Rígida | Erros, bloqueios |
| `soft` | Macia | Feedback sutil |

**Notificações:**
| Tipo | Uso |
|------|-----|
| `success` | Operação concluída com sucesso |
| `warning` | Atenção necessária |
| `error` | Erro ou falha |

**Exemplo Completo:**
```typescript
const handleReaction = (emoji: string) => {
  // Haptic específico por emoji
  vibrateReaction(emoji)

  // Fallback para iOS
  if (!navigator.vibrate) {
    hapticImpact('medium')
  }
}

const handleDelete = () => {
  // Confirmação com haptic
  hapticImpact('light')

  showPopup(
    {
      title: 'Confirmar exclusão',
      message: 'Tem certeza?',
      buttons: [
        { id: 'cancel', type: 'cancel', text: 'Cancelar' },
        { id: 'delete', type: 'destructive', text: 'Apagar' },
      ],
    },
    (buttonId) => {
      if (buttonId === 'delete') {
        hapticNotification('warning')
        onDelete(post.id)
      }
    }
  )
}
```

**Vibração por Emoji (Web Vibration API + Fallback):**
```typescript
const REACTION_VIBRATION: Record<string, number | number[]> = {
  '💀': 400,           // Vibração longa
  '😂': [80, 60, 80],  // 3 pulsos (risada)
  '😱': [200, 100, 200], // 2 pulsos fortes
  '❤️': [60, 40, 60],  // Batimento cardíaco
  '🔥': [40, 30, 40, 30, 40], // 5 pulsos rápidos
  '👍': 60,            // Curto
}

export function vibrateReaction(emoji: string): void {
  const pattern = REACTION_VIBRATION[emoji] ?? 60

  // Web Vibration API (Android)
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
      return
    } catch { /* fallback */ }
  }

  // Fallback: Telegram HapticFeedback (iOS)
  hapticImpact('medium')
}
```

---

### 3. CloudStorage (Armazenamento na Nuvem)

**Arquivo:** `src/lib/rate-limit-cache.ts`

**API:**
```typescript
interface CloudStorage {
  getItem(key: string, callback: (err: Error | null, value: string | null) => void): void
  setItem(key: string, value: string, callback: (err: Error | null) => void): void
  removeItem(key: string, callback: (err: Error | null) => void): void
  getKeys(callback: (err: Error | null, keys: string[]) => void): void
}
```

**Características:**
- ✅ **Sincronizado:** Dados disponíveis em todos dispositivos do usuário
- ✅ **Assíncrono:** Callback-based (não Promise)
- ✅ **Persistente:** Dados sobrevivem a reinstalações
- ✅ **Limite:** 1024 chaves por usuário, 128KB por valor

**Exemplo - Rate Limiting:**
```typescript
const RATE_LIMIT_KEY = '@deck/last-post-timestamp'
const POST_INTERVAL_MS = 10 * 60 * 1000 // 10 minutos

export async function getRateLimitCache(): Promise<number | null> {
  return new Promise((resolve) => {
    const tg = window.Telegram?.WebApp

    if (tg?.CloudStorage) {
      tg.CloudStorage.getItem(RATE_LIMIT_KEY, (err, value) => {
        if (err || !value) {
          // Fallback para localStorage
          const local = localStorage.getItem(RATE_LIMIT_KEY)
          resolve(local ? parseInt(local) : null)
        } else {
          resolve(parseInt(value))
        }
      })
    } else {
      // Fallback para localStorage
      const local = localStorage.getItem(RATE_LIMIT_KEY)
      resolve(local ? parseInt(local) : null)
    }
  })
}

export async function setRateLimitCache(timestamp: number): Promise<void> {
  return new Promise((resolve) => {
    const tg = window.Telegram?.WebApp

    if (tg?.CloudStorage) {
      tg.CloudStorage.setItem(RATE_LIMIT_KEY, String(timestamp), resolve)
    } else {
      localStorage.setItem(RATE_LIMIT_KEY, String(timestamp))
      resolve()
    }
  })
}
```

**Dicas:**
- ✅ Sempre ter fallback para localStorage
- ✅ Usar prefixes nas chaves (`@deck/`)
- ✅ Converter tipos (CloudStorage só armazena strings)
- ✅ Limpar chaves antigas periodicamente

---

### 4. BiometricManager (Biometria)

**Arquivo:** `src/hooks/use-biometric-lock.ts`

**API:**
```typescript
interface BiometricManager {
  init(callback: (available: boolean) => void): void
  authenticate(params: { reason: string }, callback: (success: boolean, token?: string) => void): void
  updateToken(token: string, callback: (success: boolean) => void): void
  disableBiometric(callback: (success: boolean) => void): void
}
```

**Tipos Biométricos:**
- ✅ **Face ID** (iOS)
- ✅ **Touch ID** (iOS)
- ✅ **Fingerprint** (Android)
- ✅ **PIN** (Fallback)

**Exemplo Completo:**
```typescript
import { useCallback, useState } from 'react'

export function useBiometricLock() {
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricType, setBiometricType] = useState<'face' | 'touch' | 'fingerprint' | 'unknown'>('unknown')

  const init = useCallback(() => {
    const bm = window.Telegram?.WebApp?.BiometricManager
    if (!bm) return

    bm.init((available: boolean) => {
      setBiometricAvailable(available)
      setBiometricType(bm.biometricType || 'unknown')
    })
  }, [])

  const authenticate = useCallback((reason: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const bm = window.Telegram?.WebApp?.BiometricManager
      if (!bm) {
        resolve(null)
        return
      }

      bm.authenticate({ reason }, (success: boolean, token?: string) => {
        if (success && token) {
          // Salva token no armazenamento seguro
          bm.updateToken(token, () => {})
          resolve(token)
        } else {
          resolve(null)
        }
      })
    })
  }, [])

  return { biometricAvailable, biometricType, init, authenticate }
}
```

**Uso no Profile Lock:**
```typescript
const { biometricAvailable, init, authenticate } = useBiometricLock()

useEffect(() => {
  init()
}, [init])

const handleUnlock = async () => {
  const token = await authenticate('Desbloquear perfil')
  if (token) {
    // Token válido, libera acesso
    setIsLocked(false)
  }
}
```

---

### 5. ThemeParams (Tema Dinâmico)

**Arquivo:** `src/lib/theme-provider.tsx`

**API:**
```typescript
interface ThemeParams {
  bg_color?: string              // Cor de fundo principal
  secondary_bg_color?: string    // Cor de fundo secundária
  text_color?: string            // Cor do texto
  hint_color?: string            // Cor de texto secundário
  button_color?: string          // Cor de botões
  button_text_color?: string     // Cor do texto dos botões
  link_color?: string            // Cor de links
  section_separator_color?: string // Cor de separadores
}
```

**Exemplo de Sync com Tema:**
```typescript
import { useEffect, useState } from 'react'

export function useTelegramTheme() {
  const [theme, setTheme] = useState<ThemeParams>({})

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return

    // Inicializa com tema atual
    setTheme(tg.themeParams)

    // Listen para mudanças de tema
    const handler = () => {
      setTheme(tg.themeParams)
    }

    tg.onEvent('themeChanged', handler)

    return () => {
      tg.offEvent('themeChanged', handler)
    }
  }, [])

  return theme
}
```

**CSS Variables:**
```css
:root {
  --tg-theme-bg-color: #ffffff;
  --tg-theme-text-color: #000000;
  --tg-theme-button-color: #007AFF;
  --tg-theme-button-text-color: #ffffff;
  --tg-theme-secondary-bg-color: #F2F2F7;
  --tg-theme-hint-color: #8E8E93;
  --tg-theme-link-color: #007AFF;
  --tg-theme-section-separator-color: #C6C6C8;
}

@media (prefers-color-scheme: dark) {
  :root {
    --tg-theme-bg-color: #000000;
    --tg-theme-text-color: #ffffff;
    --tg-theme-button-color: #0A84FF;
    --tg-theme-button-text-color: #ffffff;
    --tg-theme-secondary-bg-color: #1C1C1E;
    --tg-theme-hint-color: #8E8E93;
    --tg-theme-link-color: #0A84FF;
    --tg-theme-section-separator-color: #38383A;
  }
}
```

---

### 6. Popup, Alert, Confirm (Diálogos Nativos)

**Arquivo:** `src/lib/telegram-utils.ts`

#### showPopup

**API:**
```typescript
showPopup(
  params: {
    title?: string
    message: string
    buttons: Array<{
      id?: string
      type?: 'default' | 'ok' | 'yes' | 'no' | 'cancel' | 'destructive'
      text?: string
    }>
  },
  callback: (buttonId: string | null) => void
): void
```

**Exemplo:**
```typescript
showPopup(
  {
    title: 'Confirmar exclusão',
    message: 'Tem certeza que deseja apagar este post?',
    buttons: [
      { id: 'cancel', type: 'cancel', text: 'Cancelar' },
      { id: 'delete', type: 'destructive', text: 'Apagar' },
    ],
  },
  (buttonId) => {
    if (buttonId === 'delete') {
      handleDelete()
    }
  }
)
```

#### showAlert

**API:**
```typescript
showAlert(message: string, callback?: () => void): void
```

**Exemplo:**
```typescript
showAlert('Post publicado com sucesso!', () => {
  router.push('/timeline')
})
```

#### showConfirm

**API:**
```typescript
showConfirm(message: string, callback: (confirmed: boolean) => void): void
```

**Exemplo:**
```typescript
showConfirm('Deseja realmente sair?', (confirmed) => {
  if (confirmed) {
    tg.close()
  }
})
```

---

### 7. Navegação e Fullscreen

#### expand() e requestFullscreen()

**Exemplo:**
```typescript
const tg = window.Telegram?.WebApp

if (tg) {
  tg.expand()  // Expande para altura máxima
  tg.requestFullscreen()  // Solicita fullscreen
}
```

#### lockOrientation()

**Exemplo:**
```typescript
// Trava em portrait (vertical)
const tg = window.Telegram?.WebApp
tg?.lockOrientation('portrait')
```

#### switchInlineQuery

**Exemplo:**
```typescript
// Convite a amigos via inline query
const tg = window.Telegram?.WebApp
tg?.switchInlineQuery('Venha ver o Deck!')
```

#### openLink

**Exemplo:**
```typescript
const tg = window.Telegram?.WebApp
tg?.openLink('https://deck.app')
```

#### close()

**Exemplo:**
```typescript
const tg = window.Telegram?.WebApp
tg?.close()  // Fecha o Mini App
```

---

### 8. initData (Autenticação)

**Arquivo:** `src/lib/telegram-utils.ts`, `server/_core/auth.ts`

**Estrutura:**
```typescript
interface InitDataUnsafe {
  user?: {
    id: number
    first_name: string
    last_name?: string
    username?: string
    photo_url?: string
  }
  query_id?: string
  hash?: string
  auth_date?: number
}
```

**Validação HMAC-SHA256:**
```typescript
import crypto from 'crypto'

function validateInitData(initData: string, botToken: string): boolean {
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  params.delete('hash')

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest()

  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  return computedHash === hash
}
```

**Uso no tRPC Context:**
```typescript
// server/_core/auth.ts
export async function createTRPCContext(opts: CreateNextContextOptions) {
  const initData = opts.req.headers.get('x-telegram-init-data') || ''
  
  const user = await validateAndExtractUser(initData, ENV.telegramBotToken)
  
  return {
    user,
    db,
    log,
  }
}
```

---

## ✅ BOAS PRÁTICAS

### DO (Faça)

- ✅ **Sempre verificar disponibilidade:** `if (window.Telegram?.WebApp)` antes de usar
- ✅ **Usar callbacks assíncronos:** CloudStorage e BiometricManager são callback-based
- ✅ **Fallback para localStorage:** CloudStorage pode falhar
- ✅ **Inicializar no layout.tsx:** Carregar SDK antes de qualquer componente
- ✅ **Respeitar portrait lock:** App desenhado para vertical
- ✅ **Header branco:** `setHeaderColor('#ffffff')` para ícones escuros
- ✅ **Expandir automaticamente:** `tg.expand()` na inicialização
- ✅ **Haptic sutil:** Usar `light` ou `soft` para feedbacks frequentes
- ✅ **Cleanup em useEffect:** Remover event listeners com `offEvent`, `offClick`

### DON'T (Não Faça)

- ❌ **Não assumir que Telegram está disponível:** Pode rodar em browser externo
- ❌ **Não bloquear thread principal:** Callbacks do Telegram podem ser lentos
- ❌ **Não ignorar fallbacks:** Sempre prover alternativa se SDK falhar
- ❌ **Não usar integer para telegramId:** Usar BIGINT (`mode: "number"`)
- ❌ **Não esquecer cleanup:** Remover handlers com `offClick`, `offEvent`
- ❌ **Não acessar window.Telegram sem check:** SSR-safe required

---

## 📖 DOCUMENTAÇÃO OFICIAL

| Recurso | Link Oficial | Status no Deck |
|---------|--------------|---------------------|
| **WebApp SDK** | https://core.telegram.org/bots/webapps | ✅ Implementado |
| **CloudStorage** | https://core.telegram.org/bots/webapps#cloudstorage | ✅ Rate limiting |
| **BiometricManager** | https://core.telegram.org/bots/webapps#biometricmanager | ✅ Lock biométrico |
| **MainButton** | https://core.telegram.org/bots/webapps#mainbutton | ✅ Dinâmica |
| **BackButton** | https://core.telegram.org/bots/webapps#backbutton | ✅ Navegação |
| **SecondaryButton** | https://core.telegram.org/bots/webapps#secondarybutton | ✅ Suporte básico |
| **HapticFeedback** | https://core.telegram.org/bots/webapps#hapticfeedback | ✅ + Web Vibration |
| **Popup/Alert** | https://core.telegram.org/bots/webapps#popup | ✅ showTelegramPopup |
| **switchInlineQuery** | https://core.telegram.org/bots/webapps#switchinlinequery | ✅ Convite a amigos |
| **ThemeParams** | https://core.telegram.org/bots/webapps#themeparams | ✅ theme-provider.tsx |
| **Fullscreen** | https://core.telegram.org/bots/webapps#fullscreen | ✅ requestFullscreen |
| **Bot API** | https://core.telegram.org/bots/api | ✅ Notificações push |

---

*Telegram Specialist — Expert em todos os recursos nativos do Telegram para Mini Apps.*
