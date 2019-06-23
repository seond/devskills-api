import { Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm';

@Entity()
export class SkillStory {

    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    skillId: string;

    @Column()
    storyId: string;
}
