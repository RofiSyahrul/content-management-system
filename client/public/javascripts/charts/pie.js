let groupBy = localStorage.getItem("Group By") || "letter";
let accumulator = localStorage.getItem("Accumulator") || "countFreq";
$(`#${accumulator}`).prop("checked", true);
const accumulators = [
  { value: "maxFreq", label: "Maximum of Frequency" },
  { value: "minFreq", label: "Minimum of Frequency" },
  { value: "sumFreq", label: "Sum of Frequency" },
  { value: "avgFreq", label: "Average of Frequency" },
  { value: "countFreq", label: "Count of Occurence" }
];

const apiData = "http://localhost:3001/api/data";

const getData = (groupBy, accumulator, width) => {
  $.ajax({
    url: apiData,
    method: "GET",
    beforeSend: req => {
      req.setRequestHeader("Skip", "0");
      req.setRequestHeader("Limit", "all");
      if (groupBy) req.setRequestHeader("GroupBy", groupBy);
    }
  }).done(response => {
    showChart(response.data, accumulator, width);
  });
};

const showChart = (data, accumulator, width) => {
  // Load the Visualization API and the corechart package.
  google.charts.load("current", { packages: ["corechart"] });

  // Set a callback to run when the Google Visualization API is loaded.
  google.charts.setOnLoadCallback(drawChart);

  // Callback that creates and populates a data table,
  // instantiates the pie chart, passes in the data and
  // draws it.
  function drawChart() {
    // Create the data table.
    data = data.map(item => [item.letter, item[accumulator]]);
    let label = accumulators.filter(item => item.value == accumulator)[0].label;
    data.unshift(["Letter", label]);
    data = new google.visualization.arrayToDataTable(data);

    // Set chart options
    let chartWidth = 700;
    if (width < 576) chartWidth = "100%";
    else if (width < 768) chartWidth = "90%";
    const options = {
      title: `Frequency for Each Word`,
      width: chartWidth,
      height: 400,
      backgroundColor: "transparent"
      // legend: { position: "none" }
    };

    // Instantiate and draw our chart, passing in some options.
    const chart = new google.visualization.PieChart($("#pieChart").get(0));
    chart.draw(data, options);
  }
};

$(() => {
  let width = screen.width;
  let height = screen.height;

  getData(groupBy, accumulator, width);
  $("#freqOpt").change(() => {
    const checked = $(`[name="freq"]`)
      .toArray()
      .filter(item => item.checked)[0];
    accumulator = checked.getAttribute("value");
    localStorage.setItem("Accumulator", accumulator);
    getData(groupBy, accumulator, width);
  });

  setInterval(() => {
    if (screen.width != width || screen.height != height) {
      width = screen.width;
      height = screen.height;
      getData(groupBy, accumulator, width);
    }
  }, 100);

  $.ajax({
    url: "http://localhost:3001/api/users/check",
    method: "POST",
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", localStorage.getItem("token"));
    }
  }).done(response => {
    if (response.valid) $(`[href="/data"]`).show();
    else $(`[href="/data"]`).remove();
  });
});
