<template>
  <div>
    <h-crud ref="table" :entity="entity" :item-label-key="item_label_key" :sort-key="sort_key" :sort-desc="sort_desc" :search-cols="search_cols"></h-crud>
  </div>
</template>

<script>
export default {
  data() {
    return {
      entity: "measure",
      item_label_key: "name",
      sort_key: ["name"],
      sort_desc: [true],
      search_cols: 4
    };
  }
};
</script>
