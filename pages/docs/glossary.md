# Glossary

Definitions of key terms and concepts used throughout the Cloud Security Labs.

---

## A

**Access Control List (ACL)**  
A list of rules that specifies which users or systems are granted access to objects, services, or resources, and what operations are allowed on given resources.

**Access Key ID**  
A unique identifier associated with an AWS Secret Access Key; together they form AWS credentials for programmatic access to AWS services.

**Amazon CloudWatch**  
A monitoring and observability service that provides data and actionable insights to monitor applications, respond to system-wide performance changes, and optimize resource utilization.

**Amazon GuardDuty**  
A threat detection service that continuously monitors for malicious activity and unauthorized behavior to protect AWS accounts, workloads, and data stored in Amazon S3.

**Amazon Inspector**  
An automated security assessment service that helps improve the security and compliance of applications deployed on AWS by automatically assessing applications for exposure, vulnerabilities, and deviations from best practices.

**Application Load Balancer (ALB)**  
A load balancer that makes routing decisions at the application layer (HTTP/HTTPS), supports path-based routing, and can route requests to one or more ports on each container instance in your cluster.

**Auto Scaling**  
A service that monitors applications and automatically adjusts capacity to maintain steady, predictable performance at the lowest possible cost.

**Availability Zone (AZ)**  
One or more discrete data centers with redundant power, networking, and connectivity in an AWS Region, designed to provide high availability and fault tolerance.

**AWS CLI (Command Line Interface)**  
A unified tool to manage AWS services from the command line, providing direct access to the public APIs of AWS services.

**AWS Config**  
A service that enables you to assess, audit, and evaluate the configurations of your AWS resources, providing configuration history and change notifications.

**AWS Identity and Access Management (IAM)**  
A service that helps you securely control access to AWS resources by managing users, groups, roles, and policies.

**AWS Identity Center (formerly AWS SSO)**  
A cloud-based single sign-on (SSO) service that makes it easy to centrally manage access to multiple AWS accounts and business applications.

**AWS Organizations**  
An account management service that enables you to centrally manage and govern your environment as you grow and scale your AWS resources.

**AWS Security Hub**  
A cloud security posture management service that performs security best practice checks, aggregates alerts, and enables automated remediation.

---

## B

**Bastion Host**  
A server whose purpose is to provide access to a private network from an external network, such as the Internet. Often used as a jump box for secure administrative access.

**Bucket Policy**  
An access policy option available for Amazon S3 buckets that grants access permissions to your bucket and the objects in it.

---

## C

**Certificate Authority (CA)**  
An entity that issues digital certificates, which certify the ownership of a public key by the named subject of the certificate.

**CIDR Block (Classless Inter-Domain Routing)**  
A method for allocating IP addresses and IP routing. In AWS, used to define IP address ranges for VPCs and subnets.

**CloudFormation**  
A service that helps you model and set up your AWS resources using templates, allowing you to provision and manage infrastructure as code.

**CloudTrail**  
A service that enables governance, compliance, operational auditing, and risk auditing of your AWS account by logging API calls and related events.

**Compliance**  
The practice of following rules, regulations, guidelines, and specifications relevant to business processes and often related to legal requirements.

**Cross-Account Access**  
The ability for users or services in one AWS account to access resources in another AWS account, typically implemented using IAM roles and the AssumeRole API.

---

## D

**Defense in Depth**  
A layered security approach that uses multiple security controls to protect the integrity of information and information systems.

**DDoS (Distributed Denial of Service)**  
A malicious attempt to disrupt normal traffic of a targeted server, service, or network by overwhelming the target or its surrounding infrastructure with a flood of Internet traffic.

---

## E

**Elastic Compute Cloud (EC2)**  
A web service that provides secure, resizable compute capacity in the cloud, designed to make web-scale cloud computing easier for developers.

**Elastic IP Address**  
A static IPv4 address designed for dynamic cloud computing that you can associate with any instance or network interface for any VPC in your account.

**Encryption at Rest**  
The protection of data that is stored physically in databases, data warehouses, and other storage systems.

**Encryption in Transit**  
The protection of data while it's being transmitted from one location to another, such as across the internet or through a private network.

**EventBridge (formerly CloudWatch Events)**  
A serverless event bus service that makes it easy to connect applications using data from your own applications, integrated Software-as-a-Service (SaaS) applications, and AWS services.

---

## F

**Federation**  
The process of linking a user's identity across multiple separate identity management systems, allowing users to use the same identification data to obtain access to all systems.

**Flow Logs**  
A feature that enables you to capture information about the IP traffic going to and from network interfaces in your VPC.

---

## G

**Gateway**  
A network node that serves as an access point to another network, often involving format translation or protocol conversion.

---

## H

**Hardening**  
The process of securing a system by reducing its surface of vulnerability by removing unnecessary software, services, and features.

**HTTPS (HTTP Secure)**  
An extension of HTTP that uses encryption (typically TLS) to secure communication over a computer network.

---

## I

**IAM Policy**  
A document that defines permissions and can be associated with AWS identity (users, groups of users, or roles) or AWS resources.

**IAM Role**  
An IAM identity with specific permissions that determine what the identity can and cannot do in AWS, designed to be assumable by anyone who needs it.

**Identity Provider (IdP)**  
A service that creates, maintains, and manages identity information for users, services, or systems while providing authentication services to relying party applications.

**Infrastructure as Code (IaC)**  
The process of managing and provisioning computing infrastructure through machine-readable definition files, rather than physical hardware configuration or interactive configuration tools.

**Internet Gateway (IGW)**  
A VPC component that allows communication between instances in your VPC and the internet, providing a target for internet-routable traffic.

**IP Address**  
A numerical label assigned to each device connected to a computer network that uses the Internet Protocol for communication.

---

## J

**JSON (JavaScript Object Notation)**  
A lightweight data interchange format that is easy for humans to read and write and easy for machines to parse and generate.

**Jump Box**  
See Bastion Host.

---

## K

**Key Management Service (KMS)**  
A managed service that makes it easy to create and control the encryption keys used to encrypt data.

**Key Pair**  
A set of security credentials consisting of a public key and a private key that are used to prove identity when connecting to an EC2 instance.

---

## L

**Lambda**  
A compute service that lets you run code without provisioning or managing servers, executing code only when needed and scaling automatically.

**Least Privilege**  
The practice of limiting access rights for users to the bare minimum permissions they need to perform their work.

**Load Balancer**  
A device or service that distributes network or application traffic across multiple servers to ensure no single server becomes overwhelmed.

---

## M

**Multi-Factor Authentication (MFA)**  
A security process that requires more than one method of authentication from independent categories of credentials to verify the user's identity.

**Multi-Region**  
Spanning or involving multiple AWS geographic regions, often used for disaster recovery or performance optimization.

---

## N

**NAT Gateway (Network Address Translation Gateway)**  
A managed service that enables instances in private subnets to connect to the internet or other AWS services while preventing the internet from initiating connections with those instances.

**Network Access Control List (NACL)**  
An optional layer of security for VPCs that acts as a firewall for controlling traffic in and out of one or more subnets.

---

## O

**OAuth**  
An open standard for access delegation, commonly used as a way for users to grant websites or applications access to their information on other websites.

---

## P

**Permission Boundary**  
An advanced feature for using a managed policy to set the maximum permissions that an identity-based policy can grant to an IAM entity.

**Policy**  
A document that defines permissions, which can be attached to IAM identities or resources to control access to AWS services and resources.

**Principal**  
An entity that can make a request for an action or operation on an AWS resource, such as a user, role, federated user, or application.

**Private Subnet**  
A subnet whose instances cannot be reached from the internet directly, typically used for backend resources like databases or application servers.

**Public Subnet**  
A subnet whose instances can be reached from the internet, with routes to an internet gateway.

---

## Q

**Queue**  
A temporary holding area for messages that are waiting to be processed, commonly used in messaging systems for decoupling and scaling applications.

---

## R

**Region**  
A physical location around the world where AWS clusters data centers, each region consisting of multiple isolated and physically separate Availability Zones.

**Resource**  
An AWS entity that you can work with, such as an EC2 instance, an S3 bucket, an IAM user, or a VPC.

**Role-Based Access Control (RBAC)**  
A method of regulating access to computer or network resources based on the roles of individual users within an organization.

**Route Table**  
A set of rules (routes) that are used to determine where network traffic is directed in a VPC.

---

## S

**SAML (Security Assertion Markup Language)**  
An XML-based markup language for security assertions, commonly used for single sign-on (SSO) scenarios.

**Secret Access Key**  
A key that is used in conjunction with the access key ID to cryptographically sign programmatic AWS requests.

**Security Group**  
A virtual firewall that controls the traffic for one or more instances, acting at the instance level and supporting allow rules only.

**Simple Notification Service (SNS)**  
A fully managed messaging service for both system-to-system and app-to-person communication.

**Simple Storage Service (S3)**  
An object storage service that offers scalability, data availability, security, and performance.

**Single Sign-On (SSO)**  
An authentication process that allows a user to access multiple applications with one set of login credentials.

**Subnet**  
A range of IP addresses in a VPC, which can be designated as either public or private.

**Systems Manager**  
A collection of capabilities for configuring and managing Amazon EC2 instances, on-premises servers, and virtual machines.

---

## T

**Terraform**  
An open-source infrastructure as code software tool created by HashiCorp that allows users to define and provision data center infrastructure using a declarative configuration language.

**Threat Detection**  
The practice of analyzing the entirety of a security ecosystem to identify any malicious activity that could compromise the network.

**Transit Gateway**  
A service that enables customers to connect their Amazon VPCs and their on-premises networks to a single gateway.

**Trust Policy**  
A document that defines which principals can assume an IAM role and under what conditions.

---

## U

**User**  
An IAM entity that represents a person or service that interacts with AWS, consisting of a name and credentials.

---

## V

**Virtual Private Cloud (VPC)**  
A virtual network dedicated to your AWS account, logically isolated from other virtual networks in the AWS Cloud.

**VPC Endpoint**  
A connection between a VPC and a supported service that enables private connectivity without requiring an internet gateway, NAT device, VPN connection, or Direct Connect connection.

**VPC Peering**  
A networking connection between two VPCs that enables you to route traffic between them using private IPv4 addresses or IPv6 addresses.

**Vulnerability**  
A weakness in a system that can be exploited by a threat to gain unauthorized access or perform unauthorized actions.

---

## W

**Web Application Firewall (WAF)**  
A security system that monitors, filters, and blocks HTTP traffic to and from a web service to protect against various attacks.

---

## X

**XML (eXtensible Markup Language)**  
A markup language that defines a set of rules for encoding documents in a format that is both human-readable and machine-readable.

---

## Y

**YAML (YAML Ain't Markup Language)**  
A human-readable data serialization standard commonly used for configuration files and data exchange between applications.

---

## Z

**Zero Trust**  
A security concept centered on the belief that organizations should not automatically trust anything inside or outside its perimeters and instead must verify anything and everything trying to connect to its systems.

**Zone**  
See Availability Zone.

---

## Common Acronyms and Abbreviations

| Acronym | Full Form | Definition |
|---------|-----------|------------|
| ALB | Application Load Balancer | Layer 7 load balancer for HTTP/HTTPS traffic |
| ARN | Amazon Resource Name | Unique identifier for AWS resources |
| AZ | Availability Zone | Isolated data center location within a region |
| CDN | Content Delivery Network | Geographically distributed servers for content delivery |
| CIDR | Classless Inter-Domain Routing | Method for allocating IP addresses |
| CLI | Command Line Interface | Text-based interface for interacting with services |
| DNS | Domain Name System | System that translates domain names to IP addresses |
| EBS | Elastic Block Store | Persistent block storage for EC2 instances |
| EC2 | Elastic Compute Cloud | Scalable virtual servers in the cloud |
| ELB | Elastic Load Balancer | Service for distributing incoming traffic |
| IAM | Identity and Access Management | Service for managing users and permissions |
| HTTPS | HTTP Secure | Encrypted version of HTTP protocol |
| JSON | JavaScript Object Notation | Lightweight data interchange format |
| KMS | Key Management Service | Managed encryption key service |
| MFA | Multi-Factor Authentication | Additional layer of account security |
| NACL | Network Access Control List | Subnet-level firewall rules |
| NAT | Network Address Translation | Service for outbound internet access |
| REST | Representational State Transfer | Architectural style for web services |
| S3 | Simple Storage Service | Object storage service |
| SDK | Software Development Kit | Tools for developing applications |
| SG | Security Group | Instance-level firewall rules |
| SNS | Simple Notification Service | Messaging service for notifications |
| SSL | Secure Sockets Layer | Cryptographic protocol for secure communication |
| SSO | Single Sign-On | Authentication process using single credentials |
| TLS | Transport Layer Security | Cryptographic protocol, successor to SSL |
| VPC | Virtual Private Cloud | Isolated virtual network environment |
| XML | eXtensible Markup Language | Markup language for data exchange |

---

**Need a term defined?** If you encounter a term not listed here, check the [AWS Glossary](https://docs.aws.amazon.com/general/latest/gr/glos-chap.html) or search the relevant AWS service documentation.