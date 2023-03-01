import { Stack, StackProps, Tags } from "aws-cdk-lib";
import { ILogGroup, LogGroup } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export class FargateStackLogs extends Stack {
    public readonly ecsLogGroup: ILogGroup;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const ecsLogGroup = new LogGroup(this, 'ecsLogGroup', {
            logGroupName: '/cwlogs/aws/ecs/',
        });
        this.ecsLogGroup = ecsLogGroup;
        Tags.of(ecsLogGroup).add('Name', 'cwlogs-ecs');
    }
}