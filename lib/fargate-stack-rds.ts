import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import { InstanceClass, InstanceSize, InstanceType, ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import { IKey } from 'aws-cdk-lib/aws-kms';
import { AuroraPostgresEngineVersion, Credentials, DatabaseCluster, DatabaseClusterEngine, IDatabaseCluster, ParameterGroup, SubnetGroup } from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

export interface RdsProps {
    vpc: IVpc,
    sg: ISecurityGroup,
    encKey: IKey,
}

export class FargateStackRds extends Stack {
    public readonly dbCluster: IDatabaseCluster;

    constructor(scope: Construct, id: string, props: StackProps & RdsProps) {
        super(scope, id, props);

        const subnetGroupForAurora = new SubnetGroup(this, 'SubnetGroupForAurora', {
            subnetGroupName: 'fargate-subnetgroup-rds',
            vpc: props.vpc,
            description: 'For Amazon Aurora (PostgreSQL)',
            vpcSubnets: props.vpc.selectSubnets({ subnetGroupName: 'subnet-private-db-' }),
        });
        Tags.of(subnetGroupForAurora).add('Name', 'fargate-subnetgroup-rds');

        const customParameterGroup = new ParameterGroup(this, 'ParameterGroup', {
            description: 'parameterGroup',
            engine: DatabaseClusterEngine.auroraPostgres({
                version: AuroraPostgresEngineVersion.VER_14_3,
            }),
            parameters: {
                search_path: '"$user",public,myscheme',
                timezone: 'UTC+9',
            },
        });

        const credential = Credentials.fromGeneratedSecret('dbadmin', {
            secretName: 'fargate-rds-secrets',
        });

        const dbCluster = new DatabaseCluster(this, 'AuroraCluster', {
            clusterIdentifier: 'fargate-rdscluster',
            engine: DatabaseClusterEngine.auroraPostgres({
                version: AuroraPostgresEngineVersion.VER_14_3,
            }),
            instanceProps: {
                vpc: props.vpc,
                instanceType: InstanceType.of(
                    InstanceClass.T4G,
                    InstanceSize.MEDIUM,
                ),
                securityGroups: [props.sg],
            },
            subnetGroup: subnetGroupForAurora,
            instances: 1,
            defaultDatabaseName: 'postgres',
            credentials: credential,
            cloudwatchLogsExports: ['postgresql'],
            storageEncrypted: true,
            storageEncryptionKey: props.encKey,
            parameterGroup: customParameterGroup,
        });
        this.dbCluster = dbCluster;
        Tags.of(dbCluster).add('Name', 'fargate-rdscluster');
    }
}