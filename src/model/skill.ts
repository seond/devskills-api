'use strict'

import { Connection, ObjectID } from 'typeorm'

import { connection } from '../database';
import { Skill as Entity } from './entity/skill';

export class Skill {
  id: ObjectID;
  owner: string;
  name: string;
  dbObject: Entity;

  constructor(userId?: string, payload?: any) {
    if (userId && payload) {
      this.setPropertiesFromPayload(userId, payload);
    }
    this.dbObject = new Entity();
  }

  setPropertiesFromDbObject(dbObject: Entity) {
    this.dbObject = dbObject;
    this.id = dbObject.id;
    this.owner = dbObject.owner;
    this.name = dbObject.name;
  }

  setPropertiesFromPayload(userId: string, payload: any) {
    this.owner = userId;
    this.name = payload.name;
  }

  save(): Promise<Object> {
    return connection.then((conn: Connection) => {
      this.dbObject.owner = this.owner;
      this.dbObject.name = this.name; // It's here for now but will be moved
      return conn.manager.save(this.dbObject);
    });
  }

  delete(): Promise<Object> {
    return connection.then((conn: Connection) => {
      return conn.manager.remove(this.dbObject);
    });
  }
}

export function getOneById(userId: string, id: string): Promise<Object> {
  return connection
    .then((conn: Connection) => conn.manager.findOne(Entity, id))
    .then((dbObject: Entity) => {
      if (!dbObject || dbObject.owner !== userId) {
        return null;
      }

      let obj = new Skill();
      obj.setPropertiesFromDbObject(dbObject);

      return obj;
    });
}

export function getAll(userId: string): Promise<Object> {
  return connection
    .then((conn: Connection) => conn.manager.find(Entity, { owner: userId }))
    .then((dbObjects: Entity[]) => {
      if (!dbObjects) {
        return null;
      }

      return dbObjects.map(dbObject => {
        let obj = new Skill();
        obj.setPropertiesFromDbObject(dbObject);
        return obj;
      });
    });
}

export function getExistingOrCreateNewByName(owner: string, name: String): Promise<Object> {
  return connection
    .then((conn: Connection) => conn.manager.find('skill', { owner, name }))
    .then((dbObjects: Entity[]) => {
      if (dbObjects && dbObjects.length > 0) {
        return dbObjects[0];
      }

      let obj = new Skill(owner, { name });
      return obj.save();
    });
}
