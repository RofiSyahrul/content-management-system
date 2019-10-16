const apiData = "http://localhost:3001/api/maps";

const getData = () => {
  $.ajax({
    url: apiData,
    method: "GET"
  }).done(response => {
    showChart(response.data);
  });
};

const showChart = dataMaps => {
  google.charts.load("current", {
    packages: ["map"],
    mapsApiKey: "AIzaSyDvp5CKHX1e1_TP_JizSu5gW4oS4rb1Yy0"
  });
  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
    let markers = ["blue", "green", "pink"];
    dataMaps = dataMaps.map(item => [
      item.lat,
      item.long,
      item.title,
      markers[Math.floor(Math.random() * 3)]
    ]);
    dataMaps.unshift(["Lat", "Long", "Name", "Marker"]);
    let data = google.visualization.arrayToDataTable(dataMaps);

    let url =
      "https://icons.iconarchive.com/icons/icons-land/vista-map-markers/48/";
    let options = {
      showTooltip: true,
      showInfoWindow: true,
      // zoomLevel: 12,
      icons: {
        blue: {
          normal:   url + 'Map-Marker-Ball-Azure-icon.png',
          selected: url + 'Map-Marker-Ball-Right-Azure-icon.png'
        },
        green: {
          normal:   url + 'Map-Marker-Push-Pin-1-Chartreuse-icon.png',
          selected: url + 'Map-Marker-Push-Pin-1-Right-Chartreuse-icon.png'
        },
        pink: {
          normal:   url + 'Map-Marker-Ball-Pink-icon.png',
          selected: url + 'Map-Marker-Ball-Right-Pink-icon.png'
        }
      },
      useMapTypeControl: true,
      mapType: "terrain",
      showLine: true,
      enableScrollWheel: true
    };
    let map = new google.visualization.Map($("#map").get(0));
    map.draw(data, options);
  }
};

$(() => {
  getData();

  let width = screen.width;
  let height = screen.height;

  setInterval(() => {
    if (screen.width != width || screen.height != height) {
      width = screen.width;
      height = screen.height;
      getData();
    }
  }, 100);

  $.ajax({
    url: "http://localhost:3001/api/users/check",
    method: "POST",
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", localStorage.getItem("token"));
    }
  }).done(response => {
    if (response.valid) $(`[href="/maps"]`).show();
    else $(`[href="/maps"]`).remove();
  });
});
