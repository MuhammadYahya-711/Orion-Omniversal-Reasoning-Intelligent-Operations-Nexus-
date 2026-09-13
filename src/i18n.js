import { useEffect, useState } from 'react'
import en from './locales/en.json'
import ar from './locales/ar.json'
import de from './locales/de.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import hi from './locales/hi.json'
import ja from './locales/ja.json'
import ur from './locales/ur.json'
import zh from './locales/zh.json'

const dictionaries = { en, ar, de, es, fr, hi, ja, ur, zh }
const fallback = dictionaries.en

export const interfaceLanguages = [
  ['en', 'English'], ['ar', 'العربية'], ['de', 'Deutsch'], ['es', 'Español'], ['fr', 'Français'],
  ['hi', 'हिन्दी'], ['ja', '日本語'], ['ur', 'اردو'], ['zh', '中文'],
]

export function useLanguage() {
  const [language, setCurrentLanguage] = useState(() => {
    const stored = window.localStorage.getItem('orion:interface-language') || 'en'
    return dictionaries[stored] ? stored : 'en'
  })

  useEffect(() => {
    const syncLanguage = (event) => setCurrentLanguage(event.detail || 'en')
    window.addEventListener('orion:language-change', syncLanguage)
    return () => window.removeEventListener('orion:language-change', syncLanguage)
  }, [])

  const t = (key) => dictionaries[language]?.[key] || fallback[key] || key
  const setLanguage = (nextLanguage) => {
    const next = dictionaries[nextLanguage] ? nextLanguage : 'en'
    window.localStorage.setItem('orion:interface-language', next)
    setCurrentLanguage(next)
    window.dispatchEvent(new CustomEvent('orion:language-change', { detail: next }))
  }
  return { t, language, setLanguage }
}
