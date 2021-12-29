import { ObservableBase, ValueSetters } from "./types";

function fieldNameToSetterName(fieldName: string) {
  return "set" + fieldName.slice(0, 1).toUpperCase() + fieldName.slice(1);
}
function hasSetterDefined(fieldName: string, observableBase: ObservableBase) {
  return fieldNameToSetterName(fieldName) in observableBase;
}
function setterNameToFieldName(setterName: string) {
  return setterName[3].toLowerCase() + setterName.slice(4);
}
function isSetterWithDefinedField(key: string, observableBase: ObservableBase) {
  return /^set[A-Z]/.test(key) && setterNameToFieldName(key) in observableBase;
}
function shouldDefineSetter(key: string, observableBase: ObservableBase) {
  if (observableBase[key] instanceof Function) {
    return false;
  }
  if (isSetterWithDefinedField(key, observableBase)) {
    return false;
  }
  if (hasSetterDefined(key, observableBase)) {
    return false; // do not override custom setters.
    // If they define a field with a setter's name + a non-function value, TypeScript will punish them,
    // as their resultant type will include FunctionType & ValueType for the field
  }
  return true;
}
function shouldDefineErroringSetter(
  key: string,
  observableBase: ObservableBase
) {
  const { get, set } =
    Object.getOwnPropertyDescriptor(observableBase, key) || {};
  return get instanceof Function && set === undefined;
}

// mutates in-place
export function addValueSettersWhereNoExist<T extends {}>(
  obj: T
): T & ValueSetters<T> {
  Object.keys(obj).forEach((key) => {
    if (!shouldDefineSetter(key, obj)) {
      return;
    }
    const setterName = fieldNameToSetterName(key);
    const asRecord = obj as Record<string, any>;
    if (shouldDefineErroringSetter(key, obj)) {
      asRecord[setterName] = function () {
        throw Error(
          `can't set value for computed property "${key}" using auto-generated setter`
        );
      };
    } else {
      asRecord[setterName] = function (value: any) {
        asRecord[key] = value;
      };
    }
  });
  return obj as T & ValueSetters<T>;
}
