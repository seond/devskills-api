'use strict'

import { Connection, ObjectID } from 'typeorm'

import { connection } from '../database';
import { Skill as Entity } from './entity/skill';

export class Skill {
  id: ObjectID;
  name: string;
  dbObject: Entity;

  constructor(payload?: any) {
    if(payload) {
      this.setPropertiesFromPayload(payload);
    }
    this.dbObject = new Entity();
  }

  setPropertiesFromDbObject(dbObject: Entity) {
    this.dbObject = dbObject;
    if(dbObject.name) {
      this.name = dbObject.name;
    }
  }

  setPropertiesFromPayload(payload: any) {
    if(payload.name) {
      this.name = payload.name;
    }
  }

  getEntity() {
    return this.dbObject;
  }

  save(): Promise<Object> {
    this.dbObject.name = this.name; // It's here for now but will be moved

    return connection.then((conn: Connection) => {
      return conn.manager.save(this.dbObject);
    });
  }
}

export function getOneById(id: string): Promise<Object> {
  return connection
    .then((conn: Connection) => conn.manager.findOne(Entity, id))
    .then((dbObject: Entity) => {
      let obj = new Skill();
      obj.setPropertiesFromDbObject(dbObject);
      return obj;
    });
}
