<template>
  <div>
    <h-crud ref="table" :entity="entity" :mode="mode" :item-label-key="item_label_key" :sort-key="sort_key" :sort-desc="sort_desc"></h-crud>
  </div>
</template>

<script>
export default {
  data() {
    return {
      entity: "key",
      mode:"crud",
      item_label_key: "name",
      sort_key: ["name"],
      sort_desc: [true]
    };
  },
};
</script>
