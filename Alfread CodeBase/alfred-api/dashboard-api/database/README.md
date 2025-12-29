# Connect directly to DB in Prod with a DB Client (DataGrip ex.)

## Prerequisites:
1. Generate a Private Key if you don't have one already
2. Mac example: `ssh-keygen -t rsa -b 4096 -C "your_email@example.com"`
3. Copy public key value: `cat ~/.ssh/id_rsa.pub`

## Add key in EC2 Bastion Host:
1. Login to AWS console 
2. In the EC2 List select: **prod-bastion-host**
3. Select "Connect" > Connect
4. List all keys: `cat ~/.ssh/authorized_keys`
5. Add your public key: `ssh ec2-user@*ec2-bastion-host-ip* 'echo "*paste-your-public-key-here*" >> ~/.ssh/authorized_keys'`

## Add IP Address to Security Group:
1. Go to: https://us-east-1.console.aws.amazon.com/vpcconsole/home?region=us-east-1#SecurityGroups:
2. Select: `prod-bastion-security-group`
3. Select: `Inbound Rules`
4. Press: `Edit Inbound Rules`
5. Add your Public IP & Save

## DataGrip Client
1. Get host/username/password/port/dbname from **AWS Secrets Manager**
2. Add those in DataGrip >> New Data Source
3. **SSH/SSL** tab (when adding a new data source)
4. Enable: "Use SSL Tunnel"
5. Add new SSH Configuration
6. Select your private key + add EC2's Bastion Host public IP
7. Save and Connect
