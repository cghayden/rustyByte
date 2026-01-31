how this all works: 

# terminal implementation

## when a user navigates to a challenge that uses a terminal, and starts the terminal, is that the moment at which the image is built from the dockerfile? Or is the image already built and just needs to be started?

Images are already built: containers are created on demand.

Phase 1: Development/Build Time (Done ONCE by you)
- You create the Dockerfile
Dockerfile.alpine-ttyd
- You build the image (happens ONCE)
docker build -f Dockerfile.alpine-ttyd -t rusty-byte-test-terminal:latest .
Image is now stored locally (or pushed to ECR)
This image is ~150MB and contains:
- Alpine Linux OS
- All tools (bash, vim, curl, etc.)
- The flag file already created
- All directories and files
This is like creating a "template" or "snapshot" of a complete Linux system.

Image Building (Development Time)
When: Before deployment, when you create/update challenges
How long: 30-60 seconds per image
How often: Only when you change the Dockerfile
Where: On your dev machine, then pushed to registry if using


Phase 2: User Clicks "Start Terminal" (Runtime)
1. User clicks "Start Terminal"
   ↓
2. Frontend → POST /api/instances
   ↓
3. dockerService.createInstance() is called
   ↓
4. Docker pulls/uses the PRE-BUILT image
   (if local: uses immediately, ~1 second)
   (if ECR: downloads once, caches, ~5-10 seconds first time)
   ↓
5. Docker creates a NEW CONTAINER from that image
   - Assigns port (8000-9000)
   - Sets up authentication token
   - Starts ttyd terminal server
   - Container is running in ~2-5 seconds
   ↓
6. User sees the terminal in their browser

Container Creation (User Runtime)
When: User clicks "Start Terminal"
How long: 2-5 seconds (if image is cached)
How often: Every time a user starts a challenge
Where: On the server running Docker daemon


It's like a Virtual Machine template:

Image (Dockerfile) = The .iso or template you create once
Container = A running VM instance created from that template

Workflow Summary:
YOU (Developer):
1. Write Dockerfile for "Linux Basics Challenge"
2. Build image: docker build -t rusty-byte/linux-basics:latest
3. Push to ECR: docker push <ecr-url>/rusty-byte/linux-basics:latest
4. Update database: challenge.dockerImage = "<ecr-url>/rusty-byte/linux-basics:latest"
Done - Challenge is ready!

USER (Player):
1. Navigates to /terminal/linux-basics-test
2. Clicks "Start Terminal"
3. Server creates container from PRE-BUILT image
4. Container starts in 3 seconds
5. User sees terminal with all files already there

## Image and Container Storage:
AWS ECR (Image Registry):
├── rusty-byte/linux-basics:latest (built by you)
├── rusty-byte/network-forensics:latest (built by you)
└── rusty-byte/web-exploit:latest (built by you)

VPS/EC2 Server (Runtime):
├── Docker daemon pulls images from ECR (once)
├── Cached images stored locally
└── Creates containers on-demand when users click "Start"

##  when I create a challenge that uses a terminal, how do I specify the image that it needs?

Example Workflow:
# 1. Create Dockerfile for a new challenge
nano Dockerfile.network-forensics

# 2. Build the image
docker build -f Dockerfile.network-forensics -t rusty-byte-network-forensics:latest .

# 3. Test locally
# (image name is: rusty-byte-network-forensics:latest)

# 4. Create challenge in database
npx tsx scripts/add-network-challenge.ts
# This script sets: dockerImage: 'rusty-byte-network-forensics:latest'

# 5. For production: push to ECR
docker tag rusty-byte-network-forensics:latest <ecr-url>/rusty-byte/network-forensics:latest
docker push <ecr-url>/rusty-byte/network-forensics:latest

# 6. Update database for production
# Change dockerImage to ECR URL


# Image naming conventions:

Development - Local:
rusty-byte-test-terminal:latest
rusty-byte-network-forensics:latest
rusty-byte-web-exploit:latest

Production - ECR:
\<account-id\>.dkr.ecr.us-east-2.amazonaws.com/rusty-byte/linux-basics:v1.0
\<account-id\>.dkr.ecr.us-east-2.amazonaws.com/rusty-byte/network-forensics:v1.0
\<account-id\>.dkr.ecr.us-east-2.amazonaws.com/rusty-byte/web-exploit:v1.0