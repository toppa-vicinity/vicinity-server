import { ChatRoom } from "src/entities/ChatRoom";
import { Message } from "src/entities/Message";
import { Query, Resolver, Mutation, InputType, Field, Arg } from "type-graphql";

@InputType()
class MessageInput {
  @Field()
  sender!: number;

  @Field()
  receiver!: number;

  @Field({ nullable: true })
  content: string;
}

@Resolver()
export class ChatResolver {
  @Query(() => [Message])
  async getMessages(@Arg("input") input: MessageInput): Promise<Message[]> {
    const chatroom = await ChatRoom.findOne({
      where: { user: new Set<number>([input.sender, input.receiver]) },
    });
    return Message.find({ where: { chatRoom: chatroom } });
  }

  @Mutation(() => Message)
  async sendMessage(@Arg("input") input: MessageInput): Promise<Message> {
    const chatroom = await ChatRoom.findOne({
      where: { user: new Set<number>([input.sender, input.receiver]) },
    });
    return await Message.create({ ...input, chatRoom: chatroom }).save();
  }
}
