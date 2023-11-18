import { register_type } from 'hola-web';

const no_value = (value) => {
    if (value === undefined || value === null) {
        return true
    }
    if (typeof value == 'undefined') {
        return true;
    }
    if (typeof value === 'string' && value.trim().length === 0) {
        return true;
    }
    return false;
};

const is_int = (value) => {
    return parseInt(value) == parseFloat(value);
}

const get_enum_type = (type_name, type_list) => {
    return {
        name: type_name, input_type: "autocomplete",

        items: (vue) => {
            return type_list.map((key, index) => ({ value: index, text: vue.$t(key) }));
        },

        format: (value, vue) => {
            if (no_value(value)) {
                return "";
            }
            return vue.$t(type_list[value]);
        }
    }
}

const user_status_type = get_enum_type("user_status", ["type.user_status_new", "type.user_status_valid", "type.user_status_invalid"])

const role_type = {
    name: "role",
    input_type: "autocomplete",

    items: (vue) => {
        const status = [];
        status.push({ value: "admin", text: vue.$t("type.role_admin") });
        status.push({ value: "user", text: vue.$t("type.role_user") });
        status.push({ value: "vip", text: vue.$t("type.role_vip") });
        status.push({ value: "vvip", text: vue.$t("type.role_vvip") });
        return status;
    },

    format: (value, vue) => {
        if (no_value(value)) {
            return "";
        }
        switch (value) {
            case "admin":
                return vue.$t("type.role_admin");
            case "user":
                return vue.$t("type.role_user");
            case "vip":
                return vue.$t("type.role_vip");
            case "vvip":
                return vue.$t("type.role_vvip");
            default:
                return "";
        }
    }
}


const gigabyte_type = {
    name: "gigabyte",
    input_type: "number",
    search_input_type: "text",
    suffix: "GB",

    rule: (vue, field_name) => {
        const err = vue.$t("type.uint", { field: field_name });
        return (value) => no_value(value) || is_int(value) || err;
    },

    format: (value) => {
        if (no_value(value)) {
            return "";
        }
        return value ? value + " GB" : "";
    }
}

const seconds_type = {
    name: "seconds",
    input_type: "number",
    search_input_type: "text",
    suffix: "seconds",

    rule: (vue, field_name) => {
        const err = vue.$t("type.uint", { field: field_name });
        return (value) => no_value(value) || is_int(value) || err;
    },

    format: (value) => {
        if (no_value(value)) {
            return "";
        }
        return value ? value + " seconds" : "";
    }
}

const progress_type = {
    name: "progress",
    input_type: "number",
    search_input_type: "text",
    suffix: "%",

    rule: (vue, field_name) => {
        const err = vue.$t("type.uint", { field: field_name });
        return (value) => no_value(value) || is_int(value) || err;
    },

    format: (value) => {
        if (no_value(value)) {
            return "";
        }
        return value ? value + " %" : "";
    }
}

const freq_type = {
    name: "freq",
    input_type: "number",
    search_input_type: "text",
    suffix: "GHz",

    rule: (vue, field_name) => {
        const err = vue.$t("type.float", { field: field_name });
        return (value) => no_value(value) || parseFloat(value) > 0 || err;
    },

    format: (value) => {
        if (no_value(value)) {
            return "";
        }
        return value ? value + " GHz" : "";
    }
}

const compare_type = get_enum_type("compare", ["type.compare_higher_better", "type.compare_lower_better"]);
const job_status_type = get_enum_type("job_status", ["type.job_status_stopped", "type.job_status_running"]);
const chart_type = get_enum_type("chart", ["type.chart_line", "type.chart_bar"]);
const data_type = get_enum_type("data_type", ["type.fp16", "type.bf16", "type.fp8", "type.int8", "type.int4"]);
const optimizer_type = get_enum_type("optimizer", ["type.adam"]);
const exec_type = get_enum_type("exec_type", ["type.full", "type.lora", "type.qlora"]);
const zero_type = get_enum_type("zero", ["type.zero1", "type.zero2", "type.zero3"]);


const register_types = () => {
    register_type(user_status_type);
    register_type(role_type);
    register_type(gigabyte_type);
    register_type(seconds_type);
    register_type(progress_type);
    register_type(compare_type);
    register_type(freq_type);
    register_type(job_status_type);
    register_type(chart_type);
    register_type(data_type);
    register_type(optimizer_type);
    register_type(exec_type);
    register_type(zero_type);
};

const extract_number = (value) => {
    const num = value.match(/[+\-0-9\\.]+/g);
    if (num) {
        const values = num.map(Number);
        return values.length == 1 ? values[0] : 0;
    } else {
        return 0;
    }
}

export { register_types, extract_number }
