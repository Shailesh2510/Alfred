import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as AWS from 'aws-sdk';
import { BaseStack } from './base';

export class ElasticacheStack extends BaseStack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    if (!props?.tags?.stage) {
      throw new Error(`Stage missing`);
    }
    const stage = props?.tags.stage;
    const importedVPC = ec2.Vpc.fromLookup(this, `${stage}-ExportedDashboardApiVPC`, {
      vpcName: `${stage}-dashboard-api-vpc`,
    });

    const ec2Client = new AWS.EC2({
      region: 'us-east-1'
    });
    const describeSecurityGroupsParams: AWS.EC2.DescribeSecurityGroupsRequest = {
      Filters: [{ Name: 'vpc-id', Values: [importedVPC.vpcId] }],
    };
    let defaultGroupId: string | undefined = undefined;

    ec2Client.describeSecurityGroups(describeSecurityGroupsParams, (err, data) => {
      if (err) {
        console.error(err);
      } else {
        // Now 'data.SecurityGroups' contains an array of security groups in the specified VPC
        console.log('Security Groups:', data.SecurityGroups);
        data.SecurityGroups?.forEach((securityGroup) => {
          if (securityGroup.GroupName == 'default') {
            defaultGroupId = securityGroup.GroupId;
          }
        })
        console.log(`defaultGroupId: `, defaultGroupId);
    
        if (!defaultGroupId) {
          throw new Error("VPC Security group id not set")
        }

        const elasticacheSecurityGroup = new ec2.SecurityGroup(this, 'ElastiCacheSecurityGroup', {
          vpc: importedVPC,
          description: 'Security group for ElastiCache Redis',
          securityGroupName: `${stage}-dashboard-api-elasticache-security-group`
        });
    
        // Allow incoming connections on the Redis port (default is 6379)
        elasticacheSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(6379), 'Allow Redis traffic');

        const cacheSubnetGroup = new elasticache.CfnSubnetGroup(this, `${stage}-dashboard-api-cache-subnet-group`, {
          cacheSubnetGroupName: `${stage}-dashboard-api-cache-subnet-group`, // Specify the name of the Cache Subnet Group
          subnetIds: importedVPC.isolatedSubnets.map(vpc => vpc.subnetId),
          description: `${stage}-dashboard-api-cache-subnet-group`,
        });
        
        const redisCluster = new elasticache.CfnReplicationGroup(this, `${stage}-dashboard-api-redis-cluster`, {
          cacheNodeType: 'cache.t4g.micro', // Specify the node type
          engine: 'redis',
          // numCacheNodes: 1, // Number of cache nodes in the cluster
          // clusterName: `${stage}-dashboard-api-redis-cluster`, // Replace with your desired cluster name
          engineVersion: '7.0', // Specify the Redis engine version
          numCacheClusters: 1,
          port: 6379, // Specify the Redis port
          automaticFailoverEnabled: false,
          // multiAzEnabled: true,
          cacheSubnetGroupName: cacheSubnetGroup.cacheSubnetGroupName,
          // vpcSecurityGroupIds: [defaultGroupId], // Use the default security group of the VPC
          replicationGroupDescription: `${stage}-dashboard-api-redis-cluster-replication-group`,
          // securityGroupIds: [defaultGroupId],
          securityGroupIds: [defaultGroupId, elasticacheSecurityGroup.securityGroupId]
        });
        redisCluster.addDependency(cacheSubnetGroup)
      }
    });
  }
}
