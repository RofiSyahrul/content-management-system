const chai = require("chai");
const chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);

const server = require("../app");
const Data = require("../models/data");

function testSearch(filter = {}) {
  return it('It should return an array of an object that has "_id", "letter", and "frequency" properties based on searched document', done => {
    chai
      .request(server)
      .post("/api/data/search")
      .send(filter)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a("array");
        const result = res.body[0];
        result.should.be.a("object");
        result.should.have.property("_id");
        result.should.have.property("letter");
        result.should.have.property("frequency");
        result._id.should.be.a("string");
        result.letter.should.equal("A");
        result.frequency.should.equal(1.1);
        done();
      });
  });
}

describe("Unit testing for Data", () => {
  beforeEach(done => {
    const data = new Data({ letter: "A", frequency: 1.1 });
    data.save(err => {
      if (err) console.error(err);
      else done();
    });
  });

  afterEach(done => {
    Data.collection.drop();
    done();
  });

  // search document in data collection based on letter and frequency
  testSearch({ letter: { $regex: "A", $options: "i" }, frequency: 1.1 });
  // search based on letter only
  testSearch({ letter: { $regex: "A", $options: "i" } });
  // search based on frequency only
  testSearch({ frequency: 1.1 });

  // get all documents in data collection
  it('It should return an array of an object that has "_id", "letter", and "frequency" properties', done => {
    chai
      .request(server)
      .get("/api/data")
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a("array");
        const result = res.body[0];
        result.should.be.a("object");
        result.should.have.property("_id");
        result.should.have.property("letter");
        result.should.have.property("frequency");
        result._id.should.be.a("string");
        result.letter.should.equal("A");
        result.frequency.should.equal(1.1);
        done();
      });
  });

  // edit a document in data collection
  it('It should return an object that has "success", "message", and "data" properties based on edited document', done => {
    chai
      .request(server)
      .post("/api/data/search")
      .send({ letter: "A", frequency: 1.1 })
      .end((err, res) => {
        const id = res.body[0]._id;
        chai
          .request(server)
          .put(`/api/data/${id}`)
          .send({ letter: "B", frequency: 1.2 })
          .end((err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            const result = res.body;
            result.should.be.a("object");
            result.should.have.property("success");
            result.should.have.property("message");
            result.should.have.property("data");
            result.success.should.equal(true);
            result.message.should.equal("Data have been updated.");
            result.data.should.be.a("object");
            result.data.should.have.property("_id");
            result.data.should.have.property("letter");
            result.data.should.have.property("frequency");
            result.data._id.should.equal(id);
            result.data.letter.should.equal("B");
            result.data.frequency.should.equal(1.2);
            done();
          });
      });
  });

  // add a document to data collection
  it('It should return an object that has "success", "message", and "data" properties based on added document', done => {
    chai
      .request(server)
      .post("/api/data")
      .send({ letter: "B", frequency: 1.2 })
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        const result = res.body;
        result.should.be.a("object");
        result.should.have.property("success");
        result.should.have.property("message");
        result.should.have.property("data");
        result.success.should.equal(true);
        result.message.should.equal("Data have been added.");
        result.data.should.be.a("object");
        result.data.should.have.property("_id");
        result.data.should.have.property("letter");
        result.data.should.have.property("frequency");
        result.data._id.should.be.a("string");
        result.data.letter.should.equal("B");
        result.data.frequency.should.equal(1.2);
        done();
      });
  });

  // delete a document from data collection
  it('It should return an object that has "success", "message", and "data" properties based on deleted document', done => {
    chai
      .request(server)
      .post("/api/data/search")
      .send({ letter: "A", frequency: 1.1 })
      .end((err, res) => {
        const id = res.body[0]._id;
        chai
          .request(server)
          .delete(`/api/data/${id}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            const result = res.body;
            result.should.be.a("object");
            result.should.have.property("success");
            result.should.have.property("message");
            result.should.have.property("data");
            result.success.should.equal(true);
            result.message.should.equal("Data have been deleted.");
            result.data.should.be.a("object");
            result.data.should.have.property("_id");
            result.data.should.have.property("letter");
            result.data.should.have.property("frequency");
            result.data._id.should.equal(id);
            result.data.letter.should.equal("A");
            result.data.frequency.should.equal(1.1);
            done();
          });
      });
  });

  // find a document from data collection
  it('It should return an object that has "success", "message", and "data" properties based on found document', done => {
    chai
      .request(server)
      .post("/api/data/search")
      .send({ letter: "A", frequency: 1.1 })
      .end((err, res) => {
        const id = res.body[0]._id;
        chai
          .request(server)
          .get(`/api/data/${id}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            const result = res.body;
            result.should.be.a("object");
            result.should.have.property("success");
            result.should.have.property("message");
            result.should.have.property("data");
            result.success.should.equal(true);
            result.message.should.equal("Data found.");
            result.data.should.be.a("object");
            result.data.should.have.property("_id");
            result.data.should.have.property("letter");
            result.data.should.have.property("frequency");
            result.data._id.should.equal(id);
            result.data.letter.should.equal("A");
            result.data.frequency.should.equal(1.1);
            done();
          });
      });
  });
});
