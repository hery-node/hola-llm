<template>
  <div>
    <h-bread></h-bread>
    <h-array :objs="envs" class="my-5" label-key="tag" header-align="start" value-width="120px"></h-array>
  </div>
</template>

<script>
import { read_entity } from "hola-web";
export default {
  data() {
    return {
      id: this.$route.params.id,
      entity: "exec",
      envs: [],
    };
  },

  async created() {
    const server_attrs = ["name", "loop_envs"];
    const entity = await read_entity(this.entity, this.id, server_attrs.join(","));

    const array = [];
    for (let j = 0; j < entity.loop_envs.length; j++) {
      array.push({ Tag: this.$t("exec.env_param", { index: j + 1 }), ...entity.loop_envs[j] });
    }
    this.envs = array;
  },
};
</script>
