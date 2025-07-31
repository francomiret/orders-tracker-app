const { Server } = require("socket.io");

let io;

const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:3000"], // URLs del cliente
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    // Unirse a sala de alertas
    socket.on("join-alerts", (userId) => {
      socket.join(`alerts-${userId}`);
      console.log(`Usuario ${userId} se unió a las alertas`);
    });

    // Unirse a sala de pedidos específicos
    socket.on("join-order", (orderId) => {
      socket.join(`order-${orderId}`);
      console.log(`Cliente se unió al pedido ${orderId}`);
    });

    socket.on("disconnect", () => {
      console.log("Cliente desconectado:", socket.id);
    });
  });

  return io;
};

// Función para enviar alertas a usuarios específicos
const sendAlertToUser = (userId, alert) => {
  if (io) {
    io.to(`alerts-${userId}`).emit("new-alert", {
      type: "alert",
      data: alert,
      timestamp: new Date(),
    });
  }
};

// Función para enviar actualizaciones de pedidos
const sendOrderUpdate = (orderId, orderData) => {
  if (io) {
    io.to(`order-${orderId}`).emit("order-updated", {
      type: "order-update",
      data: orderData,
      timestamp: new Date(),
    });
  }
};

module.exports = {
  initializeWebSocket,
  sendOrderUpdate,
  sendAlertToUser,
};
