// Beregn median
export function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Tegn graf
export function renderChart(dates, counts) {
  const ctx = document.getElementById("chart").getContext("2d");

  const med = median(counts);
  const medianLine = Array(dates.length).fill(med);

  new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Daglige pauser",
          data: counts,
          borderColor: "blue",
          backgroundColor: "rgba(0,0,255,0.2)",
          tension: 0.2
        },
        {
          label: "Median",
          data: medianLine,
          borderColor: "red",
          borderDash: [6, 6],
          pointRadius: 0,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: "Dato"
          },
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          title: {
            display: true,
            text: "Antal pauser"
          },
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}
