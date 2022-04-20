"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = exports.FieldError = void 0;
const User_1 = require("../entities/User");
const type_graphql_1 = require("type-graphql");
const argon2_1 = __importDefault(require("argon2"));
const typeorm_1 = require("typeorm");
let UsernamePasswordInput = class UsernamePasswordInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UsernamePasswordInput.prototype, "username", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UsernamePasswordInput.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UsernamePasswordInput.prototype, "password", void 0);
UsernamePasswordInput = __decorate([
    (0, type_graphql_1.InputType)()
], UsernamePasswordInput);
let BeFriendInput = class BeFriendInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], BeFriendInput.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], BeFriendInput.prototype, "with", void 0);
BeFriendInput = __decorate([
    (0, type_graphql_1.InputType)()
], BeFriendInput);
let FieldError = class FieldError {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    (0, type_graphql_1.ObjectType)()
], FieldError);
exports.FieldError = FieldError;
let UserResponse = class UserResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], UserResponse.prototype, "user", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], UserResponse.prototype, "token", void 0);
UserResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserResponse);
let UserResolver = class UserResolver {
    me({}) {
    }
    listusers() {
        return User_1.User.find();
    }
    clear() {
        return User_1.User.clear();
    }
    async register(options, {}) {
        if (options.username.length <= 2) {
            return {
                errors: [
                    { field: "username", message: "length must be greater than 2" },
                ],
            };
        }
        if (options.username.includes("@")) {
            return {
                errors: [
                    { field: "username", message: "username cannot have symbol @" },
                ],
            };
        }
        if (options.password.length <= 3) {
            return {
                errors: [
                    { field: "password", message: "length must be greater than 3" },
                ],
            };
        }
        if (!options.email || !options.email.includes("@")) {
            return {
                errors: [{ field: "email", message: "invalid email" }],
            };
        }
        const hashedpassword = await argon2_1.default.hash(options.password);
        let user;
        try {
            const result = await (0, typeorm_1.getConnection)()
                .createQueryBuilder()
                .insert()
                .into(User_1.User)
                .values([
                {
                    username: options.username,
                    password: hashedpassword,
                    email: options.email,
                    chats: [],
                    contacts: [],
                },
            ])
                .execute();
            user = result.raw[0];
        }
        catch (err) {
            if (err.code == "23505") {
                return {
                    errors: [{ field: "username", message: "username already exists" }],
                };
            }
        }
        const token = user.id;
        return { user, token };
    }
    async login(options, {}) {
        const user = await User_1.User.findOne({ where: { username: options.username } });
        if (!user) {
            return {
                errors: [{ field: "username", message: "username doesn't exist" }],
            };
        }
        const verify = await argon2_1.default.verify(user.password, options.password);
        if (verify) {
            const token = user.id;
            return { user, token };
        }
        else {
            return {
                errors: [
                    { field: "password", message: "Incorrect password or username" },
                ],
            };
        }
    }
    async beFriend(options) {
        const user = await User_1.User.findOne({ id: options.id });
        const withUser = await User_1.User.findOne({ id: options.with });
        if (user && withUser) {
            if (user.contacts === undefined) {
                User_1.User.update({ id: options.id }, { contacts: [withUser] });
            }
            else {
                user.contacts.push(withUser);
            }
            if (withUser.contacts === undefined) {
                User_1.User.update({ id: options.with }, { contacts: [user] });
            }
            else {
                withUser.contacts.push(user);
            }
            return true;
        }
        return false;
    }
    async getFriends(id) {
        const user = await User_1.User.findOne(id);
        return await (user === null || user === void 0 ? void 0 : user.contacts);
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => User_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "me", null);
__decorate([
    (0, type_graphql_1.Query)(() => [User_1.User]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "listusers", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "clear", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)("options")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UsernamePasswordInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)("options")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UsernamePasswordInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BeFriendInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "beFriend", null);
__decorate([
    (0, type_graphql_1.Query)(() => [User_1.User], { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getFriends", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map