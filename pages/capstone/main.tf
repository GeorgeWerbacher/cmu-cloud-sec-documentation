terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.0"
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region for resources"
  default     = "us-east-1"
}

variable "environment_name" {
  description = "Environment name prefix"
  default     = "medtech-assessment"
}

variable "student_password" {
  description = "Initial password for student accounts"
  type        = string
  sensitive   = true
}

resource "aws_iam_user" "student_user" {
  name = "${var.environment_name}-student"
  path = "/"
}

resource "aws_iam_user_login_profile" "student_login" {
  user                    = aws_iam_user.student_user.name
  password_reset_required = true
}

resource "aws_iam_access_key" "student_key" {
  user = aws_iam_user.student_user.name
}

resource "aws_iam_user_policy_attachment" "student_readonly" {
  user       = aws_iam_user.student_user.name
  policy_arn = "arn:aws:iam::aws:policy/ReadOnlyAccess"
}

resource "aws_iam_user_policy_attachment" "student_support" {
  user       = aws_iam_user.student_user.name
  policy_arn = "arn:aws:iam::aws:policy/AWSSupportAccess"
}

resource "aws_iam_user" "admin_user" {
  name = "${var.environment_name}-admin"
  path = "/"
}

resource "aws_iam_access_key" "admin_key" {
  user = aws_iam_user.admin_user.name
}

resource "aws_iam_user_policy_attachment" "admin_policy" {
  user       = aws_iam_user.admin_user.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

resource "aws_iam_user" "developer_user" {
  name = "${var.environment_name}-developer"
  path = "/"
}

resource "aws_iam_user_policy" "developer_excessive" {
  name = "${var.environment_name}-developer-policy"
  user = aws_iam_user.developer_user.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "*"
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role" "ec2_role" {
  name = "${var.environment_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "ec2_excessive" {
  name = "${var.environment_name}-ec2-policy"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:*",
          "dynamodb:*",
          "rds:*"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.environment_name}-vpc"
    Environment = "Assessment"
  }
}

resource "aws_subnet" "public_subnet_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.environment_name}-public-subnet-1"
    Type = "Public"
  }
}

resource "aws_subnet" "public_subnet_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = data.aws_availability_zones.available.names[1]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.environment_name}-public-subnet-2"
    Type = "Public"
  }
}

resource "aws_subnet" "private_subnet" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "${var.environment_name}-private-subnet"
    Type = "Private"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.environment_name}-igw"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "${var.environment_name}-public-rt"
  }
}

resource "aws_route_table_association" "public_1" {
  subnet_id      = aws_subnet.public_subnet_1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_subnet_2.id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "web_sg" {
  name        = "${var.environment_name}-web-sg"
  description = "Security group for web servers"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH from anywhere"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment_name}-web-sg"
  }
}

resource "aws_security_group" "database_sg" {
  name        = "${var.environment_name}-database-sg"
  description = "Security group for database"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "MySQL from anywhere"
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment_name}-database-sg"
  }
}

resource "aws_security_group" "unused_sg" {
  name        = "${var.environment_name}-unused-sg"
  description = "Unused security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  tags = {
    Name = "${var.environment_name}-unused-sg"
  }
}

resource "aws_s3_bucket" "public_data" {
  bucket = "${var.environment_name}-public-data-${random_string.bucket_suffix.result}"

  tags = {
    Name        = "${var.environment_name}-public-data"
    Environment = "Assessment"
    DataType    = "Public"
  }
}

resource "aws_s3_bucket_public_access_block" "public_data_pab" {
  bucket = aws_s3_bucket.public_data.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "public_data_policy" {
  bucket = aws_s3_bucket.public_data.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "PublicReadGetObject"
        Effect = "Allow"
        Principal = "*"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.public_data.arn,
          "${aws_s3_bucket.public_data.arn}/*"
        ]
      }
    ]
  })
  
  depends_on = [aws_s3_bucket_public_access_block.public_data_pab]
}

resource "aws_s3_bucket" "patient_records" {
  bucket = "${var.environment_name}-patient-records-${random_string.bucket_suffix.result}"

  tags = {
    Name             = "${var.environment_name}-patient-records"
    Environment      = "Assessment"
    DataType         = "PHI"
    ComplianceScope  = "HIPAA"
  }
}

resource "aws_s3_bucket_versioning" "patient_records_versioning" {
  bucket = aws_s3_bucket.patient_records.id
  
  versioning_configuration {
    status = "Suspended"
  }
}

resource "aws_s3_bucket" "ai_training_data" {
  bucket = "${var.environment_name}-ai-training-${random_string.bucket_suffix.result}"

  tags = {
    Name        = "${var.environment_name}-ai-training"
    Environment = "Assessment"
    DataType    = "Training"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "ai_training_encryption" {
  bucket = aws_s3_bucket.ai_training_data.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket" "logs_bucket" {
  bucket = "${var.environment_name}-logs-${random_string.bucket_suffix.result}"

  tags = {
    Name        = "${var.environment_name}-logs"
    Environment = "Assessment"
    DataType    = "Logs"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "logs_lifecycle" {
  bucket = aws_s3_bucket.logs_bucket.id

  rule {
    id     = "delete-old-logs"
    status = "Enabled"

    expiration {
      days = 7
    }
  }
}

resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "${var.environment_name}-db-subnet-group"
  subnet_ids = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]

  tags = {
    Name = "${var.environment_name}-db-subnet-group"
  }
}

resource "aws_db_instance" "mysql_db" {
  identifier     = "${var.environment_name}-mysql"
  engine         = "mysql"
  engine_version = "8.0"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  storage_type          = "gp2"
  storage_encrypted     = false
  
  db_name  = "medtechdb"
  username = "admin"
  password = "MedTech2024!"
  
  vpc_security_group_ids = [aws_security_group.database_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_group.name
  
  publicly_accessible          = true
  backup_retention_period      = 1
  enabled_cloudwatch_logs_exports = []
  deletion_protection          = false
  skip_final_snapshot          = true
  
  tags = {
    Name        = "${var.environment_name}-mysql"
    Environment = "Assessment"
    DataType    = "PatientData"
  }
}

resource "aws_instance" "bastion" {
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.public_subnet_1.id
  
  vpc_security_group_ids = [aws_security_group.web_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  
  user_data = <<-EOF
    #!/bin/bash
    echo "Bastion host for MedTech" > /var/www/html/index.html
  EOF
  
  tags = {
    Name        = "${var.environment_name}-bastion"
    Environment = "Assessment"
    Type        = "Bastion"
  }
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.environment_name}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

resource "aws_cloudtrail" "main_trail" {
  name           = "${var.environment_name}-trail"
  s3_bucket_name = aws_s3_bucket.cloudtrail_bucket.id
  
  event_selector {
    read_write_type           = "WriteOnly"
    include_management_events = true
  }
  
  tags = {
    Name        = "${var.environment_name}-trail"
    Environment = "Assessment"
  }
}

resource "aws_s3_bucket" "cloudtrail_bucket" {
  bucket = "${var.environment_name}-cloudtrail-${random_string.bucket_suffix.result}"
  
  tags = {
    Name        = "${var.environment_name}-cloudtrail"
    Environment = "Assessment"
  }
}

resource "aws_s3_bucket_policy" "cloudtrail_bucket_policy" {
  bucket = aws_s3_bucket.cloudtrail_bucket.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AWSCloudTrailAclCheck"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "s3:GetBucketAcl"
        Resource = aws_s3_bucket.cloudtrail_bucket.arn
      },
      {
        Sid    = "AWSCloudTrailWrite"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.cloudtrail_bucket.arn}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      }
    ]
  })
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]
  
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

output "student_access_key_id" {
  value       = aws_iam_access_key.student_key.id
  description = "Access key ID for student user"
}

output "student_secret_access_key" {
  value       = aws_iam_access_key.student_key.secret
  sensitive   = true
  description = "Secret access key for student user"
}

output "student_console_url" {
  value       = "https://${data.aws_caller_identity.current.account_id}.signin.aws.amazon.com/console"
  description = "AWS Console URL for student login"
}

output "vpc_id" {
  value       = aws_vpc.main.id
  description = "VPC ID for assessment environment"
}

output "rds_endpoint" {
  value       = aws_db_instance.mysql_db.endpoint
  description = "RDS MySQL endpoint"
}

data "aws_caller_identity" "current" {}