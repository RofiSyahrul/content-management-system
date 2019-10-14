function hsvToRgb(h, s, v) {
  var r, g, b;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }

  return (
    "#" +
    [r * 255, g * 255, b * 255]
      .map(x => {
        x = Math.round(x).toString(16);
        if (x.length < 2) x = "0" + x;
        return x;
      })
      .join("")
  );
}

const factors = {
  10: [5, 2, 1],
  15: [5, 3, 1],
  20: [10, 2, 1],
  30: [10, 3, 1],
  40: [10, 2, 2],
  50: [10, 5, 1],
  80: [10, 4, 2],
  100: [10, 5, 2],
  200: [10, 5, 4],
  300: [10, 6, 5],
  400: [10, 8, 5],
  500: [10, 10, 5]
};

function generateRainbow(n = 10) {
  const factor = Object.keys(factors).filter(x => n <= x)[0] || 500;
  const [hCount, sCount, vCount] = factors[factor];
  let colors = [];
  for (k = vCount; k >= 1; k--) {
    for (j = 1; j <= sCount; j++) {
      for (i = 0; i < hCount; i++) {
        colors.push(
          hsvToRgb((i * 0.95) / hCount, (j * 0.9) / sCount + 0.1, k / vCount)
        );
      }
    }
  }
  return [...Array(n).keys()].map(i => colors[Math.floor((i * factor) / n)]);
}
