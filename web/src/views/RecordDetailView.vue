<template>
  <div>
    <h-bread></h-bread>
    <v-card flat>
      <v-tabs v-model="tab" align-with-title grow>
        <v-tabs-slider color="orange darken-3"></v-tabs-slider>
        <v-tab v-if="ids.length > 1">{{ $t("record.tab_dashboard") }}</v-tab>
        <v-tab v-for="item in items" :key="item.name">
          {{ item.label }}
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item v-if="ids.length > 1">
          <h-perf-dashboard :ids="ids"></h-perf-dashboard>
        </v-tab-item>
        <v-tab-item v-for="item in items" class="mt-3" :key="item.name">
          <div v-if="item.text" class="ma-3">
            <pre>{{ item.text }}</pre>
          </div>
          <template v-else-if="item.charts">
            <v-row>
              <v-col :cols="chart_cols" v-for="chart in item.charts" :key="chart.name">
                <h-line-chart :title="chart.label" :data="chart.chart_data" :unit="chart.unit" :chart-style="chart.style" :type="chart.type" :height="chart.height"></h-line-chart>
              </v-col>
            </v-row>
          </template>
          <template v-else-if="item.objs">
            <h-compare header-align="start" value-width="300px" dense show-toolbar header-uppcase label-key="tag" :objs="item.objs"></h-compare>
          </template>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </div>
</template>
<script>
import { read_entity, merge_chart_data, capitalize } from "hola-web";

export default {
  data() {
    return {
      tab: null,
      entity: "record",
      chart_cols: 12,
      items: [],
      ids: this.$route.params.ids.split(","),
    };
  },

  async created() {
    await this.load();
  },

  methods: {
    create_loss_chart(records, name) {
      const charts = [];
      const chart_names = ["loss", "memory_allocated (GB)", "learning_rate"];
      for (let i = 0; i < chart_names.length; i++) {
        const chart_name = chart_names[i];
        let chart_data = [];
        for (let j = 0; j < records.length; j++) {
          const record_obj = records[j][name];
          if (record_obj.array) {
            const field_chart_data = this.create_time_chart_data(
              record_obj.tag,
              record_obj.array.map((o) => o[chart_name])
            );
            if (chart_data.length == 0) {
              chart_data = field_chart_data;
            } else {
              merge_chart_data(chart_data, field_chart_data);
            }
          }
        }
        chart_data.length > 0 && charts.push({ name: chart_name, chart_data: chart_data, label: capitalize(chart_name.replaceAll("_", " ")), unit: chart_name.includes("GB") ? "GB" : "", style: {}, height: "400px", type: "line" });
      }
      return { charts: charts };
    },

    async load() {
      if (!this.ids || this.ids.length <= 0) {
        return;
      }
      const logs = new Set();
      const names = new Set();

      for (let i = 0; i < this.ids.length; i++) {
        const id = this.ids[i];
        const record = await read_entity(this.entity, id, "log,log_names");
        record.log && logs.add(record.log);
        if (record.log_names) {
          for (let i = 0; i < record.log_names.length; i++) {
            names.add(record.log_names[i]);
          }
        }
      }

      const names_array = [...names];
      const records = [];
      for (let i = 0; i < this.ids.length; i++) {
        const id = this.ids[i];
        const record = await read_entity(this.entity, id, names_array.join(","));
        records.push(record);
      }

      const compare_mode = this.ids.length > 1;
      const items = [];
      const log_array = [...logs];

      if (!compare_mode && log_array.length == 1) {
        items.push({ name: "log", label: this.$t("record.log"), text: log_array[0] });
      }

      for (let i = 0; i < names_array.length; i++) {
        const name = names_array[i];
        const obj = name == "losses" ? this.create_loss_chart(records, "losses") : { objs: records.map((o) => o[name]) };
        items.push({ name: name, label: name.replaceAll("_", " ").toUpperCase(), ...obj });
      }

      this.items = items;
    },

    create_time_chart_data(tag, array) {
      const chart_data = [];

      const headers = ["time"];
      headers.push(tag);
      chart_data.push(headers);

      for (let i = 0; i < array.length; i++) {
        const line_array = [i + 1];
        const line = array[i];
        line_array.push(parseFloat(parseFloat(line).toFixed(2)));
        chart_data.push(line_array);
      }
      return chart_data;
    },
  },
};
</script>
