const UserService = require("../../user/userService");
const sinon = require("sinon");

describe("UserService test", () => {
  it("has a module", () => {
    expect(UserService).toBeDefined();
  });

  it("getUser test", () => {
    const MockModel = {
      findUserById: sinon.spy(),
    };

    const userService = UserService(MockModel);
    userService.findUser("1023jkdjsla");
    const expected = true;

    const actual = MockModel.findUserById.calledOnce;
    expect(actual).toEqual(expected);
  });
});
