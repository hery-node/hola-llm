import LoginView from "../views/LoginView.vue";
import UserView from "../views/UserView.vue";
import LogView from "../views/LogView.vue";

import DashboardView from "../views/DashboardView.vue";
import SSHPrivateKeyView from "../views/SSHPrivateKeyView.vue";
import BashView from "../views/BashView.vue";
import HostView from "../views/HostView.vue";
import DockerView from "../views/DockerView.vue";
import MeasureView from "../views/MeasureView.vue";
import ExecView from "../views/ExecView.vue";
import ModelView from "../views/ModelView.vue";
import ModelDetailView from "../views/ModelDetailView.vue";
import MemoryView from "../views/MemoryView.vue";
import EnvListView from "../views/EnvListView.vue";
import RecordView from "../views/RecordView.vue";
import ExecCombineView from "../views/ExecCombineView.vue";
import RecordDetailView from "../views/RecordDetailView.vue";
import CompareResultsView from "../views/CompareResultsView.vue";

const routes = [
  { path: '/', name: 'login', component: LoginView, meta: { login: true } },
  { path: '/user', name: 'user', component: UserView },
  { path: '/log', name: 'log', component: LogView },
  { path: '/dashboard', name: 'dashboard', component: DashboardView },
  { path: '/ssh_private_key', name: 'ssh_private_key', component: SSHPrivateKeyView },
  { path: '/bash', name: 'bash', component: BashView },
  { path: '/host', name: 'host', component: HostView },
  { path: '/docker', name: 'docker', component: DockerView },
  { path: '/measure', name: 'measure', component: MeasureView },
  { path: '/exec/:type', name: 'exec', component: ExecView },
  { path: '/model', name: 'model', component: ModelView },
  { path: '/model_detail/:ids', name: 'model_detail', component: ModelDetailView },
  { path: '/memory', name: 'memory', component: MemoryView },
  { path: '/env_list/:id', name: 'env_list', component: EnvListView },
  { path: '/record/:exec/:type', name: 'record', component: RecordView },
  { path: '/exec_combine/:id', name: 'exec_combine', component: ExecCombineView },
  { path: '/record_detail/:ids/:type', name: 'record_detail', component: RecordDetailView },
  { path: '/record_detail_compare/:ids/:type', name: 'record_detail_compare', component: RecordDetailView },
  { path: '/compare_results/:ids/:type', name: 'compare_results', component: CompareResultsView },
  { path: '/compare_results_detail_compare/:ids/:type', name: 'compare_results_detail_compare', component: RecordDetailView },
  { path: "*", component: LoginView }
];

const get_menus = (ctx, role) => {
  const menus = role == "admin" ? [
    {
      title: ctx.$t("menu.app_console"),
      menus: [
        { icon: "mdi-account", title: ctx.$t("menu.user_view"), route: "/user" },
        { icon: "mdi-bug-outline", title: ctx.$t("menu.log_view"), route: "/log" },
      ],
    },
  ] : [
    {
      title: ctx.$t("menu.file_console"),
      menus: [
        { icon: "mdi-key-outline", title: ctx.$t("menu.ssh_private_key"), route: "/ssh_private_key" },
        { icon: "mdi-bash", title: ctx.$t("menu.bash"), route: "/bash" },
        { icon: "mdi-docker", title: ctx.$t("menu.docker"), route: "/docker" }
      ],
    },
    {
      title: ctx.$t("menu.llm_setting"),
      menus: [
        { icon: "mdi-desktop-classic", title: ctx.$t("menu.host"), route: "/host" },
        { icon: "mdi-head-snowflake-outline", title: ctx.$t("menu.model"), route: "/model" },
      ],
    },
    {
      title: ctx.$t("menu.process"),
      menus: [
        { icon: "mdi-brain", title: ctx.$t("menu.training"), route: "/exec/0" },
        { icon: "mdi-chat-processing-outline", title: ctx.$t("menu.inference"), route: "/exec/1" }
      ],
    },
    {
      title: ctx.$t("menu.system"),
      menus: [
        { icon: "mdi-bug-outline", title: ctx.$t("menu.log"), route: "/log" }
      ],
    }];
  return menus;
}

export { routes, get_menus };
