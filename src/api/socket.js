import { io } from 'socket.io-client';
import { API_BASE } from './http.js';

let socket = null;

export function getSocket() {
  if (!socket) {
    const token = localStorage.getItem('token');

    socket = io(API_BASE, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      // Keep trying with a capped delay so longer network outages recover.
      reconnectionAttempts: Infinity,
      transports: ['websocket', 'polling'],
      auth: {
        token: token,
      },
    });

    // Debug events
    socket.on('connect', () => {
      // console.log('[Socket.IO] Connected to server');
    });

    socket.on('disconnect', (reason) => {
      // console.log('[Socket.IO] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket.IO] Connection error:', error);
    });

    socket.io.on('reconnect', (attemptNumber) => {
      // console.log('[Socket.IO] Reconnected after', attemptNumber, 'attempts');
    });
  }
  return socket;
}

/**
 * Refresh socket authentication with new token
 * Call this after login or when token is refreshed
 */
export function refreshSocketAuth() {
  const token = localStorage.getItem('token');
  if (socket) {
    socket.auth = { token };
    // Always establish a fresh authenticated handshake. Previously a token
    // refreshed while disconnected never caused the socket to reconnect.
    if (socket.connected) {
      socket.disconnect();
    }
    if (token) socket.connect();
  }
}

/**
 * Reset socket instance completely
 * Call this on logout
 */
export function resetSocket() {
  if (socket) {
    socket.disconnect();
    socket.removeAllListeners();
    socket = null;
  }
}

export function connectSocket() {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

export function disconnectSocket() {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}

export function listenToDeviceStatus(deviceId, callback) {
  const socket = connectSocket();
  const eventName = `device:${deviceId}:status`;

  const handler = (status) => {
    callback(status);
  };

  socket.on(eventName, handler);

  // Return cleanup function
  return () => {
    socket.off(eventName, handler);
  };
}

export function listenToSocketConnection(callback) {
  const socket = connectSocket();
  const handler = () => callback();
  socket.on('connect', handler);
  return () => socket.off('connect', handler);
}

export function listenToDeviceAccessChanges(callback) {
  const socket = connectSocket();
  const eventName = 'device:access-changed';
  const handler = (payload) => callback(payload || {});

  socket.on(eventName, handler);
  return () => socket.off(eventName, handler);
}

export function listenToGroupUpdates(deviceId, callback) {
  const socket = connectSocket();
  const eventName = `device:${deviceId}:groups-updated`;

  const handler = (data) => {
    callback(data);
  };

  socket.on(eventName, handler);

  return () => {
    socket.off(eventName, handler);
  };
}

export function listenToNewGroup(deviceId, callback) {
  const socket = connectSocket();
  const eventName = `device:${deviceId}:group-joined`;

  const handler = (groupData) => {
    callback(groupData);
  };

  socket.on(eventName, handler);

  return () => {
    socket.off(eventName, handler);
  };
}

export function listenToGroupLeft(deviceId, callback) {
  const socket = connectSocket();
  const eventName = `device:${deviceId}:group-left`;

  const handler = (data) => {
    callback(data);
  };

  socket.on(eventName, handler);

  return () => {
    socket.off(eventName, handler);
  };
}
