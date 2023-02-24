import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import { ISecurityGroup, IVpc, Peer, Port, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface SgProps {
    vpc: IVpc,
}

export class FargateStackSG extends Stack {
    public readonly sgAlb: ISecurityGroup;
    public readonly sgContainer: ISecurityGroup;
    public readonly sgManagement: ISecurityGroup;
    public readonly sgRds: ISecurityGroup;
    public readonly sgVpce: ISecurityGroup;

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

        const sgRds = new SecurityGroup(this, 'sg-rds', {
            vpc: props.vpc,
            allowAllOutbound: true,
            securityGroupName: 'fargate-sg-rds',
            description: 'For RDS',
        });
        sgRds.addIngressRule(Peer.securityGroupId(sgContainer.securityGroupId), Port.tcp(5432), 'from ECS Container');
        sgRds.addIngressRule(Peer.securityGroupId(sgManagement.securityGroupId), Port.tcp(5432), 'from Management EC2 Instance');
        Tags.of(sgRds).add('Name', 'fargate-sg-rds');
        this.sgRds = sgRds;
    }
}