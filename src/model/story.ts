'use strict'

import { Connection, ObjectID } from 'typeorm'

import { connection } from '../database';
import { parseWrappedKeywords } from '../common/helpers';

import { Story as Entity } from './entity/story';
import { Chapter, getOneById as getChapterById } from './chapter';
import { Skill, getExistingOrCreateNewByName as getMentionedSkill } from './skill';

export class Story {
  id: ObjectID;
  owner: string;
  chapter: Chapter;
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
    this.chapter = payload.chapter;
    this.sentence = payload.sentence;
  }

  save(): Promise<Object> {
    let promises: Promise<void | Connection | Skill | Object>[] = [];
    promises.push(connection);
    let skills = parseWrappedKeywords(this.sentence);
    for (let i = 0; i < skills.length; i++) {
      promises.push(getMentionedSkill(this.owner, skills[i]))
    }
    return Promise.all(promises)
      .then((values: any) => {
        let conn = values[0];
        for (let i = 1; i < values.length; i++) {
          this.chapter.addSkill(values[i]);
        }
        return this.chapter.save().then(() => conn);
      }).then((conn: Connection) => {
        this.dbObject.owner = this.owner;
        this.dbObject.chapterId = this.chapter.id.toString();
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

      return Promise.all([dbObject, getChapterById(userId, dbObject.chapterId.toString())])
    })
    .then((values: [Entity, Chapter]) => {
      let dbObject = values[0];
      let chapter = values[1];

      let obj = new Story();
      obj.setPropertiesFromDbObject(dbObject);
      obj.chapter = chapter;

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
