$(() => {
  setActiveTab("dataDateTab");

  const apiData = "http://localhost:3001/api/datadate";

  const showData = (data, skip = 0) => {
    let keys = ["date", "frequency"];
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
      let actions = `<td>`;
      actions += `<a href="" role="button" class="edit btn btn-success mr-1" id="edit${item._id}"> <i class="fa fa-pencil-square-o" aria-hidden="true"></i></a>`;
      actions += `<a href="" role="button" class="delete btn btn-danger" id="delete${item._id}"> <i class="fa fa-trash" aria-hidden="true"></i></a>`;
      actions += `</td>`;
      row.append(actions);
    });
  };

  const getData = (current, limit) => {
    let skip = limit == "all" ? 0 : (current - 1) * limit;
    $.ajax({
      url: apiData,
      method: "GET",
      beforeSend: req => {
        req.setRequestHeader("Skip", skip);
        req.setRequestHeader("Limit", limit);
      }
    }).done(response => {
      showData(response.data, skip);
      showPagination(current, response.numOfPages, getData, limit);
    });
  };

  const searchData = (current, limit, filter) => {
    let skip = limit == "all" ? 0 : (current - 1) * limit;
    $.ajax({
      url: apiData + "/search",
      method: "POST",
      data: filter,
      dataType: "json",
      beforeSend: req => {
        req.setRequestHeader("Skip", skip);
        req.setRequestHeader("Limit", limit);
      }
    }).done(response => {
      showData(response.data, skip);
      showPagination(current, response.numOfPages, searchData, limit, filter);
    });
  };

  const addData = () => {
    const data = {
      date: $("#addDate").val(),
      frequency: $("#addFrequency").val()
    };
    $.ajax({
      url: apiData,
      method: "POST",
      data,
      dataType: "json"
    }).done(response => {
      $("#alertData")
        .html(`<b>${response.message}</b>`)
        .show();
      setTimeout(() => {
        $("#alertData").hide(1000);
      }, 3000);
      $("#searchDate").val($("#addDate").val());
      $("#searchFrequency").val($("#addFrequency").val());
      $("#addDate").val("");
      $("#addDate").attr("type", "text");
      $("#addFrequency").val("");
      handleEvents();
    });
  };

  const editData = (id, date = "", frequency = "") => {
    $.ajax({
      url: apiData + `/${id}`,
      method: "PUT",
      data: { date, frequency: Number(frequency) },
      dataType: "json"
    }).done(response => {
      $("#alertData")
        .html(`<b>${response.message}</b>`)
        .show();
      setTimeout(() => {
        $("#alertData").hide(1000);
      }, 2000);
    });
  };

  const deleteData = (id, current) => {
    $.ajax({
      url: apiData + `/${id}`,
      method: "DELETE"
    }).done(response => {
      $("#alertData")
        .html(`<b>${response.message}</b>`)
        .show();
      setTimeout(() => {
        $("#alertData").hide(1000);
      }, 3000);
      handleEvents(current);
    });
  };

  const $selectLimit = $("#selectLimit");
  const $searchDate = $("#searchDate");
  const $searchFrequency = $("#searchFrequency");
  getData(1, $selectLimit.val());

  const generateFilter = (date = "", frequency = "") => {
    let filter = {};
    if (date.length > 0) {
      filter.date = { $regex: date, $options: "i" };
    }

    if (frequency.length > 0) {
      filter.frequency = Number(frequency);
    }
    return JSON.stringify(filter);
  };

  const generateOptValues = (date = "", frequency = "") => {
    let filter = generateFilter(date, frequency);
    return { limit: $selectLimit.val(), filter };
  };

  const handleEvents = (current = 1) => {
    let { limit, filter } = generateOptValues(
      $searchDate.val(),
      $searchFrequency.val()
    );
    searchData(current, limit, filter);
  };

  $selectLimit.change(() => handleEvents());
  $searchDate.keyup(() => handleEvents());
  $searchFrequency.keyup(() => handleEvents());

  $("#resetSearch").click(e => {
    e.preventDefault();
    $searchDate.val("");
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
    $("#addDate").attr("type", "text");
    $("#add").slideUp();
    $("#addButton").show();
    $("#cancelAdd").hide();
  });

  $("#addDate").change(() => {
    let date = $("#addDate").val();
    $.ajax({
      url: apiData + "/search",
      method: "POST",
      data: JSON.stringify({ date }),
      dataType: "json",
      beforeSend: req => {
        req.setRequestHeader("Skip", "0");
        req.setRequestHeader("Limit", "all");
      }
    }).done(response => {
      if (response.data.length > 0) {
        let content = `<span class="text-danger">Date <b>${date}</b> already exists</span>`;
        $("#addDate").popover({
          placement: "bottom",
          content,
          trigger: "manual",
          container: "body",
          html: true
        });
        $("#addDate").popover("show");
        $(".popover").addClass("show bs-popover-bottom");
        $(".popover").removeClass("fade bottom in");
      } else {
        $("#addDate").popover("hide");
        $("#addDate").removeClass("invalid-input");
      }
    });
  });

  $("#add").submit(e => {
    e.preventDefault();
    if ($(".popover").hasClass("show")) {
      $("#addDate")
        .addClass("invalid-input")
        .focus();
    } else {
      addData();
    }
  });

  const getCellsContext = element => {
    let $dateCell = $(element)
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
    return { $dateCell, $freqCell, $actionsCell };
  };

  function showEdit(element) {
    let id = $(element)
      .attr("id")
      .slice(4);
    let { $dateCell, $freqCell, $actionsCell } = getCellsContext(element);
    let oldValues = {
      date: $dateCell.text(),
      frequency: $freqCell.text(),
      actions: $actionsCell.html()
    };

    $dateCell.html(
      `<input type="text" class="form-control" value=${oldValues.date}>` +
        `<input type="hidden" class="form-control" value=${oldValues.date}>`
    );
    $freqCell.html(
      `<input type="number" class="form-control" step="0.01" value=${oldValues.frequency}>` +
        `<input type="hidden" class="form-control" step="0.01" value=${oldValues.frequency}>`
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
    e.preventDefault();
    const editButton = $(this)
      .parent()
      .children()
      .eq(3)
      .children()
      .eq(0);
    showEdit(editButton);
  });

  function getOldValues($dateCell, $freqCell, $actionsCell) {
    return {
      date: $dateCell
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
    let { $dateCell, $freqCell, $actionsCell } = getCellsContext(element);
    let oldValues = getOldValues($dateCell, $freqCell, $actionsCell);

    let date = $dateCell
      .children()
      .eq(0)
      .val();
    let frequency = $freqCell
      .children()
      .eq(0)
      .val();

    if (date == oldValues.date && frequency == oldValues.frequency) {
      $("#alertDataDanger")
        .html(`<b>Data have not been updated</b>`)
        .show();
      setTimeout(() => {
        $("#alertDataDanger").hide(1000);
      }, 2000);
    } else {
      editData(id, date, frequency);
    }
    $dateCell.text(date);
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
    let { $dateCell, $freqCell, $actionsCell } = getCellsContext(this);
    let oldValues = getOldValues($dateCell, $freqCell, $actionsCell);
    $dateCell.text(oldValues.date);
    $freqCell.text(oldValues.frequency);
    $actionsCell.html(oldValues.actions);
  });

  $("#data").on("click", "a.delete", function(e) {
    if (confirm("Are you sure you want to delete this data?")) {
      e.preventDefault();
      const current = Number($("#pages > li.active > span").text() || 1);
      let id = $(this)
        .attr("id")
        .slice(6);
      deleteData(id, current);
    }
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
