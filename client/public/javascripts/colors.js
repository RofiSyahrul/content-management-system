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

  return '#' + [r * 255, g * 255, b * 255].map(x => {
    x = Math.round(x).toString(16);
    if (x.length<2) x = '0'+x;
    return x
  }).join('');
}

function generateRainbow(n=10) {
  return [...Array(n).keys()].map(i => hsvToRgb((0.85 * i) / n, 1, 1));
}
