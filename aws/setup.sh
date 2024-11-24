#!/bin/bash

# Exit on error
set -e

# Default values
REGION="us-west-2"
ENVIRONMENT="production"
STACK_PREFIX="thundercode"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --region)
      REGION="$2"
      shift 2
      ;;
    --environment)
      ENVIRONMENT="$2"
      shift 2
      ;;
    --stack-prefix)
      STACK_PREFIX="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Function to wait for stack creation/update
wait_for_stack() {
    local stack_name=$1
    echo "Waiting for stack $stack_name..."
    aws cloudformation wait stack-create-complete --stack-name $stack_name --region $REGION || \
    aws cloudformation wait stack-update-complete --stack-name $stack_name --region $REGION
}

# Create ECR repositories
echo "Creating ECR repositories..."
aws cloudformation deploy \
    --template-file cloudformation/ecr.yml \
    --stack-name "${STACK_PREFIX}-ecr" \
    --region $REGION \
    --capabilities CAPABILITY_IAM

# Get ECR repository URIs
FRONTEND_REPO=$(aws cloudformation describe-stacks \
    --stack-name "${STACK_PREFIX}-ecr" \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendRepositoryURI`].OutputValue' \
    --output text \
    --region $REGION)

BACKEND_REPO=$(aws cloudformation describe-stacks \
    --stack-name "${STACK_PREFIX}-ecr" \
    --query 'Stacks[0].Outputs[?OutputKey==`BackendRepositoryURI`].OutputValue' \
    --output text \
    --region $REGION)

# Create ECS cluster and VPC
echo "Creating ECS cluster and VPC..."
aws cloudformation deploy \
    --template-file cloudformation/ecs-cluster.yml \
    --stack-name "${STACK_PREFIX}-cluster" \
    --region $REGION \
    --parameter-overrides \
        EnvironmentName=$ENVIRONMENT \
    --capabilities CAPABILITY_IAM

# Get cluster outputs
CLUSTER_NAME=$(aws cloudformation describe-stacks \
    --stack-name "${STACK_PREFIX}-cluster" \
    --query 'Stacks[0].Outputs[?OutputKey==`ClusterName`].OutputValue' \
    --output text \
    --region $REGION)

VPC_ID=$(aws cloudformation describe-stacks \
    --stack-name "${STACK_PREFIX}-cluster" \
    --query 'Stacks[0].Outputs[?OutputKey==`VpcId`].OutputValue' \
    --output text \
    --region $REGION)

SUBNET1=$(aws cloudformation describe-stacks \
    --stack-name "${STACK_PREFIX}-cluster" \
    --query 'Stacks[0].Outputs[?OutputKey==`PublicSubnet1`].OutputValue' \
    --output text \
    --region $REGION)

SUBNET2=$(aws cloudformation describe-stacks \
    --stack-name "${STACK_PREFIX}-cluster" \
    --query 'Stacks[0].Outputs[?OutputKey==`PublicSubnet2`].OutputValue' \
    --output text \
    --region $REGION)

# Create ECS services and tasks
echo "Creating ECS services and tasks..."
aws cloudformation deploy \
    --template-file cloudformation/ecs-services.yml \
    --stack-name "${STACK_PREFIX}-services" \
    --region $REGION \
    --parameter-overrides \
        EnvironmentName=$ENVIRONMENT \
        FrontendImage="${FRONTEND_REPO}:latest" \
        BackendImage="${BACKEND_REPO}:latest" \
        ECSClusterName=$CLUSTER_NAME \
        VpcId=$VPC_ID \
        PublicSubnet1=$SUBNET1 \
        PublicSubnet2=$SUBNET2 \
    --capabilities CAPABILITY_IAM

# Get service URLs
FRONTEND_URL=$(aws cloudformation describe-stacks \
    --stack-name "${STACK_PREFIX}-services" \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendURL`].OutputValue' \
    --output text \
    --region $REGION)

BACKEND_URL=$(aws cloudformation describe-stacks \
    --stack-name "${STACK_PREFIX}-services" \
    --query 'Stacks[0].Outputs[?OutputKey==`BackendURL`].OutputValue' \
    --output text \
    --region $REGION)

echo "Deployment complete!"
echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL: $BACKEND_URL"
echo "Frontend ECR Repository: $FRONTEND_REPO"
echo "Backend ECR Repository: $BACKEND_REPO"
