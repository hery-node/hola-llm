<template>
  <v-system-bar window class="system_bar mb-5">
    <v-breadcrumbs :items="items">
      <template v-slot:divider>
        <v-icon>mdi-chevron-right</v-icon>
      </template>
    </v-breadcrumbs>
    <v-spacer></v-spacer>
    <v-icon @click="close">mdi-close</v-icon>
  </v-system-bar>
</template>

<script>
import { read_property } from "hola-web";
import { TYPE_TRAIN } from "../core/record";

export default {
  inheritAttrs: false,

  props: {},

  data: () => ({
    home: "/dashboard",
    items: [],
  }),

  async created() {
    const current = this.$router.history.current;
    const paths = current.path.split("/");
    const name = paths[1];

    if (name == "record") {
      const exec_id = paths[2];
      const exec = await read_property("exec", exec_id, "name,type");
      const title = exec.type == TYPE_TRAIN ? this.$t("exec.training") : this.$t("exec.inference");
      this.items = [
        { text: title, disabled: false, href: `/exec/${exec.type}` },
        { text: this.$t("record.table_title", { exec: exec.name }), disabled: true, href: "" },
      ];
    } else if (name == "record_detail" || name == "record_detail_compare") {
      const ids = paths[2].split(",");
      const record_id = ids[0];
      const record = await read_property("record", record_id, "name,exec");
      const exec = await read_property("exec", record.exec, "name,type");
      this.items = [
        { text: exec.type == TYPE_TRAIN ? this.$t("exec.training") : this.$t("exec.inference"), disabled: false, href: `/exec/${exec.type}` },
        { text: this.$t("record.table_title", { exec: exec.name }), disabled: false, href: `/record/${exec._id}/${exec.type}` },
        { text: ids.length == 1 ? this.$t("record.table_title_detail", { record: record.name }) : this.$t("record.table_title_detail_compare"), disabled: true, href: "" },
      ];
    } else if (name == "model_detail") {
      const ids = paths[2].split(",");
      let table_title = "";
      if (ids.length == 1) {
        const model = await read_property("model", ids[0], "name");
        table_title = this.$t("model.table_title", { model: model.name });
      } else {
        const names = [];
        for (let i = 0; i < ids.length; i++) {
          const model = await read_property("model", ids[i], "name");
          names.push(model.name);
        }
        table_title = this.$t("model.compare_table_title", { model: names.join(",") });
      }

      this.items = [
        { text: this.$t("menu.model"), disabled: false, href: "/model" },
        { text: table_title, disabled: true, href: "" },
      ];
    } else if (name == "env_list") {
      const exec_id = paths[2];
      const exec = await read_property("exec", exec_id, "name,type");
      this.items = [
        { text: exec.type == TYPE_TRAIN ? this.$t("exec.training") : this.$t("exec.inference"), disabled: false, href: `/exec/${exec.type}` },
        { text: this.$t("exec.envs", { exec: exec.name }), disabled: true, href: "" },
      ];
    } else if (name == "compare_results") {
      const ids = paths[2].split(",");
      const names = [];
      const type = this.$route.params.type;
      for (let i = 0; i < ids.length; i++) {
        const exec = await read_property("exec", ids[i], "name,type");
        names.push(exec.name);
      }
      this.items = [
        { text: type == TYPE_TRAIN ? this.$t("exec.training") : this.$t("exec.inference"), disabled: false, href: `/exec/${type}` },
        { text: this.$t("exec.compare_table_title", { exec: names.join(" , ") }), disabled: true, href: "" },
      ];
    } else if (name == "compare_results_detail_compare") {
      const ids = paths[2].split(",");
      const record_names = [];
      const exec_ids = [];
      const exec_names = [];
      const type = this.$route.params.type;
      for (let i = 0; i < ids.length; i++) {
        const record = await read_property("record", ids[i], "name,exec");
        record_names.push(record.name);
        const exec = await read_property("exec", record.exec, "name");
        exec_ids.push(exec._id);
        exec_names.push(exec.name);
      }
      this.items = [
        { text: type == TYPE_TRAIN ? this.$t("exec.training") : this.$t("exec.inference"), disabled: false, href: `/exec/${type}` },
        { text: this.$t("exec.compare_table_title", { exec: exec_names.join(" , ") }), disabled: false, href: `/compare_results/${exec_ids.join(",")}/${type}` },
        { text: this.$t("record.compare_table_title", { record: record_names.join(" , ") }), disabled: true, href: "" },
      ];
    } else if (name == "exec_combine") {
      const exec_id = paths[2];
      const exec = await read_property("exec", exec_id, "name,type");
      this.items = [
        { text: exec.type == TYPE_TRAIN ? this.$t("exec.training") : this.$t("exec.inference"), disabled: false, href: `/exec/${exec.type}` },
        { text: this.$t("record.table_title", { exec: exec.name }), disabled: false, href: `/record/${exec._id}/${exec.type}` },
        { text: this.$t("record.combine_title", { exec: exec.name }), disabled: true, href: "" },
      ];
    }
  },
  methods: {
    close() {
      if (this.items.length > 1) {
        const last = this.items[this.items.length - 2];
        const path = this.$router.history.current.path;
        path != this.home && this.$router.push({ path: last.href });
      }
    },
  },
};
</script>
