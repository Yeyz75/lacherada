import { createApp } from "vue";
import App from "./App.vue";
import i18n from "./i18n";
import router from "./router";

// PrimeVue imports
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import ToastService from "primevue/toastservice";
import Tooltip from "primevue/tooltip";

// Estilos personalizados para PrimeVue
import "./styles/primevue-custom.css";

const app = createApp(App);

// Configure Vue Router
app.use(router);

// Configure PrimeVue
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: "p",
      darkModeSelector: '[data-theme="dark"]',
      cssLayer: false,
    },
  },
});

// Configure PrimeVue ToastService
app.use(ToastService);

// Configure PrimeVue Tooltip directive
app.directive("tooltip", Tooltip);

app.use(i18n);
app.mount("#app");
