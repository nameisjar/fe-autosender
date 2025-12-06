import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
let socket = null;

export function getSocket() {
  if (!socket) {
    const token = localStorage.getItem('token');
    
    socket = io(API_BASE, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ['websocket', 'polling'],
      auth: {
        token: token
      }
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

    socket.on('reconnect', (attemptNumber) => {
      // console.log('[Socket.IO] Reconnected after', attemptNumber, 'attempts');
    });
  }
  return socket;
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
  
  // console.log(`[Socket.IO] Listening to event: ${eventName}`);
  
  socket.on(eventName, (status) => {
    // console.log(`[Socket.IO] Received event ${eventName}:`, status);
    callback(status);
  });
  
  // Return cleanup function
  return () => {
    // console.log(`[Socket.IO] Removing listener for: ${eventName}`);
    socket.off(eventName, callback);
  };
}

// 🆕 Listen to group updates for a device
export function listenToGroupUpdates(deviceId, callback) {
  const socket = connectSocket();
  const eventName = `device:${deviceId}:groups-updated`;
  
  // console.log(`[Socket.IO] Listening to event: ${eventName}`);
  
  socket.on(eventName, (data) => {
    // console.log(`[Socket.IO] Received event ${eventName}:`, data);
    callback(data);
  });
  
  // Return cleanup function
  return () => {
    // console.log(`[Socket.IO] Removing listener for: ${eventName}`);
    socket.off(eventName, callback);
  };
}

// 🆕 Listen to new group joined
export function listenToNewGroup(deviceId, callback) {
  const socket = connectSocket();
  const eventName = `device:${deviceId}:group-joined`;
  
  // console.log(`[Socket.IO] Listening to event: ${eventName}`);
  
  socket.on(eventName, (groupData) => {
    // console.log(`[Socket.IO] New group joined for device ${deviceId}:`, groupData);
    callback(groupData);
  });
  
  // Return cleanup function
  return () => {
    // console.log(`[Socket.IO] Removing listener for: ${eventName}`);
    socket.off(eventName, callback);
  };
}

// 🆕 Listen to group left/removed event
export function listenToGroupLeft(deviceId, callback) {
  const socket = connectSocket();
  const eventName = `device:${deviceId}:group-left`;
  
  // console.log(`[Socket.IO] Listening to event: ${eventName}`);
  
  socket.on(eventName, (data) => {
    // console.log(`[Socket.IO] Device left group ${data.groupId}:`, data);
    callback(data);
  });
  
  // Return cleanup function
  return () => {
    // console.log(`[Socket.IO] Removing listener for: ${eventName}`);
    socket.off(eventName, callback);
  };
}
