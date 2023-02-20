import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface VpceProps {
    vpc: ec2.Vpc;
    sg: ec2.SecurityGroup;
}

export class FargateStackVpce extends cdk.Stack {
    constructor(scope: Construct, id: string, vpceprops: VpceProps, props?: cdk.StackProps) {
        super(scope, id, props);

        const vpceS3 = new ec2.GatewayVpcEndpoint(this, 'endpointForS3', {
            vpc: vpceprops.vpc,
            service: ec2.GatewayVpcEndpointAwsService.S3,
        });
        cdk.Tags.of(vpceS3).add('Name', 'fargate-vpce-s3');

        const vpceSSM = new ec2.InterfaceVpcEndpoint(this, 'encpointForSsm', {
            vpc: vpceprops.vpc,
            service: ec2.InterfaceVpcEndpointAwsService.SSM,
            privateDnsEnabled: true,
            securityGroups: [vpceprops.sg],
            subnets: vpceprops.vpc.selectSubnets({ subnetGroupName: 'subnet-private-vpce-' }),
        });
        cdk.Tags.of(vpceSSM).add('Name', 'fargate-vpce-ssm');

        const vpceSSMmsg = new ec2.InterfaceVpcEndpoint(this, 'endpointForSsmMsg', {
            vpc: vpceprops.vpc,
            service: ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
            privateDnsEnabled: true,
            securityGroups: [vpceprops.sg],
            subnets: vpceprops.vpc.selectSubnets({ subnetGroupName: 'subnet-private-vpce-' }),
        });
        cdk.Tags.of(vpceSSMmsg).add('Name', 'fargate-vpce-ssmmsg');

        const vpceEC2msg = new ec2.InterfaceVpcEndpoint(this, 'endpointForEc2Msg', {
            vpc: vpceprops.vpc,
            service: ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES,
            privateDnsEnabled: true,
            securityGroups: [vpceprops.sg],
            subnets: vpceprops.vpc.selectSubnets({ subnetGroupName: 'subnet-private-vpce-' }),
        });
        cdk.Tags.of(vpceEC2msg).add('Name', 'fargate-vpce-ec2msg');

    }
}