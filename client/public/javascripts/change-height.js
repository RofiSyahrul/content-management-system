$(() => {
  let width = screen.width,
    height = screen.height;
  const changeHeight = () => {
    const bodyHeight = (width >= 576 ? 0.6 : 0.7) * height;
    $(".full-body").css({
      minHeight: bodyHeight,
      marginTop: 0.15 * height,
      marginBottom: 0.15 * height
    });
    const cardHeight = $("#card").height();
    const containerMargin = Math.floor((bodyHeight - cardHeight) / 2);
    const containerHeight = bodyHeight - 2 * containerMargin;
    $(".container-dashboard").css({
      minHeight: containerHeight,
      marginTop: containerMargin,
      marginBottom: containerMargin
    });
  };
  changeHeight();
  setInterval(() => {
    if (screen.width !== width || screen.height !== height) {
      width = screen.width;
      height = screen.height;
      $(window).trigger("resolutionChange");
    }
  }, 50);
  $(window).bind("resolutionChange", () => {
    changeHeight();
  });
});
