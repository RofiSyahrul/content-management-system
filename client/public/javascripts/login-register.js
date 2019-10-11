const toggleRegLogin = id => {
  const regLoginTerms = [
    { label: "Login", id: "#loginTab" },
    { label: "Register", id: "#registerTab" }
  ];

  $(id).click(e => {
    e.preventDefault();
    const otherId = regLoginTerms.filter(term => term.id != id)[0].id;
    $(otherId).removeClass("active");
    $(id).addClass("active");
    $("#login").toggle();
    $("#register").toggle();

    const label = regLoginTerms.filter(term => term.id == id)[0].label;
    document.title = `${label} | Content Management System`;
  });
};

const hideAlert = (value, alertEl, inputEl) => {
  if (value.length == 0) {
    alertEl.hide();
    inputEl.removeClass("big-padding-input padding-input-xs");
    inputEl.siblings().removeClass("big-padding-label");
  }
};

const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const pwRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^0-9a-zA-Z])(?=.{8,})/;

const apiUrl = "http://localhost:3001/api/users";

const register = data => {
  $.ajax({
    url: `${apiUrl}/register`,
    method: "POST",
    data,
    dataType: "json"
  })
    .done(response => {
      localStorage.setItem("email", response.data.email);
      localStorage.setItem("token", response.token);
      window.location = "/home";
    })
    .fail(response => {
      console.log(response);
    });
};

const login = data => {
  $.ajax({
    url: `${apiUrl}/login`,
    method: "POST",
    data,
    dataType: "json"
  })
    .done(response => {
      if (response.status) {
        localStorage.setItem("email", response.data.email);
        localStorage.setItem("token", response.token);
        $("#alertRegLogin").hide();
        window.location = "/home";
      } else {
        $("#alertRegLogin").text(response.message);
        $("#alertRegLogin").show();
      }
    })
    .fail(response => {
      console.log(response);
    });
};

$(() => {
  toggleRegLogin("#loginTab");
  toggleRegLogin("#registerTab");
  let width = screen.width,
    height = screen.height;
  const bodyHeight = (width >= 576 ? 0.6 : 0.7) * height;
  $(".container-dashboard").css({
    minHeight: bodyHeight,
    marginTop: (width >= 576 ? 0.05 : 0) * height,
    marginBottom: (width >= 576 ? 0.05 : 0) * height
  });

  let regEmail = $("#regEmail");
  regEmail.keyup(() => {
    const email = regEmail.val();
    const alert = $("#alertEmail");
    alert.show();
    hideAlert(email, alert, regEmail);
    // console.log(email);
    if (email.length == 0) "";
    else if (email.match(emailRegExp)) {
      // email is valid
      // check email existence
      $.ajax({
        url: `${apiUrl}/find`,
        method: "POST",
        data: { email },
        dataType: "json"
      }).done(response => {
        if (response.found) {
          // email exist
          alert.text(`${email} already exists`);
          alert.removeClass("text-success").addClass("text-danger");
          regEmail
            .addClass("big-padding-input")
            .removeClass("padding-input-xs");
          regEmail.siblings().addClass("big-padding-label");
        } else {
          // email OK
          alert.html("<strong>OK</strong>");
          alert.removeClass("text-danger").addClass("text-success");
          regEmail.removeClass("big-padding-input padding-input-xs");
          regEmail.siblings().removeClass("big-padding-label");
        }
      });
    } else {
      // email not valid
      alert.text("Please input valid email");
      alert.removeClass("text-success").addClass("text-danger");
      regEmail.removeClass("big-padding-input").addClass("padding-input-xs");
      regEmail.siblings().removeClass("big-padding-label");
    }
  });

  let regPassword = $("#regPassword");
  regPassword.keyup(() => {
    const password = regPassword.val();
    const alert = $("#alertPw");
    alert.show();
    hideAlert(password, alert, regPassword);
    if (password.length == 0) "";
    else if (password.match(pwRegExp)) {
      // valid password
      alert.html("<strong>OK</strong>");
      alert.removeClass("text-danger").addClass("text-success");
      regPassword.removeClass("big-padding-input");
      regPassword.siblings().removeClass("big-padding-label");
    } else {
      // invalid password
      let text;
      if (password.length < 8)
        text = `At least 8 characters. Contains upper case, lower case, number, and symbol.`;
      else text = `Must contain upper case, lower case, number, and symbol.`;
      alert.text(text);
      alert.removeClass("text-success").addClass("text-danger");
      regPassword.addClass("big-padding-input");
      regPassword.siblings().addClass("big-padding-label");
    }
  });

  let regCpw = $("#regConfirmPassword");
  regCpw.keyup(() => {
    const password = regPassword.val();
    const cpw = regCpw.val();
    const alert = $("#alertCpw");
    alert.show();
    hideAlert(cpw, alert, regCpw);
    if (cpw.length == 0) "";
    else if (cpw != password) {
      // doesn't match
      alert.text("Does not match");
      alert.removeClass("text-success").addClass("text-danger");
    } else {
      // match
      alert.html("<strong>Match</strong>");
      alert.removeClass("text-danger").addClass("text-success");
    }
  });

  $("#register").submit(e => {
    e.preventDefault();
    const alertEmail = $("#alertEmail").text();
    const alertPassword = $("#alertPw").text();
    const alertCpw = $("#alertCpw").text();

    const alert = $("#alertRegLogin");
    if (alertEmail == "OK" && alertPassword == "OK" && alertCpw == "Match") {
      let data = {
        email: regEmail.val(),
        password: regPassword.val(),
        retypePassword: regCpw.val()
      };
      alert.hide();
      register(data);
    } else {
      let texts = [];
      if (alertEmail != "OK") texts.push("Email not valid.");
      if (alertPassword != "OK") texts.push("Password not valid.");
      if (alertCpw != "Match" && alertPassword == "OK")
        texts.push("Confirmation password does not match");
      alert.text(texts.join(" "));
      alert.show();
    }
  });

  $("#login").submit(e => {
    e.preventDefault();
    login({ email: $("#email").val(), password: $("#password").val() });
  });
});
