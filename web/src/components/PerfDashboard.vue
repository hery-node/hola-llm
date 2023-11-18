<template>
  <v-container fluid>
    <v-row>
      <v-col class="d-flex" cols="10">&nbsp;</v-col>
      <v-col class="d-flex" cols="2">
        <v-select v-model="metric" :items="perf_metric" :label="$t('record.perf_metric')" outlined></v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card class="my-10">
          <v-sheet class="v-sheet--offset mx-auto" elevation="12" max-width="calc(100% - 32px)">
            <h-combo-chart :data="chart_data" :height="chart_height"></h-combo-chart>
          </v-sheet>
          <v-card-text class="pt-0">
            <div class="text-h6 font-weight-light mb-2">{{ $t("record.dashboard_perf_title") }}</div>
            <div>
              <h-crud ref="table" :entity="entity" :mode="mode" @loaded="redraw_chart" hide-toolbar :filter="id_filter" :item-label-key="item_label_key" :headers="headers" :expand-fields="expand_fields" :sort-key="sort_key" :sort-desc="sort_desc" :item-class="get_item_class" :actions="actions" action-width="30px"></h-crud>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { get_headers, get_metrices, get_default_metric, get_high_better_metrices } from "../core/record";
export default {
  data() {
    return {
      entity: "record",
      mode: "e",
      data_items: [],
      item_label_key: "name",
      sort_key: ["time"],
      sort_desc: [false],
      expand_fields: ["log"],
      actions: [
        { color: "edit", icon: "mdi-eye", tooltip: this.$t("record.mark_as_baseline"), handle: this.mark_as_baseline },
        { color: "delete", icon: "mdi-arrow-up", tooltip: this.$t("record.move_up"), handle: this.move_up },
      ],
      chart_height: "500px",
      chart_data: [],
      metric: get_default_metric(this.$route.params.type),
    };
  },

  computed: {
    id_filter() {
      return { _id: this.$route.params.ids };
    },

    type() {
      return this.$route.params.type;
    },

    headers() {
      return get_headers(this.type);
    },

    perf_metric() {
      return get_metrices(this.type);
    },
  },

  watch: {
    metric: {
      handler() {
        this.redraw_chart(this.data_items);
      },
    },
  },

  methods: {
    get_item_class(item) {
      return item["baseline"] == true ? "red lighten-4" : "";
    },

    redraw_chart(items) {
      if (items.length < 1) {
        return;
      }

      const high_better_metrics = get_high_better_metrices();
      const baseline_obj = items[0];
      const suffix = high_better_metrics.includes(this.metric) ? this.$t("record.high_is_better") : this.$t("record.low_is_better");
      const baseline_text = this.$t("record.baseline_suffix");
      const chart_data = [];
      const header = [this.$t("record.name"), this.metric + " ( " + suffix + " ) ", this.$t("record.normalized_perf", { attr: this.metric }) + " ( " + suffix + " ) "];
      chart_data.push(header);
      const baseline = parseFloat(baseline_obj[this.metric]);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (i == 0) {
          item.baseline = true;
          item.name = item.name.includes(baseline_text) ? item.name : item.name + baseline_text;
        } else {
          item.baseline = false;
          item.name = item.name.replace(baseline_text, "");
        }
        const value = parseFloat(item[this.metric]);
        const row = [];
        row.push(item.name);
        row.push(value);
        row.push(parseFloat((value / baseline).toFixed(2)));
        chart_data.push(row);
      }
      this.data_items = items;
      this.chart_data = chart_data;
    },

    move_item(array, to, from) {
      const item = array[from];
      array.splice(from, 1);
      array.splice(to, 0, item);
      return array;
    },

    mark_as_baseline(item) {
      const index = this.data_items.findIndex((object) => {
        return object._id + "" == item._id + "";
      });
      if (index > 0) {
        this.move_item(this.data_items, 0, index);
        this.redraw_chart(this.data_items);
      }
    },

    move_up(item) {
      const index = this.data_items.findIndex((object) => {
        return object._id + "" == item._id + "";
      });
      if (index > 0) {
        this.move_item(this.data_items, index - 1, index);
        this.redraw_chart(this.data_items);
      }
    },
  },
};
</script>
<style>
.v-sheet--offset {
  top: -24px;
  position: relative;
}
</style>
