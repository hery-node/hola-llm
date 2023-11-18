import Vue from "vue";
import VueI18n from "vue-i18n";

function load_locale_messages(locales) {
    const messages = {};
    locales.keys().forEach(key => {
        const matched = key.match(/([A-Za-z0-9-_]+)\./i);
        if (matched && matched.length > 1) {
            const locale = matched[1];
            messages[locale] = locales(key);
        }
    });
    return messages
}

function setup_i18n(locales, locale = "en") {
    Vue.use(VueI18n);

    return new VueI18n({
        locale: process.env.VUE_APP_I18N_LOCALE || locale,
        fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || locale,
        messages: load_locale_messages(locales)
    });
}

export { setup_i18n };