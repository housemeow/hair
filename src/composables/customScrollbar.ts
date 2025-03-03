import { onMounted } from "vue";
import './customScrollbar.scss';

export function useCustomScrollbar() {
  onMounted(() => {
    const isWindows = navigator.userAgent.includes("Windows");

    if (isWindows || true) {
      document.body.classList.add("custom-scroller");
    }
  });
}
