let socketInstance;

function initSocket(io) {
  socketInstance = io;
  
  socketInstance.on('connection', (socket) => {
    console.log('New client connected');
   
  });
}

function emitNotification(notificationData) {
    if (socketInstance) {
      socketInstance.emit('notification', notificationData);
      console.log('Notification sent:', notificationData); 
    } else {
      console.error('Socket not initialized');
    }
  }
  
module.exports = { initSocket, emitNotification };
