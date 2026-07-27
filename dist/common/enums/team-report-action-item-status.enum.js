"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamReportActionItemSource = exports.TeamReportActionItemStatus = void 0;
var TeamReportActionItemStatus;
(function (TeamReportActionItemStatus) {
    TeamReportActionItemStatus["Pending"] = "PENDING";
    TeamReportActionItemStatus["TaskCreated"] = "TASK_CREATED";
    TeamReportActionItemStatus["HandoverRequested"] = "HANDOVER_REQUESTED";
    TeamReportActionItemStatus["Dismissed"] = "DISMISSED";
})(TeamReportActionItemStatus || (exports.TeamReportActionItemStatus = TeamReportActionItemStatus = {}));
var TeamReportActionItemSource;
(function (TeamReportActionItemSource) {
    TeamReportActionItemSource["Blocker"] = "BLOCKER";
    TeamReportActionItemSource["Recommendation"] = "RECOMMENDATION";
})(TeamReportActionItemSource || (exports.TeamReportActionItemSource = TeamReportActionItemSource = {}));
//# sourceMappingURL=team-report-action-item-status.enum.js.map