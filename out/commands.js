"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commands = void 0;
const fs_1 = __importDefault(require("fs"));
const Commands = {};
exports.Commands = Commands;
const cfiles = fs_1.default.readdirSync(__dirname + '//commands');
console.log(cfiles);
for (let file of cfiles) {
    if (!file.endsWith('.js'))
        continue;
    file = file.substring(0, file.length - 3);
    Commands[file] = require('./commands/' + file);
    Commands[file].name = file;
    for (let alias in Commands[file].aliases) {
        Commands[Commands[file].aliases[alias]] = Commands[file];
    }
}
