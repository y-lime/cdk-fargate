import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FargateStackAlb } from './fargate-stack-alb';
import { FargateStackEc2 } from './fargate-stack-ec2';
import { FargateStackECR } from './fargate-stack-ecr';
import { FargateStackEcs } from './fargate-stack-ecs';
import { FargateStackIam } from './fargate-stack-iam';
import { FargateStackKms } from './fargate-stack-kms';
import { FargateStackLogs } from './fargate-stack-logs';
import { FargateStackRds } from './fargate-stack-rds';
import { FargateStackSG } from './fargate-stack-sg';
import { FargateStackVpc } from './fargate-stack-vpc';
import { FargateStackVpce } from './fargate-stack-vpce';

export class FargateStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // network
    const fargatestackvpc = new FargateStackVpc(this, 'VpcStack');

    // SecurityGroup
    const fargatestacksg = new FargateStackSG(this, 'SgStack', {
      vpc: fargatestackvpc.vpc,
      albPort: 80,
      containerPort: 18080,
    });

    // IAM Role
    const fargatestackiam = new FargateStackIam(this, 'IamStack');

    // Vpc Endpoint
    const fargatestackvpce = new FargateStackVpce(this, 'VpceStack', {
      vpc: fargatestackvpc.vpc,
      sg: fargatestacksg.sgVpce,
    });

    // CloudWatch Logs
    const fargatestacklogs = new FargateStackLogs(this, 'LogsStack');

    // ecr
    const fargatestackecr = new FargateStackECR(this, 'EcrStack');

    // ec2
    const fargatestackec2 = new FargateStackEc2(this, 'Ec2Stack', {
      vpc: fargatestackvpc.vpc,
      sg: fargatestacksg.sgManagement,
      role: fargatestackiam.iamRoleForManagementEc2,
    });

    // kms
    const fargatestackkms = new FargateStackKms(this, 'KmsStack');

    // rds
    const fargatestackrds = new FargateStackRds(this, 'RdsStack', {
      vpc: fargatestackvpc.vpc,
      sg: fargatestacksg.sgRds,
      encKey: fargatestackkms.rdsKey,
    });

    // alb
    const fargatestackalb = new FargateStackAlb(this, 'AlbStack', {
      vpc: fargatestackvpc.vpc,
      sg: fargatestacksg.sgAlb,
      container: {
        containerPort: 18080,
        healthCheckPath: '/actuator/health',
        healthCheckPort: 18080,
      }
    });

    // ecs
    const fargatestackecs = new FargateStackEcs(this, 'EcsStack', {
      vpc: fargatestackvpc.vpc,
      ecsTaskExecRole: fargatestackiam.iamRoleEcsTaskExec,
      ecsTaskRole: fargatestackiam.iamRoleEcsTask,
      rdsSecrets: fargatestackrds.dbSecret,
      sg: fargatestacksg.sgContainer,
      container: {
        name: 'myapp',
        ecrRepository: fargatestackecr.myappEcr,
        tag: 'latest',
        containerPort: 18080,
        healthCheckPath: '/actuator/health',
        healthCheckPort: 18080,
        logGroup: fargatestacklogs.ecsLogGroup,
        targetgroup: fargatestackalb.targetGroup,
      }
    });

  }
}
