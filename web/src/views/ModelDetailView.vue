<template>
  <div>
    <h-bread></h-bread>
    <h-detail :entity="entity" :ids="ids" :attrs="attrs"></h-detail>
  </div>
</template>

<script>
export default {
  data() {
    return {
      entity: "model",
      ids: this.$route.params.ids.split(","),
      attrs: ["config", "tokenizer_config", "special_tokens_map"],
    };
  },
};
</script>
