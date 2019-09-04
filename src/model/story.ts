'use strict'

import { Connection, ObjectID } from 'typeorm'

import { connection } from '../database';
import { Story as Entity } from './entity/story';
import { Skill, getExistingOrCreateNewByName as getMentionedSkill, getOneById as getSkillById } from './skill';

export class Story {
  id: ObjectID;
  owner: string;
  sentence: string;
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
    this.sentence = dbObject.sentence;
  }

  setPropertiesFromPayload(userId: string, payload: any) {
    this.owner = userId;
    this.sentence = payload.sentence;
  }

  save(): Promise<Object> {
    return connection.then((conn: Connection) => {
      this.dbObject.owner = this.owner;
      this.dbObject.sentence = this.sentence;
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

      let obj = new Story();
      obj.setPropertiesFromDbObject(dbObject);

      return obj;
    });
}

export function getAll(userId: string): Promise<Object> {
  return connection
    .then((conn: Connection) => conn.manager.find(Entity, { owner: userId }))
    .then((dbObjects: Entity[]) => {
      if (!dbObjects || dbObjects.length < 1) {
        return null;
      }

      return dbObjects.map(dbObject => {
        let obj = new Story();
        obj.setPropertiesFromDbObject(dbObject);
        return obj;
      });
    });
}
