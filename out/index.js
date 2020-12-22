"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const slash_commands_1 = require("slash-commands");
const Commands = __importStar(require("./commands"));
const discord_js_1 = __importDefault(require("discord.js"));
const database_1 = require("./classes/database");
const util_1 = require("util");
if (process.env.APP_ID === undefined)
    throw new Error('dotenv: APP_ID cannot be undefined');
if (process.env.TOKEN === undefined)
    throw new Error('dotenv: TOKEN cannot be undefined');
if (process.env.APP_KEY === undefined)
    throw new Error('dotenv: APP_KEY cannot be undefined');
const interaction = new slash_commands_1.DiscordInteractions({
    applicationId: process.env.APP_ID,
    authToken: process.env.TOKEN,
    publicKey: process.env.APP_KEY
});
const Bot = new discord_js_1.default.Client();
Bot.once('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Logged in");
    for (const cmd of yield interaction.getApplicationCommands(process.env.CMD_GUILD)) {
        if (Commands.Commands[cmd.name] == undefined) {
            interaction.deleteApplicationCommand(cmd.id, process.env.CMD_GUILD).catch(() => { });
        }
    }
    console.log(Commands.Commands);
    for (const c in Commands.Commands) {
        let cmd = Commands.Commands[c];
        yield interaction.createApplicationCommand(cmd.json, process.env.CMD_GUILD)
            .then((a) => { console.log(c, a); })
            .catch((a) => { console.error(c, a); });
    }
    if (process.env.DATABASE == undefined)
        throw new Error("Database is undefined. Check .env config.");
    const db = yield database_1.db_open(process.env.DATABASE);
    yield database_1.db_init(db);
    // @ts-expect-error
    Bot.ws.on('INTERACTION_CREATE', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        const command = interaction.data.name.toLowerCase();
        const args = interaction.data.options;
        const cmd = Commands.Commands[command];
        const res = cmd.response;
        if (res == undefined)
            return;
        let returned = null;
        try {
            returned = yield res.run(args, db);
        }
        catch (e) {
            returned = '```\n' + e + '```';
        }
        if (returned === undefined || returned === null)
            returned = ':white_check_mark:';
        try {
            let content = yield createAPIMessage(interaction, returned);
            // @ts-expect-error
            yield util_1.promisify(Bot.api.interactions(interaction.id, interaction.token).callback.post)({
                data: {
                    type: res.type,
                    data: content
                }
            });
        }
        catch (_a) { }
    }));
}));
function createAPIMessage(interaction, content) {
    return __awaiter(this, void 0, void 0, function* () {
        const t = Bot.channels.resolve(interaction.channel_id);
        if (t == null)
            return;
        try {
            if (content === null || content === undefined)
                throw new Error("No content");
            // @ts-expect-error
            const apiMessage = yield discord_js_1.default.APIMessage.create(t, content)
                .resolveData()
                .resolveFiles();
            return Object.assign(Object.assign({}, apiMessage.data), { files: apiMessage.files });
        }
        catch (_a) {
            throw new Error('No content');
        }
    });
}
console.log("Logging in");
Bot.login(process.env.TOKEN);
