const chai = require("chai");
const chaiHttp = require("chai-http");
// const should = chai.should();
chai.should();
const expect = chai.expect;
chai.use(chaiHttp);

const server = require("../app");
const User = require("../models/user");

const Registration = require("./user-tests/register.test");
const Login = require("./user-tests/login.test");

describe("User", () => {
  beforeEach(done => {
    const user = new User({
      email: "rofi@gmail.com",
      password: "abcD12345."
    });
    user.save(err => {
      console.error(err);
      done();
    });
  });

  afterEach(done => {
    User.collection.drop();
    done();
  });

  // valid registration
  Registration.testWhenValid(chai, server);
  // invalid registration: invalid email and password
  Registration.testWhenNotEligible(chai, server, expect);
  // invalid registration: password does not match
  Registration.testWhenWrongRetypePw(chai, server, expect);
  // invalid registration: email already exist
  Registration.testWhenEmailExists(chai, server, expect);

  // valid email and password
  Login.testWhenValid(chai, server);
  // email is not exist
  Login.testWhenEmailNotExist(chai, server, expect);
  // wrong password
  Login.testWhenWrongPw(chai, server, expect);

  // token of rofi@gmail.com account is exist
  it('It should return an object with "valid" property that has "true" value', done => {
    User.find({ email: "rofi@gmail.com" }).then(user => {
      chai
        .request(server)
        .post("/api/users/check")
        .send({ token: user[0].token })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a("object");
          res.body.should.have.property("valid");
          res.body.valid.should.equal(true);
          done();
        });
    });
  });

  // logout from rofi@gmail.com success, so the token is destroyed
  it('It should return an object with "logout" property that has "true" value', done => {
    User.find({ email: "rofi@gmail.com" }).then(user => {
      const { _id } = user[0];
      chai
        .request(server)
        .get(`/api/users/destroy?id=${_id}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a("object");
          res.body.should.have.property("logout");
          res.body.logout.should.equal(true);
          done()
        });
    });
  });
});
