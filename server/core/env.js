const { unique, combine } = require('hola-server').array;
const { run_in_context, get_context } = require('hola-server').lhs;
const { is_space, lhs_samples, random_number, contains_space } = require('hola-server').number;

const expand_envs = (array, n = 3) => {
    const knobs = [];
    for (const knob of array) {
        knobs.push(...expand_obj(knob, n));
    }
    return unique(knobs);
}

const expand_obj = (obj, n) => {
    const tmp_obj = { ...obj };

    const simple_obj = {};
    for (const key in tmp_obj) {
        const value = tmp_obj[key];
        if (!Array.isArray(value) && !is_space(value)) {
            simple_obj[key] = value;
            delete tmp_obj[key];
        }
    }
    let objs = [];
    objs.push(simple_obj);

    if (Object.keys(tmp_obj).length == 0) {
        return objs;
    }

    for (const key in tmp_obj) {
        const array = Array.isArray(tmp_obj[key]) ? tmp_obj[key] : lhs_samples(tmp_obj[key].min, tmp_obj[key].max, n).map(number => random_number(number.min, number.max));
        const values = array.map(o => ({ [key]: o }));
        objs = combine(objs, values);
    }

    return unique(objs);
}

const remove_comments = (str) => {
    return str.replace(/^\s*#.*$/gm, "");
}

const parse_one_line = (line) => {
    let [name, ...rest] = line.split('=').map(o => o.trim());
    rest = rest.join('=');
    return { name: name, value: rest };
}

const parse_by_js_mode = (str) => {
    const errors = [];

    let context = {};
    const var_name = "__knobs__";
    try {
        context = run_in_context(`${var_name}=${str};`, get_context());
    } catch (err) {
        errors.push(err.message);
    }

    if (errors.length > 0) {
        return { errors: errors };
    }

    const obj = context[var_name];
    const knobs = Array.isArray(obj) ? obj : [obj];
    let auto = false;

    for (const knob of knobs) {
        contains_space(knob) && (auto = true);
    }

    return { auto: auto, knobs: knobs, errors: errors };
}


const parse_by_line_mode = (str) => {
    const lines = str.split(/\r?\n/);

    const codes = [];
    const names = [];
    const obj_names = [];
    const errors = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line && line.trim().length > 0) {
            const line_trim = line.trim();
            if (line_trim.startsWith("{") && line_trim.endsWith("}")) {
                const name = `__obj__${i}`;
                obj_names.push(name);
                codes.push(`${name}=${line_trim};`);
            } else if (line_trim.includes("=")) {
                const { name, value } = parse_one_line(line_trim);
                const code_name = `__knob__${i}`;
                names.push({ name: name, code_name: code_name });
                codes.push(`${code_name}=${value};`);
            } else {
                errors.push(`wrong line at line ${i + 1}:${line_trim}`);
            }
        }
    }

    if (errors.length > 0) {
        return { errors: errors };
    }

    let context = {};
    try {
        context = run_in_context(codes.join("\n"), get_context());
    } catch (err) {
        errors.push(err.message);
    }

    if (errors.length > 0) {
        return { errors: errors };
    }

    let auto = false;
    const knobs = [];
    for (let i = 0; i < obj_names.length; i++) {
        const obj = context[obj_names[i]];
        contains_space(obj) && (auto = true);
        knobs.push(obj);
    }

    const obj = {};
    for (let i = 0; i < names.length; i++) {
        const { name, code_name } = names[i];
        obj[name] = context[code_name];
    }

    contains_space(obj) && (auto = true);
    names.length > 0 && knobs.push(obj);

    return { auto: auto, knobs: knobs, errors: errors };
}

const calcualte_size = (obj) => {
    let size = 1;
    let grid = 1;
    for (const key in obj) {
        const value = obj[key];
        if (Array.isArray(value)) {
            grid *= value.length;
            size += (value.length - 1);
        }
    }
    return { size: size, grid: grid };
}

const parse_str_to_obj = (str, template) => {
    str = remove_comments(str);

    const one_line_str = str.replace(/\n/g, "").trim();
    const js_mode = (one_line_str.startsWith("[") && one_line_str.endsWith("]")) || (one_line_str.startsWith("{") && one_line_str.endsWith("}"));
    const { auto, knobs, errors } = js_mode ? parse_by_js_mode(one_line_str) : parse_by_line_mode(str);

    if (errors.length > 0) {
        return { errors: errors };
    }

    let knobs_names = [];
    for (const knob of knobs) {
        knobs_names.push(...Object.keys(knob));
    }
    knobs_names = [...new Set(knobs_names)];

    //verify the knob defination with template to ensure you defined the right knobs
    if (template) {
        const template_knobs = extract_knob_names(template);
        const no_names = knobs_names.filter(name => !template_knobs.includes(name));
        no_names.length > 0 && (errors.push(`Knob "${no_names.join(",")}" defined but not used in bash command`));
    }

    if (errors.length > 0) {
        return { errors: errors };
    }

    if (errors.length > 0) {
        return { errors: errors };
    }

    const result = { auto: auto, knobs: knobs };
    if (auto) {
        result.size = -1;
        result.grid = -1;
    } else {
        result.size = 0;
        result.grid = 0;
        for (const knob of knobs) {
            const { size, grid } = calcualte_size(knob);
            result.size += size;
            result.grid += grid;
        }
    }

    return result;
}

const parse_envs = (str) => {
    const obj = parse_str_to_obj(str);
    if (obj.errors) {
        return obj;
    } else {
        return { envs: expand_envs(obj.knobs) };
    }
}

module.exports = { parse_envs }