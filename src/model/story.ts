'use strict'

import { Connection, ObjectID } from 'typeorm'

import { connection } from '../database';
import { Story as Entity } from './entity/story';
import { Skill, getExistingOrCreateNewByName as getMentionedSkill, getOneById as getSkillById } from './skill';
import { SkillStory } from './entity/skillstory';

import { parseWrappedKeywords } from '../common/helpers';

export class Story {
  id: ObjectID;
  owner: string;
  sentence: string;
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
    this.sentence = dbObject.sentence;
  }

  setPropertiesFromPayload(userId: string, payload: any) {
    this.owner = userId;
    this.sentence = payload.sentence;
  }

  addSkill(skill: Skill) {
    for (let i = 0; i < this.skills.length; i++) {
      if (this.skills[i].id.toString() == skill.id.toString()) {
        return;
      }
    }
    this.skills.push(skill);
    skill.addStory(this);
  }

  save(): Promise<Object> {
    // TODO: Save skills to the temp story right before save it for the first time. Kind of hacky... Need to be refactored.
    let skillPromise = Promise.all(parseWrappedKeywords(this.sentence).map((skill: String) => {
      return getMentionedSkill(this.owner, skill);
    })).then((skills: Skill[]) => {
      for (let i = 0; i < skills.length; i++) {
        this.skills.push(skills[i]);
      }
    });

    return skillPromise.then(() => {
      return connection.then((conn: Connection) => {
        this.dbObject.owner = this.owner;
        this.dbObject.sentence = this.sentence;
        return Promise.all([conn, conn.manager.save(this.dbObject)]);
      }).then((values: any[]) => {
        let conn = values[0];
        let saved = values[1];

        // Delete all the relations and start over. Very primitive way, just, just, just for now.
        // Later, it will modify how it is already stored.
        return conn.manager.delete(SkillStory, {
          storyId: saved.id.toString()
        }).then(() => {
          const links = this.skills.map((skill: Skill) => {
            const link = new SkillStory();
            link.storyId = saved.id.toString();
            link.skillId = skill.id.toString();
            return link;
          });
          return conn.manager.save(links);
        });
      });
    });
  }

  delete(): Promise<Object> {
    return connection.then((conn: Connection) => {
      return conn.manager.delete(SkillStory, {
        storyId: this.id.toString()
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

      let obj = new Story();
      obj.setPropertiesFromDbObject(dbObject);

      if (cascade) {
        return conn.manager.find(SkillStory, { storyId: id })
          .then((relations: SkillStory[]) => {
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
          return conn.manager.find(SkillStory, { storyId: dbObject.id.toString() })
            .then((relations: SkillStory[]) => {
              return Promise.all([dbObject, ...(relations.map(relation => {
                return getSkillById(userId, relation.skillId);
              }))]);
            });
        });

        return Promise.all(promises).then((cascaded) => {
          return cascaded.map((items: any[]) => {
            let obj = new Story();
            obj.setPropertiesFromDbObject(items[0]);
            for (let i = 1; i < items.length; i++) {
              obj.skills.push(items[i]);
            }
            return obj;
          });
        });
      } else {
        return dbObjects.map(dbObject => {
          let obj = new Story();
          obj.setPropertiesFromDbObject(dbObject);
          return obj;
        });
      }
    });
}
