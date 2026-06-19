import { useEffect, useId } from "react";

declare global {
  interface Window {
    BullionVaultChart?: new (options: Record<string, unknown>, containerId: string) => unknown;
  }
}

const CHART_SCRIPT_ID = "bullionvault-chart-script";
const CHART_SCRIPT_SRC = "https://www.bullionvault.com/chart/bullionvaultchart.js";

function loadBullionVaultChartScript(): Promise<void> {
  const existingScript = document.getElementById(CHART_SCRIPT_ID) as HTMLScriptElement | null;

  if (window.BullionVaultChart) {
    return Promise.resolve();
  }

  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("BullionVault chart failed to load")), {
        once: true,
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = CHART_SCRIPT_ID;
    script.src = CHART_SCRIPT_SRC;
    script.async = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("BullionVault chart failed to load")), { once: true });
    document.head.appendChild(script);
  });
}

export function BullionVaultChart() {
  const chartId = `bullionvault-chart-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    let isMounted = true;

    document.body.setAttribute("data-loggedin", "false");

    loadBullionVaultChartScript()
      .then(() => {
        if (!isMounted || !window.BullionVaultChart) {
          return;
        }

        new window.BullionVaultChart(
          {
            bullion: "silver",
            currency: "USD",
            timeframe: "6h",
            chartType: "line",
            containerDefinedSize: true,
            displayLatestPriceLine: true,
            switchBullion: true,
            switchCurrency: true,
            switchTimeframe: true,
            switchChartType: true,
            exportButton: true,
            resourcesRootPath: "https://www.bullionvault.com",
          },
          chartId,
        );
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [chartId]);

  return <section aria-label="BullionVault silver chart" className="chart-panel" id={chartId} />;
}
