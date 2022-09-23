import { ClasschartsStudentClient } from "../src";
import { code, dob } from "./config.json";
import "jest-extended";
const client = new ClasschartsStudentClient(code, dob);
jest.setTimeout(10000);

test("client logs in with correct credentials", () => {
  return expect(client.login()).resolves.not.toThrow();
});

test("client fails to login with incorrect credentials", () => {
  const fakeClient = new ClasschartsStudentClient("rewrew", "123");
  return expect(fakeClient.login()).rejects.toThrowError();
});

test("client returns student data", () => {
  return expect(client.getStudentInfo()).resolves.toBeObject();
});

test("client returns activity data", () => {
  return expect(client.getActivity()).resolves.toBeArray();
});

test("client returns full activity", () => {
  return client
    .getFullActivity({ from: "2022-01-01", to: "2022-09-01" })
    .then((data) => {
      let valid = false;
      if (data.length > 0) valid = true;
      expect(valid).toBeTrue();
    });
});

test("client returns behaviour data", () => {
  return expect(client.getBehaviour()).resolves.toBeObject();
});

test("client returns homework data", () => {
  return expect(client.listHomeworks()).resolves.toBeArray();
});

test("client returns badges", () => {
  expect(client.getBadges()).resolves.toBeArray();
});
