import Polyglot from 'node-polyglot'
import ZHCN from '../i18n/zh-CN.json'
import ZHTW from '../i18n/zh-TW.json'
import EN from '../i18n/en.json'
import ES from '../i18n/es-ES.json'
import FR from '../i18n/fr.json'
import RU from '../i18n/ru.json'
import DE from '../i18n/de.json'
import PL from '../i18n/pl.json'
import KO from '../i18n/ko.json'
import FA from '../i18n/fa.json'
import JA from '../i18n/ja.json'

const i18nMap: I18nMap = {
  zh: ZHCN,
  'zh-CN': ZHCN,
  'zh-TW': ZHTW,
  en: EN,
  'es-ES': ES,
  fr: FR,
  ru: RU,
  de: DE,
  pl: PL,
  ko: KO,
  fa: FA,
  ja: JA,
}

interface I18nMap {
  [key: string]: any
}

export default function useI18n(lang: string) {
  return new Polyglot({
    phrases: i18nMap[lang] || i18nMap.en,
    locale: lang,
  })
}
