const request = require("supertest");
const axios = require("axios");

const app = require("../../index");
const userRouter = require("../../routes/userRouter");
const userModel = require("../../repository/models/userModel");
const userService = require("../../service/UserService");

const { conn } = require("../../repository/mongooseConfig");
conn.connect();

beforeAll(async () => {
  return connect;
});

describe("just testing", () => {
  it("return true", () => {
    expect(true).toBe(true);
  });
});

describe("POST@/users", () => {
  it("Should create and return a new user with status 200", () => {
    axios
      .post("http://localhost:4000/ideas", {
        email: "carrcarr670@gmail.com",
        password: "test1",
        passwordCheck: "test1",
      })
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.log(error);
      });
  });
});
