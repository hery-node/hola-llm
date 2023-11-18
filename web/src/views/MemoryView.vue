<template>
  <div>
    <h-crud ref="table" :entity="entity" :item-label-key="item_label_key" :sort-key="sort_key" :sort-desc="sort_desc" :search-cols="search_cols" :cols="cols" :expand-fields="expand_fields"></h-crud>
  </div>
</template>

<script>
export default {
  data() {
    return {
      entity: "memory",
      item_label_key: "name",
      sort_key: ["name"],
      sort_desc: [true],
      cols: 4,
      search_cols: 4,
      expand_fields: ["summary"],
    };
  },
  methods: {},
};
</script>
