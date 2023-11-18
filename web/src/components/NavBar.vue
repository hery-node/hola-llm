<template>
  <h-nav-bar :title="title" :menus="menus">
    <div slot="toolbar">
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon @click="exit_to_app" v-on="on">
            <v-icon>mdi-exit-to-app</v-icon>
          </v-btn>
        </template>
        <span>{{ $t("app.logout_hint") }}</span>
      </v-tooltip>
    </div>
  </h-nav-bar>
</template>

<script>
import { axios_get, is_success_response } from "hola-web";
import { get_menus } from "../router";

export default {
  inheritAttrs: false,

  props: {
    title: { type: String },
  },

  data() {
    return {
      role: "",
    };
  },

  async created() {
    await this.load_user_role();
  },

  computed: {
    menus() {
      return get_menus(this, this.role);
    },
  },

  methods: {
    async load_user_role() {
      const { code, role } = await axios_get("/user/role");
      if (is_success_response(code)) {
        this.role = role;
      }
    },

    async exit_to_app() {
      const { code } = await axios_get("/user/logout");
      if (is_success_response(code)) {
        this.$router.push({ name: "login" });
      }
    },
  },
};
</script>
