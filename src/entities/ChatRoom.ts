import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Message } from "./Message";

@ObjectType()
@Entity()
export class ChatRoom extends BaseEntity {
  @Field() // added to expose the field, which other wise we cannot query
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  with!: number;

  @OneToMany(() => Message, (msg) => msg.chatRoom)
  messages: Message[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
