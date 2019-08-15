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

export function parseWrappedKeywords(str: String): String[] {
  let parsed = [];
  let parsing = false;
  let wordInProgress;

  for(let i = 0; i < str.length; i++) {
    if (str[i] === '`') {
      if (parsing) {
        if (wordInProgress.length > 0) {
          parsed.push(wordInProgress);
        }
        parsing = false;
      }
      else {
        parsing = true;
        wordInProgress = '';
      }
    }
    else {
      if (parsing) {
        wordInProgress += str[i];
      }
    }
  }

  return parsed;
}
