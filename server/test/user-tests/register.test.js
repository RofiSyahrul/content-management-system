module.exports = class Registration {
  static testWhenValid(chai, server) {
    return it('It should return object that has "status", "message", "data" and "token" properties from registered user', done => {
      chai
        .request(server)
        .post("/api/users/register")
        .send({
          email: "s.rofi@mail.com",
          password: "abcD123.",
          retypePassword: "abcD123."
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a("object");
          res.body.should.have.property("status");
          res.body.should.have.property("message");
          res.body.should.have.property("data");
          res.body.should.have.property("token");
          res.body.status.should.equal(true);
          res.body.message.should.equal("Register success");
          res.body.data.should.be.a("object");
          res.body.data.should.have.property("email");
          res.body.data.email.should.equal("s.rofi@mail.com");
          res.body.token.should.be.a("string");
          done();
        });
    });
  }

  static testWhenNotEligible(chai, server, expect) {
    return it('It should return object that has "status", "message", "data" and "token" properties from registered INVALID email and password', done => {
      chai
        .request(server)
        .post("/api/users/register")
        .send({
          email: "srofi.com",
          password: "12345678",
          retypePassword: "12345678"
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a("object");
          res.body.should.have.property("status");
          res.body.should.have.property("message");
          res.body.should.have.property("data");
          res.body.should.have.property("token");
          res.body.status.should.equal(false);
          res.body.message.should.equal(
            "ValidationError: email: Path `email` is invalid (srofi.com)., password: Path `password` is invalid (12345678)."
          );
          expect(res.body.data).to.be.a("null");
          expect(res.body.token).to.be.a("null");
          done();
        });
    });
  }

  static testWhenWrongRetypePw(chai, server, expect) {
    return it('It should return object that has "status", "message", "data" and "token" properties from registered INVALID password and retypePassword', done => {
      chai
        .request(server)
        .post("/api/users/register")
        .send({
          email: "s.rofi@mail.com",
          password: "abcD123.",
          retypePassword: "abCd123."
        })
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a("object");
          res.body.should.have.property("status");
          res.body.should.have.property("message");
          res.body.should.have.property("data");
          res.body.should.have.property("token");
          res.body.status.should.equal(false);
          res.body.message.should.equal(
            "Retype password does not match with password"
          );
          expect(res.body.data).to.be.a("null");
          expect(res.body.token).to.be.a("null");
          done();
        });
    });
  }

  static testWhenEmailExists(chai, server, expect) {
    return it('It should return object that has "status", "message", "data" and "token" properties from registered user with email already exist', done => {
      chai
        .request(server)
        .post("/api/users/register")
        .send({
          email: "rofi@gmail.com",
          password: "abcD123.",
          retypePassword: "abcD123."
        })
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a("object");
          res.body.should.have.property("status");
          res.body.should.have.property("message");
          res.body.should.have.property("data");
          res.body.should.have.property("token");
          res.body.status.should.equal(false);
          res.body.message.should.equal(
            "Email rofi@gmail.com is already exist."
          );
          expect(res.body.data).to.be.a("null");
          expect(res.body.token).to.be.a("null");
          done();
        });
    });
  }
};
