'use strict'

import { Connection, ObjectID } from 'typeorm'

import { connection } from '../database';
import { Story as Entity } from './entity/story';

export class Story {
  id: ObjectID;
  sentence: string;
  dbObject: Entity;

  constructor(payload?: any) {
    if(payload) {
      this.setPropertiesFromPayload(payload);
    }
    this.dbObject = new Entity();
  }

  setPropertiesFromDbObject(dbObject: Entity) {
    this.dbObject = dbObject;
    if(dbObject.sentence) {
      this.sentence = dbObject.sentence;
    }
  }

  setPropertiesFromPayload(payload: any) {
    if(payload.sentence) {
      this.sentence = payload.sentence;
    }
  }

  getEntity() {
    return this.dbObject;
  }

  save(): Promise<Object> {
    this.dbObject.sentence = this.sentence; // It's here for now but will be moved

    return connection.then((conn: Connection) => {
      return conn.manager.save(this.dbObject);
    });
  }
}

export function getOneById(id: string): Promise<Object> {
  return connection
    .then((conn: Connection) => conn.manager.findOne(Entity, id))
    .then((dbObject: Entity) => {
      let obj = new Story();
      obj.setPropertiesFromDbObject(dbObject);
      return obj;
    });
}
