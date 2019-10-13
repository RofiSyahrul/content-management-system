const showPagination = (current, numOfPages, cbGetData, ...args) => {
  $(".page-item").remove();
  current = Number(current);
  numOfPages = Number(numOfPages);

  if (numOfPages > 1) {
    const liStart = '<li class="page-item">';
    const liEnd = "</li>";
    // previous
    if (current > 1) {
      $("#pages").append(
        `${liStart}<a href="" id="previous" class="page-link">
          <span class="fa fa-backward" aria-hidden="true"></span>
          </a>${liEnd}`
      );
    }
    // first
    if (current > 3) {
      $("#pages").append(
        `${liStart}<a href="" id="firstPage" class="page-link">1</a>${liEnd}`
      );
    }

    let i = current > 3 ? current - 1 : 1;
    // left ellipsis
    if (i !== 1) {
      $("#pages").append(
        `${liStart}<a href="" id="leftEllipsis" class="page-link">
          <i class="fa fa-ellipsis-h" aria-hidden="true"></i>
        </a>${liEnd}`
      );
    }
    let upper = current > numOfPages - 3 ? numOfPages : current + 1;
    for (; i <= upper && i <= numOfPages; i++) {
      if (i === current) {
        // active page
        $("#pages").append(
          `<li class="page-item active"><span class="page-link">${i}</span>${liEnd}`
        );
      } else {
        // nonactive page
        $("#pages").append(
          `${liStart}<a class="page-link" href="" id="page${i}">${i}</a>${liEnd}`
        );
      }
    }
    // right ellipsis
    if (i == current + 2 && i < numOfPages) {
      $("#pages").append(
        `${liStart}<a href="" id="rightEllipsis" class="page-link">
          <i class="fa fa-ellipsis-h" aria-hidden="true"></i>
        </a>${liEnd}`
      );
    }
    // last
    if (current < numOfPages - 2) {
      $("#pages").append(
        `${liStart}<a href="" id="lastPage" class="page-link">${numOfPages}</a>${liEnd}`
      );
    }
    // next
    if (current < numOfPages) {
      $("#pages").append(
        `${liStart}<a href="" id="next" class="page-link">
          <span class="fa fa-forward" aria-hidden="true"></span>
          </a>${liEnd}`
      );
    }

    $(".page-link").click(function(e) {
      e.preventDefault();
      const id = $(this).attr("id");
      const current = Number($("#pages > li.active > span").text());
      const validId = [
        "firstPage",
        "previous",
        "leftEllipsis",
        "rightEllipsis",
        "next",
        "lastPage"
      ];
      if (validId.includes(id)) {
        switch (id) {
          case "firstPage":
            cbGetData(1, ...args);
            break;
          case "previous":
            cbGetData(current - 1, ...args);
            break;
          case "leftEllipsis":
            cbGetData(current - 2, ...args);
            break;
          case "rightEllipsis":
            cbGetData(current + 2, ...args);
            break;
          case "next":
            cbGetData(current + 1, ...args);
            break;
          case "lastPage":
            cbGetData(numOfPages, ...args);
            break;
        }
      } else if (id.slice(0, 4) == "page") {
        const page = Number(id.slice(4));
        cbGetData(page, ...args);
      }
    });
  }
};
