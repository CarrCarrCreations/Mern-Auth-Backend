const expect = require("chai").expect;
const request = require("supertest");

// File we are testing
const app = require("../../../index");

// File connected to the database
const conn = require("../../../repository/mongooseConfig");

describe("POST /users", () => {
  before((done) => {});
});
