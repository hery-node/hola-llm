const { is_object } = require('hola-server').obj;
const { is_log_error, log_error } = require('hola-server');

const handle_pip_list = (json, tag) => {
    const result = { tag: tag };
    if (Array.isArray(json)) {
        for (let i = 0; i < json.length; i++) {
            const version = json[i];
            version && version["name"] && (result[version["name"]] = version["version"]);
        }
        return result;
    }
    return undefined;
}

/**
 * use naming conversion to handle results
 * versions.json  for pip list
 * how to handle results, use plugin to process the results
 * @param {*} str 
 * @param {*} tag 
 * @returns 
 */
const parse_json = (base_name, str, tag, log_extra) => {
    try {
        const trimed_tag = tag ? tag.trim() : "";
        const json = JSON.parse(str);
        if (base_name == "versions.json") {
            const result = handle_pip_list(json, trimed_tag);
            if (result) {
                return result;
            }
        } else if (Array.isArray(json)) {
            return { tag: trimed_tag, array: json };
        } else if (is_object(json)) {
            json.tag = trimed_tag;
            return json;
        }
        if (is_log_error()) {
            log_error("json", `DON'T KNOW how to handle ${base_name} and content is ${str}, so ignore it`, log_extra);
        }
        return {};
    } catch (e) {
        if (is_log_error()) {
            log_error("json", `error occurs to handle ${base_name} and content is ${str} and error is: ${e.toString()}`, log_extra);
        }
        return {};
    }
}

module.exports = { parse_json }