const { register_type } = require('hola-server');
const { is_integer } = require('hola-server').number;
const { has_value } = require('hola-server').validate;

const user_status_type = {
    name: "user_status",
    convert: function (value) {
        const int_value = parseInt(value);
        return is_integer(value) && int_value >= 0 ? { value: int_value } : { err: 'user_status convert error for value:' + value };
    }
}

const role_type = {
    name: "role",
    convert: function (value) {
        return { value: value ? (value + "").trim() : "" };
    }
}

const gigabyte_type = {
    name: "gigabyte",
    convert: function (value) {
        const int_value = parseInt(value);
        return is_integer(value) && int_value >= 0 ? { value: int_value } : { err: 'int convert error for value:' + value };
    }
}

const seconds_type = {
    name: "seconds",
    convert: function (value) {
        const int_value = parseInt(value);
        return is_integer(value) && int_value >= 0 ? { value: int_value } : { err: 'seconds convert error for value:' + value };
    }
}

const progress_type = {
    name: "progress",
    convert: function (value) {
        const int_value = parseInt(value);
        return is_integer(value) && int_value >= 0 ? { value: int_value } : { err: 'progress convert error for value:' + value };
    }
}

const job_status_type = {
    name: "job_status",
    convert: function (value) {
        const int_value = parseInt(value);
        return is_integer(value) && int_value >= 0 ? { value: int_value } : { err: 'job_status convert error for value:' + value };
    }
}

const compare_type = {
    name: "compare",
    convert: function (value) {
        const int_value = parseInt(value);
        return is_integer(value) && int_value >= 0 ? { value: int_value } : { err: 'compare convert error for value:' + value };
    }
}

const chart_type = {
    name: "chart",
    convert: function (value) {
        const int_value = parseInt(value);
        return is_integer(value) && int_value >= 0 ? { value: int_value } : { err: 'chart type convert error for value:' + value };
    }
}

const data_type = {
    name: "data_type",
    convert: function (value) {
        const int_value = parseInt(value);
        return is_integer(value) && int_value >= 0 ? { value: int_value } : { err: 'data_type convert error for value:' + value };
    }
}

const optimizer_type = {
    name: "optimizer",
    convert: function (value) {
        const int_value = parseInt(value);
        return is_integer(value) && int_value >= 0 ? { value: int_value } : { err: 'optimizer convert error for value:' + value };
    }
}

const exec_type = {
    name: "exec_type",
    convert: function (value) {
        const int_value = parseInt(value);
        return is_integer(value) && int_value >= 0 ? { value: int_value } : { err: 'exec_type convert error for value:' + value };
    }
}

const zero_type = {
    name: "zero",
    convert: function (value) {
        const int_value = parseInt(value);
        return is_integer(value) && int_value >= 0 ? { value: int_value } : { err: 'zero convert error for value:' + value };
    }
}

const register_types = () => {
    register_type(user_status_type);
    register_type(role_type);
    register_type(gigabyte_type);
    register_type(seconds_type);
    register_type(progress_type);
    register_type(compare_type);
    register_type(job_status_type);
    register_type(chart_type);
    register_type(data_type);
    register_type(optimizer_type);
    register_type(exec_type);
    register_type(zero_type);
};

const TYPE_TRAIN = 0;
const TYPE_INFERENCE = 1;

module.exports = { register_types, TYPE_TRAIN, TYPE_INFERENCE }
