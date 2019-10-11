const chai = require("chai");
const chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);

const server = require("../app");
const Maps = require("../models/map");

describe("Unit testing for Map", () => {
  beforeEach(done => {
    const maps = new Maps({
      title: "Trans Studio Mall",
      lat: -6.9261257,
      long: 107.6343728
    });
    maps.save(err => {
      if (err) console.error(err);
      else {
        const maps2 = new Maps({
          title: "Cihampelas Walk",
          lat: -6.8965475,
          long: 107.6103536
        });
        maps2.save(err => {
          if (err) console.error(err);
          else done();
        });
      }
    });
  });

  afterEach(done => {
    Maps.collection.drop();
    done();
  });

  // search document in maps collection based on title
  it('It should return an array of an object that has "_id", "title", "lat", and "long" properties based on searched document', done => {
    chai
      .request(server)
      .post("/api/maps/search")
      .send({ title: "Trans Studio Mall" })
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a("array");
        const result = res.body[0];
        result.should.be.a("object");
        result.should.have.property("_id");
        result.should.have.property("title");
        result.should.have.property("lat");
        result.should.have.property("long");
        result._id.should.be.a("string");
        result.title.should.equal("Trans Studio Mall");
        result.lat.should.equal(-6.9261257);
        result.long.should.equal(107.6343728);
        done();
      });
  });

  // get all documents in maps collection
  it('It should return an array of two objects each has "_id", "title", "lat", and "long" properties', done => {
    chai
      .request(server)
      .get("/api/maps")
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a("array");
        res.body.length.should.equal(2);
        let result = res.body[0];
        result.should.be.a("object");
        result.should.have.property("_id");
        result.should.have.property("title");
        result.should.have.property("lat");
        result.should.have.property("long");
        result._id.should.be.a("string");
        result.title.should.equal("Trans Studio Mall");
        result.lat.should.equal(-6.9261257);
        result.long.should.equal(107.6343728);
        result = res.body[1];
        result.should.be.a("object");
        result.should.have.property("_id");
        result.should.have.property("title");
        result.should.have.property("lat");
        result.should.have.property("long");
        result._id.should.be.a("string");
        result.title.should.equal("Cihampelas Walk");
        result.lat.should.equal(-6.8965475);
        result.long.should.equal(107.6103536);
        done();
      });
  });

  // edit a document in maps collection
  it('It should return an object that has "success", "message", and "data" properties based on edited document', done => {
    chai
      .request(server)
      .post("/api/maps/search")
      .send({ title: "Cihampelas Walk" })
      .end((err, res) => {
        const id = res.body[0]._id;
        chai
          .request(server)
          .put(`/api/maps/${id}`)
          .send({ title: "Ciwalk", lat: -6.8965453, long: 107.6103536 })
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
            result.data.should.have.property("title");
            result.data.should.have.property("lat");
            result.data.should.have.property("long");
            result.data._id.should.equal(id);
            result.data.title.should.equal("Ciwalk");
            result.data.lat.should.equal(-6.8965453);
            result.data.long.should.equal(107.6103536);
            done();
          });
      });
  });

  // add a document to maps collection
  it('It should return an object that has "success", "message", and "data" properties based on added document', done => {
    chai
      .request(server)
      .post("/api/maps")
      .send({ title: "Ubertos", lat: -6.914215, long: 107.6966 })
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
        result.data.should.have.property("title");
        result.data.should.have.property("lat");
        result.data.should.have.property("long");
        result.data._id.should.be.a("string");
        result.data.title.should.equal("Ubertos");
        result.data.lat.should.equal(-6.914215);
        result.data.long.should.equal(107.6966);
        done();
      });
  });

  // delete a document from maps collection
  it('It should return an object that has "success", "message", and "data" properties based on deleted document', done => {
    chai
      .request(server)
      .post("/api/maps/search")
      .send({ title: "Cihampelas Walk" })
      .end((err, res) => {
        const id = res.body[0]._id;
        chai
          .request(server)
          .delete(`/api/maps/${id}`)
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
            result.data.should.have.property("title");
            result.data.should.have.property("lat");
            result.data._id.should.equal(id);
            result.data.title.should.equal("Cihampelas Walk");
            result.data.lat.should.equal(-6.8965475);
            result.data.long.should.equal(107.6103536);
            done();
          });
      });
  });

  // find a document from maps collection
  it('It should return an object that has "success", "message", and "data" properties based on found document', done => {
    chai
      .request(server)
      .post("/api/maps/search")
      .send({ title: "Cihampelas Walk" })
      .end((err, res) => {
        const id = res.body[0]._id;
        chai
          .request(server)
          .get(`/api/maps/${id}`)
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
            result.data.should.have.property("title");
            result.data.should.have.property("lat");
            result.data._id.should.equal(id);
            result.data.title.should.equal("Cihampelas Walk");
            result.data.lat.should.equal(-6.8965475);
            result.data.long.should.equal(107.6103536);
            done();
          });
      });
  });
});
