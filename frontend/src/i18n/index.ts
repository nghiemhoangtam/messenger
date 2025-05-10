import axios from "axios";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

axios.defaults.headers.common["Accept-Language"] = i18n.language;

const options = {
  order: ["querystring", "navigator"],
  lookupQuerystring: "lng",
};

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    detection: options,
    fallbackLng: "en",
    load: "languageOnly",
    debug: true,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    ns: ["common", "auth"],
    defaultNS: "common",
  });

i18n.on("languageChanged", (lng) => {
  axios.defaults.headers.common["Accept-Language"] = lng;
});

export default i18n;
