import * as cdk from 'aws-cdk-lib';
import { StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class FargateStackSG extends cdk.Stack {
    public readonly sgAlb: ec2.SecurityGroup;
    public readonly sgContainer: ec2.SecurityGroup;
    public readonly sgManagement: ec2.SecurityGroup;
    public readonly sgRds: ec2.SecurityGroup;
    public readonly sgVpce: ec2.SecurityGroup;

    constructor(scope: Construct, id: string, vpc: ec2.Vpc, props?: StackProps) {
        super(scope, id, props);

        const sgAlb = new ec2.SecurityGroup(this, 'sg-alb', {
            vpc: vpc,
            allowAllOutbound: true,
            securityGroupName: 'fargate-sg-alb',
            description: 'For ALB',
        });
        cdk.Tags.of(sgAlb).add('Name', 'fargate-sg-alb');
        this.sgAlb = sgAlb;

        const sgContainer = new ec2.SecurityGroup(this, 'sg-container', {
            vpc: vpc,
            allowAllOutbound: true,
            securityGroupName: 'fargate-sg-container',
            description: 'For ECS Container',
        });
        cdk.Tags.of(sgContainer).add('Name', 'fargate-sg-container');
        this.sgContainer = sgContainer;

        const sgRds = new ec2.SecurityGroup(this, 'sg-rds', {
            vpc: vpc,
            allowAllOutbound: true,
            securityGroupName: 'fargate-sg-rds',
            description: 'For RDS',
        });
        cdk.Tags.of(sgRds).add('Name', 'fargate-sg-rds');
        this.sgRds = sgRds;

        const sgVpce = new ec2.SecurityGroup(this, 'sg-vpce', {
            vpc: vpc,
            allowAllOutbound: true,
            securityGroupName: 'fargate-sg-vpce',
            description: 'For VPC Endpoint',
        });
        cdk.Tags.of(sgVpce).add('Name', 'fargate-sg-vpce');
        this.sgVpce = sgVpce;

        const sgManagement = new ec2.SecurityGroup(this, 'sg-management', {
            vpc: vpc,
            allowAllOutbound: true,
            securityGroupName: 'fargate-sg-management',
            description: 'For Management EC2 Instance',
        });
        sgManagement.addIngressRule(ec2.Peer.securityGroupId(sgVpce.securityGroupId), ec2.Port.tcp(443), 'from VPC Endpoint');
        cdk.Tags.of(sgManagement).add('Name', 'fargate-sg-management');
        this.sgManagement = sgManagement;

    }
}