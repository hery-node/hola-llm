<template>
  <div>
    <h-crud ref="table" :entity="entity" :item-label-key="item_label_key" :sort-key="sort_key" :sort-desc="sort_desc" :search-cols="search_cols" :headers="headers" :search-fields="search_fields" :expand-fields="expand_fields" :toolbars="toolbars"></h-crud>
  </div>
</template>

<script>
import { axios_post, is_success_response } from "hola-web";

export default {
  data() {
    return {
      entity: "log",
      item_label_key: "time",
      search_cols: 4,
      sort_key: ["time"],
      sort_desc: [true],
      expand_fields: ["msg"],
      search_fields: [{ name: "time" }, { name: "category" }, { name: "level" }],
      headers: [{ name: "time" }, { name: "category" }, { name: "level" }, { name: "path" }],
      toolbars: [{ color: "white", icon: "mdi-delete-forever", tooltip: this.$t("log.clear"), click: this.clear_logs }],
    };
  },

  methods: {
    async clear_logs() {
      const url = "/log/clear";
      const { code } = await axios_post(url, {});
      if (is_success_response(code) && this.$refs.table) {
        this.$refs.table.refresh();
      }
    },
  },
};
</script>
