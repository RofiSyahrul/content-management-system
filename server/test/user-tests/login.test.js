module.exports = class Login {
  static testWhenValid(chai, server) {
    return it('It should return object that has "status", "message", "data" and "token" properties from logged in user', done => {
      chai
        .request(server)
        .post("/api/users/login")
        .send({
          email: "rofi@gmail.com",
          password: "abcD12345."
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
          res.body.message.should.equal("Log in success");
          res.body.data.should.be.a("object");
          res.body.data.should.have.property("email");
          res.body.data.email.should.equal("rofi@gmail.com");
          res.body.token.should.be.a("string");
          done();
        });
    });
  }

  static testWhenWrongPw(chai, server, expect) {
    return it('It should return object that has "status", "message", "data" and "token" properties from logged in user whose password is wrong', done => {
      chai
        .request(server)
        .post("/api/users/login")
        .send({
          email: "rofi@gmail.com",
          password: "abcD123."
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
          res.body.message.should.equal("Wrong email or password");
          expect(res.body.data).to.be.a("null");
          expect(res.body.token).to.be.a("null");
          done();
        });
    });
  }

  static testWhenEmailNotExist(chai, server, expect) {
    return it('It should return object that has "status", "message", "data" and "token" properties from logged in user whose email is not exist', done => {
      chai
        .request(server)
        .post("/api/users/login")
        .send({
          email: "sr@gmail.com",
          password: "abcD123."
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
          res.body.message.should.equal("Wrong email or password");
          expect(res.body.data).to.be.a("null");
          expect(res.body.token).to.be.a("null");
          done();
        });
    });
  }
};
