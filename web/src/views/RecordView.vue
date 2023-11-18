<template>
  <div>
    <h-bread></h-bread>
    <h-crud ref="table" :entity="entity" :headers="headers" :search-fields="search_fields" :toolbars="toolbars" :batch-toolbars="batch_toolbars" :item-label-key="item_label_key" expand-as-text :sort-key="sort_key" :sort-desc="sort_desc" :filter="exec_filter" :search-cols="search_cols" :expand-fields="expand_fields" header-uppcase @dblclick:row="row_clicked"></h-crud>
  </div>
</template>

<script>
import { get_headers } from "../core/record";
export default {
  data() {
    return {
      entity: "record",
      item_label_key: "name",
      sort_key: ["time"],
      sort_desc: [false],
      search_cols: 6,
      headers: get_headers(this.$route.params.type),
      search_fields: get_headers(this.$route.params.type),
      expand_fields: ["env", "cmd", "log"],
      toolbars: [{ color: "white", icon: "mdi-vector-combine", tooltip: this.$t("record.combine_view"), click: this.combine_view }],
      batch_toolbars: [{ color: "white", icon: "mdi-compare", tooltip: this.$t("record.compare"), click: this.compare }],
    };
  },

  computed: {
    exec_id() {
      return this.$route.params.exec;
    },

    type() {
      return this.$route.params.type;
    },

    exec_filter() {
      return { exec: this.exec_id };
    },
  },

  methods: {
    row_clicked(evt, obj) {
      const item = obj["item"];
      this.$router.push({ path: `/record_detail/${item["_id"]}/${this.type}` });
    },

    combine_view() {
      this.$router.push({ path: `/exec_combine/${this.exec_id}` });
    },

    compare() {
      const table = this.$refs.table;
      const items = table.get_selected_items();
      if (items != null) {
        this.$router.push({ path: `/record_detail_compare/${items.map((item) => item["_id"]).join(",")}/${this.type}` });
      }
    },
  },
};
</script>
