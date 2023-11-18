<template>
  <v-container fluid>
    <h-bread></h-bread>
    <v-row>
      <v-col class="d-flex" cols="10">&nbsp;</v-col>
      <v-col class="d-flex" cols="2">
        <v-select v-model="metric" :items="perf_metric" :label="$t('record.perf_metric')" outlined></v-select>
      </v-col>
    </v-row>
    <h-array :objs="items" :actions="actions" show-toolbar download-excel-name="results.xlsx"></h-array>
  </v-container>
</template>

<script>
import { axios_get, is_success_response } from "hola-web";
import { get_metrices, get_default_metric } from "../core/record";

export default {
  data() {
    return {
      items: [],
      metric: get_default_metric(this.$route.params.type),
      actions: [{ color: "edit", icon: "mdi-compare", tooltip: this.$t("exec.compare_results"), handle: this.compare_results }],
    };
  },

  computed: {
    type() {
      return this.$route.params.type;
    },

    perf_metric() {
      return get_metrices(this.type);
    },
  },

  async created() {
    await this.load();
  },

  watch: {
    metric: {
      handler() {
        this.load();
      },
    },
  },

  methods: {
    async load() {
      const url = "/exec/compare_results";
      const { code, data } = await axios_get(url, { ids: this.$route.params.ids, attr: this.metric });
      if (is_success_response(code)) {
        this.items = data;
      }
    },

    compare_results(item) {
      this.$router.push({ path: `/compare_results_detail_compare/${item["_id"]}/${this.type}` });
    },
  },
};
</script>
