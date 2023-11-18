<template>
  <v-card flat>
    <v-tabs v-model="tab" background-color="transparent" grow class="mt-5">
      <v-tab v-for="item in items" :key="item.name">
        {{ item.label }}
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item v-for="item in items" class="mt-3 text-center" :key="item.name">
        <template v-if="item.text">
          <pre>{{ item.text }}</pre>
        </template>
        <template v-else-if="item.fields">
          <h-compare-entity dense header-align="start" value-width="300px" :entity="entity" :max-line-words="max_line_words" :download-excel-name="item.fields[0].name + '.xlsx'" show-toolbar header-uppcase :search-hint="item.hint" label-key="tag" :ids="ids" :fields="item.fields"></h-compare-entity>
        </template>
        <template v-else-if="item.field">
          <h-array-entity dense :entity="entity" show-toolbar header-uppcase :id="ids[0]" :field-name="item.field"></h-array-entity>
        </template>
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>
<script>
export default {
  props: {
    entity: { type: String, required: true },
    ids: { type: Array, required: true },
    attrs: { type: Array, required: true },
  },

  data() {
    return {
      tab: null,
      items: [],
      max_line_words: -1,
    };
  },

  async created() {
    await this.load();
  },

  methods: {
    async load() {
      if (!this.ids || this.ids.length <= 0) {
        return;
      }
      const items = [];
      for (let i = 0; i < this.attrs.length; i++) {
        const attr = this.attrs[i];
        items.push({ name: attr, label: this.$t(`${this.entity}.${attr}`), fields: [{ name: attr }] });
      }
      this.items = items;
    },
  },

  watch: {
    ids: {
      handler() {
        this.load();
      },
    },
  },
};
</script>
