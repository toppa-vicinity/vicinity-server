import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";
import { User } from "./User";

@ObjectType()
@Entity()
export class Message extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column()
    sentBy!: User

    @Field()
    @Column()
    sentFrom?: User

    @Field()
    @Column()
    timeStamp!: Date

    @Field()
    @Column()
    content!: string
}