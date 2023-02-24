import { Duration, RemovalPolicy, Stack, StackProps, Tags } from "aws-cdk-lib";
import { ISecurityGroup, IVpc } from "aws-cdk-lib/aws-ec2";
import { IRepository } from "aws-cdk-lib/aws-ecr";
import { Cluster, ContainerImage, DeploymentControllerType, FargatePlatformVersion, FargateService, FargateTaskDefinition, LogDriver, Protocol, Secret } from "aws-cdk-lib/aws-ecs";
import { IRole } from "aws-cdk-lib/aws-iam";
import { ILogGroup } from "aws-cdk-lib/aws-logs";
import { ISecret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

export interface ContainerProps {
    name: string,
    ecrRepository: IRepository,
    tag: string,
    containerPort: number,
    healthCheckPath: string,
    healthCheckPort: number,
    logGroup: ILogGroup,
}

export interface EcsProps {
    vpc: IVpc,
    ecsTaskExecRole: IRole,
    ecsTaskRole: IRole,
    rdsSecrets: ISecret,
    sg: ISecurityGroup,
    container: ContainerProps,
}

export class FargateStackEcs extends Stack {
    constructor(scope: Construct, id: string, props: StackProps & EcsProps) {
        super(scope, id, props);

        // task definition
        const taskDef = new FargateTaskDefinition(this, 'fargate-taskdef', {
            family: 'fargate-taskdef',
            memoryLimitMiB: 2048,
            cpu: 1024,
            executionRole: props?.ecsTaskExecRole,
            taskRole: props?.ecsTaskRole,
        });
        taskDef.applyRemovalPolicy(RemovalPolicy.DESTROY);
        Tags.of(taskDef).add('Name', 'fargate-taskdef');

        // container definition
        const containerDef = taskDef.addContainer('fargate-container-def', {
            containerName: props.container.name,
            image: ContainerImage.fromEcrRepository(props.container.ecrRepository, props.container.tag),
            memoryReservationMiB: 512,
            cpu: 256,
            essential: true,
            secrets: {
                DB_HOST: Secret.fromSecretsManager(props.rdsSecrets, 'host'),
                DB_NAME: Secret.fromSecretsManager(props.rdsSecrets, 'dbname'),
                SPRING_DATASOURCE_USERNAME: Secret.fromSecretsManager(props.rdsSecrets, 'username'),
                SPRING_DATASOURCE_PASSWORD: Secret.fromSecretsManager(props.rdsSecrets, 'password'),
            },
            environment: {
                SPRING_DATASOURCE_URL: 'jdbc:postgresql://${DB_HOST}:5432/${DB_NAME}',
                SPRING_ACTIVE_PROFILE: 'aws',
            },
            logging: LogDriver.awsLogs({
                streamPrefix: 'ecs',
                logGroup: props.container.logGroup,
            }),
            portMappings: [
                {
                    containerPort: props.container.containerPort,
                    hostPort: props.container.containerPort,
                    protocol: Protocol.TCP,
                }
            ],
            healthCheck: {
                command: [
                    'CMD-SHELL',
                    `curl -f http://localhost:${props.container.healthCheckPort}/${props.container.healthCheckPath} || exit 1`,
                ],
                interval: Duration.seconds(30),
                retries: 3,
                timeout: Duration.seconds(5),
            },
        });

        // fargate cluster
        const fargateEcsCluster = new Cluster(this, 'fargate-ecs-cluster', {
            clusterName: 'fargate-ecs-cluster',
            vpc: props.vpc,
            containerInsights: true,
        });

        // fargate service
        const fargateService = new FargateService(this, 'fargate-ecs-service', {
            serviceName: 'fargate-ecs-service',
            cluster: fargateEcsCluster,
            platformVersion: FargatePlatformVersion.LATEST,
            taskDefinition: taskDef,
            desiredCount: 1,
            minHealthyPercent: 100,
            maxHealthyPercent: 200,
            deploymentController: { type: DeploymentControllerType.ECS },
            enableECSManagedTags: true,
            healthCheckGracePeriod: Duration.seconds(30),
            capacityProviderStrategies: [
                {
                    capacityProvider: 'FARGATE',
                    weight: 1,
                },
            ],
            enableExecuteCommand: true,
            securityGroups: [props.sg],
            vpcSubnets: props.vpc.selectSubnets({
                subnetGroupName: 'subnet-private-service-',
                availabilityZones: [props.vpc.availabilityZones[0]],
            }),
        });

    }
}