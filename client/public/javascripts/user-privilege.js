const tabs = ["homeTab", "dataTab", "dataDateTab", "mapsTab"];
const setActiveTab = (active = "homeTab") => {
  const activeTab = $("#" + active);
  const nonActiveTabs = tabs
    .filter(tab => tab != active)
    .map(tab => $("#" + tab));
  nonActiveTabs.forEach(tab => {
    tab.removeClass("active");
  });
  activeTab.addClass("active");
};

const apiUrl = "http://localhost:3001/api/users/";

const auth = () => {
  $.ajax({
    url: apiUrl + "check",
    method: "POST",
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", localStorage.getItem("token"));
    }
  }).done(response => {
    if (!response.valid) {
      window.location = "/";
    } else {
      $(".privilege").show();
      $("body.home").css({ background: "#ffffff", height: "100vh", width: "100vw" });
      $("body.not-home").css({ background: "#ffffff", height: "100%", width: "100%" });
      $("th, td").attr("style", "vertical-align: middle !important");
    }
  });
};

$(() => {
  auth();
  $("#logout").click(e => {
    e.preventDefault();
    $.ajax({
      url: apiUrl + "destroy",
      method: "GET",
      beforeSend: function(request) {
        request.setRequestHeader(
          "Authorization",
          localStorage.getItem("token")
        );
      }
    }).done(response => {
      if (response.logout) {
        localStorage.setItem("email", "");
        localStorage.setItem("token", "");
        window.location = "/";
      }
    });
  });
});
