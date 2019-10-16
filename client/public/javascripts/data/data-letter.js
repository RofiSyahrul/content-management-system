$(() => {
  setActiveTab("dataTab");

  function showSweetAlert(title, type = "success") {
    Swal.fire({
      position: "center",
      type,
      title,
      showConfirmButton: false,
      timer: 3000
    });
  }

  const showFreqOpt = () => {
    const options = [
      { value: "maxFreq", label: "Maximum" },
      { value: "minFreq", label: "Minimum" },
      { value: "sumFreq", label: "Sum" },
      { value: "avgFreq", label: "Average" },
      { value: "countFreq", label: "Count" }
    ];
    const width = screen.width;
    let divClass = "custom-control custom-radio custom-control-inline";
    if (width < 600) divClass += " col-6";
    options.forEach((opt, index) => {
      let radios = [
        `<div class="${divClass}">`,
        `<input type="radio" id="${opt.value}" name="freq" class="custom-control-input" value="${opt.value}">`,
        `<label class="custom-control-label" for="${opt.value}">${opt.label}</label>`,
        "</div>"
      ];
      $("#freqOpt").append(radios.join("\n"));
    });
    let acc = localStorage.getItem("Accumulator");
    if (acc && acc != "") $(`#${acc}`).prop("checked", true);
    else $("#sumFreq").prop("checked", true);
    $("#freqOptions").fadeIn();
    $("td:nth-child(4)").addClass("hidden");
    $("th:nth-child(4)").addClass("hidden");
  };

  const apiData = "http://localhost:3001/api/data";

  const showData = (data, skip = 0, accumulator) => {
    let keys = ["letter", "frequency"];
    if (accumulator) keys[1] = accumulator;
    $("#data > tr").remove();
    let table = $("#data");

    data.forEach((item, index) => {
      table.append(`<tr id="row${index + skip + 1}"></tr>`);
      let row = $(`#row${index + skip + 1}`);
      row.append(`<td>${index + skip + 1}</td>`);
      keys.forEach(key => {
        let content = item[key];
        if (typeof content == "number")
          content = Number(content.toPrecision(5));
        row.append(`<td>${content}</td>`);
      });
      if (!$("#groupBy").is(":checked")) {
        let actions = `<td>`;
        actions += `<a href="" role="button" class="edit btn btn-success mr-1" id="edit${item._id}"> <i class="fa fa-pencil-square-o" aria-hidden="true"></i></a>`;
        actions += `<a href="" role="button" class="delete btn btn-danger" id="delete${item._id}"> <i class="fa fa-trash" aria-hidden="true"></i></a>`;
        actions += `</td>`;
        row.append(actions);
      }
    });
  };

  const getData = (current, limit, groupBy, accumulator) => {
    let skip = limit == "all" ? 0 : (current - 1) * limit;
    $.ajax({
      url: apiData,
      method: "GET",
      beforeSend: req => {
        req.setRequestHeader("Skip", skip);
        req.setRequestHeader("Limit", limit);
        if (groupBy) req.setRequestHeader("GroupBy", groupBy);
      }
    }).done(response => {
      showData(response.data, skip, accumulator);
      showPagination(
        current,
        response.numOfPages,
        getData,
        limit,
        groupBy,
        accumulator
      );
    });
  };

  const searchData = (current, limit, groupBy, accumulator, filter) => {
    let skip = limit == "all" ? 0 : (current - 1) * limit;
    $.ajax({
      url: apiData + "/search",
      method: "POST",
      data: filter,
      dataType: "json",
      beforeSend: req => {
        req.setRequestHeader("Skip", skip);
        req.setRequestHeader("Limit", limit);
        if (groupBy) req.setRequestHeader("GroupBy", groupBy);
      }
    }).done(response => {
      showData(response.data, skip, accumulator);
      showPagination(
        current,
        response.numOfPages,
        searchData,
        limit,
        groupBy,
        accumulator,
        filter
      );
    });
  };

  const addData = () => {
    const data = {
      letter: $("#addLetter").val(),
      frequency: $("#addFrequency").val()
    };
    $.ajax({
      url: apiData,
      method: "POST",
      data,
      dataType: "json"
    }).done(response => {
      showSweetAlert(response.message);
      $("#searchLetter").val($("#addLetter").val());
      $("#searchFrequency").val($("#addFrequency").val());
      $("#addLetter").val("");
      $("#addFrequency").val("");
      handleEvents();
    });
  };

  const editData = (id, letter = "", frequency = "") => {
    $.ajax({
      url: apiData + `/${id}`,
      method: "PUT",
      data: { letter, frequency: Number(frequency) },
      dataType: "json"
    }).done(response => {
      showSweetAlert(response.message);
    });
  };

  const deleteData = (id, current) => {
    $.ajax({
      url: apiData + `/${id}`,
      method: "DELETE"
    }).done(response => {
      showSweetAlert(response.message);
      let { limit, groupBy, accumulator, filter } = generateOptValues(
        $searchLetter.val(),
        $searchFrequency.val()
      );
      searchData(current, limit, groupBy, accumulator, filter);
    });
  };

  const $elGroupBy = $("#groupBy");
  const $selectLimit = $("#selectLimit");
  const $searchLetter = $("#searchLetter");
  const $searchFrequency = $("#searchFrequency");
  getData(1, $selectLimit.val());

  const generateFilter = (
    letter = "",
    frequency = "",
    groupBy,
    accumulator
  ) => {
    let filter = {};
    if (letter.length > 0) {
      if (groupBy) filter._id = { $regex: letter, $options: "i" };
      else filter.letter = { $regex: letter, $options: "i" };
    }

    if (frequency.length > 0) {
      if (groupBy) filter[accumulator] = Number(frequency);
      else filter.frequency = Number(frequency);
    }
    return JSON.stringify(filter);
  };

  const generateOptValues = (letter = "", frequency = "") => {
    let groupBy = $elGroupBy.is(":checked") ? $elGroupBy.val() : undefined;
    const checked = $(`[name="freq"]`)
      .toArray()
      .filter(item => item.checked)[0];
    let accumulator = checked ? checked.getAttribute("value") : undefined;
    let filter = generateFilter(letter, frequency, groupBy, accumulator);
    return { limit: $selectLimit.val(), groupBy, accumulator, filter };
  };

  const handleEvents = () => {
    let { limit, groupBy, accumulator, filter } = generateOptValues(
      $searchLetter.val(),
      $searchFrequency.val()
    );
    // send groupBy and accumulator to local storage in order to it can be accessed by bar chart and pie chart
    localStorage.setItem("Group By", groupBy || "letter");
    localStorage.setItem("Accumulator", accumulator || "sumFreq");
    searchData(1, limit, groupBy, accumulator, filter);
  };

  $elGroupBy.change(() => {
    if ($elGroupBy.is(":checked")) showFreqOpt();
    else {
      $("#freqOptions").fadeOut();
      $(".custom-control-inline").remove();
      $("td:nth-child(4)").removeClass("hidden");
      $("th:nth-child(4)").removeClass("hidden");
    }
    handleEvents();
  });

  $(`#freqOpt`).change(handleEvents);
  $selectLimit.change(handleEvents);
  $searchLetter.keyup(handleEvents);
  $searchFrequency.keyup(handleEvents);

  $("#resetSearch").click(e => {
    e.preventDefault();
    $searchLetter.val("");
    $searchFrequency.val("");
    handleEvents();
  });

  $("#addButton").click(e => {
    e.preventDefault();
    $("#addButton").hide();
    $("#cancelAdd").show();
    $("#add").slideDown();
  });

  $("#cancelAdd").click(e => {
    e.preventDefault();
    $("#add").slideUp();
    $("#addButton").show();
    $("#cancelAdd").hide();
  });

  $("#add").submit(e => {
    e.preventDefault();
    $elGroupBy.prop("checked", false);
    $("#freqOptions").fadeOut();
    $(".custom-control-inline").remove();
    $("td:nth-child(4)").removeClass("hidden");
    $("th:nth-child(4)").removeClass("hidden");
    addData();
  });

  const getCellsContext = element => {
    let $letterCell = $(element)
      .parents()
      .eq(1)
      .children()
      .eq(1);
    let $freqCell = $(element)
      .parents()
      .eq(1)
      .children()
      .eq(2);
    let $actionsCell = $(element)
      .parents()
      .eq(1)
      .children()
      .eq(3);
    return { $letterCell, $freqCell, $actionsCell };
  };

  function showEdit(element) {
    let id = $(element)
      .attr("id")
      .slice(4);
    let { $letterCell, $freqCell, $actionsCell } = getCellsContext(element);
    let oldValues = {
      letter: $letterCell.text(),
      frequency: $freqCell.text(),
      actions: $actionsCell.html()
    };

    $letterCell.html(
      `<input type="text" class="form-control" value=${oldValues.letter}>` +
        `<input type="hidden" class="form-control" value=${oldValues.letter}>`
    );
    $freqCell.html(
      `<input type="number" class="form-control" step="0.0001" value=${oldValues.frequency}>` +
        `<input type="hidden" class="form-control" step="0.0001" value=${oldValues.frequency}>`
    );
    const actionOk = `<a href="" role="button" class="ok btn btn-success mr-1" id="ok${id}"> <i class="fa fa-check" aria-hidden="true"></i></a>`;
    const actionCancel = `<a href="" role="button" class="cancel btn btn-danger" id="cancel${id}"><i class="fa fa-times" aria-hidden="true"></i></a>`;
    const oldActions = `<div style="display: none">${oldValues.actions}</div>`;
    $actionsCell.html(actionOk + actionCancel + oldActions);
  }

  $("#data").on("click", "a.edit", function(e) {
    e.preventDefault();
    showEdit(this);
  });

  $("#data").on("dblclick", "td", function(e) {
    const btn = $(this)
      .parent()
      .children()
      .eq(3)
      .children()
      .eq(0);
    if (
      $(btn)
        .attr("id")
        .includes("edit")
    ) {
      e.preventDefault();
      showEdit(btn);
    }
  });

  function getOldValues($letterCell, $freqCell, $actionsCell) {
    return {
      letter: $letterCell
        .children()
        .eq(1)
        .val(),
      frequency: $freqCell
        .children()
        .eq(1)
        .val(),
      actions: $actionsCell
        .children()
        .eq(2)
        .html()
    };
  }

  function saveEdit(element) {
    let id = $(element)
      .attr("id")
      .slice(2);
    let { $letterCell, $freqCell, $actionsCell } = getCellsContext(element);
    let oldValues = getOldValues($letterCell, $freqCell, $actionsCell);

    let letter = $letterCell
      .children()
      .eq(0)
      .val();
    let frequency = $freqCell
      .children()
      .eq(0)
      .val();

    if (letter == oldValues.letter && frequency == oldValues.frequency) {
      showSweetAlert("Data have not been updated", "warning");
    } else {
      editData(id, letter, frequency);
    }
    $letterCell.text(letter);
    $freqCell.text(frequency);
    $actionsCell.html(oldValues.actions);
  }

  $("#data").on("click", "a.ok", function(e) {
    e.preventDefault();
    saveEdit(this);
  });

  $("#data").on("keypress", "input", function(e) {
    if (e.which == 13) {
      e.preventDefault();
      let saveButton = $(this)
        .parent()
        .siblings()
        .eq(2)
        .children()
        .eq(0);
      saveEdit(saveButton);
    }
  });

  $("#data").on("click", "a.cancel", function(e) {
    e.preventDefault();
    let { $letterCell, $freqCell, $actionsCell } = getCellsContext(this);
    let oldValues = getOldValues($letterCell, $freqCell, $actionsCell);
    $letterCell.text(oldValues.letter);
    $freqCell.text(oldValues.frequency);
    $actionsCell.html(oldValues.actions);
  });

  $("#data").on("click", "a.delete", function(e) {
    e.preventDefault();

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success ml-2",
        cancelButton: "btn btn-danger"
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true
      })
      .then(result => {
        if (result.value) {
          const current = Number($("#pages > li.active > span").text() || 1);
          let id = $(this)
            .attr("id")
            .slice(6);
          deleteData(id, current);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire(
            "Cancelled",
            "Your data is safe and not deleted :)",
            "error"
          );
        }
      });
  });

  setInterval(() => {
    if (screen.width < 350) {
      $("td > .btn").addClass("btn-sm");
      $("td > a > .fa")
        .addClass("fa-xs")
        .removeClass("fa-sm");
    } else if (screen.width < 600) {
      $("td > .btn").addClass("btn-sm");
      $("td > a > .fa")
        .addClass("fa-sm")
        .removeClass("fa-xs");
    } else {
      $("td > .btn").removeClass("btn-sm");
      $("td > a > .fa")
        .removeClass("fa-sm")
        .removeClass("fa-xs");
    }
  }, 100);
});
