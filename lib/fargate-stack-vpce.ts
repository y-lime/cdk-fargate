import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import { GatewayVpcEndpoint, GatewayVpcEndpointAwsService, InterfaceVpcEndpoint, InterfaceVpcEndpointAwsService, ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
export interface props {
    vpc: IVpc;
    sg: ISecurityGroup;
}

export class FargateStackVpce extends Stack {
    constructor(scope: Construct, id: string, props: StackProps & props) {
        super(scope, id, props);

        const vpceS3 = new GatewayVpcEndpoint(this, 'endpointForS3', {
            vpc: props.vpc,
            service: GatewayVpcEndpointAwsService.S3,
        });
        Tags.of(vpceS3).add('Name', 'fargate-vpce-s3');

        const vpceSSM = new InterfaceVpcEndpoint(this, 'encpointForSsm', {
            vpc: props.vpc,
            service: InterfaceVpcEndpointAwsService.SSM,
            privateDnsEnabled: true,
            securityGroups: [props.sg],
            subnets: props.vpc.selectSubnets({ subnetGroupName: 'subnet-private-vpce-' }),
        });
        Tags.of(vpceSSM).add('Name', 'fargate-vpce-ssm');

        const vpceSSMmsg = new InterfaceVpcEndpoint(this, 'endpointForSsmMsg', {
            vpc: props.vpc,
            service: InterfaceVpcEndpointAwsService.SSM_MESSAGES,
            privateDnsEnabled: true,
            securityGroups: [props.sg],
            subnets: props.vpc.selectSubnets({ subnetGroupName: 'subnet-private-vpce-' }),
        });
        Tags.of(vpceSSMmsg).add('Name', 'fargate-vpce-ssmmsg');

        const vpceEC2msg = new InterfaceVpcEndpoint(this, 'endpointForEc2Msg', {
            vpc: props.vpc,
            service: InterfaceVpcEndpointAwsService.EC2_MESSAGES,
            privateDnsEnabled: true,
            securityGroups: [props.sg],
            subnets: props.vpc.selectSubnets({ subnetGroupName: 'subnet-private-vpce-' }),
        });
        Tags.of(vpceEC2msg).add('Name', 'fargate-vpce-ec2msg');

        const vpceEcrDkr = new InterfaceVpcEndpoint(this, 'endpointForEcrDkr', {
            vpc: props.vpc,
            service: InterfaceVpcEndpointAwsService.ECR_DOCKER,
            privateDnsEnabled: true,
            securityGroups: [props.sg],
            subnets: props.vpc.selectSubnets({ subnetGroupName: 'subnet-private-vpce-' }),
        })
        Tags.of(vpceEcrDkr).add('Name', 'fargate-vpce-ecrdkr');

        const vpceEcrApi = new InterfaceVpcEndpoint(this, 'endpointForEcrApi', {
            vpc: props.vpc,
            service: InterfaceVpcEndpointAwsService.ECR,
            privateDnsEnabled: true,
            securityGroups: [props.sg],
            subnets: props.vpc.selectSubnets({ subnetGroupName: 'subnet-private-vpce-' }),
        })
        Tags.of(vpceEcrApi).add('Name', 'fargate-vpce-ecrapi');

        const vpceCWLogs = new InterfaceVpcEndpoint(this, 'endpointForCloudWatchLogs', {
            vpc: props.vpc,
            service: InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
            privateDnsEnabled: true,
            securityGroups: [props.sg],
            subnets: props.vpc.selectSubnets({ subnetGroupName: 'subnet-private-vpce-' }),
        })
        Tags.of(vpceCWLogs).add('Name', 'fargate-vpce-cloudwatchlogs');

        const vpceSecretsManager = new InterfaceVpcEndpoint(this, 'endpointForSecretsManager', {
            vpc: props.vpc,
            service: InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
            privateDnsEnabled: true,
            securityGroups: [props.sg],
            subnets: props.vpc.selectSubnets({ subnetGroupName: 'subnet-private-vpce-' }),
        })
        Tags.of(vpceSecretsManager).add('Name', 'fargate-vpce-secretsmanager');

    }
}