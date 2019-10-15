const apiData = "http://localhost:3001/api/datadate";

const getData = () => {
  $.ajax({
    url: apiData,
    method: "GET"
  }).done(response => {
    showChart(response.data);
  });
};

const showChart = dataDates => {
  google.charts.load("current", { packages: ["corechart", "line"] });
  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
    const data = new google.visualization.DataTable();
    data.addColumn("string", "Date");
    data.addColumn("number", "Frequency");

    data.addRows(dataDates.map(item => [item.date, item.frequency]));

    const options = {
      title: "Frequency Rate for Each Date",
      width: "100%",
      height: 400,
      hAxis: { title: "Date" },
      vAxis: { title: "Frequency" },
      legend: { position: "none" },
      animation: { duration: 1000, startup: true, easing: "in" }
    };

    const chart = new google.visualization.LineChart($("#lineChart").get(0));

    chart.draw(data, options);
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
    if (response.valid) $(`[href="/data-date"]`).show();
    else $(`[href="/data-date"]`).remove();
  });
});
