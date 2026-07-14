const jwt = require('jsonwebtoken');
const CallLog = require('../models/CallLog');
const Seller = require('../models/Seller');
const User = require('../models/User');

const presenceByTenant = new Map();
const activeCalls = new Map();

const isCallSocketSilent = process.env.CALL_SOCKET_SILENT === 'true';

const callSocketLog = (...args) => {
  if (!isCallSocketSilent) console.log(...args);
};

const parseCookieHeader = (cookieHeader = '') => cookieHeader
  .split(';')
  .map((part) => part.trim())
  .filter(Boolean)
  .reduce((cookies, part) => {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex === -1) return cookies;

    const key = part.slice(0, separatorIndex);
    const value = part.slice(separatorIndex + 1);
    cookies[key] = decodeURIComponent(value);
    return cookies;
  }, {});

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
};

const getTenantPresence = (tenantId) => {
  const key = String(tenantId);
  if (!presenceByTenant.has(key)) {
    presenceByTenant.set(key, new Map());
  }
  return presenceByTenant.get(key);
};

const findSocketId = (tenantId, userId) => {
  const presence = getTenantPresence(tenantId);
  const entry = presence.get(String(userId));
  return entry ? entry.socketId : null;
};

const getTenantIdForUser = async (user) => {
  if (!user) return null;
  if (user.role === 'manager') return user._id;

  if (user.role === 'seller') {
    const seller = await Seller.findOne({ userId: user._id }).select('managerId').lean();
    return seller?.managerId || null;
  }

  return user._id;
};

const getSocketToken = (socket) => {
  const authToken = socket.handshake.auth?.token;
  if (authToken) return authToken;

  const authHeader = socket.handshake.headers?.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length);
  }

  const cookies = parseCookieHeader(socket.handshake.headers?.cookie);
  return cookies.token || null;
};

const buildSocketUser = async (socket) => {
  const token = getSocketToken(socket);
  if (!token) {
    throw new Error('No auth token provided');
  }

  const decoded = jwt.verify(token, getJwtSecret());
  const userId = decoded.userId || decoded.id || decoded._id;
  const user = await User.findById(userId).select('name role email mobile').lean();

  if (!user) {
    throw new Error('User no longer exists');
  }

  const tenantId = decoded.tenantId || await getTenantIdForUser(user);
  if (!tenantId) {
    throw new Error('User is not linked to a calling tenant');
  }

  return {
    userId: String(user._id),
    tenantId: String(tenantId),
    role: user.role,
    name: user.name,
  };
};

module.exports = function initCallSocket(io) {
  io.use(async (socket, next) => {
    try {
      socket.user = await buildSocketUser(socket);
      callSocketLog('[call-socket] auth successful', {
        userId: socket.user.userId,
        tenantId: socket.user.tenantId,
        role: socket.user.role,
      });
      next();
    } catch (err) {
      console.error('[call-socket] auth failed', {
        error: err.message,
        hasToken: !!getSocketToken(socket),
        headers: {
          cookie: socket.handshake.headers?.cookie ? '***' : 'none',
          authorization: socket.handshake.headers?.authorization ? '***' : 'none',
        },
        auth: socket.handshake.auth ? '***' : 'none',
      });
      next(new Error(err.message || 'Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const { userId, tenantId, role, name } = socket.user;
    const tenantRoom = `tenant:${tenantId}`;
    const presence = getTenantPresence(tenantId);

    socket.join(tenantRoom);
    presence.set(String(userId), { socketId: socket.id, name, role });

    callSocketLog('[call-socket] connected', {
      userId,
      tenantId,
      role,
      socketId: socket.id,
      presenceKeys: Array.from(presence.keys()),
    });

    socket.to(tenantRoom).emit('presence-update', {
      userId,
      status: 'online',
    });

    socket.on('call-initiate', ({ receiverId, callType = 'voice' }) => {
      const normalizedReceiverId = String(receiverId || '');
      const receiverSocketId = findSocketId(tenantId, normalizedReceiverId);

      callSocketLog('[call-socket] call-initiate', {
        from: userId,
        tenantId,
        receiverId: normalizedReceiverId,
        receiverSocketId: receiverSocketId,
        presenceKeys: Array.from(presence.keys()),
      });

      if (!normalizedReceiverId || normalizedReceiverId === String(userId)) {
        socket.emit('call-failed', {
          reason: 'invalid-target',
          message: 'Invalid call receiver.',
        });
        return;
      }

      const receiverPresence = presence.get(normalizedReceiverId);
      const callId = `${userId}-${normalizedReceiverId}-${Date.now()}`;
      const safeCallType = ['voice', 'video', 'screen'].includes(callType) ? callType : 'voice';

      // Create the call record even if the receiver is offline so caller sees the ringing/outgoing state.
      const NO_ANSWER_TIMEOUT_MS = Number(process.env.NO_ANSWER_TIMEOUT_MS) || 30000;

      const timeoutId = setTimeout(async () => {
        const call = activeCalls.get(callId);
        if (!call) return;
        // If call never started, mark as missed and notify caller
        if (!call.startedAt) {
          const callerSocketId = findSocketId(call.tenantId, call.caller.userId);
          if (callerSocketId) {
            io.to(callerSocketId).emit('call-ended', { callId, reason: 'no-answer' });
          }
          await logCall(call, 'missed');
          activeCalls.delete(callId);
        }
      }, NO_ANSWER_TIMEOUT_MS);

      activeCalls.set(callId, {
        caller: { userId, name, role },
        receiver: {
          userId: normalizedReceiverId,
          name: receiverPresence?.name,
          role: receiverPresence?.role,
        },
        tenantId,
        callType: safeCallType,
        startedAt: null,
        timeoutId,
      });

      // If receiver is online, notify them. If not, we still let caller see 'ringing'.
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('incoming-call', {
          callId,
          callerId: userId,
          callerName: name,
          callerRole: role,
          callType: safeCallType,
        });
      }

      socket.emit('call-ringing', { callId });
    });

    socket.on('call-accept', ({ callId }) => {
      const call = activeCalls.get(callId);
      if (!call) return;

      // Clear no-answer timeout if set
      if (call.timeoutId) {
        clearTimeout(call.timeoutId);
        delete call.timeoutId;
      }

      call.startedAt = Date.now();
      const callerSocketId = findSocketId(tenantId, call.caller.userId);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call-accepted', { callId });
      }
    });

    socket.on('call-reject', async ({ callId }) => {
      const call = activeCalls.get(callId);
      if (!call) return;

      // Clear any pending timeout
      if (call.timeoutId) {
        clearTimeout(call.timeoutId);
        delete call.timeoutId;
      }

      const callerSocketId = findSocketId(tenantId, call.caller.userId);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call-rejected', { callId });
      }

      await logCall(call, 'rejected');
      activeCalls.delete(callId);
    });

    socket.on('webrtc-offer', ({ callId, targetUserId, offer }) => {
      const targetSocketId = findSocketId(tenantId, targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtc-offer', { callId, offer, from: userId });
      }
    });

    socket.on('webrtc-answer', ({ callId, targetUserId, answer }) => {
      const targetSocketId = findSocketId(tenantId, targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtc-answer', { callId, answer, from: userId });
      }
    });

    socket.on('ice-candidate', ({ callId, targetUserId, candidate }) => {
      const targetSocketId = findSocketId(tenantId, targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('ice-candidate', { callId, candidate, from: userId });
      }
    });

    socket.on('screen-share-toggle', ({ callId, targetUserId, isSharing }) => {
      const targetSocketId = findSocketId(tenantId, targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('screen-share-toggle', {
          callId,
          isSharing,
          from: userId,
        });
      }
    });

    socket.on('call-end', async ({ callId, targetUserId }) => {
      const call = activeCalls.get(callId);
      const targetSocketId = findSocketId(tenantId, targetUserId);

      // Clear any pending timeout
      if (call && call.timeoutId) {
        clearTimeout(call.timeoutId);
        delete call.timeoutId;
      }

      if (targetSocketId) {
        io.to(targetSocketId).emit('call-ended', { callId });
      }

      if (call) {
        await logCall(call, call.startedAt ? 'completed' : 'missed');
        activeCalls.delete(callId);
      }
    });

    socket.on('disconnect', () => {
      presence.delete(String(userId));
      socket.to(tenantRoom).emit('presence-update', {
        userId,
        status: 'offline',
      });

      for (const [callId, call] of activeCalls.entries()) {
        const { userId: callerUserId } = call.caller;
        const { userId: receiverUserId } = call.receiver;

        if (callerUserId === userId || receiverUserId === userId) {
          const otherUserId = callerUserId === userId ? receiverUserId : callerUserId;
          const otherSocketId = findSocketId(tenantId, otherUserId);

          // Clear any pending timeout
          if (call.timeoutId) {
            clearTimeout(call.timeoutId);
            delete call.timeoutId;
          }

          if (otherSocketId) {
            io.to(otherSocketId).emit('call-ended', { callId, reason: 'disconnected' });
          }

          logCall(call, call.startedAt ? 'completed' : 'missed');
          activeCalls.delete(callId);
        }
      }
    });
  });
};

async function logCall(call, status) {
  try {
    const endedAt = Date.now();
    const durationSeconds = call.startedAt
      ? Math.round((endedAt - call.startedAt) / 1000)
      : 0;

    await CallLog.create({
      tenantId: call.tenantId,
      caller: call.caller,
      receiver: call.receiver,
      callType: call.callType,
      status,
      startedAt: call.startedAt ? new Date(call.startedAt) : null,
      endedAt: new Date(endedAt),
      durationSeconds,
    });
  } catch (err) {
    console.error('[call-socket] Failed to log call:', err.message);
  }
}
