import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18next
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'en',
    supportedLngs: ['en', 'es'],
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    detection: {
      order: ['queryString', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      caches: ['cookie', 'localStorage'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      request: (options, url, payload, callback) => {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              if (xhr.status >= 200 && xhr.status < 300) {
                callback(null, { status: xhr.status, data: xhr.responseText });
              } else {
                callback(new Error(xhr.statusText), { status: xhr.status, data: null });
              }
            }
          };
          xhr.send();
        } catch (e) {
            callback(e, { status: 500, data: null });
        }
      },
    },
    ns: 'translation',
    defaultNS: 'translation'
  });

export default i18next;
