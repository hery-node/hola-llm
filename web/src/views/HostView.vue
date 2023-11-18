<template>
  <div>
    <h-crud ref="table" :entity="entity" :item-label-key="item_label_key" :sort-key="sort_key" :sort-desc="sort_desc" :search-cols="search_cols" :actions="actions"></h-crud>
  </div>
</template>

<script>
export default {
  data() {
    return {
      entity: "host",
      item_label_key: "name",
      sort_key: ["name"],
      sort_desc: [true],
      search_cols: 6,
      actions: [
        { color: "edit", icon: "mdi-console", tooltip: this.$t("host.terminal"), handle: this.show_terminal },
      ]
    };
  },
  methods: {
    show_terminal(item) {
      this.$emit("show_term", { item: item });
    },
  }
};
</script>
