import { Stack, StackProps, Tags } from "aws-cdk-lib";
import { ISecurityGroup, IVpc } from "aws-cdk-lib/aws-ec2";
import { ApplicationLoadBalancer, ApplicationProtocol, ApplicationTargetGroup, TargetType } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Construct } from "constructs";
import { ContainerProps } from "./fargate-stack-ecs";

export interface AlbProps {
    vpc: IVpc,
    sg: ISecurityGroup,
    container: ContainerProps,
}

export class FargateStackAlb extends Stack {
    constructor(scope: Construct, id: string, props: StackProps & AlbProps) {
        super(scope, id, props);

        const albForEcs = new ApplicationLoadBalancer(this, 'fargate-alb-for-ecs', {
            loadBalancerName: 'fargate-alb-for-ecs',
            internetFacing: false,
            securityGroup: props.sg,
            vpc: props.vpc,
            vpcSubnets: props.vpc.selectSubnets({
                subnetGroupName: 'subnet-private-elb-',
            }),
        });
        Tags.of(albForEcs).add('Name', 'fargate-alb-for-ecs');

        const targetGroupforEcs = new ApplicationTargetGroup(this, 'fargate-tg-for-ecs', {
            targetGroupName: 'fargate-tg-for-ecs',
            targetType: TargetType.IP,
            port: props.container.containerPort,
            protocol: ApplicationProtocol.HTTP,
            vpc: props.vpc,
            healthCheck: {
                path: props.container.healthCheckPath,
                port: props.container.healthCheckPort.toString(),
                healthyHttpCodes: '200',
            },
        });
        Tags.of(targetGroupforEcs).add('Name', 'fargate-tg-for-ecs');

        const listenerHTTP = albForEcs.addListener('ListenerHTTP', {
            port: 80,
            defaultTargetGroups: [targetGroupforEcs],
        });
    }
}