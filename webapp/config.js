const POD_CONFIG = {
    SOCKET_PARAMS: {
        socketAddress: 'ws://172.16.110.20:8003/ws',
        serverName: 'fanitoring-service',
        reconnectOnClose: true,
        connectionCheckTimeout: 10000,
        serverRegisteration: true,
        asyncLogging: {
            onFunction: true
            //             onMessageReceive: true,
            //             onMessageSend: true
        }
    }
};