<template>
  <h-crud :entity="entity" :item-label-key="item_label_key" :sort-key="sort_key" :sort-desc="sort_desc" :search-cols="search_cols" :update-view="update_view"></h-crud>
</template>

<script>
export default {
  data() {
    return {
      entity: "user",
      item_label_key: "name",
      sort_key: ["name"],
      sort_desc: [false],
      search_cols: 6,
      update_view: "0",
    };
  },
};
</script>
