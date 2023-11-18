<template>
  <v-container fluid>
    <h-bread></h-bread>
    <h-array :objs="items" show-toolbar :download-excel-name="excel_name"></h-array>
  </v-container>
</template>

<script>
import { axios_get, is_success_response, read_property } from "hola-web";

export default {
  data() {
    return {
      excel_name: "results.xlsx",
      items: [],
    };
  },

  async created() {
    await this.load();
  },

  methods: {
    async load() {
      const exec_id = this.$route.params.id;
      const exec = await read_property("exec", exec_id, "name");
      this.excel_name = `${exec.name.replaceAll(" ", "_")}.xlsx`;

      const url = "/exec/combine_results";
      const { code, data } = await axios_get(url, { id: exec_id });
      if (is_success_response(code)) {
        this.items = data;
      }
    },
  },
};
</script>
