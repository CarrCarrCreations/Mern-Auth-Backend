const AuthService = require("../../service/authService");
const sinon = require("sinon");

describe("UserService test", () => {
  it("has a module", () => {
    expect(AuthService).toBeDefined();
  });

  it("getUser test", () => {
    const MockRepository = {
      findUserById: sinon.spy(),
    };

    const userService = AuthService(MockRepository);
    userService.findUser("1023jkdjsla");
    const expected = true;

    const actual = MockRepository.findUserById.calledOnce;
    expect(actual).toEqual(expected);
  });
});
