
import * as graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';

import { createEntity, deleteEntityById, getOneById, getAll } from './handler/common';

const schema = buildSchema(`
  type Query {
    hello: String
    skills: [Skill!]!
    skill(id: ID!): Skill
    stories: [Story!]!
    story(id: ID!): Story
  }

  type Skill {
    id: ID!
    name: String
    stories: [Story!]
  }

  type Story {
    id: ID!
    sentence: String
    skills: [Skill!]
  }

  input SkillInput {
    name: String
  }

  input StoryInput {
    sentence: String
  }

  type Mutation {
    createSkill(input: SkillInput): Skill
    createStory(input: StoryInput): Story
    deleteSkillById(id: ID): Boolean
    deleteStoryById(id: ID): Boolean
  }
`);

const root = {
  hello: () => {
    return 'Hello world';
  },
  skills: () => {
    return getAll('skill', true);
  },
  stories: () => {
    return getAll('story', true);
  },
  skill: args => {
    return getOneById('skill', args.id, true);
  },
  story: args => {
    return getOneById('story', args.id, true);
  },
  Skill: {
    id: parent => parent.id,
    name: parent => parent.name,
    stories: parent => parent.stories
  },
  Story: {
    id: parent => parent.id,
    sentence: parent => parent.sentence,
    skills: parent => parent.skills
  },
  createSkill: ({input}) => {
    return createEntity('skill', input);
  },
  createStory: ({input}) => {
    return createEntity('story', input);
  },
  deleteSkillById: args => {
    return deleteEntityById('skill', args.id).then(() => {
      return true;
    }).catch(() => {
      return false;
    });;
  },
  deleteStoryById: args => {
    return deleteEntityById('story', args.id).then(() => {
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
