import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import { GatewayVpcEndpoint, GatewayVpcEndpointAwsService, InterfaceVpcEndpoint, InterfaceVpcEndpointAwsService, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface VpceProps {
    vpc: Vpc;
    sg: SecurityGroup;
}

export class FargateStackVpce extends Stack {
    constructor(scope: Construct, id: string, vpceprops: VpceProps, props?: StackProps) {
        super(scope, id, props);

        const vpceS3 = new GatewayVpcEndpoint(this, 'endpointForS3', {
            vpc: vpceprops.vpc,
            service: GatewayVpcEndpointAwsService.S3,
        });
        Tags.of(vpceS3).add('Name', 'fargate-vpce-s3');

        const vpceSSM = new InterfaceVpcEndpoint(this, 'encpointForSsm', {
            vpc: vpceprops.vpc,
            service: InterfaceVpcEndpointAwsService.SSM,
            privateDnsEnabled: true,
            securityGroups: [vpceprops.sg],
            subnets: vpceprops.vpc.selectSubnets({ subnetGroupName: 'subnet-private-vpce-' }),
        });
        Tags.of(vpceSSM).add('Name', 'fargate-vpce-ssm');

        const vpceSSMmsg = new InterfaceVpcEndpoint(this, 'endpointForSsmMsg', {
            vpc: vpceprops.vpc,
            service: InterfaceVpcEndpointAwsService.SSM_MESSAGES,
            privateDnsEnabled: true,
            securityGroups: [vpceprops.sg],
            subnets: vpceprops.vpc.selectSubnets({ subnetGroupName: 'subnet-private-vpce-' }),
        });
        Tags.of(vpceSSMmsg).add('Name', 'fargate-vpce-ssmmsg');

        const vpceEC2msg = new InterfaceVpcEndpoint(this, 'endpointForEc2Msg', {
            vpc: vpceprops.vpc,
            service: InterfaceVpcEndpointAwsService.EC2_MESSAGES,
            privateDnsEnabled: true,
            securityGroups: [vpceprops.sg],
            subnets: vpceprops.vpc.selectSubnets({ subnetGroupName: 'subnet-private-vpce-' }),
        });
        Tags.of(vpceEC2msg).add('Name', 'fargate-vpce-ec2msg');

    }
}