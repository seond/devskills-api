'use strict'

import { Connection, ObjectID } from 'typeorm'

import { connection } from '../database';
import { Chapter as Entity } from './entity/chapter';
import { Skill, getOneById as getSkillById } from './skill';
import { SkillChapter } from './entity/skillchapter';
import { ILink } from '../interface/link';

export class Chapter {
  id: ObjectID;
  owner: string;
  title: string;
  type: string;
  link: ILink;
  skills: Skill[];
  dbObject: Entity;

  constructor(userId?: string, payload?: any) {
    if (userId && payload) {
      this.setPropertiesFromPayload(userId, payload);
    }
    this.dbObject = new Entity();
    this.skills = [];
  }

  setPropertiesFromDbObject(dbObject: Entity) {
    this.dbObject = dbObject;
    this.id = dbObject.id;
    this.owner = dbObject.owner;
    this.title = dbObject.title;
    this.type = dbObject.type;
    this.link = dbObject.link;
  }

  setPropertiesFromPayload(userId: string, payload: any) {
    this.owner = userId;
    this.title = payload.title;
    this.type = payload.type;
    this.link = payload.link;
  }

  addSkill(skill: Skill) {
    for (let i = 0; i < this.skills.length; i++) {
      if (this.skills[i].id.toString() == skill.id.toString()) {
        return;
      }
    }
    this.skills.push(skill);
  }

  save(): Promise<Object> {
    return connection.then((conn: Connection) => {
      this.dbObject.owner = this.owner;
      this.dbObject.title = this.title;
      this.dbObject.type = this.type;
      this.dbObject.link = this.link;
      return Promise.all([conn, conn.manager.save(this.dbObject)]);
    }).then((values: any[]) => {
      let conn = values[0];
      let saved = values[1];

      // Delete all the relations and start over. Very primitive way, just, just, just for now.
      // Later, it will modify how it is already stored.
      return conn.manager.delete(SkillChapter, {
        chapterId: saved.id.toString()
      }).then(() => {
        const links = this.skills.map((skill: Skill) => {
          const link = new SkillChapter();
          link.chapterId = saved.id.toString();
          link.skillId = skill.id.toString();
          return link;
        });
        return conn.manager.save(links);
      }).then(() => {
        return saved;
      });
    });
  }

  delete(): Promise<Object> {
    return connection.then((conn: Connection) => {
      return conn.manager.delete(SkillChapter, {
        chapterId: this.id.toString()
      }).then(() => conn);
    }).then((conn: Connection) => {
      return conn.manager.remove(this.dbObject);
    });
  }
}

export function getOneById(userId: string, id: string, cascade: boolean = false): Promise<Object> {
  return connection
    .then((conn: Connection) => Promise.all([conn, conn.manager.findOne(Entity, id)]))
    .then((values: any[]) => {
      let conn = values[0];
      let dbObject = values[1];
      if (!dbObject && dbObject.owner !== userId) {
        return null;
      }

      let obj = new Chapter();
      obj.setPropertiesFromDbObject(dbObject);

      if (cascade) {
        return conn.manager.find(SkillChapter, { chapterId: id })
          .then((relations: SkillChapter[]) => {
            let promises = relations.map(relation => {
              return getSkillById(userId, relation.skillId);
            });
            return Promise.all(promises);
          }).then((skills: Skill[]) => {
            skills.forEach((skill: Skill) => {
              obj.skills.push(skill);
            });
            return obj;
          });
      } else {
        return obj;
      }
    }).catch(error => {
      console.error(error);
    });
}

export function getAll(userId: string, cascade: boolean = false): Promise<Object> {
  return connection
    .then((conn: Connection) => Promise.all([conn, conn.manager.find(Entity, { owner: userId })]))
    .then((values: any[]) => {
      let conn = values[0];
      let dbObjects = values[1];

      if (!dbObjects) {
        return null;
      }

      if (cascade) {
        let promises = dbObjects.map(dbObject => {
          return conn.manager.find(SkillChapter, { chapterId: dbObject.id.toString() })
            .then((relations: SkillChapter[]) => {
              return Promise.all([dbObject, ...(relations.map(relation => {
                return getSkillById(userId, relation.skillId);
              }))]);
            });
        });

        return Promise.all(promises).then((cascaded) => {
          return cascaded.map((items: any[]) => {
            let obj = new Chapter();
            obj.setPropertiesFromDbObject(items[0]);
            for (let i = 1; i < items.length; i++) {
              obj.skills.push(items[i]);
            }
            return obj;
          });
        });
      } else {
        return dbObjects.map(dbObject => {
          let obj = new Chapter();
          obj.setPropertiesFromDbObject(dbObject);
          return obj;
        });
      }
    });
}
