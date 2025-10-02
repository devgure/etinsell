import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.SOCKET_IO_CORS_ORIGIN || '*' } });

io.on('connection', socket => {
  console.log('socket connected', socket.id);
  socket.on('join', (room) => socket.join(room));
  socket.on('leave', (room) => socket.leave(room));
  socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

app.post('/notify', express.json(), (req, res) => {
  const { room, event, payload } = req.body;
  if (room) io.to(room).emit(event || 'notify', payload);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3020;
server.listen(PORT, () => console.log(`Notification service listening ${PORT}`));
