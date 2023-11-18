const TYPE_TRAIN = 0;
const TYPE_INFERENCE = 1;

const get_headers = (type) => {
    if (type == TYPE_TRAIN) {
        return [{ name: "name" }, { name: "time" }, { name: "samples_per_second" }, { name: "steps_per_second" }, { name: "max_memory" }, { name: "loss" }, { name: "perplexity" }];
    } else {
        return [{ name: "name" }, { name: "time" }, { name: "throughput" }, { name: "latency" }, { name: "first_token" }];
    }
}

const get_metrices = (type) => {
    if (type == TYPE_TRAIN) {
        return ["samples_per_second", "steps_per_second", "max_memory", "loss", "perplexity"];
    } else {
        return ["throughput", "latency", "first_token"];
    }
}

const get_default_metric = (type) => {
    return type == TYPE_TRAIN ? "samples_per_second" : "throughput";
}

const get_high_better_metrices = () => {
    return ["throughput", "samples_per_second", "steps_per_second"];
}

export { TYPE_TRAIN, TYPE_INFERENCE, get_headers, get_metrices, get_default_metric, get_high_better_metrices }