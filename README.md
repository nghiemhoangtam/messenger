# Realtime Chat System

## Overview

This is a **Realtime Chat System** built with **NestJS, MongoDB, WebSocket (Socket.IO), Redis**, and **React**. It provides real-time messaging, user authentication, and scalable infrastructure using Kubernetes.

## Features

- ✅ **User Authentication** (JWT & OAuth2)
- ✅ **Realtime Messaging** with WebSocket (Socket.IO)
- ✅ **MongoDB Database** for chat persistence
- ✅ **Redis Pub/Sub** for WebSocket scaling
- ✅ **REST API** for user and chat management
- ✅ **Dockerized Deployment** with **Kubernetes & Helm**
- ✅ **CI/CD Pipeline** using **Jenkins & ArgoCD**

## Tech Stack

### Backend

- [NestJS](https://nestjs.com/) (TypeScript Framework)
- [MongoDB](https://www.mongodb.com/) (Database)
- [Redis](https://redis.io/) (Caching & Pub/Sub)
- [Socket.IO](https://socket.io/) (WebSocket Communication)
- [JWT](https://jwt.io/) (Authentication)
- [Swagger](https://swagger.io/) (API Documentation)

### Frontend

- [React.js](https://reactjs.org/)
- [Redux](https://redux.js.org/)
- [Ant Design](https://ant.design/)

### DevOps

- [Docker](https://www.docker.com/)
- [Kubernetes](https://kubernetes.io/)
- [Helm](https://helm.sh/)
- [Jenkins](https://www.jenkins.io/)
- [ArgoCD](https://argo-cd.readthedocs.io/en/stable/)

## System Architecture

```plaintext
+---------------+        +-------------------+        +-----------------+
|  React App    | <-->   |  NestJS Chat API  |  <-->  | MongoDB (chat)  |
| (WebSocket)   |        | (REST + WebSocket)|        | Redis (Pub/Sub) |
+---------------+        +-------------------+        +-----------------+
```



