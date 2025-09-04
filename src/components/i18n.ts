type TranslationKeys = 'loading' | 'error' | 'delete' | 'duplicate' | 'save' | 'view' | 'field' | 'record'; // add more as needed
type Language = 'en'; // add more as needed

type Translations = {
  [lang in Language]: {
    [key in TranslationKeys]: string;
  };
};

export const translations: Translations = {
  en: {
    loading: 'Loading…',
    error: 'Error',
    delete: 'Delete',
    duplicate: 'Duplicate',
    save: 'Save',
    view: 'View',
    field: 'Field',
    record: 'Record',
    // ...add more as needed
  },
  // Add other languages here
};

export function t(key: TranslationKeys, lang: Language = 'en'): string {
  return translations[lang][key] || key;
}
