<template>
  <v-app id="login" class="primary">
    <v-main>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md6 lg4>
            <v-form ref="form" @submit.prevent="login">
              <v-card class="elevation-1 pa-3">
                <v-card-text>
                  <div class="layout column align-center">
                    <h1 class="flex my-4 primary--text text-h4">{{ $t("login.title") }}</h1>
                    <img src="../assets/logo.jpg" :alt="$t('login.title')" width="663" height="442" class="my-5" />
                  </div>
                  <v-text-field append-icon="mdi-space-station" :label="$t('login.name')" type="text" v-model="name" :rules="rules" :autofocus="true" />
                  <v-text-field :type="showPassword ? 'text' : 'password'" :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :label="$t('login.password')" :rules="rules" v-model="password" @click:append="showPassword = !showPassword" />
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn type="submit" block color="primary" :loading="loading">{{ $t("login.button") }}</v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </v-flex>
        </v-layout>
      </v-container>

      <v-snackbar v-model="snackbar" :timeout="4000" top color="error">
        <span>{{ result }}</span>
        <v-btn color="white" text @click="snackbar = false">{{ $t("login.close") }}</v-btn>
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script>
import { axios_post, is_success_response } from "hola-web";

export default {
  data() {
    return {
      loading: false,
      snackbar: false,
      name: "",
      password: "",
      showPassword: false,
      result: "",
      rules: [(v) => !!v || this.$t("login.required")],
    };
  },

  methods: {
    show_error(error) {
      this.result = error;
      this.snackbar = true;
    },

    async login() {
      if (!this.$refs.form.validate()) {
        this.show_error(this.$t("login.error"));
        return;
      }

      this.loading = true;

      const url = "/user/login";
      const { code, root } = await axios_post(url, { name: this.name, password: this.password });
      if (is_success_response(code)) {
        this.$router.push({ name: root ? "user" : "dashboard" });
      } else {
        this.snackbar = true;
        this.result = this.$t("login.not_matched");
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped lang="css">
#login {
  height: 50%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  content: "";
  z-index: 0;
}
</style>
