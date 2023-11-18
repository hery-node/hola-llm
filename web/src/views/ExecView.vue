<template>
  <div>
    <h-crud ref="table" :entity="entity" :search-fields="search_fields" :entity-label="entity_label" :chip-fields-map="chip_field_map" :action-width="action_width" :filter="hidden_values" show-detail-error chip-clickable :edit-fields="edit_fields" @dblclick:row="row_clicked" header-uppcase :item-label-key="item_label_key" :sort-key="sort_key" :sort-desc="sort_desc" :search-cols="search_cols" :actions="actions" :hidden-values="hidden_values" :batch-toolbars="batch_toolbars"></h-crud>
  </div>
</template>

<script>
import { axios_get, is_success_response } from "hola-web";
import { TYPE_TRAIN } from "../core/record";

export default {
  data() {
    return {
      entity: "exec",
      item_label_key: "name",
      sort_key: ["name"],
      sort_desc: [true],
      search_cols: 6,
      action_width: "200px",
      hidden_values: { type: this.$route.params.type },
      search_fields: [{ name: "name" }, { name: "host" }, { name: "docker" }, { name: "model" }, { name: "script" }],
      edit_fields: [
        { name: "name", cols: 12 },
        { name: "loop", cols: 12 },
        { name: "env", cols: 12 },
        { name: "host", cols: 6 },
        { name: "docker", cols: 6 },
        { name: "model", cols: 6 },
        { name: "script", cols: 6 },
        { name: "record", cols: 12 },
      ],
      chip_field_map: {
        bash: [
          { name: "name", cols: 6 },
          { name: "alias", cols: 6 },
          { name: "verbose", cols: 4 },
          { name: "strict", cols: 4 },
          { name: "subprocess", cols: 4 },
          { name: "run", cols: 12 },
        ],
      },
      batch_toolbars: [{ color: "white", icon: "mdi-compare", tooltip: this.$t("exec.compare_results"), click: this.compare_results }],
      actions: [
        { color: "edit", icon: "mdi-run", tooltip: this.$t("exec.happy_run"), handle: this.run_exec, shown: (item) => !this.is_running(item) },
        { color: "delete", icon: "mdi-stop", tooltip: this.$t("exec.stop"), handle: this.stop_exec, shown: (item) => this.is_running(item), animate: true },
        { color: "edit", icon: "mdi-console", tooltip: this.$t("exec.interactive_run"), handle: this.exec_run },
        { color: "edit", icon: "mdi-cog-outline", tooltip: this.$t("exec.envs_button"), handle: this.list_params },
      ],
    };
  },
  computed: {
    type() {
      return this.$route.params.type;
    },

    entity_label() {
      return this.type == TYPE_TRAIN ? this.$t("exec.training") : this.$t("exec.inference");
    },
  },

  methods: {
    exec_run(item) {
      this.$emit("show_term", { item: item, command: "exec" });
    },

    async row_clicked(evt, obj) {
      const item = obj["item"];
      this.$router.push({ path: `/record/${item["_id"]}/${this.type}` });
    },

    list_params(item) {
      this.$router.push({ path: "/env_list/" + item["_id"] });
    },

    is_running(item) {
      if (!item["progress"]) {
        return false;
      }
      const progress = parseInt(item["progress"]);
      return progress > 0 && progress < 100;
    },

    compare_results() {
      const table = this.$refs.table;
      const items = table.get_selected_items();
      if (items != null) {
        this.$router.push({ path: `/compare_results/${items.map((item) => item["_id"]).join(",")}/${this.type}` });
      }
    },

    async run_exec(item) {
      const title = this.$t("exec.run");
      const table = this.$refs.table;

      const msg = this.$t("exec.run_confirm", { exec: item["name"] });
      const res = await table.show_confirm(title, msg);
      if (res) {
        const url = "/exec/run";
        const { code } = await axios_get(url, { id: item["_id"] });
        if (is_success_response(code)) {
          table.refresh();
        }
      }
    },

    async stop_exec(item) {
      const title = this.$t("exec.stop");
      const table = this.$refs.table;

      const msg = this.$t("exec.stop_confirm", { exec: item["name"] });
      const res = await table.show_confirm(title, msg);
      if (res) {
        const url = "/exec/stop";
        const { code } = await axios_get(url, { id: item["_id"] });
        if (is_success_response(code)) {
          table.refresh();
        }
      } else {
        table.refresh();
      }
    },
  },
};
</script>
