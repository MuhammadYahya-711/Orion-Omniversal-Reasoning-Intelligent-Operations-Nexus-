export {}

declare global {
  type GenMBUser = { id: string; email: string; name: string; picture: string }
  type GenMBSearchResult = { title: string; url: string; snippet: string; source: string; host: string; imageUrl?: string; favicon?: string; image: string; publishedAt?: string }
  interface Window {
    genmb: {
      auth: {
        ready: () => Promise<void>
        signIn: () => Promise<GenMBUser | null>
        sendMagicLink: (email: string) => Promise<{ success: boolean; data: unknown }>
        signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; data: unknown }>
        verifySignUp: (email: string, code: string) => Promise<GenMBUser | null>
        signInWithPassword: (email: string, password: string) => Promise<GenMBUser | null>
        requestPasswordReset: (email: string) => Promise<void>
        confirmPasswordReset: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; data: unknown }>
        signOut: () => Promise<void>
        getUser: () => GenMBUser | null
        isAuthenticated: () => boolean
        onAuthStateChange: (callback: (user: GenMBUser | null) => void) => () => void
      }
      kv: {
        get: (key: string) => Promise<unknown | null>
        set: (key: string, value: unknown) => Promise<void>
        delete: (key: string) => Promise<{ deleted: boolean }>
        list: (prefix: string) => Promise<{ data: Array<{ key: string; value: unknown }>; total: number }>
      }
      search: {
        web: (query: string, options?: { numResults?: number }) => Promise<GenMBSearchResult[]>
        news: (query: string, options?: { numResults?: number }) => Promise<GenMBSearchResult[]>
      }
      ai: {
        complete: (prompt: string, options?: { maxTokens?: number; enableSearch?: boolean }) => Promise<string>
        analyzeImage: (file: File | Blob, prompt: string) => Promise<string>
      }
      storage: {
        upload: (file: File, options?: { folder?: string; onProgress?: (percent: number) => void; signal?: AbortSignal }) => Promise<{ filename: string; url: string; size: number; contentType: string }>
        validate: (file: File, options?: { accept?: string; maxSize?: number }) => { ok: boolean; reason?: "type" | "size"; message?: string }
        list: (options?: { folder?: string }) => Promise<{ files: Array<{ filename: string; url: string; size: number; contentType: string; uploadedAt: string }>; usage: { totalSize: number; fileCount: number } }>
      }
    }
  }
}
