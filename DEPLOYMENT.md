# PlacementHub Production Deployment Guide

This guide details recommendations and steps to deploy PlacementHub to a production environment (such as AWS, DigitalOcean, Heroku, or Render).

---

## 1. Production Environmental Settings

Configure the following tokens inside your hosting server environment (e.g. AWS Parameter Store or Render Env Control):

| Key | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `PORT` | Backend port binding | `5000` |
| `NODE_ENV` | Mode of operation | `production` |
| `MONGO_URI` | Remote database link | `mongodb+srv://user:pass@cluster.mongodb.net/placementhub` |
| `JWT_SECRET` | Secret hash key | *Secure long random alphanumeric string* |
| `JWT_EXPIRE` | Token validation span | `30d` |
| `CLIENT_URL` | Frontend URL endpoint | `https://placementhub.college.edu` |
| `SMTP_HOST` | SMTP server endpoint | `smtp.sendgrid.net` or `smtp.gmail.com` |
| `SMTP_PORT` | SMTP communication port | `587` or `465` |
| `SMTP_SECURE` | Use SSL encryption | `true` (for 465) or `false` (for 587) |
| `SMTP_USER` | SMTP username credential| `apikey` or account email |
| `SMTP_PASS` | SMTP password credential| *Secure API key or password* |
| `FROM_EMAIL` | Sender address | `"Placement Cell" <placements@college.edu>` |

---

## 2. Serving Frontend Assets via Express (Unified Deployment)

For a single-server deployment, you can build the React frontend and configure the Express backend to serve the static build folder directly.

### Step 1: Build the React Client
Inside `frontend/` folder, run the compiler:
```bash
cd frontend
npm run build
```
This generates a production-compiled client folder at `frontend/dist/`.

### Step 2: Configure Express Static Mounts
In `backend/src/server.js`, mount the build directory to Express using standard path helpers:
```javascript
// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend', 'dist', 'index.html'));
  });
}
```

---

## 3. Process Management (PM2)

To keep the backend server online in case of crashes or system restarts, configure **PM2**:

1. Install PM2 globally on the host server:
   ```bash
   sudo npm install -g pm2
   ```
2. Create an `ecosystem.config.js` file inside `backend/`:
   ```javascript
   module.exports = {
     apps: [
       {
         name: 'placementhub-api',
         script: 'src/server.js',
         instances: 'max',
         exec_mode: 'cluster',
         env: {
           NODE_ENV: 'production'
         }
       }
     ]
   };
   ```
3. Boot the application:
   ```bash
   pm2 start ecosystem.config.js
   ```
4. Save the PM2 process list to load automatically on server restart:
   ```bash
   pm2 save
   pm2 startup
   ```

---

## 4. Nginx Reverse Proxy & SSL Setup

Use Nginx to map incoming HTTPS requests on ports 80/443 directly to port 5000, and handle WebSocket upgrade handshakes.

### Example Nginx Server block:
```nginx
server {
    listen 80;
    server_name placementhub.college.edu;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name placementhub.college.edu;

    ssl_certificate /etc/letsencrypt/live/placementhub.college.edu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/placementhub.college.edu/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. MongoDB Database Hosting

1. Provision a free or dedicated MongoDB Cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. whitelist the server IP address (or set to `0.0.0.0/0` temporarily, and then narrow down) in Database Access settings.
3. Extract your connection URI and set it as `MONGO_URI` in the server's environment variables.
