"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const level = process.env.LOG_LEVEL || "debug";
function formatParams(info) {
    const { timestamp, level, message } = info, args = __rest(info, ["timestamp", "level", "message"]);
    const ts = timestamp.slice(0, 19).replace("T", " ");
    return `${ts} ${level}:  ${message} ${Object.keys(args).length ? JSON.stringify(args, "", "") : ""}`;
}
const developmentFormat = winston_1.format.combine(winston_1.format.colorize(), winston_1.format.timestamp(), winston_1.format.align(), winston_1.format.json(), winston_1.format.printf(formatParams));
const productionFormat = winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.align(), winston_1.format.printf(formatParams));
let logger;
exports.logger = logger;
if (process.env.NODE_ENV !== "production") {
    exports.logger = logger = winston_1.createLogger({
        level: level,
        format: developmentFormat,
        transports: [new winston_1.transports.Console()]
    });
}
else {
    exports.logger = logger = winston_1.createLogger({
        level: level,
        format: productionFormat,
        transports: [
            new winston_1.transports.File({ filename: "error.log", level: "error" }),
            new winston_1.transports.File({ filename: "combined.log" })
        ]
    });
}
//# sourceMappingURL=logger.js.map