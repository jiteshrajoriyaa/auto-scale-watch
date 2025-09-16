# AutoScaleWatch

## Key Features
- **Request Submission:** Handles and queues incoming requests efficiently using Redis.
- **Auto Scaling Logic:** Manages workloads and scales services dynamically.
- **Monitoring Dashboard:** Grafana provides real-time metrics and system health visualization.
- **Containerized Setup:** Each component runs inside its own Docker container for isolation and simplicity.
- **One-Command Deployment:** Just run ```docker compose up``` and the entire system is ready.

## Steps to locally deployment:
### Clone the repo
```
git clone https://github.com/jiteshrajoriyaa/auto-scale-watch.git
```
### Run
```
docker compose up
OR
dokcer compose up -d
```
  It will run all the service (container).

## Testing services
Go to postman and use these APIs for testing
### Auth
```
POST  http://localhost:3001/signup
POST  http://localhost:3001/signin
```
**Schema for Signup body**
```
  { name: String,
    email: String,
    Password: String,
  }
  Schema for Signin body
  {
    email: String,
    password: String
  }
```
### Request
```
POST  http://localhost:8000/submit
```
**Keep in mind**
- The token you get from signup or signin need to be inseted in headers with ```Bearer``` at first and then paste the token. Like this:
  <img width="1410" height="147" alt="image" src="https://github.com/user-attachments/assets/a0559ed1-3a56-489b-b2b1-0e20ae3b0e55" />

Schema
{
  request: String
}

## Monitoring
- Open the docker desktop
- click on the link of grafana (this one in image)
  <img width="457" height="627" alt="image" src="https://github.com/user-attachments/assets/9f8cdc78-935b-4d54-a04d-617387e5be6e" />
- username: admin
- Password: admin
- Click on dashboards
  

