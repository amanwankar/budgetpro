Bilkul bhai. **Proper professional GitHub README** me sirf commands nahi hote. README ka purpose ye hona chahiye ki koi recruiter/developer repo open kare to usko **project kya hai, kaise run karna hai, architecture kya hai, DevOps kaise setup hai aur kaise verify karna hai** — sab clear mile.

Tumhare **BudgetPro** ke liye README ka ideal structure ye hona chahiye:

````markdown
# BudgetPro

> AI-powered Expense Management Platform with Docker, CI/CD, Kubernetes, Prometheus, Grafana and AIOps.

---

## 📌 Overview

BudgetPro is a full-stack expense management platform designed with a production-oriented DevOps architecture.

The application provides:

- Expense management
- Income management
- Investment management
- Financial dashboard
- Firebase Authentication
- Cloud Firestore
- Razorpay integration
- AI-powered investment document scanning

The project also implements a complete DevOps workflow:

GitHub → GitHub Actions → Docker → Docker Hub → Kubernetes → Prometheus → Grafana

The next evolution of the project is AI-powered DevOps / AIOps for incident analysis and root-cause recommendations.

---

# ✨ Features

## Application Features

- Expense tracking
- Income tracking
- Investment tracking
- Financial dashboard
- Firebase authentication
- Cloud Firestore database
- Razorpay integration
- Responsive UI

## AI Features

- AI Investment Document Scanner
- Automatic extraction of investment details
- Gemini-powered document analysis

Extracted information includes:

- Investment name
- Amount
- Investment type
- Due date
- Interest rate

## DevOps Features

- Production Docker image
- Multi-stage Docker build
- Docker Hub image publishing
- GitHub Actions CI/CD
- Kubernetes deployment
- Kubernetes Secrets
- Readiness probes
- Liveness probes
- CPU and memory resource limits
- Prometheus monitoring
- Grafana dashboards
- Application-level metrics
- Prometheus alerts
- Kubernetes ServiceMonitor

---

# 🏗️ Architecture

```text
                         BudgetPro
                            |
             +--------------+--------------+
             |                             |
        Application                    DevOps
             |                             |
     React + TypeScript                Docker
             |                             |
      Node.js + Express            GitHub Actions
             |                             |
    Firebase / Firestore             Docker Hub
             |                             |
       Gemini / Razorpay            Kubernetes
                                           |
                              +------------+------------+
                              |                         |
                         Prometheus                 Grafana
                              |
                           Alerts
````

---

# 🛠️ Tech Stack

| Category           | Technology              |
| ------------------ | ----------------------- |
| Frontend           | React + TypeScript      |
| Build Tool         | Vite                    |
| Styling            | Tailwind CSS            |
| Backend            | Node.js + Express       |
| Database           | Cloud Firestore         |
| Authentication     | Firebase Authentication |
| Payments           | Razorpay                |
| AI                 | Google Gemini           |
| Containerization   | Docker                  |
| CI/CD              | GitHub Actions          |
| Container Registry | Docker Hub              |
| Orchestration      | Kubernetes              |
| Monitoring         | Prometheus              |
| Visualization      | Grafana                 |
| Metrics            | prom-client             |

---

# 📁 Project Structure

```text
budgetpro/
│
├── src/
│   ├── components/
│   ├── context/
│   ├── services/
│   └── ...
│
├── server.ts
├── vite.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.server.json
│
├── Dockerfile
├── .dockerignore
├── .gitignore
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── servicemonitor.yaml
│   └── budgetpro-prometheus-rules.yaml
│
└── README.md
```

---

# ⚙️ Prerequisites

Install the following before running the project:

* Node.js 22+
* npm
* Git
* Docker
* kubectl
* Kubernetes
* Helm

Verify installations:

```powershell
node --version
npm --version
git --version
docker --version
kubectl version --client
helm version
```

---

# 🚀 Local Development

## 1. Clone Repository

```powershell
git clone https://github.com/amanwankar/budgetpro.git
cd budgetpro
```

---

## 2. Install Dependencies

```powershell
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the project root.

Example:

```env
GEMINI_API_KEY=your_gemini_api_key

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

> Never commit `.env` or real credentials to GitHub.

---

## 4. Validate Project

```powershell
npm run lint
```

---

## 5. Build Frontend

```powershell
npm run build
```

---

## 6. Build Backend

```powershell
npm run build:server
```

---

## 7. Start Development Server

```powershell
npm run dev
```

Application:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

Metrics:

```text
http://localhost:3000/metrics
```

---

# 🐳 Docker

## Build Image

```powershell
docker build -t budgetpro:latest .
```

## Check Image

```powershell
docker images
```

## Run Container

```powershell
docker run -d `
  --name budgetpro-app `
  -p 3000:3000 `
  --env-file .env `
  budgetpro:latest
```

## Check Container

```powershell
docker ps
```

## View Logs

```powershell
docker logs budgetpro-app
```

## Stop Container

```powershell
docker stop budgetpro-app
```

## Start Container

```powershell
docker start budgetpro-app
```

## Remove Container

```powershell
docker rm budgetpro-app
```

---

# 🐳 Docker Hub

Login:

```powershell
docker login
```

Tag image:

```powershell
docker tag budgetpro:latest amanwankar18/budgetpro:latest
```

Push image:

```powershell
docker push amanwankar18/budgetpro:latest
```

Docker Hub repository:

```text
amanwankar18/budgetpro
```

---

# 🔄 CI/CD with GitHub Actions

The project uses GitHub Actions to automate the build and Docker image publishing process.

## Pipeline

```text
Developer
    |
    v
GitHub
    |
    v
GitHub Actions
    |
    +--> Install Dependencies
    |
    +--> Validate / Build
    |
    +--> Build Docker Image
    |
    +--> Login to Docker Hub
    |
    +--> Push Docker Image
    |
    v
Docker Hub
```

## Required GitHub Secrets

Add these secrets in:

```text
GitHub Repository
→ Settings
→ Secrets and variables
→ Actions
```

Required:

```text
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
```

---

# ☸️ Kubernetes

## Check Kubernetes

```powershell
kubectl version --client
kubectl config current-context
kubectl get nodes
```

---

# Create Namespace

```powershell
kubectl create namespace budgetpro
```

---

# Kubernetes Secret

Create application secrets:

```powershell
kubectl create secret generic budgetpro-secrets `
  --from-env-file=.env `
  -n budgetpro
```

Verify:

```powershell
kubectl get secrets -n budgetpro
```

---

# Deploy Application

Apply Kubernetes manifests:

```powershell
kubectl apply -f k8s/
```

Check deployment:

```powershell
kubectl get deployment -n budgetpro
```

Check pods:

```powershell
kubectl get pods -n budgetpro
```

Check services:

```powershell
kubectl get service -n budgetpro
```

Check everything:

```powershell
kubectl get all -n budgetpro
```

---

# 🔍 Kubernetes Health Checks

BudgetPro exposes:

```text
/api/health
```

Kubernetes uses this endpoint for:

### Readiness Probe

Determines whether the application is ready to receive traffic.

### Liveness Probe

Determines whether the application is still healthy.

---

# 📊 Kubernetes Resources

The application uses resource requests and limits.

```text
CPU Request      100m
Memory Request   128Mi

CPU Limit        500m
Memory Limit     512Mi
```

This prevents the application from consuming unlimited cluster resources.

---

# 📈 Prometheus Monitoring

Prometheus is deployed using:

```text
kube-prometheus-stack
```

Create monitoring namespace:

```powershell
kubectl create namespace monitoring
```

Add Prometheus Community Helm repository:

```powershell
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
```

Update repository:

```powershell
helm repo update
```

Install monitoring stack:

```powershell
helm install monitoring prometheus-community/kube-prometheus-stack `
  -n monitoring
```

Check monitoring pods:

```powershell
kubectl get pods -n monitoring
```

---

# 🔌 Prometheus Port Forward

```powershell
kubectl port-forward `
  -n monitoring `
  svc/monitoring-kube-prometheus-prometheus `
  9090:9090
```

Prometheus:

```text
http://localhost:9090
```

---

# 📊 Application Metrics

BudgetPro exposes metrics through:

```text
/metrics
```

Main application metrics:

```text
budgetpro_http_requests_total

budgetpro_http_request_duration_seconds
```

These metrics provide information about:

* Request count
* HTTP method
* Route
* Status code
* Request duration
* Application performance

---

# 🔎 Test Application Metrics

```powershell
kubectl run metrics-test `
  -n budgetpro `
  --rm -i `
  --restart=Never `
  --image=curlimages/curl `
  -- curl -v http://budgetpro:3000/metrics
```

---

# 🔗 ServiceMonitor

BudgetPro uses a Kubernetes `ServiceMonitor` so Prometheus can automatically discover and scrape application metrics.

Verify:

```powershell
kubectl get servicemonitor -n monitoring
```

Metrics endpoint:

```text
/metrics
```

Scrape interval:

```text
15 seconds
```

---

# 📉 Grafana

Port-forward Grafana:

```powershell
kubectl port-forward `
  -n monitoring `
  svc/monitoring-grafana `
  3001:80
```

Open:

```text
http://localhost:3001
```

Prometheus datasource:

```text
http://monitoring-kube-prometheus-prometheus:9090
```

---

# 📊 Grafana Dashboard

The BudgetPro application dashboard contains:

1. Request Rate
2. Total Requests
3. 5xx Errors
4. 4xx Errors
5. Average Latency
6. P95 Latency
7. Requests by Endpoint
8. HTTP Status Codes
9. CPU Usage
10. Memory Usage

Dashboard refresh:

```text
15 seconds
```

---

# 📐 PromQL Queries

### Request Rate

```promql
rate(budgetpro_http_requests_total[5m])
```

### Total Requests

```promql
sum(budgetpro_http_requests_total)
```

### 5xx Error Rate

```promql
sum(
  rate(
    budgetpro_http_requests_total{
      status_code=~"5.."
    }[5m]
  )
)
```

### 4xx Error Rate

```promql
sum(
  rate(
    budgetpro_http_requests_total{
      status_code=~"4.."
    }[5m]
  )
)
```

### Average Latency

```promql
sum(rate(budgetpro_http_request_duration_seconds_sum[5m]))
/
sum(rate(budgetpro_http_request_duration_seconds_count[5m]))
```

### Running BudgetPro Pods

```promql
count(
  kube_pod_status_phase{
    namespace="budgetpro",
    phase="Running"
  }
)
```

### CPU Usage

```promql
sum(
  rate(
    container_cpu_usage_seconds_total{
      namespace="budgetpro",
      container!="",
      container!="POD"
    }[5m]
  )
)
```

### Memory Usage

```promql
sum(
  container_memory_working_set_bytes{
    namespace="budgetpro",
    container!="",
    container!="POD"
  }
)
```

---

# 🚨 Prometheus Alerts

BudgetPro contains application monitoring alerts for:

```text
BudgetProPodDown
BudgetProHigh5xxRate
BudgetProHighLatency
BudgetProHighCPU
BudgetProHighMemory
BudgetProMetricsMissing
```

Verify:

```powershell
kubectl get prometheusrule -n monitoring
```

---

# 🛠️ Troubleshooting

## Check Pods

```powershell
kubectl get pods -n budgetpro
```

## Pod Details

```powershell
kubectl describe pod <pod-name> -n budgetpro
```

## Pod Logs

```powershell
kubectl logs <pod-name> -n budgetpro
```

## Kubernetes Events

```powershell
kubectl get events `
  -n budgetpro `
  --sort-by=.lastTimestamp
```

## Deployment Status

```powershell
kubectl describe deployment budgetpro -n budgetpro
```

## Docker Logs

```powershell
docker logs budgetpro-app
```

---

# ⏹️ Stop BudgetPro

Scale application to zero:

```powershell
kubectl scale deployment budgetpro `
  -n budgetpro `
  --replicas=0
```

---

# ▶️ Start BudgetPro Again

```powershell
kubectl scale deployment budgetpro `
  -n budgetpro `
  --replicas=2
```

---

# ⏹️ Stop Monitoring

```powershell
kubectl scale deployment `
  -n monitoring `
  --all `
  --replicas=0
```

```powershell
kubectl scale statefulset `
  -n monitoring `
  --all `
  --replicas=0
```

Port-forward processes can be stopped using:

```text
Ctrl + C
```

---

# 🔄 Git Workflow

Check changes:

```powershell
git status
```

Check commits:

```powershell
git log --oneline
```

Add changes:

```powershell
git add .
```

Commit:

```powershell
git commit -m "Update BudgetPro"
```

Push:

```powershell
git push origin main
```

---

# 🔐 Security

Never commit:

```text
.env
API keys
Firebase private credentials
Razorpay secret keys
Gemini API keys
Docker Hub tokens
Kubernetes secret values
```

Use:

* `.env` locally
* GitHub Actions Secrets for CI/CD
* Kubernetes Secrets for deployment

---

# 🤖 Future AIOps

The next phase of BudgetPro will integrate AI into DevOps operations.

Planned architecture:

```text
Prometheus
    |
    v
AI Incident Analyzer
    |
    +--> Metrics Analysis
    |
    +--> Error Analysis
    |
    +--> Latency Analysis
    |
    +--> Resource Analysis
    |
    v
Root Cause Analysis
    |
    v
Recommendation
    |
    v
Human Approval
    |
    v
Controlled Kubernetes Action
    |
    v
Verification
```

The initial AIOps implementation will be read-only.

AI will:

* Analyze incidents
* Analyze metrics
* Identify possible root causes
* Provide evidence
* Recommend actions
* Provide confidence scores

Production remediation will require human approval.

---

# 📌 Current Project Status

| Component           | Status        |
| ------------------- | ------------- |
| Application         | ✅             |
| React + TypeScript  | ✅             |
| Node.js + Express   | ✅             |
| Firebase            | ✅             |
| Firestore           | ✅             |
| Gemini AI           | ✅             |
| Docker              | ✅             |
| Docker Hub          | ✅             |
| GitHub Actions      | ✅             |
| Kubernetes          | ✅             |
| Kubernetes Secrets  | ✅             |
| Health Probes       | ✅             |
| Prometheus          | ✅             |
| Grafana             | ✅             |
| Application Metrics | ✅             |
| ServiceMonitor      | ✅             |
| Prometheus Alerts   | ✅             |
| Centralized Logging | 🔄 Planned    |
| AIOps               | 🔄 Next Phase |

---

# 🔄 Complete DevOps Workflow

```text
Developer
    |
    v
GitHub
    |
    v
GitHub Actions
    |
    v
Docker Build
    |
    v
Docker Hub
    |
    v
Kubernetes
    |
    +--------------------+
    |                    |
    v                    v
BudgetPro             Metrics
    |                    |
    |                Prometheus
    |                    |
    |                 Grafana
    |                    |
    +---------> Alerts <+
                         |
                         v
                       AIOps
```

---

# 👨‍💻 Author

**Aman Wankar**

B.Tech Computer Science Engineering

GitHub:

[https://github.com/amanwankar](https://github.com/amanwankar)

LinkedIn:

[https://linkedin.com/in/aman-w-4b1310266](https://linkedin.com/in/aman-w-4b1310266)

---

# 📄 License

This project is intended for educational, portfolio and demonstration purposes.

```

**Ye structure tumhare README ke liye sahi rahega.** Isme theory limited hai aur actual **setup → build → Docker → CI/CD → Kubernetes → Prometheus → Grafana → alerts → troubleshooting → AIOps** complete flow cover hota hai.
```
