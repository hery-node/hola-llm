<template>
  <div>
    <h-crud ref="table" :entity="entity" :item-label-key="item_label_key" :sort-key="sort_key" :sort-desc="sort_desc" :edit-fields="edit_fields" :expand-fields="expand_fields"></h-crud>
  </div>
</template>

<script>
export default {
  data() {
    return {
      entity: "bash",
      item_label_key: "name",
      sort_key: ["name"],
      sort_desc: [true],
      expand_fields: ["run"],
      edit_fields: [
        { name: "name", cols: 6 },
        { name: "alias", cols: 6 },
        { name: "verbose", cols: 4 },
        { name: "strict", cols: 4 },
        { name: "subprocess", cols: 4 },
        { name: "run", cols: 12 },
      ],
    };
  },
};
</script>
