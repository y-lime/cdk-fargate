import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Peer, Port, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface SgProps {
    vpc: Vpc,
}

export class FargateStackSG extends Stack {
    public readonly sgAlb: SecurityGroup;
    public readonly sgContainer: SecurityGroup;
    public readonly sgManagement: SecurityGroup;
    public readonly sgRds: SecurityGroup;
    public readonly sgVpce: SecurityGroup;

    constructor(scope: Construct, id: string, props: StackProps & SgProps) {
        super(scope, id, props);

        const sgAlb = new SecurityGroup(this, 'sg-alb', {
            vpc: props.vpc,
            allowAllOutbound: true,
            securityGroupName: 'fargate-sg-alb',
            description: 'For ALB',
        });
        Tags.of(sgAlb).add('Name', 'fargate-sg-alb');
        this.sgAlb = sgAlb;

        const sgContainer = new SecurityGroup(this, 'sg-container', {
            vpc: props.vpc,
            allowAllOutbound: true,
            securityGroupName: 'fargate-sg-container',
            description: 'For ECS Container',
        });
        Tags.of(sgContainer).add('Name', 'fargate-sg-container');
        this.sgContainer = sgContainer;

        const sgRds = new SecurityGroup(this, 'sg-rds', {
            vpc: props.vpc,
            allowAllOutbound: true,
            securityGroupName: 'fargate-sg-rds',
            description: 'For RDS',
        });
        Tags.of(sgRds).add('Name', 'fargate-sg-rds');
        this.sgRds = sgRds;

        const sgVpce = new SecurityGroup(this, 'sg-vpce', {
            vpc: props.vpc,
            allowAllOutbound: true,
            securityGroupName: 'fargate-sg-vpce',
            description: 'For VPC Endpoint',
        });
        Tags.of(sgVpce).add('Name', 'fargate-sg-vpce');
        this.sgVpce = sgVpce;

        const sgManagement = new SecurityGroup(this, 'sg-management', {
            vpc: props.vpc,
            allowAllOutbound: true,
            securityGroupName: 'fargate-sg-management',
            description: 'For Management EC2 Instance',
        });
        sgManagement.addIngressRule(Peer.securityGroupId(sgVpce.securityGroupId), Port.tcp(443), 'from VPC Endpoint');
        Tags.of(sgManagement).add('Name', 'fargate-sg-management');
        this.sgManagement = sgManagement;

    }
}