<template>
  <div>
    <h-crud ref="table" :entity="entity" :item-label-key="item_label_key" :sort-key="sort_key" :sort-desc="sort_desc" :search-cols="search_cols" @dblclick:row="row_clicked" :batch-toolbars="toolbars"></h-crud>
  </div>
</template>

<script>
export default {
  data() {
    return {
      entity: "model",
      item_label_key: "name",
      sort_key: ["name"],
      sort_desc: [true],
      search_cols: 4,
      toolbars: [{ color: "white", icon: "mdi-compare", tooltip: this.$t("model.compare"), click: this.compare }],
    };
  },

  methods: {
    async row_clicked(evt, obj) {
      const item = obj["item"];
      this.$router.push({ path: "/model_detail/" + item["_id"] });
    },

    compare() {
      const table = this.$refs.table;
      const items = table.get_selected_items();
      if (items != null) {
        this.$router.push({ path: "/model_detail/" + items.map((item) => item["_id"]).join(",") });
      }
    },
  },
};
</script>
