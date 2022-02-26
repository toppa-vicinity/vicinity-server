import "reflect-metadata";
import { _prod_ } from "./constants";
import express from "express";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/user";
import { HelloResolver } from "./resolvers/hello";
import { MyContext } from "./types";
// import { createConnection } from "typeorm";
// import { User } from "./entities/User";
import { createPool } from "mysql";

const main = async () => {
  await createPool({
    // type: "mysql",
    host: "toppa-vicinity-dev.cnxtjh97j1g2.us-east-1.rds.amazonaws.com",
    port: 3306,
    // name: "toppa_vicinity_dev",
    user: "vicinity_dev",
    password: "toppa_vicinity_dev6",
    // logging: true,
    // synchronize: true,
    // entities: [User], // add entities
  });

  const app = express();
  app.set("trust proxy", true);

  app.use(cors());

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, HelloResolver], // add resolvers
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      req,
      res,
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
