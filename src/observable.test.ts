import { autorun } from "mobx";
import { observable } from "./main";

test("observable + autorun", () => {
  const state = observable("myObs", {
    v: 2,
    updateV(newValue: number) {
      state.v = newValue;
    },
    get doubleV() {
      return this.v * 2;
    },
    get quadrupleV() {
      return this.doubleV * 2;
    },
  });

  const doubleVRunner = jest.fn(() => {
    expect(state.v * 2).toEqual(state.doubleV);
    return state.doubleV;
  });
  autorun(doubleVRunner);

  const quadrupleVRunner = jest.fn(() => {
    expect(state.v * 4).toEqual(state.quadrupleV);
    return state.quadrupleV;
  });
  autorun(quadrupleVRunner);

  expect(state.v).toEqual(2);
  expect(state.doubleV).toEqual(4);
  state.updateV(3);
  expect(state.v).toEqual(3);
  expect(state.doubleV).toEqual(6);

  expect(doubleVRunner).toHaveBeenCalledTimes(2);
  expect(doubleVRunner).toHaveReturnedWith(4);
  expect(doubleVRunner).toHaveReturnedWith(6);

  expect(quadrupleVRunner).toHaveBeenCalledTimes(2);
  expect(quadrupleVRunner).toHaveReturnedWith(8);
  expect(quadrupleVRunner).toHaveReturnedWith(12);
});

test("auto-generated setters", () => {
  const myObs = observable("withSettersObs", {
    a: 2,
  });
  expect(myObs.a).toBe(2);
  expect(typeof myObs.setA).toBe("function");
  myObs.setA(3);
  expect(myObs.a).toBe(3);
});

test("custom setters + setting new setters works", () => {
  const myObs = observable("horribleSetterSetterThing", {
    a: 2,
    setA(v: number) {
      this.a = v * 2;
    },
  });
  expect(myObs.a).toEqual(2);
  myObs.setA(2);
  expect(myObs.a).toEqual(4);
  myObs.setSetA(function (v: number) {
    myObs.a = v * 3;
  });
  myObs.setA(2);
  expect(myObs.a).toBe(6);
});