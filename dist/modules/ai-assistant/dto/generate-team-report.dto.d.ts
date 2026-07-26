export declare class TeamReportDataSourcesDto {
    tasks?: boolean;
    dailyUpdates?: boolean;
    meetingTranscripts?: boolean;
    previousReport?: boolean;
}
export declare class GenerateTeamReportDto {
    reportDate: string;
    sprintId?: string;
    dataSources?: TeamReportDataSourcesDto;
    extraInstruction?: string;
}
