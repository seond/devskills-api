
import * as graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';

import { createEntity, deleteEntityById, getOneById, getAll } from './handler/common';

const schema = buildSchema(`
  type Query {
    hello: String
    chapters(userId: String!): [Chapter!]!
    chapter(userId: String!, id: ID!): Chapter
    skills(userId: String!): [Skill!]!
    skill(userId: String!, id: ID!): Skill
    stories(userId: String!): [Story!]!
    story(userId: String!, id: ID!): Story
  }

  type Chapter {
    id: ID!
    owner: String
    title: String
    type: String
  }

  type Skill {
    id: ID!
    owner: String
    name: String
  }

  type Story {
    id: ID!
    owner: String
    sentence: String
  }

  input ChapterInput {
    type: String
    title: String
  }

  input SkillInput {
    name: String
  }

  input StoryInput {
    sentence: String
  }

  type Mutation {
    createChapter(userId: String, input: ChapterInput): Chapter
    createSkill(userId: String, input: SkillInput): Skill
    createStory(userId: String, input: StoryInput): Story
    deleteChapterById(userId: String, id: ID): Boolean
    deleteSkillById(userId: String, id: ID): Boolean
    deleteStoryById(userId: String, id: ID): Boolean
  }
`);

const root = {
  hello: () => {
    return 'Hello world';
  },
  chapters: args => {
    return getAll('chapter', args.userId, true);
  },
  skills: args => {
    return getAll('skill', args.userId, true);
  },
  stories: args => {
    return getAll('story', args.userId, true);
  },
  skill: args => {
    return getOneById('skill', args.userId, args.id, true);
  },
  story: args => {
    return getOneById('story', args.userId, args.id, true);
  },
  Chapter: {
    id: parent => parent.id,
    owner: parent => parent.owner,
    title: parent => parent.title,
    type: parent => parent.type
  },
  Skill: {
    id: parent => parent.id,
    owner: parent => parent.owner,
    name: parent => parent.name
  },
  Story: {
    id: parent => parent.id,
    owner: parent => parent.owner,
    sentence: parent => parent.sentence
  },
  createChapter: (args) => {
    return createEntity('chapter', args.userId, args.input);
  },
  createSkill: (args) => {
    return createEntity('skill', args.userId, args.input);
  },
  createStory: (args) => {
    return createEntity('story', args.userId, args.input);
  },
  deleteChapterById: args => {
    return deleteEntityById('chapter', args.userId, args.id).then(() => {
      return true;
    }).catch(() => {
      return false;
    });;
  },
  deleteSkillById: args => {
    return deleteEntityById('skill', args.userId, args.id).then(() => {
      return true;
    }).catch(() => {
      return false;
    });;
  },
  deleteStoryById: args => {
    return deleteEntityById('story', args.userId, args.id).then(() => {
      return true;
    }).catch(() => {
      return false;
    });
  }
};

export const middleware = graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true
});
