const objectKeyList = ['skills', 'stories'];

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
    for (let i = 0; i < objectKeyList.length; i++) {
      if (obj[objectKeyList[i]]) {
        pluckDbObject(obj[objectKeyList[i]]);
      }
    }
  }

  return obj;
}
