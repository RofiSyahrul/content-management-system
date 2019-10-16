$(() => {
  function getLatLong(title = "") {
    return new Promise((resolve, reject) => {
      const geo = new google.maps.Geocoder();

      geo.geocode({ address: title }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          const lat = Number(results[0].geometry.location.lat().toPrecision(8));
          const long = Number(
            results[0].geometry.location.lng().toPrecision(8)
          );
          resolve({ lat, long });
        } else {
          reject(`<b>${title}</b> not found`);
        }
      });
    });
  }

  setActiveTab("mapsTab");

  function showSweetAlert(title, type = "success") {
    Swal.fire({
      position: "center",
      type,
      title,
      showConfirmButton: false,
      timer: 3000
    });
  }

  const apiData = "http://localhost:3001/api/maps";

  const showData = (data, skip = 0) => {
    let keys = ["title", "lat", "long"];
    $("#data > tr").remove();
    let table = $("#data");

    if (data) {
      data.forEach((item, index) => {
        table.append(`<tr id="row${index + skip + 1}"></tr>`);
        let row = $(`#row${index + skip + 1}`);
        row.append(`<td>${index + skip + 1}</td>`);
        keys.forEach(key => {
          let content = item[key];
          if (typeof content == "number")
            content = Number(content.toPrecision(13));
          row.append(`<td>${content}</td>`);
        });
        let actions = `<td>`;
        actions += `<a href="" role="button" class="edit btn btn-success mr-1" id="edit${item._id}"> <i class="fa fa-pencil-square-o" aria-hidden="true"></i></a>`;
        actions += `<a href="" role="button" class="delete btn btn-danger" id="delete${item._id}"> <i class="fa fa-trash" aria-hidden="true"></i></a>`;
        actions += `</td>`;
        row.append(actions);
      });
    }
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
      $("#searchTitle").focus();
      $("#addLat, #addLong, #addTitle").blur();
    });
  };

  const addData = () => {
    const data = {
      title: $("#addTitle").val(),
      lat: $("#addLat").val(),
      long: $("#addLong").val()
    };
    $.ajax({
      url: apiData,
      method: "POST",
      data,
      dataType: "json"
    }).done(response => {
      showSweetAlert(response.message);
      $("#searchTitle").val($("#addTitle").val());
      $("#addTitle").val("");
      $("#addLat").val("");
      $("#addLong").val("");
      handleEvents();
    });
  };

  const editData = (id, title = "", lat = "", long = "") => {
    $.ajax({
      url: apiData + `/${id}`,
      method: "PUT",
      data: { title, lat: Number(lat), long: Number(long) },
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
      handleEvents(current);
    });
  };

  const $selectLimit = $("#selectLimit");
  const $searchTitle = $("#searchTitle");
  getData(1, $selectLimit.val());

  const generateFilter = (title = "") => {
    let filter = {};
    if (title.length > 0) {
      filter.title = { $regex: title, $options: "i" };
    }
    return JSON.stringify(filter);
  };

  const generateOptValues = (title = "") => {
    let filter = generateFilter(title);
    return { limit: $selectLimit.val(), filter };
  };

  const handleEvents = (current = 1) => {
    let { limit, filter } = generateOptValues($searchTitle.val());
    searchData(current, limit, filter);
  };

  $selectLimit.change(() => handleEvents());
  $searchTitle.keyup(() => handleEvents());

  $("#resetSearch").click(e => {
    e.preventDefault();
    $searchTitle.val("");
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
    $("#addTitle").val("");
    $("#addLat").val("");
    $("#addLong").val("");
    $("#add").slideUp();
    $("#addButton").show();
    $("#cancelAdd").hide();
  });

  $("#addTitle").popover({
    placement: "bottom",
    content: "",
    trigger: "manual",
    container: "body",
    html: true
  });
  let popover = $("#addTitle").data("bs.popover");

  function showPopover(popover, content = "") {
    $("#addTitle").attr("data-content", content);
    popover = $("#addTitle").data("bs.popover");
    popover.setContent();
    popover.$tip.addClass(popover.options.placement);
    $("#addTitle").popover("show");
    $(".popover").addClass("show bs-popover-bottom");
    $(".popover").removeClass("fade bottom in");
  }

  $("#addTitle").keyup(() => {
    let title = $("#addTitle").val();
    $.ajax({
      url: apiData + "/search",
      method: "POST",
      data: JSON.stringify({ title: { $regex: `^${title}$`, $options: "i" } }),
      dataType: "json",
      beforeSend: req => {
        req.setRequestHeader("Skip", "0");
        req.setRequestHeader("Limit", "all");
      }
    }).done(response => {
      if (response.data.length > 0) {
        let content = `
        <span class="text-danger">
        <b>${$("#addTitle").val()}</b> already exists
        </span>`;
        $("#addLat").val("");
        $("#addLong").val("");
        showPopover(popover, content);
      } else {
        getLatLong(title)
          .then(result => {
            $("#addTitle").popover("hide");
            $("#addTitle").removeClass("invalid-input");
            $("#addLat").val(Number(result.lat));
            $("#addLong").val(Number(result.long));
          })
          .catch(message => {
            $("#addLat").val("");
            $("#addLong").val("");
            message = `<span class="text-danger">${message}</span>`;
            showPopover(popover, message);
          });
      }
    });
  });

  $("#add").submit(e => {
    e.preventDefault();
    if ($(".popover").hasClass("show")) {
      $("#addTitle")
        .addClass("invalid-input")
        .focus();
    } else {
      addData();
    }
  });

  const getCellsContext = element => {
    let cells = $(element)
      .parents()
      .eq(1)
      .children();
    let $titleCell = cells.eq(1);
    let $latCell = cells.eq(2);
    let $longCell = cells.eq(3);
    let $actionsCell = cells.eq(4);
    return { $titleCell, $latCell, $longCell, $actionsCell };
  };

  function showEdit(element) {
    let id = $(element)
      .attr("id")
      .slice(4);
    let { $titleCell, $latCell, $longCell, $actionsCell } = getCellsContext(
      element
    );
    let oldValues = {
      title: $titleCell.text(),
      lat: $latCell.text(),
      long: $longCell.text(),
      actions: $actionsCell.html()
    };

    $titleCell.html(
      `<input type="text" class="form-control edit-title" data-id="${id}" value="${oldValues.title}" required>` +
        `<input type="hidden" class="form-control" value="${oldValues.title}">`
    );
    $latCell.html(
      `<input type="number" class="form-control" step="0.00000001" value=${oldValues.lat} readonly required>` +
        `<input type="hidden" class="form-control" step="0.00000001" value=${oldValues.lat}>`
    );
    $longCell.html(
      `<input type="number" class="form-control" step="0.00000001" value=${oldValues.long} readonly required>` +
        `<input type="hidden" class="form-control" step="0.00000001" value=${oldValues.long}>`
    );
    const actionOk = `<a href="" role="button" class="ok btn btn-success mr-1" id="ok${id}"> <i class="fa fa-check" aria-hidden="true"></i></a>`;
    const actionCancel = `<a href="" role="button" class="cancel btn btn-danger" id="cancel${id}"><i class="fa fa-times" aria-hidden="true"></i></a>`;
    const oldActions = `<div style="display: none">${oldValues.actions}</div>`;
    $actionsCell.html(actionOk + actionCancel + oldActions);
    $(`.edit-title[data-id="${id}"]`).focus();
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
      .eq(4)
      .children()
      .eq(0);
    if (
      $(editButton)
        .attr("id")
        .includes("edit")
    ) {
      showEdit(editButton);
    }
  });

  $("#data").on("keyup", ".edit-title", e => {
    let title = e.target.value;
    let $latLongCells = $(e.target)
      .parent()
      .siblings();
    let $latCell = $latLongCells
      .eq(1)
      .children()
      .eq(0);
    let $longCell = $latLongCells
      .eq(2)
      .children()
      .eq(0);
    $(e.target).popover({
      placement: "bottom",
      content: "",
      trigger: "manual",
      container: "body",
      html: true
    });
    let popover = $(e.target).data("bs.popover");

    getLatLong(title)
      .then(result => {
        $(e.target).popover("hide");
        $(e.target).removeClass("invalid-input");
        $latCell.val(Number(result.lat));
        $longCell.val(Number(result.long));
      })
      .catch(message => {
        message = `<span class="text-danger">${message}</span>`;
        $(e.target).attr("data-content", message);
        popover = $(e.target).data("bs.popover");
        popover.setContent();
        popover.$tip.addClass(popover.options.placement);
        $(e.target).popover("show");
        $(".popover").addClass("show bs-popover-bottom");
        $(".popover").removeClass("fade bottom in");
        $latCell.val("");
        $longCell.val("");
      });
  });

  function getOldValues($titleCell, $latCell, $longCell, $actionsCell) {
    return {
      title: $titleCell
        .children()
        .eq(1)
        .val(),
      lat: $latCell
        .children()
        .eq(1)
        .val(),
      long: $longCell
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
    let { $titleCell, $latCell, $longCell, $actionsCell } = getCellsContext(
      element
    );
    let oldValues = getOldValues($titleCell, $latCell, $longCell, $actionsCell);
    let titleCell = $titleCell.children().eq(0);

    let title = titleCell.val();
    let lat = $latCell
      .children()
      .eq(0)
      .val();
    let long = $longCell
      .children()
      .eq(0)
      .val();

    let isAllOld =
      title == oldValues.title &&
      lat == oldValues.lat &&
      long == oldValues.long;
    let isAnyEmpty = title == "" || lat == "" || long == "";
    titleCell.popover("hide");

    if (isAllOld || isAnyEmpty) {
      showSweetAlert("Data have not been updated", "warning");
      $titleCell.text(oldValues.title);
      $latCell.text(oldValues.lat);
      $longCell.text(oldValues.long);
      $actionsCell.html(oldValues.actions);
    } else {
      // CHECK if new value of title is already exist
      $.ajax({
        url: apiData + "/search",
        method: "POST",
        data: JSON.stringify({
          title: { $regex: `^${title}$`, $options: "i" }
        }),
        dataType: "json",
        beforeSend: req => {
          req.setRequestHeader("Skip", "0");
          req.setRequestHeader("Limit", "all");
        }
      }).done(response => {
        if (response.data.length > 0) {
          if (
            response.data[0].title.toLowerCase() !=
            oldValues.title.toLowerCase()
          ) {
            let content = `
          <span class="text-danger">
          <b>${title}</b> already exists
          </span>`;
            showSweetAlert(content, "error");
            title = oldValues.title;
            lat = oldValues.lat;
            long = oldValues.long;
          } else editData(id, title, lat, long);
        } else {
          editData(id, title, lat, long);
        }
        $titleCell.text(title);
        $latCell.text(lat);
        $longCell.text(long);
        $actionsCell.html(oldValues.actions);
      });
    }
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
        .eq(3)
        .children()
        .eq(0);
      saveEdit(saveButton);
    }
  });

  $("#data").on("click", "a.cancel", function(e) {
    e.preventDefault();
    let { $titleCell, $latCell, $longCell, $actionsCell } = getCellsContext(
      this
    );
    let oldValues = getOldValues($titleCell, $latCell, $longCell, $actionsCell);
    $titleCell.text(oldValues.title);
    $latCell.text(oldValues.lat);
    $longCell.text(oldValues.long);
    $actionsCell.html(oldValues.actions);
  });

  $("#data").on("click", "a.delete", function(e) {
    e.preventDefault();
    let { $titleCell } = getCellsContext(this);
    let title = $titleCell.text();
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success ml-2",
        cancelButton: "btn btn-danger"
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons
      .fire({
        title: `Are you sure to delete ${title}?`,
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
