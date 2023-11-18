const { init_router } = require('hola-server');

module.exports = init_router({
    collection: "record",
    creatable: false,
    readable: true,
    updatable: false,
    cloneable: false,
    deleteable: true,
    primary_keys: ["owner", "name", "exec"],
    ref_label: "name",
    user_field: "owner",
    fields: [
        { name: "owner", required: true, ref: "user", delete: "cascade" },
        { name: "name", type: "string", required: true },
        { name: "time", type: "string", required: true },
        { name: "exec", type: "string", ref: "exec", required: true },
        //run env setting
        { name: "env", type: "string" },
        //execution command
        { name: "cmd", type: "string" },
        { name: "log", type: "string" },
        //performance for training
        { name: "samples_per_second", type: "string" },
        { name: "steps_per_second", type: "string" },
        { name: "loss", type: "string" },
        { name: "perplexity", type: "string" },
        { name: "max_memory", type: "string" },
        // performance for inference
        { name: "throughput", type: "string" },
        { name: "latency", type: "string" },
        { name: "first_token", type: "string" },
        // end performance
        { name: "log_names", type: "array" },
        //record env with performance
        { name: "result", type: "obj" }
    ],
});