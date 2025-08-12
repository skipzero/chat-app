# Chat-App
creating a relatively simple little chat app to keep in practice and to try out something new. It's been ages since I've used socket.io and this was a good excuse to pull it off the shrlf and take 'er for a little spin... When done, this app should:

• Be real time with one-on-one and group chat rooms

• Have a live presence indicator, basically a list of online users

• Typing notifications when someone is typing

• Message history, using MongoDB keep older messages

• Mobile-friendly, responsive UI 


   ## Running the App

### Server

set `MONGO_URI`, `JWT_SECRET`, `PORT` in .env


```javascript
cd server
npm install
npm run dev
```

### Client

set `VITE_SERVER_URL=http://localhost:4000` in .env


```javascript
cd client
npm install
npm run start
```