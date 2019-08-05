export function pluckDbObject(obj: any) {
  if (obj.length) {
    for(let i = 0; i < obj.length; i++) {
      pluckDbObject(obj[i]);
    }
  }
  else {
    if (obj.dbObject) {
      delete obj.dbObject;
    }
  }

  return obj;
}
