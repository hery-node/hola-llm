<template>
  <div>
    <h-crud ref="table" :entity="entity" :item-label-key="item_label_key" :sort-key="sort_key" :sort-desc="sort_desc" :expand-fields="expand_fields"></h-crud>
  </div>
</template>

<script>
export default {
  data() {
    return {
      entity: "docker",
      item_label_key: "name",
      sort_key: ["name"],
      sort_desc: [true],
      expand_fields: ["env", "file", "run"],
    };
  },
};
</script>
