import "reflect-metadata";
import { _prod_ } from "./constants";
import express from "express";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver, UserResolver } from "./resolvers";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import { ChatRoom } from "./entities/ChatRoom";
import { Message } from "./entities/Message";

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    logging: true,
    synchronize: true,
    extra: { rejectUnauthorized: false },
    entities: [User, ChatRoom, Message], // add entities
  });
  console.log("connected at", conn.name);

  const app = express();
  app.set("trust proxy", true);

  app.use(cors());

  const apolloServer = new ApolloServer({
    introspection: true,
    schema: await buildSchema({
      resolvers: [UserResolver, HelloResolver], // add resolvers
      validate: false,
    }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen({ port: process.env.PORT || 4000 }, () => {
    console.log("server started on localhost:4000");
  });
};
main();
