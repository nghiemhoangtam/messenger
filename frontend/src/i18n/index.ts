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

function getCurrentLanguage() {
  return localStorage.getItem("lang") || "en";
}

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: getCurrentLanguage(), // 👈 load from localStorage
    detection: options,
    fallbackLng: "en",
    load: "languageOnly",
    debug: false,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    ns: ["common", "auth", "messages"],
    defaultNS: "common",
  });

i18n.on("languageChanged", (lng) => {
  axios.defaults.headers.common["Accept-Language"] = lng;
});

export default i18n;
