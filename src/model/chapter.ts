'use strict'

import { Connection, ObjectID } from 'typeorm'

import { connection } from '../database';
import { Chapter as Entity } from './entity/chapter';
import { Skill, getOneById as getSkillById } from './skill';
import { Story, getOneById as getStoryById } from './story';
import { SkillChapter as SkillChapterEntity } from './entity/skillchapter';
import { Story as StoryEntity } from './entity/story';
import { ILink } from '../interface/link';

export class Chapter {
  id: ObjectID;
  owner: string;
  title: string;
  type: string;
  link: ILink;
  skills: Skill[];
  stories: Story[];
  dbObject: Entity;

  constructor(userId?: string, payload?: any) {
    if (userId && payload) {
      this.setPropertiesFromPayload(userId, payload);
    }
    this.dbObject = new Entity();
    this.skills = [];
    this.stories = [];
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

  addStory(story: Story) {
    for (let i = 0; i < this.stories.length; i++) {
      if (this.stories[i].id.toString() == story.id.toString()) {
        return;
      }
    }
    this.stories.push(story);
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
      return conn.manager.delete(SkillChapterEntity, {
        chapterId: saved.id.toString()
      }).then(() => {
        const links = this.skills.map((skill: Skill) => {
          const link = new SkillChapterEntity();
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
      return conn.manager.delete(SkillChapterEntity, {
        chapterId: this.id.toString()
      }).then(() => conn);
    }).then((conn: Connection) => {
      return conn.manager.delete(Story, {
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
        let promise_skills: Promise<Object[]> = conn.manager.find(SkillChapterEntity, { chapterId: id })
          .then((relations: SkillChapterEntity[]) => {
            let promises: Promise<Object>[] = relations.map(relation => {
              return getSkillById(userId, relation.skillId);
            });
            return Promise.all(promises);
          });
        let promise_stories: Promise<Object[]> = conn.manager.find(StoryEntity, { chapterId: id });

        return Promise.all([promise_skills, promise_stories]).then((values: any) => {
          let skills = values[0];
          let stories = values[1];

          skills.forEach((skill: Skill) => {
            obj.skills.push(skill);
          });

          stories.forEach((story: Story) => {
            obj.stories.push(story);
          });

          return obj as any;
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
          return conn.manager.find(SkillChapterEntity, { chapterId: dbObject.id.toString() })
            .then((relations: SkillChapterEntity[]) => {
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
